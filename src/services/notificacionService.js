const { getModoNotificacion } = require('../config/notificacion');
const { enviarWhatsAppAdmin } = require('./whatsappService');
const { sendOrderEmail } = require('./emailService');

/**
 * Unifica el envío de notificaciones según configuración en .env
 * @param {Object} orden - Datos de la orden
 */
const notificarOrden = async (orden) => {
  const modo = getModoNotificacion();

  console.log(`📢 Modo de notificación activo: ${modo}`);

  try {
    if (modo === 'whatsapp') {
      await enviarWhatsAppAdmin(orden);
    } else if (modo === 'gmail') {
      await sendOrderEmail(orden);
    } else {
      console.warn(`⚠️ Modo desconocido: ${modo}. Se usa Gmail por defecto.`);
      await sendOrderEmail(orden);
    }
  } catch (error) {
    console.error('❌ Error en notificacionService:', error.message);
    throw error;
  }
};

module.exports = {
  notificarOrden,
};
