/**
 * Controlador para gestión de imágenes de carruseles
 */

import { Request, Response } from 'express';
import {
  CarouselSection,
  CarouselType,
  CreateCarouselImageRequest,
  UpdateCarouselOrderRequest,
  CAROUSEL_SECTIONS,
  CAROUSEL_SECTION_CONFIG
} from '../types/carousel';
import {
  validateCarouselImageData,
  validateSectionMinImages,
  validatePrincipalTypes,
  validatePrincipalCount,
  getNextOrder,
  validateSection
} from '../utils/carouselValidation';
import { prisma } from '../app';

/**
 * GET /carousel
 * Obtiene todas las imágenes de un carrusel o todas las secciones
 */
export async function getCarouselImages(req: Request, res: Response) {
  try {
    const { section } = req.query;

    let whereClause: any = {};
    if (section) {
      if (!CAROUSEL_SECTIONS.includes(section as CarouselSection)) {
        return res.status(400).json({
          error: `Sección inválida: ${section}`,
          validSections: CAROUSEL_SECTIONS
        });
      }
      whereClause = { section: section as CarouselSection };
    }

    const images = await prisma.carouselImage.findMany({
      where: whereClause,
      orderBy: [{ section: 'asc' }, { order: 'asc' }]
    });

    res.json({
      success: true,
      data: images,
      count: images.length
    });
  } catch (error) {
    console.error('Error al obtener imágenes del carrusel:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener imágenes del carrusel'
    });
  }
}

/**
 * GET /carousel/:id
 * Obtiene una imagen específica
 */
export async function getCarouselImageById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const image = await prisma.carouselImage.findUnique({
      where: { id }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener imagen'
    });
  }
}

/**
 * POST /carousel
 * Crea una nueva imagen en un carrusel
 */
export async function createCarouselImage(req: Request, res: Response) {
  try {
    const { section, type, url }: CreateCarouselImageRequest = req.body;

    // Validar entrada
    if (!section || !url) {
      return res.status(400).json({
        success: false,
        error: 'section y url son requeridos'
      });
    }

    // Validar datos
    const validation = validateCarouselImageData(section, type, url);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    // Validar sección
    if (!CAROUSEL_SECTIONS.includes(section)) {
      return res.status(400).json({
        success: false,
        error: `Sección inválida: ${section}`,
        validSections: CAROUSEL_SECTIONS
      });
    }

    // Validaciones específicas para PRINCIPAL
    if (section === 'PRINCIPAL') {
      // Verificar que no pasaría de 4 imágenes totales
      const count = await prisma.carouselImage.count({
        where: { section: 'PRINCIPAL' }
      });

      if (count >= 4) {
        return res.status(409).json({
          success: false,
          error: 'PRINCIPAL ya tiene 4 imágenes (máximo permitido)',
          currentCount: count
        });
      }
    } else {
      // Para otras secciones, validar mínimo
      const config = CAROUSEL_SECTION_CONFIG[section];
      const count = await prisma.carouselImage.count({
        where: { section: section as any }
      });

      if (count >= config.maxImages) {
        return res.status(409).json({
          success: false,
          error: `${section} alcanzó el máximo de ${config.maxImages} imágenes`,
          currentCount: count
        });
      }
    }

    // Obtener siguiente orden
    const order = await getNextOrder(section);

    // Crear imagen
    const image = await prisma.carouselImage.create({
      data: {
        section: section as any,
        type: section === 'PRINCIPAL' ? (type as CarouselType) : undefined,
        url,
        order
      }
    });

    res.status(201).json({
      success: true,
      data: image,
      message: 'Imagen creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear imagen del carrusel:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear imagen del carrusel'
    });
  }
}

/**
 * PUT /carousel/:id
 * Actualiza una imagen existente
 */
