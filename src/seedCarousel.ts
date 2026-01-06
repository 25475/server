/**
 * Seed para carruseles
 * Ejecutar después de la migración: npx ts-node src/seedCarousel.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCarouselImages() {
  console.log('🎬 Iniciando seed de carruseles...');

  try {
    // Limpiar datos existentes
    await prisma.carouselImage.deleteMany({});
    console.log('🧹 Tabla limpiada');

    // PRINCIPAL - Exactamente 4 imágenes, una de cada tipo
    const principal = await prisma.carouselImage.createMany({
      data: [
        {
          section: 'PRINCIPAL',
          type: 'HERO',
          url: 'https://via.placeholder.com/1920x1080?text=Hero+Principal',
          order: 1
        },
        {
          section: 'PRINCIPAL',
          type: 'PLANES',
          url: 'https://via.placeholder.com/1920x1080?text=Planes',
          order: 2
        },
        {
          section: 'PRINCIPAL',
          type: 'VISION',
          url: 'https://via.placeholder.com/1920x1080?text=Vision+Camaras',
          order: 3
        },
        {
          section: 'PRINCIPAL',
          type: 'DOMOTICA',
          url: 'https://via.placeholder.com/1920x1080?text=Domotica',
          order: 4
        }
      ]
    });
    console.log(`✅ PRINCIPAL: ${principal.count} imágenes creadas`);

    // NOSOTROS - 3 imágenes
    const nosotros = await prisma.carouselImage.createMany({
      data: [
        {
          section: 'NOSOTROS',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Nosotros+1',
          order: 1
        },
        {
          section: 'NOSOTROS',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Nosotros+2',
          order: 2
        },
        {
          section: 'NOSOTROS',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Nosotros+3',
          order: 3
        }
      ]
    });
    console.log(`✅ NOSOTROS: ${nosotros.count} imágenes creadas`);

    // PLANES - 3 imágenes
    const planes = await prisma.carouselImage.createMany({
      data: [
        {
          section: 'PLANES',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Planes+1',
          order: 1
        },
        {
          section: 'PLANES',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Planes+2',
          order: 2
        },
        {
          section: 'PLANES',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Planes+3',
          order: 3
        }
      ]
    });
    console.log(`✅ PLANES: ${planes.count} imágenes creadas`);

    // VISION - 3 imágenes
    const vision = await prisma.carouselImage.createMany({
      data: [
        {
          section: 'VISION',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Vision+1',
          order: 1
        },
        {
          section: 'VISION',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Vision+2',
          order: 2
        },
        {
          section: 'VISION',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Vision+3',
          order: 3
        }
      ]
    });
    console.log(`✅ VISION: ${vision.count} imágenes creadas`);

    // NOVATEK - 3 imágenes
    const novatek = await prisma.carouselImage.createMany({
      data: [
        {
          section: 'NOVATEK',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Novatek+1',
          order: 1
        },
        {
          section: 'NOVATEK',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Novatek+2',
          order: 2
        },
        {
          section: 'NOVATEK',
          type: null,
          url: 'https://via.placeholder.com/1024x576?text=Novatek+3',
          order: 3
        }
      ]
    });
    console.log(`✅ NOVATEK: ${novatek.count} imágenes creadas`);

    // Validar integridad
    const totalImages = await prisma.carouselImage.findMany();
    console.log(`\n📊 Total de imágenes: ${totalImages.length}`);

    // Mostrar resumen por sección
    const sections = ['PRINCIPAL', 'NOSOTROS', 'PLANES', 'VISION', 'NOVATEK'];
    for (const section of sections) {
      const count = await prisma.carouselImage.count({
        where: { section: section as any }
      });
      console.log(`   ${section}: ${count} imágenes`);
    }

    console.log('\n✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedCarouselImages();
