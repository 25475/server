import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear carpeta uploads si no existe
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp + nombre original SIN ESPACIOS
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    // Reemplazar espacios y caracteres especiales con guiones
    const cleanName = nameWithoutExt
      .replace(/\s+/g, '-')           // Espacios → guiones
      .replace(/[^a-zA-Z0-9-_]/g, '') // Remover caracteres especiales
      .toLowerCase();                  // Convertir a minúsculas
    cb(null, cleanName + '-' + uniqueSuffix + ext);
  }
});

// Filtro para solo permitir imágenes JPG, PNG y WEBP
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes en formato JPG, PNG o WEBP'));
  }
};

// Configurar multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // Límite aumentado a 20MB
  }
});
