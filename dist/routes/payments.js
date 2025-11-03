"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Environment variables supported:
// PAYPHONE_API_URL - base URL for PayPhone API (optional)
// PAYPHONE_API_TOKEN - bearer token / API key for PayPhone (optional)
// PAYPHONE_CALLBACK_URL - explicit callback URL (optional)
// PAYPHONE_WEBHOOK_SECRET - secret to validate webhook HMAC (optional)
const router = (0, express_1.Router)();
exports.paymentRoutes = router;
const prisma = new client_1.PrismaClient();
// Mock endpoint para procesar pago con "pyphone" (simulado)
router.post('/pyphone', async (req, res) => {
    try {
        // Esperamos recibir { amount, phone, metadata }
        const { amount } = req.body;
        if (!amount)
            return res.status(400).json({ error: 'Amount required' });
        // Simular procesamiento y devolver transaction id + mensaje para cliente
        const transactionId = `PY-${(0, uuid_1.v4)()}`;
        // En una integración real aquí se llamaría a la pasarela
        const message = `Pago simulado exitoso. Transacción: ${transactionId}`;
        return res.json({ success: true, transactionId, message });
    }
    catch (err) {
        console.error('Payment error', err);
        res.status(500).json({ error: 'Payment processing failed' });
    }
});
// Crear pago real (o simulado) para PayPhone
router.post('/payphone/create', async (req, res) => {
    try {
        const { amount, orderReference, returnUrl, customer, items, paymentMethod } = req.body;
        if (!amount)
            return res.status(400).json({ error: 'Amount required' });
        const callbackUrl = process.env.PAYPHONE_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:5000'}/api/payments/payphone/callback`;
        // Si está configurada la API de PayPhone intentamos llamar a ella, si no, simulamos
        if (process.env.PAYPHONE_API_URL && process.env.PAYPHONE_API_TOKEN) {
            try {
                const payload = {
                    amount,
                    orderReference,
                    returnUrl,
                    callbackUrl,
                };
                // Use global fetch if available; cast to any to avoid TS fetch types
                const resp = await globalThis.fetch(`${process.env.PAYPHONE_API_URL}/payments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.PAYPHONE_API_TOKEN}`,
                    },
                    body: JSON.stringify(payload),
                });
                const json = await resp.json();
                // Devolver lo que la pasarela responda (adaptar según doc de PayPhone)
                return res.status(resp.status).json(json);
            }
            catch (err) {
                console.error('Error calling PayPhone API', err);
                // Si falla la llamada externa, se sigue con un fallback simulado
            }
        }
        // Fallback simulado para pruebas locales
        const transactionId = `PP-${(0, uuid_1.v4)()}`;
        const paymentUrl = `${process.env.PAYPHONE_PAYMENT_PAGE || 'https://payphone.test/pay'}?transactionId=${transactionId}`;
        const message = `Pago simulado creado. Transacción: ${transactionId}`;
        // Si nos enviaron customer+items, crear una pre-orden en DB con estado PENDING
        let createdOrder = null;
        try {
            if (customer && items && Array.isArray(items) && items.length > 0) {
                const total = items.reduce((s, a) => s + (Number(a.price || 0) * Number(a.quantity || 1)), 0);
                createdOrder = await prisma.order.create({
                    data: {
                        customerName: customer.name,
                        customerEmail: customer.email,
                        customerPhone: customer.phone || null,
                        address: customer.address || '',
                        reference: orderReference || (customer.reference || null),
                        total,
                        status: 'PENDING',
                        paymentMethod: paymentMethod || 'PYPHONE',
                        transactionId,
                        items: { create: items.map((it) => ({ productId: it.productId, productName: it.name, price: it.price, quantity: it.quantity })) }
                    },
                    include: { items: true }
                });
            }
        }
        catch (err) {
            console.error('Error creating pre-order in DB', err);
        }
        return res.json({ success: true, transactionId, paymentUrl, message, callbackUrl, order: createdOrder });
    }
    catch (err) {
        console.error('Create payphone payment error', err);
        return res.status(500).json({ error: 'Payment creation failed' });
    }
});
// Webhook / callback que PayPhone llamará cuando cambie el estado del pago
router.post('/payphone/callback', async (req, res) => {
    try {
        const payload = req.body;
        // Verificar HMAC si se configuró secret
        const secret = process.env.PAYPHONE_WEBHOOK_SECRET;
        if (secret) {
            const signatureHeader = (req.headers['x-payphone-signature'] || req.headers['x-signature'] || req.headers['signature']);
            if (!signatureHeader) {
                console.warn('Missing signature header for payphone callback');
                return res.status(401).json({ error: 'Missing signature' });
            }
            const expected = crypto_1.default.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
            const expectedBuf = Buffer.from(expected);
            const gotBuf = Buffer.from(signatureHeader);
            // timingSafeEqual throws if buffers have different lengths, so check first
            if (expectedBuf.length !== gotBuf.length || !crypto_1.default.timingSafeEqual(expectedBuf, gotBuf)) {
                console.warn('Invalid webhook signature', { expected, got: signatureHeader });
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }
        // Loguear payload y procesarlo (actualizar BD / ordenes según transactionId)
        console.log('PayPhone webhook received:', JSON.stringify(payload));
        const transactionId = payload.transactionId || payload.txnId || payload.id;
        const statusRaw = (payload.status || payload.state || '').toString().toLowerCase();
        const orderReference = payload.orderReference || payload.reference || null;
        // Buscar orden por transactionId o por referencia
        const order = await prisma.order.findFirst({ where: { OR: [{ transactionId }, { reference: orderReference }] }, include: { items: true } });
        if (!order) {
            console.warn('Webhook for unknown order/transactionId', { transactionId, orderReference });
            return res.status(200).json({ success: true });
        }
        // Idempotencia: si ya está PAID y webhook indica pago, no procesar nuevamente
        const alreadyPaid = order.status === 'PAID';
        // Mapear estado
        let newStatus = 'PENDING';
        if (['success', 'paid', 'completed'].includes(statusRaw))
            newStatus = 'PAID';
        else if (['failed', 'error', 'cancelled', 'canceled'].includes(statusRaw))
            newStatus = 'FAILED';
        if (alreadyPaid && newStatus === 'PAID') {
            console.log('Order already marked as PAID, skipping', order.id);
            return res.status(200).json({ success: true });
        }
        // Actualizar estado y transactionId si es necesario
        await prisma.order.update({ where: { id: order.id }, data: { status: newStatus, transactionId: transactionId || order.transactionId } });
        // Si pago exitoso, generar PDF y enviar email (reusar lógica similar a orders.ts)
        if (newStatus === 'PAID') {
            try {
                // uploads directory is at project root `/uploads`; __dirname is server/src/routes
                const uploadsDir = path_1.default.join(__dirname, '../../uploads');
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
                    doc.text('Items:')(order.items || []).forEach((it) => {
                        doc.text(`${it.productName} - ${it.quantity} x S/${Number(it.price).toFixed(2)} = S/${(it.quantity * it.price).toFixed(2)}`);
                    });
                    doc.moveDown();
                    doc.text(`Total: S/${Number(order.total).toFixed(2)}`, { align: 'right' });
                    doc.end();
                    stream.on('finish', () => resolve());
                    stream.on('error', (e) => reject(e));
                });
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
                    subject: `Pago recibido - Orden ${order.id}`,
                    text: `Se recibió el pago para la orden ${order.id}. Transaction: ${transactionId}`,
                    attachments: [{ filename: `order-${order.id}.pdf`, path: path_1.default.join(__dirname, '../../uploads', `order-${order.id}.pdf`) }]
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
                    console.error('Error sending email on webhook processing:', err);
                }
            }
            catch (err) {
                console.error('Error generating PDF or sending email after webhook', err);
            }
        }
        return res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('PayPhone webhook error', err);
        return res.status(500).json({ error: 'processing failed' });
    }
});
