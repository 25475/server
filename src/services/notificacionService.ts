// @ts-ignore - JS module
import { getModoNotificacion } from '../config/notificacion';
// @ts-ignore - JS module
import { enviarWhatsAppAdmin } from './whatsappService';
import { sendOrderEmail } from './emailService';

/**
 * Unifica el envío de notificaciones según configuración en .env
 * @param {Object} orden - Datos de la orden
 */
export const notificarOrden = async (orden: any) => {
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
  } catch (error: any) {
    console.error('❌ Error en notificacionService:', error.message);
    throw error;
  }
};
