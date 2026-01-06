/**
 * Tipos para el sistema de carruseles de imágenes
 * Define estructuras para secciones, tipos de imagen y validaciones
 */

// Secciones disponibles del sitio
export type CarouselSection = 'PRINCIPAL' | 'NOSOTROS' | 'PLANES' | 'VISION' | 'NOVATEK' | 'DOMOTICA';

// Tipos de imágenes solo en la sección PRINCIPAL
export type CarouselType = 'INTERNET' | 'VIZION' | 'DOMOTICA' | 'NOVATEK';

// Configuración de reglas por sección
export interface SectionConfig {
  section: CarouselSection;
  minImages: number;
  maxImages: number;
  requiresType: boolean;
  allowedTypes?: CarouselType[];
}

// Imagen del carrusel (respuesta API)
export interface CarouselImage {
  id: string;
  section: CarouselSection;
  type: CarouselType | null;
  url: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Solicitud para crear/actualizar imagen
export interface CreateCarouselImageRequest {
  section: CarouselSection;
  type?: CarouselType | null; // Solo para PRINCIPAL
  url: string;
  order: number;
}

// Solicitud para actualizar orden de imágenes
export interface UpdateCarouselOrderRequest {
  section: CarouselSection;
  images: Array<{
    id: string;
    order: number;
  }>;
}

// Respuesta API para carruseles
export interface CarouselResponse {
  success: boolean;
  data?: CarouselImage | CarouselImage[];
  error?: string;
  message?: string;
}

// Validación de carrusel
export interface CarouselValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Configuración de carruseles por sección
export const CAROUSEL_SECTION_CONFIG: Record<CarouselSection, SectionConfig> = {
  PRINCIPAL: {
    section: 'PRINCIPAL',
    minImages: 4,
    maxImages: 4,
    requiresType: true,
    allowedTypes: ['INTERNET', 'VIZION', 'DOMOTICA', 'NOVATEK']
  },
  NOSOTROS: {
    section: 'NOSOTROS',
    minImages: 3,
    maxImages: 10,
    requiresType: false
  },
  PLANES: {
    section: 'PLANES',
    minImages: 3,
    maxImages: 10,
    requiresType: false
  },
  VISION: {
    section: 'VISION',
    minImages: 3,
    maxImages: 10,
    requiresType: false
  },
  NOVATEK: {
    section: 'NOVATEK',
    minImages: 3,
    maxImages: 10,
    requiresType: false
  },
  DOMOTICA: {
    section: 'DOMOTICA',
    minImages: 3,
    maxImages: 10,
    requiresType: false
  }
};

// Tipos de secciones
export const CAROUSEL_SECTIONS: CarouselSection[] = [
  'PRINCIPAL',
  'NOSOTROS',
  'PLANES',
  'VISION',
  'NOVATEK',
  'DOMOTICA'
];

// Tipos de imágenes para sección PRINCIPAL
export const CAROUSEL_TYPES_PRINCIPAL: CarouselType[] = [
  'INTERNET',
  'VIZION',
  'DOMOTICA',
  'NOVATEK'
];
