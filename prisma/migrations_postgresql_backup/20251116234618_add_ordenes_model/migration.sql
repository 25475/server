-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('APROBADA', 'PENDIENTE', 'RECHAZADA');

-- CreateTable
CREATE TABLE "ordenes" (
    "id" TEXT NOT NULL,
    "nombreCliente" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "productos" JSONB NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "ordenes_pkey" PRIMARY KEY ("id")
);
