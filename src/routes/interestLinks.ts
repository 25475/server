import { Router, Request, Response } from 'express';
import { prisma } from '../app';
import { authenticateToken } from '../middleware/auth';

export const interestLinksRouter = () => {
  const router = Router();

  // GET all interest links (pública - sin autenticación)
  router.get('/', async (req, res) => {
    try {
      const links = await prisma.interestLink.findMany({
        orderBy: {
          createdAt: 'asc',
        },
      });
      res.json(links);
    } catch (error) {
      console.error('Error fetching interest links:', error);
      res.status(500).json({ error: 'Error al obtener los links de interés' });
    }
  });

  // GET single interest link
  router.get('/:id', async (req, res) => {
    try {
      const link = await prisma.interestLink.findUnique({
        where: { id: req.params.id },
      });
      if (!link) {
        return res.status(404).json({ error: 'Link no encontrado' });
      }
      res.json(link);
    } catch (error) {
      console.error('Error fetching interest link:', error);
      res.status(500).json({ error: 'Error al obtener el link' });
    }
  });

  // POST create new interest link (requiere autenticación)
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { title, url } = req.body;

      // Validar que title y url sean obligatorios
      if (!title || !url) {
        return res.status(400).json({ 
          error: 'El título y la URL son campos obligatorios' 
        });
      }

      // Validar que title sea string
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ 
          error: 'El título debe ser un texto válido' 
        });
      }

      // Validar que url sea string y sea una URL válida
      if (typeof url !== 'string' || url.trim() === '') {
        return res.status(400).json({ 
          error: 'La URL debe ser un texto válido' 
        });
      }

      // Validar formato de URL
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({ 
          error: 'La URL debe ser válida (ej: https://ejemplo.com)' 
        });
      }

      const link = await prisma.interestLink.create({
        data: {
          title: title.trim(),
          url: url.trim(),
        },
      });

      res.status(201).json(link);
    } catch (error) {
      console.error('Error creating interest link:', error);
      res.status(500).json({ error: 'Error al crear el link de interés' });
    }
  });

  // PUT update interest link (requiere autenticación)
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { title, url } = req.body;

      // Validar que al menos uno de los campos sea proporcionado
      if (!title && !url) {
        return res.status(400).json({ 
          error: 'Debe proporcionar al menos el título o la URL' 
        });
      }

      // Validar title si se proporciona
      if (title && (typeof title !== 'string' || title.trim() === '')) {
        return res.status(400).json({ 
          error: 'El título debe ser un texto válido' 
        });
      }

      // Validar url si se proporciona
      if (url) {
        if (typeof url !== 'string' || url.trim() === '') {
          return res.status(400).json({ 
            error: 'La URL debe ser un texto válido' 
          });
        }
        try {
          new URL(url);
        } catch (e) {
          return res.status(400).json({ 
            error: 'La URL debe ser válida (ej: https://ejemplo.com)' 
          });
        }
      }

      // Verificar que el link existe
      const existingLink = await prisma.interestLink.findUnique({
        where: { id: req.params.id },
      });

      if (!existingLink) {
        return res.status(404).json({ error: 'Link no encontrado' });
      }

      const link = await prisma.interestLink.update({
        where: { id: req.params.id },
        data: {
          ...(title && { title: title.trim() }),
          ...(url && { url: url.trim() }),
        },
      });

      res.json(link);
    } catch (error) {
      console.error('Error updating interest link:', error);
      res.status(500).json({ error: 'Error al actualizar el link' });
    }
  });

  // DELETE interest link (requiere autenticación)
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      // Verificar que el link existe
      const existingLink = await prisma.interestLink.findUnique({
        where: { id: req.params.id },
      });

      if (!existingLink) {
        return res.status(404).json({ error: 'Link no encontrado' });
      }

      await prisma.interestLink.delete({
        where: { id: req.params.id },
      });

      res.json({ message: 'Link eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting interest link:', error);
      res.status(500).json({ error: 'Error al eliminar el link' });
    }
  });

  return router;
};

export default interestLinksRouter;