export async function updateCarouselImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { url, order }: Partial<CreateCarouselImageRequest> = req.body;

    // Verificar que la imagen existe
    const existing = await prisma.carouselImage.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }

    // Preparar datos para actualizar
    const updateData: any = {};

    if (url !== undefined) {
      // Validar URL - aceptar URLs absolutas y relativas
      if (!url || url.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'URL no puede estar vacía'
        });
      }
      
      // Validar formato básico (absoluta o relativa)
      const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
      const isRelative = url.startsWith('/');
      
      if (!isAbsolute && !isRelative) {
        return res.status(400).json({
          success: false,
          error: 'URL debe ser absoluta (http/https) o relativa (empezar con /)'
        });
      }
      
      updateData.url = url;
    }

    if (order !== undefined) {
      if (typeof order !== 'number' || order < 1) {
        return res.status(400).json({
          success: false,
          error: 'order debe ser un número positivo'
        });
      }
      updateData.order = order;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay datos para actualizar'
      });
    }

    // Actualizar imagen
    const updated = await prisma.carouselImage.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updated,
      message: 'Imagen actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar imagen:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar imagen'
    });
  }
}

/**
 * DELETE /carousel/:id
 * Elimina una imagen
 */
export async function deleteCarouselImage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Verificar que existe
    const existing = await prisma.carouselImage.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }

    // Si es de PRINCIPAL, verificar que no sea la última de su tipo
    if (existing.section === 'PRINCIPAL') {
      const validation = await validatePrincipalTypes();
      if (!validation.isValid && existing.type) {
        // Contar cuántas de este tipo hay
        const count = await prisma.carouselImage.count({
          where: {
            section: 'PRINCIPAL',
            type: existing.type
          }
        });

        if (count === 1) {
          return res.status(409).json({
            success: false,
            error: `No se puede eliminar la última imagen de tipo ${existing.type}. PRINCIPAL requiere una de cada tipo.`
          });
        }
      }
    }

    // Eliminar imagen
    await prisma.carouselImage.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar imagen'
    });
  }
}

/**
 * PUT /carousel/order
 * Actualiza el orden de imágenes en una sección
 */
export async function updateCarouselOrder(req: Request, res: Response) {
  try {
    const { section, images }: UpdateCarouselOrderRequest = req.body;

    if (!section || !images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        error: 'section e images (array) son requeridos'
      });
    }

    // Validar sección
    if (!CAROUSEL_SECTIONS.includes(section)) {
      return res.status(400).json({
        success: false,
        error: `Sección inválida: ${section}`
      });
    }

    // Actualizar orden de cada imagen
    const updates = images.map(({ id, order }) =>
      prisma.carouselImage.update({
        where: { id },
        data: { order }
      })
    );

    const updated = await Promise.all(updates);

    res.json({
      success: true,
      data: updated,
      message: 'Orden actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error al actualizar orden:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Una o más imágenes no encontradas'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar orden'
    });
  }
}

/**
 * GET /carousel/validate/:section
 * Valida el estado de una sección
 */
export async function validateCarouselSection(req: Request, res: Response) {
  try {
    const { section } = req.params;

    if (!CAROUSEL_SECTIONS.includes(section as CarouselSection)) {
      return res.status(400).json({
        success: false,
        error: `Sección inválida: ${section}`
      });
    }

    const validation = await validateSection(section as CarouselSection);

    res.json({
      success: true,
      data: validation,
      isValid: validation.isValid
    });
  } catch (error) {
    console.error('Error al validar sección:', error);
    res.status(500).json({
      success: false,
      error: 'Error al validar sección'
    });
  }
}

/**
 * GET /carousel/stats
 * Obtiene estadísticas de todas las secciones
 */
export async function getCarouselStats(req: Request, res: Response) {
  try {
    // Filtrar solo secciones que existen en Prisma (excluir DOMOTICA temporalmente si causa error)
    const validSections = CAROUSEL_SECTIONS.filter(s => {
      try {
        // Verificar si la sección es válida en Prisma
        return ['PRINCIPAL', 'NOSOTROS', 'PLANES', 'VISION', 'NOVATEK', 'DOMOTICA'].includes(s);
      } catch {
        return false;
      }
    });

    const stats = await Promise.all(
      validSections.map(async (section) => {
        try {
          const count = await prisma.carouselImage.count({
            where: { section: section as any }
          });
          const validation = await validateSection(section);

          return {
            section,
            count,
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: validation.warnings
          };
        } catch (error) {
          console.error(`Error en stats para ${section}:`, error);
          return {
            section,
            count: 0,
            isValid: false,
            errors: [`Error al cargar estadísticas de ${section}`],
            warnings: []
          };
        }
      })
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
