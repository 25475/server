-- Actualizar productos HIVISION a VISION
UPDATE products SET "productType" = 'VISION' WHERE "productType" = 'HIVISION';

-- Actualizar categorías HIVISION a VISION
UPDATE categories SET "productType" = 'VISION' WHERE "productType" = 'HIVISION';

-- Eliminar datos HIVISION si existen
DELETE FROM products WHERE "productType" = 'HIVISION';
DELETE FROM categories WHERE "productType" = 'HIVISION';