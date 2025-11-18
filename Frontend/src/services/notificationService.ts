// 📁 src/services/notificationService.ts
import axios, { AxiosInstance } from 'axios';
import io from 'socket.io-client';

// Interfaz que coincide con la estructura devuelta por el Backend (friendController y NotificationModel)
export interface Notificacion {
    id: number;
    idUsuario: number;
    tipo: 'SOLICITUD_RECIBIDA' | 'AMISTAD_ACEPTADA' | 'EVENTO_CREADO' | string;
    contenido: string;
    referenciaId: number | null;
    leida: 0 | 1;
    fechaCreacion: string; // La DB devuelve esto como string
}

export interface SocketNotification {
    tipo: string;
    contenido: string;
    referenciaId: number | null;
    // La notificación real no lleva ID o fecha, el frontend debe recargar
}

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const api: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/notificaciones`, // Base URL específica
    headers: { 'Content-Type': 'application/json' },
});

// --- 1. Lógica REST (Comunicación con NotificationController) ---

/**
 * Obtiene las notificaciones no leídas de la API.
 * @param token - El token JWT para la autenticación.
 * @returns Promesa que resuelve a un array de notificaciones no leídas.
 */
export const fetchUnreadNotifications = async (token: string): Promise<Notificacion[]> => {
    try {
        const response = await api.get('/no-leidas', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener notificaciones no leídas:", error);
        // Devolvemos un array vacío en caso de error para manejar el estado en el componente
        return [];
    }
};

/**
 * Marca las notificaciones como leídas en la base de datos.
 * @param ids - Array de IDs de notificaciones a marcar.
 * @param token - El token JWT.
 * @returns Promesa que resuelve a `true` si la operación fue exitosa.
 */
export const markNotificationsAsRead = async (ids: number[], token: string): Promise<boolean> => {
    try {
        await api.post('/marcar-leidas', { notificationIds: ids }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        console.error("Error al marcar notificaciones como leídas:", error);
        return false;
    }
};

// --- 2. Lógica WebSocket (Conexión Socket.IO) ---

type SocketType = ReturnType<typeof io>;
let socket: SocketType | null = null;
/**
 * Establece la conexión de Socket.IO y registra al usuario.
 * Si ya existe una conexión, la devuelve.
 * @param userId - El ID interno numérico del usuario de la DB.
 * @returns La instancia del socket.
 */
export const connectSocket = (userId: number): SocketType => {
    // Si ya existe una conexión y está activa, la devolvemos
    if (socket && socket.connected) {
        return socket;
    }
    
    // Conectar al servidor Socket.IO
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log("🟢 Socket.IO conectado. Registrando usuario...");
        // 🚨 IMPORTANTE: El cliente envía su ID interno para que el backend lo mapee
        socket!.emit('registerUser', userId); 
    });

    socket.on('disconnect', () => {
        console.log("🔴 Socket.IO desconectado.");
    });
    
    socket.on('connect_error', (error) => {
        console.error("Socket.IO Error de conexión:", error.message);
    });

    return socket;
};

/**
 * Desconecta el socket si existe.
 */
export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("Socket.IO desconectado manualmente.");
    }
};