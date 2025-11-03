import express, { Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

// 🔧 Extiende el tipo Request para incluir `file`
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = express.Router();

// Ruta para subir una imagen
router.post(
  '/',
  authenticateToken,
  upload.single('image'),
  (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se recibió ningún archivo' });
      }

      // Generar la URL completa del archivo subido
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      res.json({
        success: true,
        imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error('Error al subir imagen:', error);
      res.status(500).json({ error: 'Error al subir la imagen' });
    }
  }
);

export { router as uploadRoutes };
