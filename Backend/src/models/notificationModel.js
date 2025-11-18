// 📁 src/models/notificacionModel.js
const sql = require("../config/db").default;
const { toLowercaseKeys } = require("../utils/formatData");

const createNotification = async (usuarioId, tipo, contenido, referenciaId = null) => {
    // 💡 CAMBIO: Uso de sql`...` y RETURNING para obtener el ID insertado
    const query = sql`
        INSERT INTO notificaciones ("Id_usuario", "Tipo", "Contenido", "Referencia_id", "Leida")
        VALUES (${usuarioId}, ${tipo}, ${contenido}, ${referenciaId}, 0)
        RETURNING "Id"
    `;
    try {
        const result = await query;
        return result[0].Id; 
    } catch (error) {
        console.error("❌ Error en NotificationModel.createNotification:", error);
        throw error;
    }
};

const getUnreadNotifications = async (usuarioId) => {
    const query = sql`
        SELECT "Id", "Id_usuario", "Tipo", "Contenido", "Referencia_id", "Fecha_creacion", "Leida"
        FROM notificaciones
        WHERE "Id_usuario" = ${usuarioId} AND "Leida" = 0
        ORDER BY "Fecha_creacion" DESC
    `;
    try {
        const rows = await query;
        // toLowercaseKeys() ajusta 'id_usuario' a 'idUsuario' (camelCase) si lo necesitas.
        return toLowercaseKeys(rows); 
    } catch (error) {
        console.error("❌ Error en NotificationModel.getUnreadNotifications:", error);
        throw error;
    }
};

const markAsRead = async (notificationIds) => {
    if (!notificationIds || notificationIds.length === 0) return true;

    // 💡 CAMBIO: postgres library usa el operador IN con arrays directamente, 
    // no se necesita generar placeholders (?, ?, ...) manualmente.
    const numericIds = notificationIds.map(id => Number(id));
    const idPlaceholders = numericIds.map(id => sql`${id}`);
    const joinedIds = idPlaceholders.reduce((prev, current, index) => {
        if (index === 0) return current;
        return sql`${prev}, ${current}`;
    });
    const query = sql`
        UPDATE notificaciones
        SET "Leida" = 1
        WHERE "Id" IN (${joinedIds})
    `;
    
    try {
        // Ejecutar el update y usar rowCount para saber cuántas filas fueron afectadas.
        const result = await query;
        return result.count > 0;
    } catch (error) {
        console.error("❌ Error en NotificationModel.markAsRead:", error);
        throw error;
    }
};

const getAmigosIds = async (usuarioId) => {
    const query = sql`
        SELECT 
            CASE 
                WHEN "Id_usuario_1" = ${usuarioId} THEN "Id_usuario_2" 
                ELSE "Id_usuario_1" 
            END as amigo_id
        FROM solicitudes_amistad 
        WHERE ("Id_usuario_1" = ${usuarioId} OR "Id_usuario_2" = ${usuarioId}) AND "Id_estado" = 8
    `;
    try {
        console.log(`[DEBUG AMIGOS] Buscando amigos para ID: ${usuarioId}`); // ⬅️ Nuevo Log
        const rows = await query;
        
        // Devuelve un array simple de IDs numéricos de amigos [1, 5, 8, ...]
        const ids = rows.map(row => row.amigo_id);
        console.log(`[DEBUG AMIGOS] IDs encontrados: ${ids.join(', ')}`); // ⬅️ Log Clave: ¿Cuántos hay?
        return ids;
    } catch (error) {
        console.error("❌ Error en NotificationModel.getAmigosIds:", error);
        // Si hay error en la DB, devuelve array vacío para no interrumpir la creación del evento
        return []; 
    }
};

// 🚨 FUNCIÓN CRUCIAL 2: Obtener IDs de participantes de un evento
// Esta función es necesaria para notificar en caso de cancelación o recordatorio.
const getParticipantesIds = async (eventoId) => {
    // La tabla de participantes es 'usuarios_x_evento'
    const query = sql`
        SELECT "Id_usuario" 
        FROM usuarios_x_evento 
        WHERE "Id_evento" = ${eventoId}
    `;
    try {
        const rows = await query;
        return rows.map(row => row.Id_usuario);
    } catch (error) {
        console.error("❌ Error en NotificationModel.getParticipantesIds:", error);
        return [];
    }
};

module.exports = {
    createNotification,
    getUnreadNotifications,
    markAsRead,
    getAmigosIds,      
    getParticipantesIds,
};