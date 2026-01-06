import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all products (pública - sin autenticación)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const products = await prisma.product.findMany({
      where: type ? { productType: type as any } : undefined,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos', details: error });
  }
});

// Get product by slug (pública - sin autenticación)
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Create product
router.post('/', authenticateToken, async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto', details: error });
  }
});

// Update product
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    // Return error message if available for easier debugging in dev
    const message = (error as any)?.message || 'Error al actualizar producto';
    res.status(500).json({ error: message });
  }
});

// Set default stock for all products (protected)
router.post('/set-default-stock', authenticateToken, async (req, res) => {
  try {
    const { stock } = req.body;
    const value = typeof stock === 'number' ? stock : parseInt(stock || '0');
    if (isNaN(value) || value < 0) return res.status(400).json({ error: 'Stock inválido' });

  await prisma.product.updateMany({ data: { stock: value } as any });
    return res.json({ success: true, stock: value });
  } catch (error) {
    console.error('Error setting default stock', error);
    return res.status(500).json({ error: 'Error al setear stock por defecto' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Endpoint para productos aleatorios (pública)

// Endpoint para productos aleatorios (pública)
router.get('/random', async (req, res) => {
  try {
    // Entre 4 y 6 productos aleatorios
    const take = Math.floor(Math.random() * 3) + 4;
    const productos = await prisma.product.findMany({
      take,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(Array.isArray(productos) ? productos : []);
  } catch (error) {
    console.error('Error al obtener productos aleatorios:', error);
    res.status(500).json({ error: 'Error al obtener productos aleatorios', details: error });
  }
});

export const productRoutes = router;
