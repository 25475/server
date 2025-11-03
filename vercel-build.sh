#!/bin/bash
set -e

echo "🏗 Ejecutando build en entorno Linux..."
chmod +x ./node_modules/.bin/prisma || true
npx prisma generate
echo "✅ Prisma Client generado correctamente para entorno Linux"
