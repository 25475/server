#!/bin/bash
# Script de build personalizado para Vercel

echo "🏗 Ejecutando build en entorno Linux..."
chmod +x ./node_modules/.bin/prisma

npx prisma generate
echo "✅ Prisma Client generado correctamente para entorno Linux"

# Si tienes un paso adicional, como TypeScript build o copiar archivos, puedes añadirlo aquí
# Ejemplo: npm run tsc
echo "🏗 Build completado."