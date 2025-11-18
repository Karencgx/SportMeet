// 📁 src/controllers/NotificationController.js
const NotificationModel = require("../models/notificationModel");

/**
 * Obtiene todas las notificaciones NO LEÍDAS del usuario autenticado.
 * Ruta: GET /api/notificaciones/no-leidas
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
const getUnreadNotifications = async (req, res) => {
    // Asumimos que 'req.user.internalDbId' es el ID numérico interno
    // del usuario, proporcionado por un middleware de autenticación.
    const usuarioId = req.internalUserId; 

    if (!usuarioId) {
        return res.status(401).json({ error: "Autenticación requerida: ID de usuario no disponible." });
    }

    try {
        const notificaciones = await NotificationModel.getUnreadNotifications(usuarioId);
        const finalNotificaciones = notificaciones.map(notif => {
            // Asumiendo que toLowercaseKeys ya ha convertido 'Fecha_creacion' a 'fecha_creacion'
            if (notif.fecha_creacion) {
                notif.fechaCreacion = notif.fecha_creacion;
                delete notif.fecha_creacion; // Limpiar la clave anterior (opcional)
            } 
            // Haz lo mismo para id_usuario (si el frontend espera idUsuario)
            if (notif.id_usuario) {
                notif.idUsuario = notif.id_usuario;
                delete notif.id_usuario;
            }
            return notif;
        });

        // Devolvemos el array de notificaciones no leídas
        res.status(200).json(finalNotificaciones);
    } catch (error) {
        console.error("❌ Error al obtener notificaciones no leídas:", error);
        res.status(500).json({ error: "Fallo interno del servidor al consultar notificaciones." });
    }
};

/**
 * Marca una o más notificaciones como leídas en la base de datos.
 * Ruta: POST /api/notificaciones/marcar-leidas
 * @param {object} req - Objeto de solicitud de Express. Se espera { notificationIds: [1, 5, 8] }.
 * @param {object} res - Objeto de respuesta de Express.
 */
const markNotificationsAsRead = async (req, res) => {
    // Se espera un array de IDs de notificación en el cuerpo de la solicitud
    const { notificationIds } = req.body; 

    // Validación básica
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ error: "Se requiere un array de IDs de notificación (notificationIds)." });
    }
    
    try {
        // La función del modelo realiza el UPDATE en la DB
        const success = await NotificationModel.markAsRead(notificationIds);
        
        if (success) {
            // Se asume éxito si el modelo no lanza un error. 
            // El modelo reporta si se actualizaron filas o no.
            res.status(200).json({ message: "Notificaciones marcadas como leídas." });
        } else {
             // Si el modelo retorna false (pocas veces pasa si no hay error de DB)
             res.status(200).json({ message: "Las notificaciones ya estaban marcadas o no existen." });
        }
    } catch (error) {
        console.error("❌ Error al marcar notificaciones como leídas:", error);
        res.status(500).json({ error: "Fallo interno del servidor al actualizar notificaciones." });
    }
};

module.exports = {
    getUnreadNotifications,
    markNotificationsAsRead,
};