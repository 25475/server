-- Migración manual para actualizar los tipos de carrusel existentes
-- De los valores antiguos a los nuevos

-- HERO → INTERNET
UPDATE "carousel_images" 
SET "type" = 'INTERNET' 
WHERE "type" = 'HERO';

-- PLANES → NOVATEK  
UPDATE "carousel_images" 
SET "type" = 'NOVATEK' 
WHERE "type" = 'PLANES';

-- VISION → VIZION (si existe)
UPDATE "carousel_images" 
SET "type" = 'VIZION' 
WHERE "type" = 'VISION';

-- Nota: DOMOTICA permanece igual
