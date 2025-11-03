"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all plans (pública - sin autenticación)
router.get('/', async (req, res) => {
    try {
        const plans = await prisma.plan.findMany({
            orderBy: { price: 'asc' },
        });
        res.json(plans);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener planes' });
    }
});
// Create plan
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const plan = await prisma.plan.create({
            data: req.body,
        });
        res.json(plan);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al crear plan' });
    }
});
// Update plan
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const plan = await prisma.plan.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(plan);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar plan' });
    }
});
// Delete plan
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        await prisma.plan.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Plan eliminado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar plan' });
    }
});
exports.planRoutes = router;
