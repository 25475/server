import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function createCategoryIfNotExists(name, slug, productType, description) {
  let category = await prisma.category.findUnique({ where: { slug } });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        productType,
      },
    });
    console.log(`📁 Categoría creada: ${name}`);
  }

  return category;
}

async function main() {
  console.log("🚀 Iniciando seed de PRODUCTOS...\n");

  // CATEGORÍAS
  const energia = await createCategoryIfNotExists(
    "Energía y Protección",
    "energia-proteccion",
    "NOVATEK",
    "UPS, reguladores y protectores de voltaje"
  );

  const routers = await createCategoryIfNotExists(
    "Routers y WiFi",
    "routers-wifi",
    "NOVATEK",
    "Routers inalámbricos para el hogar y empresa"
  );

  const mesh = await createCategoryIfNotExists(
    "Sistemas Mesh",
    "sistemas-mesh",
    "NOVATEK",
    "Cobertura WiFi total con tecnología Mesh"
  );

  const camaras = await createCategoryIfNotExists(
    "Cámaras de Seguridad",
    "camaras-seguridad",
    "VIZION",
    "Cámaras para interior y exterior"
  );

  const domotica = await createCategoryIfNotExists(
    "Domótica",
    "domotica",
    "DOMOTICA",
    "Automatización inteligente del hogar"
  );

  const serviciosSeguridad = await createCategoryIfNotExists(
    "Servicios de Seguridad",
    "servicios-seguridad",
    "SERVICIOS",
    "Alarmas, CCTV y soluciones de seguridad"
  );

  const infraestructura = await createCategoryIfNotExists(
    "Infraestructura de Red",
    "infraestructura-red",
    "SERVICIOS",
    "Cableado estructurado y redes"
  );

  // PRODUCTOS (ajustado a tu schema)
  const products = [
    {
      name: "Regulador de Voltaje Forza 1000VA FVR-1011-USB",
      description:
        "Unidad compacta que ofrece protección eléctrica con regulación automática de voltaje y puertos USB integrados.",
      price: null,
      imageUrl: null,
      features: [
        "Regulador Automático de Voltaje (AVR)",
        "Protección contra picos de voltaje",
        "2 puertos USB",
        "Indicadores LED",
        "Termofusible de protección",
        "Instalación vertical u horizontal",
      ],
      stock: 0,
      categoryId: energia.id,
      productType: "NOVATEK",
    },
    {
      name: "UPS Hikvision 600VA / 360W (6 Tomas)",
      description:
        "UPS con 6 salidas (4 con respaldo y 2 sin respaldo), ideal para respaldo eléctrico y protección.",
      price: null,
      imageUrl: null,
      features: [
        "Capacidad 600 VA / 360 W",
        "Batería 12 V / 7 Ah",
        "Voltaje entrada 85-150 V",
        "Voltaje salida 102-132 V",
        "6 salidas (4 respaldo + 2 sin respaldo)",
      ],
      stock: 0,
      categoryId: energia.id,
      productType: "NOVATEK",
    },
    {
      name: "Router TP-Link EC225-G",
      description:
        "Router Wi-Fi AC1300 con puertos Gigabit, cobertura amplia y compatibilidad EasyMesh.",
      price: null,
      imageUrl: null,
      features: [
        "Wi-Fi AC1300 (Dual Band)",
        "Puertos Gigabit",
        "Beamforming + 4 antenas",
        "EasyMesh",
        "Seguridad WPA3",
      ],
      stock: 0,
      categoryId: routers.id,
      productType: "NOVATEK",
    },
    {
      name: "TP-Link Deco X50 Wi-Fi 6 Mesh",
      description:
        "Sistema Mesh Wi-Fi 6 AX3000 con cobertura sin cortes y optimización inteligente.",
      price: null,
      imageUrl: null,
      features: [
        "Wi-Fi 6 AX3000",
        "3 puertos Gigabit",
        "Mesh con AI",
        "HomeShield",
        "Cobertura hasta 232 m2 (1 unidad)",
      ],
      stock: 0,
      categoryId: mesh.id,
      productType: "NOVATEK",
    },
    {
      name: "Cámara EZVIZ H1C Mini 2MP Interior",
      description:
        "Cámara interior 1080p con visión nocturna, detección de movimiento y audio bidireccional.",
      price: null,
      imageUrl: null,
      features: [
        "1080p",
        "Lente gran angular 108°",
        "Visión nocturna (hasta 10 m)",
        "Detección de movimiento",
        "Audio bidireccional",
      ],
      stock: 0,
      categoryId: camaras.id,
      productType: "VIZION",
    },
    {
      name: "Cerradura Kadonio Smart M13",
      description:
        "Cerradura inteligente con huella, PIN, tarjetas, llaves y control desde app.",
      price: null,
      imageUrl: null,
      features: [
        "Huella dactilar",
        "Códigos de acceso (App)",
        "Tarjetas de acceso",
        "Llaves convencionales",
        "Notificaciones en tiempo real",
      ],
      stock: 0,
      categoryId: domotica.id,
      productType: "DOMOTICA",
    },
    {
      name: "Sistemas de Alarma Inalámbricas (Servicio)",
      description:
        "Kits de alarma personalizables con sensores, sirena, control y botón de pánico.",
      price: null,
      imageUrl: null,
      features: [
        "Sensores de apertura",
        "Detectores de movimiento",
        "Sirena",
        "Control de alarma",
        "Botón de pánico",
      ],
      stock: null,
      categoryId: serviciosSeguridad.id,
      productType: "SERVICIOS",
    },
    {
      name: "Cableado Estructurado (Servicio)",
      description:
        "Implementación de infraestructura de comunicaciones para voz, datos y video.",
      price: null,
      imageUrl: null,
      features: [
        "Redes modernas",
        "Oficinas y edificios inteligentes",
        "Base para voz/datos/video",
        "Ordenado y escalable",
      ],
      stock: null,
      categoryId: infraestructura.id,
      productType: "SERVICIOS",
    },
  ];

  for (const p of products) {
    const slug = slugify(p.name);

    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) {
      console.log(`⚠️ Ya existe: ${p.name}`);
      continue;
    }

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        features: p.features,
        stock: p.stock,
        categoryId: p.categoryId,
        productType: p.productType,
      },
    });

    console.log(`✅ Creado: ${p.name}`);
  }

  console.log("\n🎉 Seed de PRODUCTOS completado");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("❌ Error:", err);
  await prisma.$disconnect();
});
