-- CreateEnum
CREATE TYPE "PlanCategory" AS ENUM ('HOGAR', 'GAMER', 'EMPRESARIAL');

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "category" "PlanCategory" NOT NULL DEFAULT 'HOGAR';
