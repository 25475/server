// ========================================
// VALIDADORES DE ENUMS PARA MySQL
// ========================================
// Como MySQL no soporta ENUMs nativos de Prisma,
// estos validadores reemplazan la validación automática
// que tenías en PostgreSQL
// ========================================

/**
 * Validadores de ENUMs para reemplazar los tipos nativos de PostgreSQL
 */

// ProductType: VIZION | NOVATEK | DOMOTICA
export const PRODUCT_TYPES = ['VIZION', 'NOVATEK', 'DOMOTICA'] as const;
export type ProductType = typeof PRODUCT_TYPES[number];

export function isValidProductType(value: any): value is ProductType {
  return typeof value === 'string' && PRODUCT_TYPES.includes(value as ProductType);
}

export function validateProductType(value: any): ProductType {
  if (!isValidProductType(value)) {
    throw new Error(`ProductType inválido: "${value}". Valores permitidos: ${PRODUCT_TYPES.join(', ')}`);
  }
  return value;
}

// PlanCategory: HOGAR | GAMER | EMPRESARIAL
export const PLAN_CATEGORIES = ['HOGAR', 'GAMER', 'EMPRESARIAL'] as const;
export type PlanCategory = typeof PLAN_CATEGORIES[number];

export function isValidPlanCategory(value: any): value is PlanCategory {
  return typeof value === 'string' && PLAN_CATEGORIES.includes(value as PlanCategory);
}

export function validatePlanCategory(value: any): PlanCategory {
  if (!isValidPlanCategory(value)) {
    throw new Error(`PlanCategory inválido: "${value}". Valores permitidos: ${PLAN_CATEGORIES.join(', ')}`);
  }
  return value;
}

// EstadoOrden: APROBADA | PENDIENTE | RECHAZADA
export const ESTADO_ORDEN = ['APROBADA', 'PENDIENTE', 'RECHAZADA'] as const;
export type EstadoOrden = typeof ESTADO_ORDEN[number];

export function isValidEstadoOrden(value: any): value is EstadoOrden {
  return typeof value === 'string' && ESTADO_ORDEN.includes(value as EstadoOrden);
}

export function validateEstadoOrden(value: any): EstadoOrden {
  if (!isValidEstadoOrden(value)) {
    throw new Error(`EstadoOrden inválido: "${value}". Valores permitidos: ${ESTADO_ORDEN.join(', ')}`);
  }
  return value;
}

// CarouselSection: PRINCIPAL | NOSOTROS | PLANES | VISION | NOVATEK | DOMOTICA
export const CAROUSEL_SECTIONS = ['PRINCIPAL', 'NOSOTROS', 'PLANES', 'VISION', 'NOVATEK', 'DOMOTICA'] as const;
export type CarouselSection = typeof CAROUSEL_SECTIONS[number];

export function isValidCarouselSection(value: any): value is CarouselSection {
  return typeof value === 'string' && CAROUSEL_SECTIONS.includes(value as CarouselSection);
}

export function validateCarouselSection(value: any): CarouselSection {
  if (!isValidCarouselSection(value)) {
    throw new Error(`CarouselSection inválido: "${value}". Valores permitidos: ${CAROUSEL_SECTIONS.join(', ')}`);
  }
  return value;
}

// CarouselType: INTERNET | VIZION | DOMOTICA | NOVATEK
export const CAROUSEL_TYPES = ['INTERNET', 'VIZION', 'DOMOTICA', 'NOVATEK'] as const;
export type CarouselType = typeof CAROUSEL_TYPES[number];

export function isValidCarouselType(value: any): value is CarouselType {
  return typeof value === 'string' && CAROUSEL_TYPES.includes(value as CarouselType);
}

export function validateCarouselType(value: any): CarouselType | null {
  if (value === null || value === undefined) return null;
  if (!isValidCarouselType(value)) {
    throw new Error(`CarouselType inválido: "${value}". Valores permitidos: ${CAROUSEL_TYPES.join(', ')}`);
  }
  return value;
}

// ========================================
// HELPERS PARA ARRAYS → JSON
// ========================================

/**
 * Convierte un array de strings a JSON para Plan.features
 * Uso: cuando envías datos a la BD
 */
export function arrayToJson(arr: string[]): string {
  if (!Array.isArray(arr)) {
    throw new Error('Se esperaba un array');
  }
  return JSON.stringify(arr);
}

/**
 * Convierte JSON a array de strings desde Plan.features
 * Uso: cuando recibes datos de la BD
 */
export function jsonToArray(json: any): string[] {
  // Si ya es un array, retornarlo
  if (Array.isArray(json)) {
    return json;
  }
  
  // Si es string JSON, parsearlo
  if (typeof json === 'string') {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON no contiene un array');
      }
      return parsed;
    } catch (error) {
      throw new Error(`Error al parsear JSON: ${error}`);
    }
  }
  
  // Si es null o undefined, retornar array vacío
  if (json === null || json === undefined) {
    return [];
  }
  
  throw new Error('Formato de features inválido');
}

// ========================================
// MIDDLEWARE DE VALIDACIÓN
// ========================================

/**
 * Middleware para validar ENUMs en requests
 */
export function validateEnumMiddleware(field: string, validValues: readonly string[]) {
  return (req: any, res: any, next: any) => {
    const value = req.body[field];
    
    if (value && !validValues.includes(value)) {
      return res.status(400).json({
        error: `${field} inválido`,
        message: `"${value}" no es un valor válido. Valores permitidos: ${validValues.join(', ')}`
      });
    }
    
    next();
  };
}

// ========================================
// EXPORTACIÓN DE CONSTANTES
// ========================================

export const VALID_ENUMS = {
  ProductType: PRODUCT_TYPES,
  PlanCategory: PLAN_CATEGORIES,
  EstadoOrden: ESTADO_ORDEN,
  CarouselSection: CAROUSEL_SECTIONS,
  CarouselType: CAROUSEL_TYPES,
} as const;
