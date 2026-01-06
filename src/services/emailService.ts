import nodemailer from 'nodemailer';

// Interfaz para la orden
interface Orden {
  id: string;
  orderId: string;
  nombreCliente: string;
  telefono: string;
  productos: any[];
  total: number;
  estado: string;
  fecha: Date;
  createdAt: Date;
  pdfUrl?: string;
}

// Variable global para el transportador
let transporter: any = null;

/**
 * Inicializa el transporte de email
 * Usa Gmail SMTP para producción, o Ethereal para pruebas
 */
export async function initializeEmailService(): Promise<void> {
  try {
    const useGmail = process.env.GMAIL_USER && process.env.GMAIL_PASSWORD;
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (useGmail) {
      // Usar Gmail SMTP real
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD
        }
      });

      if (!isProduction) {
        console.log('✅ Servicio de email inicializado con Gmail');
        console.log(`📧 Correo configurado: ${process.env.GMAIL_USER}`);
      }
    } else {
      // Usar Ethereal Email para pruebas
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      if (!isProduction) {
        console.log('✅ Servicio de email inicializado con Ethereal (PRUEBA)');
        console.log(`📧 Cuenta de prueba: ${testAccount.user}`);
        console.log('⚠️ CONFIGURAR GMAIL_USER y GMAIL_PASSWORD en .env para usar Gmail real');
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error al inicializar el servicio de email:', error);
    }
  }
}

/**
 * Genera el HTML del email con diseño limpio
 */
function generateEmailHTML(orden: Orden): string {
  const productosHTML = orden.productos
    .map(
      (prod) =>
        `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; text-align: left;">${prod.nombre || 'Producto'}</td>
      <td style="padding: 10px; text-align: center;">${prod.cantidad || 1}</td>
      <td style="padding: 10px; text-align: right;">$${(prod.precio || 0).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const fecha = new Date(orden.fecha);
  const fechaFormato = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .order-id {
          background-color: #f0f4ff;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        .order-id h2 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .order-id p {
          margin: 0;
          color: #667eea;
          font-size: 24px;
          font-weight: bold;
        }
        .customer-info {
          background-color: #fafafa;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .info-label {
          font-weight: 600;
          color: #555;
        }
        .info-value {
          color: #333;
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .products-table th {
          background-color: #f5f5f5;
          padding: 10px;
          text-align: left;
          font-weight: 600;
          color: #555;
          font-size: 14px;
          border-bottom: 2px solid #667eea;
        }
        .products-table td {
          padding: 10px;
          font-size: 14px;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          padding: 20px 0;
          border-top: 2px solid #eee;
          border-bottom: 2px solid #667eea;
          margin-bottom: 20px;
        }
        .total-label {
          font-weight: 600;
          font-size: 16px;
          color: #333;
          margin-right: 20px;
        }
        .total-amount {
          font-weight: bold;
          font-size: 20px;
          color: #667eea;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .footer {
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 Nueva Orden de Compra</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Systray</p>
        </div>
        
        <div class="content">
          <!-- Orden ID -->
          <div class="order-id">
            <h2>Número de Orden</h2>
            <p>${orden.orderId}</p>
          </div>

          <!-- Estado -->
          <div style="margin-bottom: 20px;">
            <span class="status-badge status-pending">
              ${orden.estado}
            </span>
          </div>

          <!-- Información del Cliente -->
          <div class="customer-info">
            <div class="info-row">
              <span class="info-label">👤 Cliente:</span>
              <span class="info-value">${orden.nombreCliente}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📞 Teléfono:</span>
              <span class="info-value">${orden.telefono}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📅 Fecha:</span>
              <span class="info-value">${fechaFormato}</span>
            </div>
          </div>

          <!-- Tabla de Productos -->
          <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">📦 Productos</h3>
          <table class="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: right;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML}
            </tbody>
          </table>

          <!-- Total -->
          <div class="total-row">
            <span class="total-label">Total:</span>
            <span class="total-amount">$${orden.total.toFixed(2)}</span>
          </div>

          <!-- Nota -->
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 4px; font-size: 13px; color: #0c5460; margin-top: 20px;">
            <strong>ℹ️ Nota:</strong> Esta orden está en estado <strong>PENDIENTE</strong>. 
            Se procesará conforme a los tiempos establecidos.
          </div>
        </div>

        <div class="footer">
          <p><strong>Systray - Soluciones de Vigilancia</strong></p>
          <p>Este es un correo automático, no responder directamente.</p>
          <p style="margin-top: 10px; opacity: 0.7;">
            Orden ID: ${orden.id}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envía un email de orden de compra
 * @param orden - Objeto con los datos de la orden
 */
export async function sendOrderEmail(orden: Orden): Promise<void> {
  try {
    // Inicializar si no está inicializado
    if (!transporter) {
      await initializeEmailService();
    }

    if (!transporter) {
      console.warn('⚠️ Transporter no disponible, email no enviado');
      return;
    }

    // Correo del administrador - usar ADMIN_EMAIL o el de Gmail si está configurado
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'admin@systray.com';
    
    // Email del remitente
    const senderEmail = process.env.GMAIL_USER || 'noreply@systray.com';

    // Preparar el email
    const mailOptions = {
      from: `"Systray - Órdenes" <${senderEmail}>`,
      to: adminEmail,
      subject: `🛒 Nueva Orden de Compra - ${orden.orderId}`,
      html: generateEmailHTML(orden),
      text: `Nueva orden ${orden.orderId} del cliente ${orden.nombreCliente}. Total: $${orden.total.toFixed(2)}`
    };

    // Enviar el email
    const info = await transporter.sendMail(mailOptions);

    // Mostrar información del email
    console.log('✅ Email enviado exitosamente');
    console.log(`📧 De: ${senderEmail}`);
    console.log(`📧 Para: ${adminEmail}`);
    console.log(`📧 Orden: ${orden.orderId}`);
    console.log(`📧 Message ID: ${info.messageId}`);

    // Si es Ethereal, mostrar URL de vista previa
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('👀 URL de vista previa del email:');
        console.log(previewUrl);
        console.log('---');
      }
    }
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    // No lanzar error para no interrumpir el flujo de crear orden
  }
}

/**
 * Permite cambiar la configuración del transporte para usar SMTP real
 * Úsalo cuando necesites migrar a un servicio real
 */
export function setTransporter(customTransporter: any): void {
  transporter = customTransporter;
  console.log('✅ Transporte de email actualizado');
}

/**
 * Obtiene información del transporte actual (útil para debugging)
 */
export function getTransporterInfo(): any {
  const useGmail = !!process.env.GMAIL_USER;
  return {
    configured: transporter !== null,
    useGmail,
    email: process.env.GMAIL_USER || 'ethereal (test)',
    adminEmail: process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'admin@systray.com'
  };
}
