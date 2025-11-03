/**
 * Middleware personalizado para manejar headers de Ngrok y otros
 */
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para manejar headers de Ngrok y evitar warning pages
 */
export const ngrokSkipWarning = (req: Request, res: Response, next: NextFunction) => {
  // Agregar header para saltear la página de warning de Ngrok
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
};

/**
 * Middleware para logging básico de requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - Origin: ${req.get('Origin')} - User-Agent: ${req.get('User-Agent')}`);
  next();
};

/**
 * Middleware para manejar errores de CORS específicos de Ngrok
 */
export const corsErrorHandler = (req: Request, res: Response, next: NextFunction) => {
  // Si la request viene de Ngrok, asegurar que los headers estén configurados
  const origin = req.get('Origin');
  if (origin && (origin.includes('ngrok') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
};