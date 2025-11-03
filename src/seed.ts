import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@systray.com' },
    update: {},
    create: {
      email: 'admin@systray.com',
      password: hashedPassword,
      name: 'Administrador',
    },
  });

  console.log('✅ Usuario administrador creado:', admin.email);
  console.log('📧 Email: admin@systray.com');
  console.log('🔑 Contraseña: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });