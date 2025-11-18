const express = require('express');
const cors = require('cors');
const { createServer } = require('http'); 
const socketManager = require('./socketManager'); 
const { startReminderJob } = require('./cronService');

require('dotenv').config();
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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

// 🚨 CORRECCIÓN CLAVE: Usar Variables de Entorno de Render para el Frontend
// En Render, establecerás la variable FRONTEND_URL. Si no existe, usa localhost.
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173', 
    'http://localhost:5173', // Para desarrollo local
    'http://localhost:3000', // Para pruebas directas
];

// Middlewares
// 🚨 Usamos una función para verificar el origen en CORS
app.use(cors({
    origin: (origin, callback) => {
        // Permitir peticiones sin origen (como Postman o curl, o peticiones del mismo servidor)
        if (!origin) return callback(null, true); 
        // Permitir orígenes configurados
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.onrender.com')) { 
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'), false);
        }
    },
    credentials: true
}));
app.use(express.json());

const db = require("./config/db");

// --- 🚨 INICIALIZACIÓN DE SOCKET.IO ---

// 1. Creamos el servidor HTTP a partir de la aplicación Express
const httpServer = createServer(app);

// 2. Inicializamos Socket.IO
// Debes asegurarte de que socketManager también use la variable de entorno FRONTEND_URL para el CORS de Socket.IO
socketManager.initSocketServer(httpServer);


// 4. Exportamos IO y el mapa para que los controladores puedan usarlos
module.exports = {
    app, // Opcional, pero útil si necesitas Express
    db
};

// -------------------------------------------

// Rutas de prueba
app.get('/', (req, res) => {
    res.send('🚀 Backend de Eventos Deportivos funcionando!');
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
    startReminderJob();
});