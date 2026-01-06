import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { productRoutes } from './routes/products';
import { categoryRoutes } from './routes/categories';
import { planRoutes } from './routes/plans';
import { authRoutes } from './routes/auth';
import { uploadRoutes } from './routes/upload';
import { paymentRoutes } from './routes/payments';
import { orderRoutes } from './routes/orders';
import { ordenesRoutes } from './routes/ordenes';
import interestLinksRouter from './routes/interestLinks';
import { carouselRoutes } from './routes/carousel';
import { videoRoutes } from './routes/videos';
import { ngrokSkipWarning, requestLogger } from './middleware/ngrok';

const app = express();

// Instancia Prisma
export const prisma = new PrismaClient();


// Configuración CORS dinámica según entorno
import cors from 'cors';

// Determinar orígenes permitidos según entorno
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL || 'https://tudominio.com',
      process.env.ADMIN_URL || 'https://tudominio.com/admin'
    ].filter(Boolean)
  : [
      'http://localhost:3001',
      'http://localhost:5173'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (como Postman, cURL, o apps móviles)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(null, true); // En producción, permitir todos por ahora - ajustar según necesidad
    }
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ...existing code...

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Servidor Systray activo',
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/ordenes', express.static(path.join(__dirname, '../uploads/ordenes')));
app.use('/uploads/videos', express.static(path.join(__dirname, '../uploads/videos')));

// Rutas principales
app.use('/api/products', productRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/interest-links', interestLinksRouter());
app.use('/api/carousel', carouselRoutes);
app.use('/api/videos', videoRoutes);

// Error handler global para multer y otros errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔴 Global Error Handler:', err.message || err);
  
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer error:', err.code, err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Archivo demasiado grande. Máximo: 20MB' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Solo se puede subir un archivo' });
    }
    return res.status(400).json({ error: `Error de multer: ${err.message}` });
  }
  
  // Si es un error de validación de archivo
  if (err.message && err.message.includes('Solo se permiten')) {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ 
    error: 'Error en el servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app; // 👈 Esto es lo que Vercel necesita
