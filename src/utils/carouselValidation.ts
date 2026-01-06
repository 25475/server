/**
 * Utilidades para validación de carruseles
 */

import {
  CarouselSection,
  CarouselType,
  CarouselValidation,
  CAROUSEL_SECTION_CONFIG,
  CAROUSEL_TYPES_PRINCIPAL
} from '../types/carousel';
import { prisma } from '../app';

/**
 * Valida que una sección tenga el número mínimo de imágenes
 */
export async function validateSectionMinImages(
  section: CarouselSection
): Promise<CarouselValidation> {
  const config = CAROUSEL_SECTION_CONFIG[section];
  const count = await prisma.carouselImage.count({
    where: { section }
  });

  const errors: string[] = [];
  const warnings: string[] = [];

  if (count < config.minImages) {
    errors.push(
      `La sección ${section} requiere mínimo ${config.minImages} imágenes. Actualmente tiene ${count}.`
    );
  }

  if (count > config.maxImages) {
    warnings.push(
      `La sección ${section} tiene ${count} imágenes, máximo recomendado: ${config.maxImages}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida que PRINCIPAL tenga todos los tipos requeridos
 */
export async function validatePrincipalTypes(): Promise<CarouselValidation> {
  const images = await prisma.carouselImage.findMany({
    where: { section: 'PRINCIPAL' }
  });

  const errors: string[] = [];
  const warnings: string[] = [];
  const presentTypes = new Set(images.map((img: any) => img.type).filter((t: any) => t !== null));

  // Verificar que todos los tipos estén presentes
  for (const type of CAROUSEL_TYPES_PRINCIPAL) {
    if (!presentTypes.has(type)) {
      errors.push(`Falta imagen de tipo ${type} en sección PRINCIPAL`);
    }
  }

  // Verificar que no haya duplicados de tipo
  const typeCount: Record<string, number> = {};
  images.forEach((img: any) => {
    if (img.type) {
      typeCount[img.type] = (typeCount[img.type] || 0) + 1;
    }
  });

  for (const [type, count] of Object.entries(typeCount)) {
    if (count > 1) {
      errors.push(`Hay ${count} imágenes de tipo ${type} en PRINCIPAL (debe ser solo 1)`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida que PRINCIPAL tenga exactamente 4 imágenes
 */
export async function validatePrincipalCount(): Promise<CarouselValidation> {
  const count = await prisma.carouselImage.count({
    where: { section: 'PRINCIPAL' }
  });

  const errors: string[] = [];

  if (count !== 4) {
    errors.push(`PRINCIPAL debe tener exactamente 4 imágenes, actualmente tiene ${count}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Valida los datos de una nueva imagen antes de crear/actualizar
 */
export function validateCarouselImageData(
  section: CarouselSection,
  type: CarouselType | null | undefined,
  url: string
): CarouselValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar URL
  if (!url || url.trim().length === 0) {
    errors.push('URL de imagen requerida');
  } else if (!isValidUrl(url)) {
    errors.push('URL inválida');
  }

  const config = CAROUSEL_SECTION_CONFIG[section];

  // Validar tipo para PRINCIPAL
  if (section === 'PRINCIPAL') {
    if (!type) {
      errors.push('PRINCIPAL requiere un tipo de imagen (HERO, PLANES, VISION, DOMOTICA)');
    } else if (!CAROUSEL_TYPES_PRINCIPAL.includes(type)) {
      errors.push(`Tipo inválido: ${type}. Tipos permitidos: ${CAROUSEL_TYPES_PRINCIPAL.join(', ')}`);
    }
  } else {
    // Otras secciones no deben tener tipo
    if (type) {
      warnings.push(`${section} no requiere tipo, será ignorado`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida que la URL sea una URL válida
 */
function isValidUrl(url: string): boolean {
  try {
    // Aceptar URLs relativas (como /uploads/file.jpg)
    if (url.startsWith('/')) {
      return true;
    }
    // Aceptar URLs absolutas
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene el siguiente número de orden para una sección
 */
export async function getNextOrder(section: CarouselSection): Promise<number> {
  const lastImage = await prisma.carouselImage.findFirst({
    where: { section },
    orderBy: { order: 'desc' }
  });

  return (lastImage?.order || 0) + 1;
}

/**
 * Ejecuta todas las validaciones para una sección
 */
export async function validateSection(
  section: CarouselSection
): Promise<CarouselValidation> {
  let validation = await validateSectionMinImages(section);

  if (section === 'PRINCIPAL') {
    const typeValidation = await validatePrincipalTypes();
    const countValidation = await validatePrincipalCount();

    // Combinar todas las validaciones
    validation.errors.push(...typeValidation.errors, ...countValidation.errors);
    validation.warnings.push(...typeValidation.warnings, ...countValidation.warnings);
    validation.isValid = validation.errors.length === 0;
  }

  return validation;
}
