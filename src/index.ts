// Load .env in development so local env files work (dotenv is in dependencies)
import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import path from 'path';
import { productRoutes } from './routes/products';
import { categoryRoutes } from './routes/categories';
import { planRoutes } from './routes/plans';
import { authRoutes } from './routes/auth';
import { uploadRoutes } from './routes/upload';
import { paymentRoutes } from './routes/payments';
import { orderRoutes } from './routes/orders';
import { ngrokSkipWarning, requestLogger } from './middleware/ngrok';

const app = express();
const prisma = new PrismaClient();

// Configuración de CORS mejorada para desarrollo y Ngrok
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite frontend
    'http://localhost:5174', // Vite frontend (puerto alternativo)
    'http://localhost:3000', // Otro posible puerto
    /^https:\/\/.*\.ngrok-free\.app$/, // Cualquier subdominio de ngrok-free.app
    /^https:\/\/.*\.ngrok-free\.dev$/, // Cualquier subdominio de ngrok-free.dev
    /^https:\/\/.*\.ngrok\.io$/, // Cualquier subdominio de ngrok.io (versión anterior)
    'https://nonlepidopteral-deliberatively-major.ngrok-free.dev', // Tu URL específica de ngrok
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
};

// Middleware global
app.use(cors(corsOptions));
app.use(express.json());
app.use(ngrokSkipWarning); // Para saltear warnings de Ngrok
app.use(requestLogger); // Para logging básico

// Ruta raíz para verificar que el servidor esté activo
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Servidor Systray activo',
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de salud para monitoreo
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀='.repeat(50));
  console.log(`✅ Servidor Systray corriendo en http://localhost:${PORT}`);
  console.log(`📊 Estado del servidor: http://localhost:${PORT}/health`);
  console.log(`🌐 Para exponer con Ngrok: ngrok http ${PORT}`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀='.repeat(50));
});

export { prisma };