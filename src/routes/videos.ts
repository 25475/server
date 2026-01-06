import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../app";

const router = express.Router();

// Asegurar que el directorio de videos existe
const videosDir = path.join(__dirname, "../../uploads/videos");
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Configuración de Multer para videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB máximo
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /video\/(mp4|webm|ogg|mov|avi|mkv)/;
    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido. Solo se aceptan videos."));
    }
  },
});

// SUBIR VIDEO
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { section, title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    if (!section) {
      return res.status(400).json({ error: "La sección es requerida" });
    }

    const url = `/uploads/videos/${req.file.filename}`;

    const video = await prisma.video.create({
      data: {
        url,
        section,
        title: title || null,
        description: description || null,
      },
    });

    console.log(`✅ Video subido: ${video.id} - Sección: ${section}`);
    res.json({ message: "Video subido correctamente", video });
  } catch (err) {
    console.error("❌ Error al subir video:", err);
    res.status(500).json({ error: "Error al subir video" });
  }
});

// OBTENER TODOS LOS VIDEOS DE UNA SECCIÓN
router.get("/", async (req, res) => {
  try {
    const { section } = req.query;

    const whereClause = section ? { section: section as string } : {};

    const videos = await prisma.video.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        url: true,
        section: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(videos);
  } catch (err) {
    console.error("❌ Error al obtener videos:", err);
    res.status(500).json({ error: "Error al obtener videos" });
  }
});

// OBTENER UN VIDEO POR ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        section: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!video) {
      return res.status(404).json({ error: "Video no encontrado" });
    }

    res.json(video);
  } catch (err) {
    console.error("❌ Error al obtener video:", err);
    res.status(500).json({ error: "Error al obtener video" });
  }
});

// ELIMINAR VIDEO
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      return res.status(404).json({ error: "Video no encontrado" });
    }

    // Eliminar archivo físico
    const filePath = path.join(__dirname, "../..", video.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar de base de datos
    await prisma.video.delete({
      where: { id },
    });

    console.log(`🗑️ Video eliminado: ${id}`);
    res.json({ message: "Video eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar video:", err);
    res.status(500).json({ error: "Error al eliminar video" });
  }
});

// ACTUALIZAR VIDEO (título, descripción, sección, estado, archivo opcional)
router.put("/:id", upload.single("video"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, section, status } = req.body;

    // Buscar video actual
    const current = await prisma.video.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: "Video no encontrado" });

    let url = current.url;
    // Si se subió un nuevo archivo, reemplazarlo
    if (req.file) {
      // Eliminar archivo anterior
      const oldPath = path.join(__dirname, "../..", current.url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      url = `/uploads/videos/${req.file.filename}`;
    }

    const video = await prisma.video.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(section !== undefined && { section }),
        ...(status !== undefined && { status }),
        url,
      },
    });

    res.json({ message: "Video actualizado", video });
  } catch (err) {
    console.error("❌ Error al actualizar video:", err);
    res.status(500).json({ error: "Error al actualizar video" });
  }
});

// SUSPENDER O REACTIVAR VIDEO (solo estado)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['activo','suspendido'].includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }
    const video = await prisma.video.update({
      where: { id },
      data: { status },
    });
    res.json({ message: `Video ${status === 'suspendido' ? 'suspendido' : 'reactivado'}`, video });
  } catch (err) {
    console.error("❌ Error al cambiar estado:", err);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
});

export const videoRoutes = router;
