"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = void 0;
const express_1 = __importDefault(require("express"));
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
exports.uploadRoutes = router;
// Ruta para subir una imagen
router.post('/', auth_1.authenticateToken, upload_1.upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ningún archivo' });
        }
        // Devolver la URL de la imagen
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({
            success: true,
            imageUrl,
            filename: req.file.filename
        });
    }
    catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ error: 'Error al subir la imagen' });
    }
});
