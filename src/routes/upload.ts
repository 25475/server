import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { upload } from '../middleware/upload';

// 🔧 Extiende el tipo Request para incluir `file`
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = express.Router();

// Middleware para crear la carpeta uploads si no existe
router.use((req: Request, res: Response, next: NextFunction) => {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Carpeta uploads creada:', uploadDir);
    } catch (err) {
      console.error('❌ Error al crear carpeta uploads:', err);
    }
  }
  next();
});

// Manejador de errores de multer - DEBE estar ANTES de la ruta POST
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer error:', err.code, err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Archivo demasiado grande. Máximo: 20MB' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Solo se puede subir un archivo' });
    }
    return res.status(400).json({ error: `Error de multer: ${err.message}` });
  } else if (err) {
    console.error('❌ Upload error:', err.message || err);
    return res.status(400).json({ error: err.message || 'Error al procesar la solicitud' });
  }
  next();
});

// Ruta para subir una imagen
router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    console.log('📸 Intento de upload recibido');
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Authorization:', req.get('Authorization') ? '✅ Presente' : '❌ No presente');
    next();
  },
  upload.single('image'),
  (req: Request, res: Response, next: NextFunction) => {
    console.log('✅ Archivo procesado por multer');
    if ((req as any).file) {
      console.log('📄 Archivo recibido:', (req as any).file.filename);
      console.log('📊 Tamaño:', (req as any).file.size, 'bytes');
      console.log('📝 MIME type:', (req as any).file.mimetype);
    } else {
      console.log('⚠️ No hay archivo en req.file');
      console.log('Body:', req.body);
    }
    next();
  },
  (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        console.error('❌ Error: No file received');
        return res.status(400).json({ 
          error: 'No se recibió ningún archivo',
          details: 'El campo debe ser "image" y de tipo FormData'
        });
      }

      console.log('🎉 Upload exitoso');
      console.log('Archivo guardado:', req.file.filename);

      // Construir URL correcta
      let imageUrl = `/uploads/${req.file.filename}`;
      if (process.env.VERCEL === '1' || req.get('host')?.includes('vercel.app')) {
        imageUrl = `https://${req.get('host')}/uploads/${req.file.filename}`;
      }
      
      res.json({
        success: true,
        imageUrl,
        filename: req.file.filename,
        size: req.file.size,
      });
    } catch (error) {
      console.error('❌ Error al subir imagen:', error);
      res.status(500).json({ 
        error: 'Error al subir la imagen',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
);
export { router as uploadRoutes };
