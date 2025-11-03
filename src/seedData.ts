import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedData() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar datos existentes
  console.log('🧹 Limpiando productos existentes...');
  await prisma.product.deleteMany({});
  
  console.log('🧹 Limpiando categorías existentes...');
  await prisma.category.deleteMany({});
  
  console.log('🧹 Limpiando planes existentes...');
  await prisma.plan.deleteMany({});

  // Crear categorías
  console.log('📁 Creando categorías...');
  
  const categoriesData = [
    // Categorías Vision
    { name: 'Cámaras IP', slug: 'camaras-ip', description: 'Cámaras de seguridad IP de alta definición', productType: 'VISION' },
    { name: 'DVR/NVR', slug: 'dvr-nvr', description: 'Grabadores digitales y de red', productType: 'VISION' },
    { name: 'Accesorios Vision', slug: 'accesorios-vision', description: 'Cables, conectores y más', productType: 'VISION' },
    
    // Categorías Novatec
    { name: 'Computadoras', slug: 'computadoras', description: 'PCs de escritorio y laptops', productType: 'NOVATEC' },
    { name: 'Componentes', slug: 'componentes', description: 'Hardware y componentes de PC', productType: 'NOVATEC' },
    { name: 'Periféricos', slug: 'perifericos', description: 'Mouse, teclados, monitores', productType: 'NOVATEC' },
    // Nuevas categorías para los productos del adjunto
    { name: 'Redes', slug: 'redes', description: 'Routers, mesh, accesos', productType: 'NOVATEC' },
    { name: 'Energia', slug: 'energia', description: 'UPS, reguladores y protectores', productType: 'NOVATEC' },
    { name: 'Cerraduras', slug: 'cerraduras', description: 'Cerraduras inteligentes', productType: 'NOVATEC' },
    { name: 'Alarmas y CCTV', slug: 'alarmas-cctv', description: 'Kits de alarma y CCTV', productType: 'VISION' },
    { name: 'Cableado', slug: 'cableado', description: 'Servicios y cableado estructurado', productType: 'NOVATEC' },
  ];

  const categories = await Promise.all(
    categoriesData.map(cat => 
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat as any,
      })
    )
  );

  console.log(`✅ ${categories.length} categorías creadas`);

  // Crear productos de ejemplo
  console.log('📦 Creando productos...');

  const productsData = [
    // Productos Vision
    {
      name: 'Cámara IP Domo 2MP',
      slug: 'camara-ip-domo-2mp',
      description: 'Cámara IP tipo domo con resolución 2MP, visión nocturna hasta 30m',
      price: 89.99,
  imageUrl: 'http://localhost:5000/uploads/CAMARA EZVIZ 2MP FIJA  H1C MINI PARA INTERIOR-1761455277829-658061800.jpg',
      categoryId: categories.find(c => c.slug === 'camaras-ip')?.id,
      productType: 'VISION',
      features: { resolution: '1920x1080', nightVision: '30m', weatherproof: 'IP67' }
    },
    {
      name: 'Cámara IP Bullet 4MP',
      slug: 'camara-ip-bullet-4mp',
      description: 'Cámara IP tipo bullet con resolución 4MP, ideal para exteriores',
      price: 129.99,
  imageUrl: 'http://localhost:5000/uploads/CAMARA INALAMBRICA HOMETAPOC500 PTZ TP-LINK-1761455318224-768499090.jpg',
      categoryId: categories.find(c => c.slug === 'camaras-ip')?.id,
      productType: 'VISION',
      features: { resolution: '2560x1440', nightVision: '40m', weatherproof: 'IP67' }
    },
    
    // Productos Novatec
    {
      name: 'PC Gamer AMD Ryzen 5',
      slug: 'pc-gamer-amd-ryzen-5',
      description: 'PC completa con procesador AMD Ryzen 5, 16GB RAM, SSD 500GB',
      price: 899.99,
  imageUrl: 'http://localhost:5000/uploads/ROUTER TPLINK EC-225G-1761455458265-370326457.jpg',
      categoryId: categories.find(c => c.slug === 'computadoras')?.id,
      productType: 'NOVATEC',
      features: { processor: 'AMD Ryzen 5 5600X', ram: '16GB DDR4', storage: 'SSD 500GB' }
    },
    {
      name: 'Laptop Dell Inspiron 15',
      slug: 'laptop-dell-inspiron-15',
      description: 'Laptop Dell con procesador Intel i7, 16GB RAM, pantalla 15.6"',
      price: 799.99,
  imageUrl: 'http://localhost:5000/uploads/TPLINK DECO X50 (PACK DE 1 HASTA 3 UNIDADES)-1761455350930-516380869.jpg',
      categoryId: categories.find(c => c.slug === 'computadoras')?.id,
      productType: 'NOVATEC',
      features: { processor: 'Intel Core i7', ram: '16GB', display: '15.6" Full HD' }
    },
    // Productos añadidos desde Planes detallado.txt
    {
      name: 'Regulador Forza 1000VA (FVR-1011-USB)',
      slug: 'regulador-forza-1000va-fvr-1011-usb',
      description: 'Regulador automático de voltaje con puertos USB y protección integrada.',
      price: 89.0,
  imageUrl: 'http://localhost:5000/uploads/Forza Toma-1761455647418-554080986.jpg',
      categoryId: categories.find(c => c.slug === 'energia')?.id,
      productType: 'NOVATEC',
      features: { tipo: 'AVR', usb: true, proteccion: 'termofusible' }
    },
    {
      name: 'UPS 600VA 360W Hikvision',
      slug: 'ups-600va-360w-hikvision',
      description: 'UPS 600 VA / 360 W con 6 tomas, batería 12V/7Ah.',
      price: 129.0,
  imageUrl: 'http://localhost:5000/uploads/UPS DE 600 VA 360W 6 TOMAS HIKVISION-1761455662755-576546198.jpg',
      categoryId: categories.find(c => c.slug === 'energia')?.id,
      productType: 'NOVATEC',
      features: { capacidad: '600VA/360W', baterias: '12V/7Ah', salidas: 6 }
    },
    {
      name: 'Protector Powest Refrimatic',
      slug: 'protector-powest-refrimatic',
      description: 'Protector de voltaje para equipos de refrigeración hasta 800L.',
      price: 39.99,
  imageUrl: 'http://localhost:5000/uploads/PROTECTOR DE VOLTAJE -REFRIMATIC- POWEST-1761455604738-682186780.jpg',
      categoryId: categories.find(c => c.slug === 'energia')?.id,
      productType: 'NOVATEC',
      features: { rango: '100-130VAC', capacidad: '1200W' }
    },
    {
      name: 'Protector Powest Multimatic',
      slug: 'protector-powest-multimatic',
      description: 'Protector de voltaje multiusos para electrodomésticos y equipos electrónicos.',
      price: 34.99,
  imageUrl: 'http://localhost:5000/uploads/PROTECTOR DE VOLTAJE -MULTIMATIC- POWEST-1761455443715-985947326.jpg',
      categoryId: categories.find(c => c.slug === 'energia')?.id,
      productType: 'NOVATEC',
      features: { rango: '100-130VAC', capacidad: '1200W' }
    },
    {
      name: 'Router TP-Link EC-225G',
      slug: 'router-tplink-ec-225g',
      description: 'Router AC1300 con puertos Gigabit y soporte EasyMesh.',
      price: 79.99,
  imageUrl: 'http://localhost:5000/uploads/ROUTER TPLINK EC-225G-1761455458265-370326457.jpg',
      categoryId: categories.find(c => c.slug === 'redes')?.id,
      productType: 'NOVATEC',
      features: { wifi: 'AC1300', puertos: 'Gigabit', mesh: true }
    },
    {
      name: 'Router TP-Link HC220 (Cubo) WiFi 5',
      slug: 'router-tplink-hc220-cubo-wifi5',
      description: 'Router tipo cubo AC1200 con EasyMesh y gestión remota.',
      price: 49.99,
  imageUrl: 'http://localhost:5000/uploads/ROUTER TIPO CUBO TPLINK HC220 WIFI 5-1761455624944-72506334.jpg',
      categoryId: categories.find(c => c.slug === 'redes')?.id,
      productType: 'NOVATEC',
      features: { wifi: 'AC1200', puertos: '1 WAN/2 LAN Gigabit' }
    },
    {
      name: 'Router TP-Link HX220 WiFi 6',
      slug: 'router-tplink-hx220-wifi6',
      description: 'Router WiFi 6 AX1800 con EasyMesh y gestión cloud.',
      price: 99.99,
      imageUrl: null,
      categoryId: categories.find(c => c.slug === 'redes')?.id,
      productType: 'NOVATEC',
      features: { wifi: 'AX1800', mesh: true }
    },
    {
      name: 'TP-Link Deco M5 (pack)',
      slug: 'tplink-deco-m5-pack',
      description: 'Sistema Deco Mesh para cobertura extendida (1-3 unidades).',
      price: 179.99,
  imageUrl: 'http://localhost:5000/uploads/TPLINK DECO M5 (PACK DE 1 HASTA 3 UNIDADES)-1761455473425-540853758.jpg',
      categoryId: categories.find(c => c.slug === 'redes')?.id,
      productType: 'NOVATEC',
      features: { mesh: true, velocidad: '1267Mbps' }
    },
    {
      name: 'TP-Link Deco X50 (pack)',
      slug: 'tplink-deco-x50-pack',
      description: 'Sistema Deco WiFi 6 AX3000 para cobertura con AI mesh.',
      price: 299.99,
  imageUrl: 'http://localhost:5000/uploads/TPLINK DECO X50 (PACK DE 1 HASTA 3 UNIDADES)-1761455350930-516380869.jpg',
      categoryId: categories.find(c => c.slug === 'redes')?.id,
      productType: 'NOVATEC',
      features: { wifi: 'AX3000', mesh: true }
    },
    {
      name: 'Cámara Uniarch 2MP UHO-S2',
      slug: 'camara-uniarch-2mp-uho-s2',
      description: 'Cámara Uniarch 2MP con audio, H.265 y visión nocturna.',
      price: 59.99,
  imageUrl: 'http://localhost:5000/uploads/CAMARA UNIARCH 2MP INT UHO-S2-1761455427530-843823385.jpg',
      categoryId: categories.find(c => c.slug === 'camaras-ip')?.id,
      productType: 'VISION',
      features: { resolution: '2MP', audio: true, ir: '10m' }
    },
    {
      name: 'Cámara EZVIZ H1C Mini 2MP',
      slug: 'camara-ezviz-h1c-mini-2mp',
      description: 'Cámara EZVIZ 1080p para interior con lente gran angular y microSD.',
      price: 45.0,
  imageUrl: 'http://localhost:5000/uploads/CAMARA EZVIZ 2MP FIJA  H1C MINI PARA INTERIOR-1761455277829-658061800.jpg',
      categoryId: categories.find(c => c.slug === 'camaras-ip')?.id,
      productType: 'VISION',
      features: { resolution: '1080p', angle: '108°', microSD: '512GB' }
    },
    {
      name: 'Cámara Uniarch 3MP PTZ UHO-P1A-M3F4D',
      slug: 'camara-uniarch-3mp-ptz-uho-p1a-m3f4d',
      description: 'Cámara PTZ 3MP con IR hasta 30m, WDR y audio bidireccional.',
      price: 169.99,
  imageUrl: 'http://localhost:5000/uploads/CAMARA UNIARCH 3MP EXT PTZ UHO-P1A-M3F4D-1761455262456-242238997.jpg',
      categoryId: categories.find(c => c.slug === 'camaras-ip')?.id,
      productType: 'VISION',
      features: { resolution: '3MP', ir: '30m', ptz: true }
    },
    {
      name: 'Cámara Tapo C500 PTZ (Outdoor)',
      slug: 'camara-tapo-c500-ptz',
      description: 'Cámara exterior Tapo C500 con rotación 360°, detección y almacenamiento microSD.',
      price: 99.99,
  imageUrl: 'http://localhost:5000/uploads/CAMARA INALAMBRICA HOMETAPOC500 PTZ TP-LINK-1761455318224-768499090.jpg',
      categoryId: categories.find(c => c.slug === 'camaras-ip')?.id,
      productType: 'VISION',
      features: { resolution: '1080p', rotacion: '360°', ip: 'IP65' }
    },
    {
      name: 'Cámara Tapo C200 (Indoor)',
      slug: 'camara-tapo-c200-indoor',
      description: 'Cámara interior Tapo C200 1080p con detección de movimiento y microSD.',
      price: 29.99,
  imageUrl: 'http://localhost:5000/uploads/CAMARA INALAMBRICA INDOOR TAPO 360   C200 TP-LINK-1761455225759-172429831.jpg',
      categoryId: categories.find(c => c.slug === 'camaras-ip')?.id,
      productType: 'VISION',
      features: { resolution: '1080p', microSD: '128GB' }
    },
    {
      name: 'Cerradura Kadonio Smart M13',
      slug: 'cerradura-kadonio-smart-m13',
      description: 'Cerradura inteligente con huella, PIN, tarjetas y acceso remoto via app.',
      price: 149.99,
  imageUrl: 'http://localhost:5000/uploads/CERRADURA KADONIO SMART M13-1761455301952-940285731.jpg',
      categoryId: categories.find(c => c.slug === 'cerraduras')?.id,
      productType: 'NOVATEC',
      features: { apertura: ['huella','pin','tarjeta','llave'], app: true }
    },
    {
      name: 'Kits de alarma inalámbrica',
      slug: 'kits-alarma-inalambrica',
      description: 'Kits personalizados con sensores, sirena, control y botón de pánico.',
      price: 199.99,
  imageUrl: 'http://localhost:5000/uploads/SISTEMAS DE ALARMA INALÃMBRICAS-1761455238733-922475980.jpg',
      categoryId: categories.find(c => c.slug === 'alarmas-cctv')?.id,
      productType: 'VISION',
      features: { incluye: ['sensores','sirena','control','boton de panico'] }
    },
    {
      name: 'Servicio de Cableado Estructurado',
      slug: 'servicio-cableado-estructurado',
      description: 'Servicio profesional de cableado estructurado para oficinas y edificios.',
      price: null,
      imageUrl: null,
      categoryId: categories.find(c => c.slug === 'cableado')?.id,
      productType: 'NOVATEC',
      features: { descripcion: 'Instalacion y certificacion de cableado estructurado' }
    },
  ];

  // Copiar imágenes desde el cliente (si están disponibles) a la carpeta uploads del servidor
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const clientImagesDir = path.join(__dirname, '../../src/Image/Productos');

  // Construir mapa de imágenes disponibles con nombres normalizados
  const normalize = (s: string) => {
    // quitar acentos, pasar a minúsculas y reemplazar no-alfa-num por guiones
    const from = 'ÁÀÄÂáàäâÉÈËÊéèëêÍÌÏÎíìïîÓÒÖÔóòöôÚÙÜÛúùüûÑñçÇ'
    const to   = 'AAAAaaaaEEEEeeeeIIIIiiiiOOOOooooUUUUuuuuNncc'
    let res = s.split('').map(ch => {
      const idx = from.indexOf(ch)
      return idx !== -1 ? to[idx] : ch
    }).join('')
    res = res.toLowerCase()
    res = res.replace(/[^a-z0-9]+/g, '-')
    res = res.replace(/^-+|-+$/g, '')
    return res
  }

  let clientFiles: string[] = []
  try {
    clientFiles = fs.existsSync(clientImagesDir) ? fs.readdirSync(clientImagesDir) : []
  } catch (err) {
    clientFiles = []
  }

  const fileMap: Record<string, string> = {}
  for (const f of clientFiles) {
    const ext = path.extname(f).toLowerCase()
    if (!['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) continue
    const base = path.basename(f, ext)
    const norm = normalize(base)
    fileMap[norm] = f
  }

  for (const prod of productsData) {
    try {
      if (!prod.imageUrl) {
        const slugNorm = normalize(prod.slug || prod.name || '')

        // Priorizar coincidencia exacta, luego includes, luego startsWith
        let matched: string | null = null

        if (fileMap[slugNorm]) matched = fileMap[slugNorm]
        else {
          // buscar por includes
          for (const normName of Object.keys(fileMap)) {
            if (normName.includes(slugNorm) || slugNorm.includes(normName)) {
              matched = fileMap[normName]
              break
            }
          }
        }

        if (matched) {
          const found = path.join(clientImagesDir, matched)
          const ext = path.extname(found).toLowerCase()
          const base = path.basename(found, ext)
          const normFilename = `${normalize(base)}${ext}`
          const dest = path.join(uploadsDir, normFilename)
          if (!fs.existsSync(dest)) {
            fs.copyFileSync(found, dest)
            console.log(`📷 Copiada imagen ${matched} -> uploads as ${normFilename}`)
          }
          prod.imageUrl = `http://localhost:5000/uploads/${encodeURI(normFilename)}`
        }
      }
    } catch (err) {
      console.error('Error manejando imagen para', prod.slug, err)
    }
  }

  // Asegurar que cada producto tenga stock por defecto si no fue especificado
  for (const prod of productsData) {
    if (typeof (prod as any).stock === 'undefined') (prod as any).stock = 10
  }

  const products = await Promise.all(
    productsData.map(prod => 
      prisma.product.upsert({
        where: { slug: prod.slug },
        update: {},
        create: prod as any,
      })
    )
  );

  console.log(`✅ ${products.length} productos creados`);

  // Crear planes
  console.log('📋 Creando planes...');

  const plansData = [
    // Planes importados desde "Planes detallado.txt"
    {
      name: 'Plan Estudiantil',
      description: '400 MBPS',
      price: 16.49,
      features: [
        'Velocidad: 400 Mbps',
        'Uso: streaming FullHD, teletrabajo, clases virtuales',
        '2 PC / Laptops',
        '1 Consola de videojuegos',
        '4 Teléfonos / Tablets',
        '1 Smart TV'
      ],
      category: 'HOGAR',
      isPopular: false,
    },
    {
      name: 'Plan Estudiantil Pro',
      description: '500 MBPS',
      price: 17.99,
      features: [
        'Velocidad: 500 Mbps',
        'Uso: streaming FullHD, más demanda',
        '2 PC / Laptops',
        '1 Consola de videojuegos',
        '4 Teléfonos / Tablets',
        '2 Smart TV'
      ],
      category: 'HOGAR',
      isPopular: false,
    },
    {
      name: 'Plan Family',
      description: '600 MBPS',
      price: 20.99,
      features: [
        'Velocidad: 600 Mbps',
        'Uso: familia estándar, streaming 4K, domótica y cámaras',
        '2 PC / Laptops',
        '1 Consola de videojuegos',
        '5 Teléfonos / Tablets',
        '2 Smart TV'
      ],
      category: 'HOGAR',
      isPopular: false,
    },
    {
      name: 'Plan Family Pro',
      description: '700 MBPS',
      price: 22.49,
      features: [
        'Velocidad: 700 Mbps',
        'Uso: familia superior, más demanda en 4K y domótica',
        '3 PC / Laptops',
        '1 Consola de videojuegos',
        '5 Teléfonos / Tablets',
        '3 Smart TV'
      ],
      category: 'HOGAR',
      isPopular: false,
    },
    {
      name: 'Plan Cool',
      description: '800 MBPS',
      price: 25.49,
      features: [
        'Velocidad: 800 Mbps',
        'Uso: familiar, laboral, gaming; streaming hasta 8K',
        '3 PC / Laptops',
        '2 Consolas de videojuegos',
        '6 Teléfonos / Tablets',
        '3 Smart TV'
      ],
      category: 'HOGAR',
      isPopular: false,
    },
    {
      name: 'Plan Cool Pro',
      description: '900 MBPS',
      price: 26.99,
      features: [
        'Velocidad: 900 Mbps',
        'Uso: familiar y gaming, mayor demanda en 8K',
        '3 PC / Laptops',
        '2 Consolas de videojuegos',
        '6 Teléfonos / Tablets',
        '4 Smart TV'
      ],
      category: 'HOGAR',
      isPopular: false,
    },
    {
      name: 'Plan Gamer',
      description: '1 GB',
      price: 29.99,
      features: [
        'Velocidad: 1000 Mbps',
        'Uso: gaming exigente, streaming 8K en varios dispositivos',
        '4 PC / Laptops',
        '3 Consolas de videojuegos',
        '7 Teléfonos / Tablets',
        '4 Smart TV'
      ],
      category: 'GAMER',
      isPopular: true,
    },
    {
      name: 'Plan Gamer Pro',
      description: '1.1 GB',
      price: 31.49,
      features: [
        'Velocidad: 1100 Mbps',
        'Uso: usuarios exigentes, gaming sin lag y streaming 8K',
        '4 PC / Laptops',
        '4 Consolas de videojuegos',
        '7 Teléfonos / Tablets',
        '4 Smart TV'
      ],
      category: 'GAMER',
      isPopular: true,
    },
  ];

  const plans = await Promise.all(
    plansData.map((plan, index) => 
      prisma.plan.upsert({
        where: { id: `plan-${index}` },
        update: {},
        create: plan as any,
      })
    )
  );

  console.log(`✅ ${plans.length} planes creados`);

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log(`\n📊 Resumen:`);
  console.log(`   Categorías: ${categories.length}`);
  console.log(`   Productos: ${products.length}`);
  console.log(`   Planes: ${plans.length}`);
}

seedData()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });