import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateOrderId } from '../utils/orderIdGenerator';
import { sendOrderEmail } from '../services/emailService';
import { notificarOrden } from "../services/notificacionService";


const router = Router();
const prisma = new PrismaClient();

// Configuración de multer para recibir el PDF
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST /ordenes/guardar - Guardar orden desde el frontend
router.post('/guardar', upload.single('pdfFile'), async (req, res) => {
  try {
    const { nombreCliente, telefono, productos, total } = req.body;

    // Validar campos requeridos
    if (!nombreCliente || !telefono || !productos || !total) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: nombreCliente, telefono, productos, total' 
      });
    }

    // Parsear productos si viene como string
    let productosJson;
    try {
      productosJson = typeof productos === 'string' ? JSON.parse(productos) : productos;
    } catch (err) {
      return res.status(400).json({ error: 'El campo productos debe ser un JSON válido' });
    }

    // Generar orderId automáticamente
    const orderId = await generateOrderId();

    // Crear la orden en la base de datos primero para obtener el ID
    const orden = await prisma.orden.create({
      data: {
        orderId,
        nombreCliente,
        telefono,
        productos: productosJson,
        total: parseFloat(total),
        pdfUrl: '', // Se actualizará después
        createdAt: new Date(),
        estado: 'PENDIENTE'
      }
    });

    // Guardar el PDF si se envió
    let pdfUrl = '';
    if (req.file) {
      // Crear directorio si no existe
      const ordenesDir = path.join(__dirname, '../../uploads/ordenes');
      if (!fs.existsSync(ordenesDir)) {
        fs.mkdirSync(ordenesDir, { recursive: true });
      }

      // Guardar el archivo PDF
      const pdfFilename = `${orden.id}.pdf`;
      const pdfPath = path.join(ordenesDir, pdfFilename);
      fs.writeFileSync(pdfPath, req.file.buffer);

      // Generar URL del PDF
      pdfUrl = `http://localhost:${process.env.PORT || 5000}/uploads/ordenes/${pdfFilename}`;

      // Actualizar la orden con la URL del PDF
      await prisma.orden.update({
        where: { id: orden.id },
        data: { pdfUrl }
      });
    } else if (req.body.pdfBase64) {
      // Si viene como base64 en el body
      const ordenesDir = path.join(__dirname, '../../uploads/ordenes');
      if (!fs.existsSync(ordenesDir)) {
        fs.mkdirSync(ordenesDir, { recursive: true });
      }

      const pdfFilename = `${orden.id}.pdf`;
      const pdfPath = path.join(ordenesDir, pdfFilename);
      
      // Remover el prefijo data:application/pdf;base64, si existe
      const base64Data = req.body.pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(pdfPath, buffer);

      pdfUrl = `http://localhost:${process.env.PORT || 5000}/uploads/ordenes/${pdfFilename}`;

      await prisma.orden.update({
        where: { id: orden.id },
        data: { pdfUrl }
      });
    }

    // Responder al cliente inmediatamente
    res.json({
      success: true,
      mensaje: 'Orden guardada exitosamente',
      orden: {
        id: orden.id,
        orderId: orden.orderId,
        nombreCliente: orden.nombreCliente,
        telefono: orden.telefono,
        total: orden.total,
        pdfUrl: pdfUrl || orden.pdfUrl,
        fecha: orden.fecha,
        createdAt: orden.createdAt,
        estado: orden.estado
      }
    });

    // Enviar notificación de forma asincrónica (no bloquea la respuesta)
    // Crear objeto orden completo para la notificación
    const ordenCompleta = await prisma.orden.findUnique({
      where: { id: orden.id }
    });

    if (ordenCompleta) {
      // Ejecutar en background sin esperar
      notificarOrden(ordenCompleta).catch((err: any) => {
        console.error('Error al enviar notificación de orden (background):', err);
      });
    }
  } catch (error) {
    console.error('Error al guardar orden:', error);
    res.status(500).json({ 
      error: 'Error al guardar la orden', 
      details: error instanceof Error ? error.message : error 
    });
  }
});

