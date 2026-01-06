const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImageUrls() {
  try {
    const products = await prisma.product.findMany({
      where: {
        imageUrl: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true
      },
      take: 5
    });

    console.log('=== Productos con imagen en BD ===');
    products.forEach(p => {
      console.log(`\nProducto: ${p.name}`);
      console.log(`ImageURL: ${p.imageUrl}`);
    });

    if (products.length === 0) {
      console.log('\n⚠️ No hay productos con imágenes en la base de datos');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageUrls();
