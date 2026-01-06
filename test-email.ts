import axios from 'axios';

const testOrder = {
  nombreCliente: "Carlos Méndez",
  telefono: "5559876543",
  productos: JSON.stringify([
    { nombre: "Cámara Hikvision 4MP", precio: 250, cantidad: 1 },
    { nombre: "NVR 8 Canales", precio: 400, cantidad: 1 }
  ]),
  total: 650
};

async function testEmail() {
  try {
    console.log("📤 Enviando orden de prueba...\n");
    
    const response = await axios.post('http://localhost:5000/api/ordenes/guardar', testOrder);
    
    const data = response.data;
    
    if (data.success) {
      console.log("✅ Orden creada exitosamente!");
      console.log(`📦 Orden ID: ${data.orden.orderId}`);
      console.log(`💰 Total: $${data.orden.total}`);
      console.log(`📧 Email enviado a: zamoraadrian117@gmail.com`);
      console.log("\n🎯 Revisa tu bandeja de entrada en Gmail\n");
    } else {
      console.log("❌ Error:", data.error);
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

testEmail();
