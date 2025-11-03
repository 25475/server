"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    // Crear usuario administrador
    const hashedPassword = await bcryptjs_1.default.hash('admin123', 10);
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
