-- ========================================
-- SCRIPT DE MIGRACIÓN: PostgreSQL → MySQL
-- ========================================
-- Crea todas las tablas en MySQL
-- Fecha: 20 de diciembre, 2025
-- Base de datos: systray_db (o el nombre que elijas)
-- ========================================

-- Asegúrate de estar en la base de datos correcta
-- USE systray_db;

-- ========================================
-- 1. TABLA: categories
-- ========================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `productType` VARCHAR(50) NOT NULL,
  `imageUrl` VARCHAR(500) NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'activo',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_productType_idx` (`productType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 2. TABLA: products
-- ========================================
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DOUBLE NULL,
  `imageUrl` VARCHAR(500) NULL,
  `features` JSON NULL,
  `stock` INT NULL DEFAULT 0,
  `categoryId` VARCHAR(36) NOT NULL,
  `productType` VARCHAR(50) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  KEY `products_categoryId_idx` (`categoryId`),
  KEY `products_productType_idx` (`productType`),
  CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 3. TABLA: plans
-- ========================================
CREATE TABLE IF NOT EXISTS `plans` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DOUBLE NOT NULL,
  `imageUrl` VARCHAR(500) NULL,
  `features` JSON NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'HOGAR',
  `isPopular` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `plans_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 4. TABLA: admins
-- ========================================
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `admins_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 5. TABLA: orders
-- ========================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(36) NOT NULL,
  `customerName` VARCHAR(255) NOT NULL,
  `customerEmail` VARCHAR(255) NOT NULL,
  `customerPhone` VARCHAR(50) NULL,
  `address` TEXT NOT NULL,
  `reference` VARCHAR(255) NULL,
  `total` DOUBLE NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `paymentMethod` VARCHAR(100) NULL,
  `transactionId` VARCHAR(255) NULL,
  `pdfUrl` VARCHAR(500) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `orders_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 6. TABLA: order_items
-- ========================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` VARCHAR(36) NOT NULL,
  `orderId` VARCHAR(36) NOT NULL,
  `productId` VARCHAR(36) NOT NULL,
  `productName` VARCHAR(255) NOT NULL,
  `price` DOUBLE NOT NULL,
  `quantity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_orderId_idx` (`orderId`),
  CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 7. TABLA: ordenes
-- ========================================
CREATE TABLE IF NOT EXISTS `ordenes` (
  `id` VARCHAR(36) NOT NULL,
  `orderId` VARCHAR(50) NULL,
  `nombreCliente` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(50) NOT NULL,
  `productos` JSON NOT NULL,
  `total` DOUBLE NOT NULL,
  `pdfUrl` VARCHAR(500) NOT NULL,
  `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `estado` VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ordenes_orderId_unique` (`orderId`),
  KEY `ordenes_estado_idx` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 8. TABLA: interest_links
-- ========================================
CREATE TABLE IF NOT EXISTS `interest_links` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 9. TABLA: carousel_images
-- ========================================
CREATE TABLE IF NOT EXISTS `carousel_images` (
  `id` VARCHAR(36) NOT NULL,
  `section` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NULL,
  `url` VARCHAR(500) NOT NULL,
  `order` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `carousel_images_section_idx` (`section`),
  KEY `carousel_images_section_order_idx` (`section`, `order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 10. TABLA: videos
-- ========================================
CREATE TABLE IF NOT EXISTS `videos` (
  `id` VARCHAR(36) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `section` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'activo',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `videos_section_idx` (`section`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- MIGRACIÓN COMPLETADA
-- ========================================
-- Todas las tablas han sido creadas
-- Siguiente paso: Importar datos desde PostgreSQL
-- ========================================
