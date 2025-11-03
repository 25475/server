"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = (0, express_1.Router)();
exports.orderRoutes = router;
const prisma = new client_1.PrismaClient();
// Crear orden: valida stock, decrementa inventario, genera PDF y envía email
router.post('/', async (req, res) => {
    try {
        const { customer, items, payment } = req.body;
        if (!customer || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid payload' });
        }
        // Validar stock
        const productIds = items.map((i) => i.productId);
        const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
        for (const it of items) {
            const p = products.find(x => x.id === it.productId);
            if (!p)
                return res.status(400).json({ error: `Producto no encontrado ${it.productId}` });
            if ((p.stock || 0) < it.quantity)
                return res.status(400).json({ error: `Stock insuficiente para ${p.name}` });
        }
        // Decrementar stock
        for (const it of items) {
            await prisma.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.quantity } } });
        }
        const total = items.reduce((s, a) => s + (a.price || 0) * a.quantity, 0);
        // Crear orden
        const order = await prisma.order.create({
            data: {
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone || null,
                address: customer.address,
                reference: customer.reference || null,
                total,
                status: 'PAID',
                paymentMethod: payment?.method || 'PYPHONE',
                transactionId: payment?.transactionId || null,
                items: {
                    create: items.map((it) => ({ productId: it.productId, productName: it.name, price: it.price, quantity: it.quantity }))
                }
            },
            include: { items: true }
        });
        // Generar PDF de la orden
        const uploadsDir = path_1.default.join(__dirname, '../uploads');
        if (!fs_1.default.existsSync(uploadsDir))
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        const pdfPath = path_1.default.join(uploadsDir, `order-${order.id}.pdf`);
        await new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: 'A4' });
            const stream = fs_1.default.createWriteStream(pdfPath);
            doc.pipe(stream);
            doc.fontSize(20).text('Orden de Compra', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Orden ID: ${order.id}`);
            doc.text(`Cliente: ${order.customerName} <${order.customerEmail}>`);
            doc.text(`Dirección: ${order.address}`);
            if (order.reference)
                doc.text(`Referencia: ${order.reference}`);
            doc.moveDown();
            doc.text('Items:');
            order.items.forEach((it) => {
                doc.text(`${it.productName} - ${it.quantity} x S/${it.price.toFixed(2)} = S/${(it.quantity * it.price).toFixed(2)}`);
            });
            doc.moveDown();
            doc.text(`Total: S/${order.total.toFixed(2)}`, { align: 'right' });
            doc.end();
            stream.on('finish', () => resolve());
            stream.on('error', (e) => reject(e));
        });
        // Actualizar pdfUrl
        const pdfUrl = `http://localhost:${process.env.PORT || 5000}/uploads/order-${order.id}.pdf`;
        await prisma.order.update({ where: { id: order.id }, data: { pdfUrl } });
        // Enviar email al administrador (si config disponible)
        const adminEmail = process.env.ADMIN_EMAIL || 'zamoraadrian117@gmail.com';
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || '',
            port: Number(process.env.SMTP_PORT || 587),
            secure: false,
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
        });
        const mailOptions = {
            from: process.env.SMTP_FROM || 'no-reply@systray.local',
            to: adminEmail,
            subject: `Nueva orden de compra ${order.id}`,
            text: `Se ha generado una nueva orden. ID: ${order.id} - Cliente: ${order.customerName}`,
            attachments: [{ filename: `order-${order.id}.pdf`, path: pdfPath }]
        };
        try {
            if (process.env.SMTP_USER) {
                await transporter.sendMail(mailOptions);
            }
            else {
                console.log('SMTP no configurado. Email simulado:', mailOptions);
            }
        }
        catch (err) {
            console.error('Error sending email:', err);
        }
        res.json({ success: true, orderId: order.id, pdfUrl });
    }
    catch (err) {
        console.error('Order creation error', err);
        res.status(500).json({ error: 'Order creation failed', details: err });
    }
});
