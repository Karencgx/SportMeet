// 📁 src/socketManager.js

const { Server } = require('socket.io');

// Mapa para rastrear usuarios conectados: { id_usuario_db: socket_id }
const userSocketMap = new Map(); 
let io = null; // Variable para almacenar la instancia de Socket.IO

const FRONTEND_URL = 'https://sport-meet-front.vercel.app'; // Asegúrate de que esta URL sea correcta

/**
 * Inicializa el servidor Socket.IO
 * @param {import('http').Server} httpServer El servidor HTTP de Node.js
 */
const initSocketServer = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: FRONTEND_URL, 
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket.IO] Usuario conectado: ${socket.id}`);

        // El cliente envía el ID interno del usuario al iniciar sesión
        socket.on('registerUser', (userId) => {
            if (userId) {
                userSocketMap.set(userId, socket.id);
                console.log(`[Socket.IO] Usuario DB ID ${userId} mapeado a socket ${socket.id}`);
            }
        });

        // Manejo de desconexión: eliminamos la entrada del mapa
        socket.on('disconnect', () => {
            userSocketMap.forEach((socketId, userId) => {
                if (socketId === socket.id) {
                    userSocketMap.delete(userId);
                    console.log(`[Socket.IO] Usuario DB ID ${userId} desconectado.`);
                }
            });
        });
    });
};

/**
 * Devuelve la instancia de Socket.IO
 * @returns {Server | null}
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO no está inicializado. Llama a initSocketServer primero.');
    }
    return io;
};

/**
 * Devuelve el mapa de usuarios
 * @returns {Map}
 */
const getUserSocketMap = () => {
    return userSocketMap;
};

module.exports = {
    initSocketServer,
    getIO,
    getUserSocketMap,
};