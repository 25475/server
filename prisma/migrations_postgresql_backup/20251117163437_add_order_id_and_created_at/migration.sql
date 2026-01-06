/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `ordenes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ordenes" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_orderId_key" ON "ordenes"("orderId");
