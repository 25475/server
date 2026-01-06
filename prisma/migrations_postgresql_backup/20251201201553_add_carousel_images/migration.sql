-- CreateEnum
CREATE TYPE "CarouselSection" AS ENUM ('PRINCIPAL', 'NOSOTROS', 'PLANES', 'VISION', 'NOVATEK');

-- CreateEnum
CREATE TYPE "CarouselType" AS ENUM ('HERO', 'PLANES', 'VISION', 'DOMOTICA');

-- CreateTable
CREATE TABLE "carousel_images" (
    "id" TEXT NOT NULL,
    "section" "CarouselSection" NOT NULL,
    "type" "CarouselType",
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carousel_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "carousel_images_section_idx" ON "carousel_images"("section");

-- CreateIndex
CREATE INDEX "carousel_images_section_order_idx" ON "carousel_images"("section", "order");

-- CreateIndex
CREATE UNIQUE INDEX "carousel_images_section_type_key" ON "carousel_images"("section", "type");
