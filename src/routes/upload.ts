import express from 'express';
import { upload } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Ruta para subir una imagen
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    // Devolver la URL de la imagen
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

export { router as uploadRoutes };
