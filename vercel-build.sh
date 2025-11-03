#!/bin/bash
set -e

echo "🏗 Ejecutando build en entorno Linux..."
# Forzar permisos de ejecución al binario de Prisma
chmod +x ./node_modules/.bin/prisma || true

# Regenerar cliente Prisma
npx prisma generate

echo "✅ Prisma Client generado correctamente para entorno Linux"
