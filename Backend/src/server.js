// 📁 server.js

const express = require('express');
const cors = require('cors');
// --- 🚨 NUEVAS IMPORTACIONES SOCKET.IO Y HTTP ---
const { createServer } = require('http'); // Necesario para envolver a Express
const socketManager = require('./socketManager'); // El servidor de Socket.IO
const { startReminderJob } = require('./cronService');// ------------------------------------------------

require('dotenv').config();
var admin = require("firebase-admin");
const firebaseCredentialsString = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccount;

try {
    if (firebaseCredentialsString) {
        // Parsear el JSON desde la variable de entorno
        serviceAccount = JSON.parse(firebaseCredentialsString);
        console.log("✅ Firebase Admin: Credenciales cargadas de variables de entorno.");
    } else {
        // Cargar desde el archivo (para desarrollo local, pero fallará en Render)
        serviceAccount = require("../serviceAccountKey.json");
        console.warn("⚠️ Firebase Admin: Usando archivo local. Esto podría fallar en Render.");
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

} catch (e) {
    console.error("❌ ERROR CRÍTICO: Fallo al inicializar Firebase Admin. Revisar FIREBASE_SERVICE_ACCOUNT.", e.message);
}
const app = express();
const userController = require("./controllers/userController");

// --- Importaciones de Middlewares y Rutas ---
const { verifyToken } = require('./auth');
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const installationRoutes = require("./routes/installationRoutes");
const sportRoutes = require("./routes/sportRoutes");
const roleRoutes = require("./routes/roleRoutes");
const stateRoutes = require("./routes/stateRoutes");
const friendRoutes = require("./routes/friendRoutes");
const notificationRoutes = require('./routes/notificationRoutes');
const calificacionRoutes = require('./routes/calificacionRoutes');

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = 'https://sport-meet-front.vercel.app'; // URL de tu frontend (del CORS)

// Middlewares
app.use(cors({origin: [FRONTEND_URL], // Usamos la constante
  credentials: true}));
app.use(express.json());

const db = require("./config/db");

// --- 🚨 INICIALIZACIÓN DE SOCKET.IO ---

// 1. Creamos el servidor HTTP a partir de la aplicación Express
const httpServer = createServer(app);

// 2. Inicializamos Socket.IO
socketManager.initSocketServer(httpServer);


// 4. Exportamos IO y el mapa para que los controladores puedan usarlos
module.exports = {
    app, // Opcional, pero útil si necesitas Express
    db
};

// -------------------------------------------

// Rutas de prueba
app.get('/', (req, res) => {
  res.send('🚀 Backend de Eventos Deportivos funcionando! y cambios guardados :)');
});

app.get("/api/usuarios/perfil", verifyToken, userController.getProfile);

app.use("/api/usuarios", userRoutes);
app.use("/api/eventos", eventRoutes);
app.use("/api/instalaciones", installationRoutes);
app.use("/api/deportes", sportRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/estados", stateRoutes);
app.use('/api/amigos', friendRoutes);
app.use('/api/notificaciones', notificationRoutes);
app.use('/api/calificaciones', calificacionRoutes);

// Iniciar servidor
// 🚨 CAMBIO CLAVE: Usamos httpServer.listen en lugar de app.listen
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  startReminderJob();;
});

