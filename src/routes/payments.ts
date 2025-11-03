import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

// Environment variables supported:
// PAYPHONE_API_URL - base URL for PayPhone API (optional)
// PAYPHONE_API_TOKEN - bearer token / API key for PayPhone (optional)
// PAYPHONE_CALLBACK_URL - explicit callback URL (optional)
// PAYPHONE_WEBHOOK_SECRET - secret to validate webhook HMAC (optional)

const router = Router()
const prisma = new PrismaClient()

// Mock endpoint para procesar pago con "pyphone" (simulado)
router.post('/pyphone', async (req, res) => {
  try {
    // Esperamos recibir { amount, phone, metadata }
    const { amount } = req.body
    if (!amount) return res.status(400).json({ error: 'Amount required' })

  // Simular procesamiento y devolver transaction id + mensaje para cliente
  const transactionId = `PY-${uuidv4()}`
  // En una integración real aquí se llamaría a la pasarela
  const message = `Pago simulado exitoso. Transacción: ${transactionId}`
  return res.json({ success: true, transactionId, message })
  } catch (err) {
    console.error('Payment error', err)
    res.status(500).json({ error: 'Payment processing failed' })
  }
})

// Crear pago real (o simulado) para PayPhone
router.post('/payphone/create', async (req, res) => {
  try {
  const { amount, orderReference, returnUrl, customer, items, paymentMethod } = req.body
    if (!amount) return res.status(400).json({ error: 'Amount required' })

    const callbackUrl = process.env.PAYPHONE_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:5000'}/api/payments/payphone/callback`

    // Si está configurada la API de PayPhone intentamos llamar a ella, si no, simulamos
    if (process.env.PAYPHONE_API_URL && process.env.PAYPHONE_API_TOKEN) {
      try {
        const payload = {
          amount,
          orderReference,
          returnUrl,
          callbackUrl,
        }

        // Use global fetch if available; cast to any to avoid TS fetch types
        const resp = await (globalThis as any).fetch(`${process.env.PAYPHONE_API_URL}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.PAYPHONE_API_TOKEN}`,
          },
          body: JSON.stringify(payload),
        })

        const json = await resp.json()
        // Devolver lo que la pasarela responda (adaptar según doc de PayPhone)
        return res.status(resp.status).json(json)
      } catch (err) {
        console.error('Error calling PayPhone API', err)
        // Si falla la llamada externa, se sigue con un fallback simulado
      }
    }

    // Fallback simulado para pruebas locales
    const transactionId = `PP-${uuidv4()}`
    const paymentUrl = `${process.env.PAYPHONE_PAYMENT_PAGE || 'https://payphone.test/pay'}?transactionId=${transactionId}`
    const message = `Pago simulado creado. Transacción: ${transactionId}`

    // Si nos enviaron customer+items, crear una pre-orden en DB con estado PENDING
    let createdOrder: any = null
    try {
      if (customer && items && Array.isArray(items) && items.length > 0) {
        const total = items.reduce((s:any, a:any) => s + (Number(a.price || 0) * Number(a.quantity || 1)), 0)
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
            items: { create: items.map((it:any) => ({ productId: it.productId, productName: it.name, price: it.price, quantity: it.quantity })) }
          },
          include: { items: true }
        })
      }
    } catch (err) {
      console.error('Error creating pre-order in DB', err)
    }

    return res.json({ success: true, transactionId, paymentUrl, message, callbackUrl, order: createdOrder })
  } catch (err) {
    console.error('Create payphone payment error', err)
    return res.status(500).json({ error: 'Payment creation failed' })
  }
})

