-- Migración para actualizar el enum CarouselType
-- De: HERO, PLANES, VISION, DOMOTICA
-- A: INTERNET, VIZION, DOMOTICA, NOVATEK

-- Paso 1: Crear un enum temporal con los nuevos valores
CREATE TYPE "CarouselType_new" AS ENUM ('INTERNET', 'VIZION', 'DOMOTICA', 'NOVATEK');

-- Paso 2: Convertir temporalmente la columna a TEXT
ALTER TABLE "carousel_images" 
ALTER COLUMN "type" TYPE TEXT;

-- Paso 3: Actualizar los datos con los nuevos valores
UPDATE "carousel_images" 
SET "type" = 'INTERNET'
WHERE "type" = 'HERO';

UPDATE "carousel_images" 
SET "type" = 'NOVATEK'
WHERE "type" = 'PLANES';

UPDATE "carousel_images" 
SET "type" = 'VIZION'
WHERE "type" = 'VISION';

-- Paso 4: Convertir la columna al nuevo enum
ALTER TABLE "carousel_images" 
ALTER COLUMN "type" TYPE "CarouselType_new" 
USING ("type"::"CarouselType_new");

-- Paso 5: Eliminar el enum antiguo
DROP TYPE "CarouselType";

-- Paso 6: Renombrar el nuevo enum al nombre original
ALTER TYPE "CarouselType_new" RENAME TO "CarouselType";
