const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
const ADMIN_NUMBER = process.env.ADMIN_NUMBER;

/**
 * Envía notificación de orden por WhatsApp al administrador
 * @param {Object} orden - Objeto con datos de la orden
 * @param {string} orden.nombreCliente - Nombre del cliente
 * @param {string} orden.telefono - Teléfono del cliente
 * @param {string} orden.email - Email del cliente (opcional)
 * @param {Array} orden.productos - Array de productos
 * @param {number} orden.total - Monto total
 * @param {string} orden.orderId - ID de la orden
 */
const enviarWhatsAppAdmin = async (orden) => {
  try {
    if (!ADMIN_NUMBER) {
      throw new Error('ADMIN_NUMBER no está configurado en .env');
    }

    // Formatear productos
    let productosTexto = '';
    if (Array.isArray(orden.productos)) {
      productosTexto = orden.productos
        .map(p => `• ${p.nombre || p.product || 'Producto'}: ${p.cantidad || 1} x $${p.precio || 0}`)
        .join('\n');
    } else {
      productosTexto = '• Productos: Ver detalles en PDF';
    }

    const mensajeBody = `*🎉 NUEVA ORDEN RECIBIDA*

📋 *Datos del Cliente:*
• Nombre: ${orden.nombreCliente || 'N/A'}
• Teléfono: ${orden.telefono || 'N/A'}

🛍️ *Detalles del Pedido:*
${productosTexto}

💰 Total: $${orden.total || '0'}
📦 ID Orden: ${orden.orderId || orden.id || 'N/A'}

⏰ Hora: ${new Date().toLocaleString('es-CO')}`;

    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: ADMIN_NUMBER,
      body: mensajeBody,
    });

    console.log(`✅ WhatsApp enviado exitosamente. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('❌ Error al enviar WhatsApp:', error.message);
    throw error;
  }
};

module.exports = {
  enviarWhatsAppAdmin,
};
