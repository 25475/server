/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `productType` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `categories` table. All the data in the column will be lost.
  - Added the required column `section` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "categories_slug_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "imageUrl",
DROP COLUMN "name",
DROP COLUMN "productType",
DROP COLUMN "slug",
ADD COLUMN     "section" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'activo',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'activo';
