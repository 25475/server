import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeOrderIds() {
  try {
    console.log('Inicializando orderIds para órdenes existentes...');
    
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
        console.log(`✓ Orden ${ordenes[i].id} asignada con orderId: ${orderId}`);
      }
    }

    console.log('Inicialización completada');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeOrderIds();
