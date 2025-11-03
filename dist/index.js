"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const products_1 = require("./routes/products");
const categories_1 = require("./routes/categories");
const plans_1 = require("./routes/plans");
const auth_1 = require("./routes/auth");
const upload_1 = require("./routes/upload");
const payments_1 = require("./routes/payments");
const orders_1 = require("./routes/orders");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Rutas
app.use('/api/products', products_1.productRoutes);
app.use('/api/categories', categories_1.categoryRoutes);
app.use('/api/plans', plans_1.planRoutes);
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/upload', upload_1.uploadRoutes);
app.use('/api/payments', payments_1.paymentRoutes);
app.use('/api/orders', orders_1.orderRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
