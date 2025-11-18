// 📁 db.js (SOLUCIÓN CON POOLER)

import postgres from 'postgres';
import 'dotenv/config'; 

// Usaremos la cadena de conexión del POOLER (que es IPv4 compatible)
const connectionString = process.env.DATABASE_URL; // Esta debe ser la URL del Pooler

if (!connectionString) {
    throw new Error("DATABASE_URL no está definido en el entorno.");
}

const sql = postgres(connectionString, { // Usamos la cadena completa
    ssl: {
        rejectUnauthorized: false, 
    }
});


// Opcional: Prueba de conexión
sql`SELECT 1 + 1 AS result`
    .then((result) => {
        console.log(`🟢 Conexión a Supabase exitosa. Resultado de prueba: ${result[0].result}`);
    })
    .catch((error) => {
        console.error("❌ Error al conectar con Supabase:", error.message);
        // Si el error persiste, aquí aparecerá el error exacto.
    });

export default sql;