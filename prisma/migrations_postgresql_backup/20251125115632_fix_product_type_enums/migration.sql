-- AlterEnum
BEGIN;
  CREATE TYPE "ProductType_new" AS ENUM ('VIZION', 'NOVATEK');
  ALTER TABLE "categories" ALTER COLUMN "productType" DROP DEFAULT;
  ALTER TABLE "products" ALTER COLUMN "productType" DROP DEFAULT;
  ALTER TABLE "categories" ALTER COLUMN "productType" TYPE "ProductType_new" USING CASE 
    WHEN "productType"::text = 'VISION' THEN 'VIZION'::"ProductType_new"
    WHEN "productType"::text = 'NOVATEC' THEN 'NOVATEK'::"ProductType_new"
    ELSE "productType"::text::"ProductType_new"
  END;
  ALTER TABLE "products" ALTER COLUMN "productType" TYPE "ProductType_new" USING CASE 
    WHEN "productType"::text = 'VISION' THEN 'VIZION'::"ProductType_new"
    WHEN "productType"::text = 'NOVATEC' THEN 'NOVATEK'::"ProductType_new"
    ELSE "productType"::text::"ProductType_new"
  END;
  DROP TYPE "ProductType";
  ALTER TYPE "ProductType_new" RENAME TO "ProductType";
COMMIT;
