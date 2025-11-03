"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await prisma.admin.findUnique({
            where: { email },
        });
        if (!admin) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const validPassword = await bcryptjs_1.default.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET || '', { expiresIn: '24h' });
        res.json({
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error en el login' });
    }
});
// Register (solo para desarrollo, eliminar en producción)
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const admin = await prisma.admin.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        res.json({
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al registrar administrador' });
    }
});
exports.authRoutes = router;
