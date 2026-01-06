import mysql from "mysql2/promise";
import "dotenv/config";

(async () => {
  try {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await conn.query("SELECT NOW() AS fecha");
    console.log("✅ Conexión exitosa:", rows);
    await conn.end();
  } catch (err) {
    console.error("❌ Error de conexión:", err.message);
  }
})();
