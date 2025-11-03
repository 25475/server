import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetPlans() {
  console.log('🔁 Reseteando planes: eliminando todos los registros existentes...');
  try {
    await prisma.plan.deleteMany({});
    console.log('✅ Todos los planes anteriores fueron eliminados.');

    const plansData = [
      {
        name: 'Plan Estudiantil',
        description: '400 MBPS',
        price: 16.49,
        features: [
          'Velocidad: 400 Mbps',
          'Uso: streaming FullHD, teletrabajo, clases virtuales',
          '2 PC / Laptops',
          '1 Consola de videojuegos',
          '4 Teléfonos / Tablets',
          '1 Smart TV'
        ],
        category: 'HOGAR',
        isPopular: false,
      },
      {
        name: 'Plan Estudiantil Pro',
        description: '500 MBPS',
        price: 17.99,
        features: [
          'Velocidad: 500 Mbps',
          'Uso: streaming FullHD, más demanda',
          '2 PC / Laptops',
          '1 Consola de videojuegos',
          '4 Teléfonos / Tablets',
          '2 Smart TV'
        ],
        category: 'HOGAR',
        isPopular: false,
      },
      {
        name: 'Plan Family',
        description: '600 MBPS',
        price: 20.99,
        features: [
          'Velocidad: 600 Mbps',
          'Uso: familia estándar, streaming 4K, domótica y cámaras',
          '2 PC / Laptops',
          '1 Consola de videojuegos',
          '5 Teléfonos / Tablets',
          '2 Smart TV'
        ],
        category: 'HOGAR',
        isPopular: false,
      },
      {
        name: 'Plan Family Pro',
        description: '700 MBPS',
        price: 22.49,
        features: [
          'Velocidad: 700 Mbps',
          'Uso: familia superior, más demanda en 4K y domótica',
          '3 PC / Laptops',
          '1 Consola de videojuegos',
          '5 Teléfonos / Tablets',
          '3 Smart TV'
        ],
        category: 'HOGAR',
        isPopular: false,
      },
      {
        name: 'Plan Cool',
        description: '800 MBPS',
        price: 25.49,
        features: [
          'Velocidad: 800 Mbps',
          'Uso: familiar, laboral, gaming; streaming hasta 8K',
          '3 PC / Laptops',
          '2 Consolas de videojuegos',
          '6 Teléfonos / Tablets',
          '3 Smart TV'
        ],
        category: 'HOGAR',
        isPopular: false,
      },
      {
        name: 'Plan Cool Pro',
        description: '900 MBPS',
        price: 26.99,
        features: [
          'Velocidad: 900 Mbps',
          'Uso: familiar y gaming, mayor demanda en 8K',
          '3 PC / Laptops',
          '2 Consolas de videojuegos',
          '6 Teléfonos / Tablets',
          '4 Smart TV'
        ],
        category: 'HOGAR',
        isPopular: false,
      },
      {
        name: 'Plan Gamer',
        description: '1 GB',
        price: 29.99,
        features: [
          'Velocidad: 1000 Mbps',
          'Uso: gaming exigente, streaming 8K en varios dispositivos',
          '4 PC / Laptops',
          '3 Consolas de videojuegos',
          '7 Teléfonos / Tablets',
          '4 Smart TV'
        ],
        category: 'GAMER',
        isPopular: true,
      },
      {
        name: 'Plan Gamer Pro',
        description: '1.1 GB',
        price: 31.49,
        features: [
          'Velocidad: 1100 Mbps',
          'Uso: usuarios exigentes, gaming sin lag y streaming 8K',
          '4 PC / Laptops',
          '4 Consolas de videojuegos',
          '7 Teléfonos / Tablets',
          '4 Smart TV'
        ],
        category: 'GAMER',
        isPopular: true,
      },
    ];

    console.log('✨ Creando planes nuevos...');
    for (const plan of plansData) {
      await prisma.plan.create({ data: plan as any });
      console.log(`  - creado: ${plan.name}`);
    }

    console.log('🎉 Reseteo de planes completado.');
  } catch (err) {
    console.error('❌ Error durante reset de planes:', err);
  } finally {
    await prisma.$disconnect();
  }
}

resetPlans();
