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

// Configuración CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    /^https:\/\/.*\.ngrok-free\.app$/,
    /^https:\/\/.*\.ngrok-free\.dev$/,
    /^https:\/\/.*\.ngrok\.io$/,
    'https://nonlepidopteral-deliberatively-major.ngrok-free.dev'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(ngrokSkipWarning);
app.use(requestLogger);

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

// Rutas principales
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);

export const prisma = new PrismaClient();
export default app; // 👈 Esto es lo que Vercel necesita
