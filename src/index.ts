import app from './app';
import { initializeEmailService } from './services/emailService';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Inicializar servicio de email
initializeEmailService().catch((err) => {
  if (NODE_ENV === 'development') {
    console.error('Advertencia: No se pudo inicializar el servicio de email:', err);
  }
});

app.listen(PORT, () => {
  if (NODE_ENV === 'production') {
    console.log(`✅ Servidor Systray en producción - Puerto: ${PORT}`);
  } else {
    console.log('🚀='.repeat(50));
    console.log(`✅ Servidor Systray corriendo en http://localhost:${PORT}`);
    console.log(`📊 Estado del servidor: http://localhost:${PORT}/health`);
    console.log(`🌐 Para exponer con Ngrok: ngrok http ${PORT}`);
    console.log(`🔧 Entorno: ${NODE_ENV}`);
    console.log('🚀='.repeat(50));
  }
});
