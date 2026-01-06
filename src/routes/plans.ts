import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all plans (pública - sin autenticación)
router.get('/', async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });
    
    // Construir URLs completas para las imágenes
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const plansWithFullUrls = plans.map(plan => ({
      ...plan,
      imageUrl: plan.imageUrl && !plan.imageUrl.startsWith('http') 
        ? `${baseUrl}${plan.imageUrl}` 
        : plan.imageUrl
    }));
    
    res.json(plansWithFullUrls);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener planes' });
  }
});

// Create plan
router.post('/', authenticateToken, async (req, res) => {
  try {
    const plan = await prisma.plan.create({
      data: req.body,
    });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear plan' });
  }
});

// Update plan
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const plan = await prisma.plan.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar plan' });
  }
});

// Delete plan
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.plan.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Plan eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar plan' });
  }
});

export const planRoutes = router;
