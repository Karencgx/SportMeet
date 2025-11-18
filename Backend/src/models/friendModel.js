// 📁 src/models/friendModel.js
const sql = require("../config/db").default;
const { toLowercaseKeys } = require("../utils/formatData");

// Obtener todas las amistades
const getAllAmigos = async (internalUserId) => {
    const rows = await sql`
        SELECT 
            s."Id" AS id,
            s."Id_usuario_1" AS "usuarioId",
            s."Id_usuario_2" AS "amigoId",
            s."Id_estado" AS "estadoId",
            
            u1."Id" AS usuario_id,
            u1."Nombre" AS usuario_nombre,
            u1."Email" AS usuario_email,
            u1."Foto" AS usuario_avatar,

            u2."Id" AS amigo_id,
            u2."Nombre" AS amigo_nombre,
            u2."Email" AS amigo_email,
            u2."Foto" AS amigo_avatar

        FROM solicitudes_amistad s
        JOIN usuarios u1 ON u1."Id" = s."Id_usuario_1" 
        JOIN usuarios u2 ON u2."Id" = s."Id_usuario_2"
        WHERE (s."Id_usuario_1" = ${internalUserId} OR s."Id_usuario_2" = ${internalUserId})
        AND s."Id_estado" IN (7, 8, 9)
    `;

    // Transformamos los datos para que cumplan con la interfaz Amistad (se mantiene la lógica de JS)
    return rows.map(row => ({
        id: row.id,
        usuarioId: row.usuarioId,
        amigoId: row.amigoId,
        estado: row.estadoId === 8 ? 'aceptada' : 
                row.estadoId === 7 ? 'pendiente' : 
                row.estadoId === 9 ? 'rechazada' : 
                'desconocido',
        usuario: {
            id: row.usuario_id,
            nombre: row.usuario_nombre,
            email: row.usuario_email,
            avatar: row.usuario_avatar
        },
        amigo: {
            id: row.amigo_id,
            nombre: row.amigo_nombre,
            email: row.amigo_email,
            avatar: row.amigo_avatar
        }
    }));
};

// Obtener amistad por ID
const getAmigoById = async (id) => {
    const rows = await sql`
        SELECT * FROM solicitudes_amistad 
        WHERE "Id" = ${id}
    `;
    return rows[0]; // Retorna el primer objeto del array
};

// Crear amistad
const createAmigo = async (data) => {
    const { Id_usuario_1, Id_usuario_2, Id_estado } = data;
    const result = await sql`
        INSERT INTO solicitudes_amistad ("Id_usuario_1", "Id_usuario_2", "Id_estado") 
        VALUES (${Id_usuario_1}, ${Id_usuario_2}, ${Id_estado})
        RETURNING "Id"
    `;
    // 💡 CAMBIO: Obtener el ID insertado
    const insertedId = result[0].Id;
    return { Id: insertedId, Id_usuario_1, Id_usuario_2, Id_estado };
};

// Actualizar estado de la amistad
const updateAmigo = async (id, data) => {
    const { Id_estado } = data;
    await sql`
        UPDATE solicitudes_amistad 
        SET "Id_estado" = ${Id_estado} 
        WHERE "Id" = ${id}
    `;
    return { Id: id, Id_estado };
};

// Eliminar amistad (Marcar como eliminado)
const deleteAmigo = async (id) => {
    const ESTADO_ELIMINADO = 6; 
    // Ejecutamos un UPDATE en lugar de un DELETE, usamos RETURNING para contar filas
    const result = await sql`
        DELETE FROM solicitudes_amistad 
        WHERE "Id" = ${id}
        RETURNING "Id"
    `;
    return { message: "Amistad marcada como eliminada", affectedRows: result.length };
};

const checkExistingAmigo = async (id1, id2) => {
    const rows = await sql`
        SELECT "Id", "Id_estado" 
        FROM solicitudes_amistad
        WHERE ("Id_usuario_1" = ${id1} AND "Id_usuario_2" = ${id2})
           OR ("Id_usuario_1" = ${id2} AND "Id_usuario_2" = ${id1})
    `;
    
    // Retorna la primera fila encontrada (si existe)
    return rows[0]; 
};

module.exports = { getAllAmigos, getAmigoById, createAmigo, updateAmigo, deleteAmigo, checkExistingAmigo };