// Webhook / callback que PayPhone llamará cuando cambie el estado del pago
router.post('/payphone/callback', async (req, res) => {
  try {
    const payload = req.body

    // Verificar HMAC si se configuró secret
    const secret = process.env.PAYPHONE_WEBHOOK_SECRET
    if (secret) {
      const signatureHeader = (req.headers['x-payphone-signature'] || req.headers['x-signature'] || req.headers['signature']) as string | undefined
      if (!signatureHeader) {
        console.warn('Missing signature header for payphone callback')
        return res.status(401).json({ error: 'Missing signature' })
      }
      const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')
      const expectedBuf = Buffer.from(expected)
      const gotBuf = Buffer.from(signatureHeader)
      // timingSafeEqual throws if buffers have different lengths, so check first
      if (expectedBuf.length !== gotBuf.length || !crypto.timingSafeEqual(expectedBuf, gotBuf)) {
        console.warn('Invalid webhook signature', { expected, got: signatureHeader })
        return res.status(401).json({ error: 'Invalid signature' })
      }
    }

    // Loguear payload y procesarlo (actualizar BD / ordenes según transactionId)
    console.log('PayPhone webhook received:', JSON.stringify(payload))

    const transactionId = payload.transactionId || payload.txnId || payload.id
    const statusRaw = (payload.status || payload.state || '').toString().toLowerCase()
    const orderReference = payload.orderReference || payload.reference || null

    // Buscar orden por transactionId o por referencia
    const order = await prisma.order.findFirst({ where: { OR: [{ transactionId }, { reference: orderReference }] }, include: { items: true } })
    if (!order) {
      console.warn('Webhook for unknown order/transactionId', { transactionId, orderReference })
      return res.status(200).json({ success: true })
    }

    // Idempotencia: si ya está PAID y webhook indica pago, no procesar nuevamente
    const alreadyPaid = order.status === 'PAID'

    // Mapear estado
    let newStatus = 'PENDING'
    if (['success', 'paid', 'completed'].includes(statusRaw)) newStatus = 'PAID'
    else if (['failed', 'error', 'cancelled', 'canceled'].includes(statusRaw)) newStatus = 'FAILED'

    if (alreadyPaid && newStatus === 'PAID') {
      console.log('Order already marked as PAID, skipping', order.id)
      return res.status(200).json({ success: true })
    }

    // Actualizar estado y transactionId si es necesario
    await prisma.order.update({ where: { id: order.id }, data: { status: newStatus, transactionId: transactionId || order.transactionId } })

    // Si pago exitoso, generar PDF y enviar email (reusar lógica similar a orders.ts)
    if (newStatus === 'PAID') {
      try {
  // uploads directory is at project root `/uploads`; __dirname is server/src/routes
  const uploadsDir = path.join(__dirname, '../../uploads')
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  const pdfPath = path.join(uploadsDir, `order-${order.id}.pdf`)

        await new Promise<void>((resolve, reject) => {
          const doc = new PDFDocument({ size: 'A4' })
          const stream = fs.createWriteStream(pdfPath)
          doc.pipe(stream)

          doc.fontSize(20).text('Orden de Compra', { align: 'center' })
          doc.moveDown()
          doc.fontSize(12).text(`Orden ID: ${order.id}`)
          doc.text(`Cliente: ${order.customerName} <${order.customerEmail}>`)
          doc.text(`Dirección: ${order.address}`)
          if (order.reference) doc.text(`Referencia: ${order.reference}`)
          doc.moveDown()
          doc.text('Items:');
          (order.items || []).forEach((it:any) => {
            doc.text(`${it.productName} - ${it.quantity} x S/${Number(it.price).toFixed(2)} = S/${(it.quantity * it.price).toFixed(2)}`)
          })
          doc.moveDown()
          doc.text(`Total: S/${Number(order.total).toFixed(2)}`, { align: 'right' })
          doc.end()
          stream.on('finish', () => resolve())
          stream.on('error', (e) => reject(e))
        })

  const pdfUrl = `http://localhost:${process.env.PORT || 5000}/uploads/order-${order.id}.pdf`
        await prisma.order.update({ where: { id: order.id }, data: { pdfUrl } })

        // Enviar email al administrador (si config disponible)
        const adminEmail = process.env.ADMIN_EMAIL || 'zamoraadrian117@gmail.com'
        const baseMailOptions = {
          from: process.env.SMTP_FROM || 'no-reply@systray.local',
          to: adminEmail,
          subject: `Pago recibido - Orden ${order.id}`,
          text: `Se recibió el pago para la orden ${order.id}. Transaction: ${transactionId}`,
          attachments: [{ filename: `order-${order.id}.pdf`, path: path.join(__dirname, '../../uploads', `order-${order.id}.pdf`) }]
        }

        try {
          // If SMTP host or user is configured try to send via configured SMTP
          if (process.env.SMTP_HOST || process.env.SMTP_USER) {
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST || '',
              port: Number(process.env.SMTP_PORT || 587),
              secure: !!(process.env.SMTP_SECURE && process.env.SMTP_SECURE !== 'false'),
              auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
            })

            const info = await transporter.sendMail(baseMailOptions)
            // If using a real SMTP server this will not include a preview URL. Log the transport result for debugging.
            console.log('Email enviado via SMTP configured. info:', info)
          } else {
            // No SMTP configured — fall back to Ethereal test account so devs can see a real preview URL
            // This still doesn't send to external inboxes, but provides a real message and preview link
            const testAccount = await nodemailer.createTestAccount()
            const ethTransporter = nodemailer.createTransport({
              host: testAccount.smtp.host,
              port: testAccount.smtp.port,
              secure: testAccount.smtp.secure,
              auth: { user: testAccount.user, pass: testAccount.pass }
            })

            const info = await ethTransporter.sendMail({ ...baseMailOptions, from: process.env.SMTP_FROM || testAccount.user })
            const preview = nodemailer.getTestMessageUrl(info)
            console.log('SMTP no configurado. Email enviado a Ethereal (preview):', preview, info)
          }
        } catch (err) {
          console.error('Error sending email on webhook processing:', err)
        }
      } catch (err) {
        console.error('Error generating PDF or sending email after webhook', err)
      }
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('PayPhone webhook error', err)
    return res.status(500).json({ error: 'processing failed' })
  }
})

export { router as paymentRoutes }
