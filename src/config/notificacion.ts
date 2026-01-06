/**
 * Obtiene el modo de notificación configurado en .env
 * Por defecto: "gmail"
 * Opciones válidas: "gmail" o "whatsapp"
 */
const getModoNotificacion = () => {
  const modo = process.env.MODO_NOTIFICACION || 'gmail';
  return modo.toLowerCase();
};

module.exports = {
  getModoNotificacion,
};
