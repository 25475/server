/**
 * Rutas para gestión de carruseles de imágenes
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getCarouselImages,
  getCarouselImageById,
  createCarouselImage,
  updateCarouselImage,
  deleteCarouselImage,
  updateCarouselOrder,
  validateCarouselSection,
  getCarouselStats
} from '../services/carouselController';

const router = Router();

/**
 * Rutas públicas específicas (sin autenticación) - DEBEN IR PRIMERO
 */

// GET /carousel/stats - Estadísticas de todas las secciones (público)
router.get('/stats', getCarouselStats);

// GET /carousel/validate/:section - Validar estado de sección (público pero con info)
router.get('/validate/:section', validateCarouselSection);

/**
 * Rutas públicas genéricas (sin autenticación)
 */

// GET /carousel - Obtener todas las imágenes o por sección
// Query params: ?section=PRINCIPAL
router.get('/', getCarouselImages);

// GET /carousel/:id - Obtener una imagen específica
router.get('/:id', getCarouselImageById);

/**
 * Rutas protegidas (requieren autenticación)
 */

// POST /carousel - Crear nueva imagen
router.post('/', authenticateToken, createCarouselImage);

// PUT /carousel/:id - Actualizar imagen
router.put('/:id', authenticateToken, updateCarouselImage);

// DELETE /carousel/:id - Eliminar imagen
router.delete('/:id', authenticateToken, deleteCarouselImage);

// PUT /carousel/order - Actualizar orden de imágenes en una sección
router.put('/order/:section', authenticateToken, updateCarouselOrder);

export const carouselRoutes = router;