// GET /ordenes - Obtener todas las órdenes con filtros
router.get('/', async (req, res) => {
  try {
    const { search, estado, sort = 'desc' } = req.query;

    // Construir filtro
    const where: any = {};

    if (search) {
      const searchTerm = search as string;
      where.OR = [
        { nombreCliente: { contains: searchTerm, mode: 'insensitive' } },
        { telefono: { contains: searchTerm, mode: 'insensitive' } },
        { orderId: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    if (estado) {
      where.estado = estado;
    }

    // Ordenar por fecha (descendente por defecto)
    const orderBy = sort === 'asc' ? 'asc' : 'desc';

    const ordenes = await prisma.orden.findMany({
      where,
      orderBy: { fecha: orderBy }
    });

    res.json(ordenes);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// GET /ordenes/grouped - Obtener órdenes agrupadas por cliente
router.get('/grouped/by-customer', async (req, res) => {
  try {
    const ordenes = await prisma.orden.findMany({
      orderBy: { fecha: 'desc' }
    });

    // Agrupar por nombreCliente
    const groupedOrders = ordenes.reduce((acc, orden) => {
      const customerName = orden.nombreCliente;
      if (!acc[customerName]) {
        acc[customerName] = [];
      }
      acc[customerName].push(orden);
      return acc;
    }, {} as Record<string, typeof ordenes>);

    // Convertir a array de objetos con formato más legible
    const result = Object.entries(groupedOrders).map(([customerName, orders]) => ({
      customerName,
      totalOrders: orders.length,
      totalAmount: orders.reduce((sum, o) => sum + o.total, 0),
      orders
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener órdenes agrupadas:', error);
    res.status(500).json({ error: 'Error al obtener órdenes agrupadas' });
  }
});

// GET /ordenes/:id - Obtener una orden específica
router.get('/:id', async (req, res) => {
  try {
    const orden = await prisma.orden.findUnique({
      where: { id: req.params.id }
    });

    if (!orden) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(orden);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
});

// PUT /ordenes/:id/estado - Cambiar estado de una orden
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;

    // Validar que el estado sea válido
    const estadosValidos = ['APROBADA', 'PENDIENTE', 'RECHAZADA'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido. Debe ser: APROBADA, PENDIENTE o RECHAZADA' 
      });
    }

    // Verificar que la orden existe
    const ordenExistente = await prisma.orden.findUnique({
      where: { id: req.params.id }
    });

    if (!ordenExistente) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Actualizar el estado
    const orden = await prisma.orden.update({
      where: { id: req.params.id },
      data: { estado: estado as any }
    });

    res.json({
      success: true,
      mensaje: `Estado actualizado a ${estado}`,
      orden
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ 
      error: 'Error al actualizar estado',
      details: error instanceof Error ? error.message : error
    });
  }
});

// DELETE /ordenes/:id - Eliminar una orden
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la orden existe
    const ordenExistente = await prisma.orden.findUnique({
      where: { id }
    });

    if (!ordenExistente) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Eliminar el PDF si existe
    if (ordenExistente.pdfUrl) {
      const pdfFilename = `${id}.pdf`;
      const ordenesDir = path.join(__dirname, '../../uploads/ordenes');
      const pdfPath = path.join(ordenesDir, pdfFilename);
      
      if (fs.existsSync(pdfPath)) {
        try {
          fs.unlinkSync(pdfPath);
          console.log(`✓ PDF eliminado: ${pdfPath}`);
        } catch (err) {
          console.error(`Advertencia: No se pudo eliminar el PDF`, err);
        }
      }
    }

    // Eliminar la orden de la base de datos
    const orden = await prisma.orden.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Orden eliminada exitosamente',
      ordenEliminada: {
        id: orden.id,
        orderId: orden.orderId,
        nombreCliente: orden.nombreCliente
      }
    });
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    res.status(500).json({
      error: 'Error al eliminar la orden',
      details: error instanceof Error ? error.message : error
    });
  }
});

export { router as ordenesRoutes };
