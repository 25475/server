import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all categories (pública - sin autenticación)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const categories = await prisma.category.findMany({
      where: type ? { productType: type as any } : undefined,
      include: {
        products: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Create category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const category = await prisma.category.create({
      data: req.body,
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// Update category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// Delete category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

export const categoryRoutes = router;