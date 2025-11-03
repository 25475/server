#!/bin/bash
set -e

echo "🏗 Ejecutando build en entorno Linux..."
# Evitar ejecutar el binario local de node_modules/.bin/prisma que a veces
# viene sin bit de ejecución en el entorno de Vercel y genera "Permission denied".
# Usamos npx para invocar la versión del paquete directamente, esto fuerza la
# descarga/ejecución del binario correcto en tiempo de ejecución y evita el error.
npx --yes --package prisma prisma generate

echo "✅ Prisma Client generado correctamente para entorno Linux"
