"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all categories (pública - sin autenticación)
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        const categories = await prisma.category.findMany({
            where: type ? { productType: type } : undefined,
            include: {
                products: true,
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});
// Create category
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const category = await prisma.category.create({
            data: req.body,
        });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al crear categoría' });
    }
});
// Update category
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const category = await prisma.category.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
});
// Delete category
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        await prisma.category.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Categoría eliminada' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
});
exports.categoryRoutes = router;
