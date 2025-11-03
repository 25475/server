import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀='.repeat(50));
  console.log(`✅ Servidor Systray corriendo en http://localhost:${PORT}`);
  console.log(`📊 Estado del servidor: http://localhost:${PORT}/health`);
  console.log(`🌐 Para exponer con Ngrok: ngrok http ${PORT}`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀='.repeat(50));
});
