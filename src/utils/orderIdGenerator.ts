import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera un ID de orden único con formato "ORD-XXXXX"
 * Usa un enfoque más seguro que puede manejar concurrencia
 */
export async function generateOrderId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      // Obtener la orden con el orderId más alto
      const lastOrder = await prisma.orden.findMany({
        orderBy: {
          fecha: 'desc'
        },
        take: 1
      });

      let nextNumber = 1;

      if (lastOrder.length > 0 && lastOrder[0].orderId) {
        // Extraer el número del formato "ORD-XXXXX"
        const match = lastOrder[0].orderId.match(/ORD-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      // Formatear con ceros a la izquierda (5 dígitos)
      const orderId = `ORD-${String(nextNumber).padStart(5, '0')}`;
      
      // Verificar que no existe ya
      const existing = await prisma.orden.findUnique({
        where: { orderId }
      });

      if (!existing) {
        return orderId;
      }

      // Si existe, incrementar y reintentar
      attempts++;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error('Error al generar orderId después de', maxAttempts, 'intentos:', error);
        throw new Error('No se pudo generar el ID de orden después de varios intentos');
      }
    }
  }

  throw new Error('No se pudo generar un ID de orden único');
}

/**
 * Inicializa los orderIds en órdenes existentes que no los tengan
 * Útil después de la migración
 */
export async function initializeOrderIds(): Promise<void> {
  try {
    const ordenes = await prisma.orden.findMany({
      orderBy: { fecha: 'asc' }
    });
    
    for (let i = 0; i < ordenes.length; i++) {
      if (!ordenes[i].orderId) {
        const orderId = `ORD-${String(i + 1).padStart(5, '0')}`;
        await prisma.orden.update({
          where: { id: ordenes[i].id },
          data: { orderId }
        });
      }
    }

    console.log('Inicialización de orderIds completada');
  } catch (error) {
    console.error('Error al inicializar orderIds:', error);
    throw error;
  }
}
