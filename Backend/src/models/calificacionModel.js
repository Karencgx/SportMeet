// 📁 src/models/calificacionModel.js 

// 💡 CAMBIO 1: Renombrar 'db' a 'sql' para claridad, ya que ahora es el cliente 'postgres'
const sql = require("../config/db").default; // Asumiendo que exportas con 'export default sql'

const crearCalificacion = async (id_evento, id_calificador, id_calificado, puntaje, comentario) => {
    try {
        // 💡 CAMBIO 2: Usar template literal de SQL (sql`) y $ en vez de ?
        // 💡 CAMBIO 3: Añadir RETURNING Id para obtener el ID de la calificación insertada
        const result = await sql`
            INSERT INTO calificaciones 
            ("Id_evento", "Id_usuario_calificador", "Id_usuario_calificado", "Puntaje", "Comentario")
            VALUES (${id_evento}, ${id_calificador}, ${id_calificado}, ${puntaje}, ${comentario})
            RETURNING "Id"
        `;
        // PostgreSQL devuelve el ID insertado en la primera fila
        return result[0]; // Retorna el objeto { Id: X }
    } catch (error) {
        console.error("Error al registrar calificación:", error);
        throw error;
    }
};


const checkIfAlreadyRated = async (id_evento, id_calificador, id_calificado) => {
    try {
        // 💡 CAMBIO 2: Usar template literal de SQL (sql`) y $ en vez de ?
        // 💡 CAMBIO 4: COUNT devuelve una fila con la columna count
        const results = await sql`
            SELECT COUNT("Id") AS count 
            FROM calificaciones 
            WHERE "Id_evento" = ${id_evento} 
              AND "Id_usuario_calificador" = ${id_calificador} 
              AND "Id_usuario_calificado" = ${id_calificado}
        `;
        // 💡 CAMBIO 5: postgres devuelve [ { count: 1 } ]. Accedemos a [0].count.
        // Nota: PostgreSQL suele devolver COUNT como string, si es el caso, usa parseInt(results[0].count)
        return parseInt(results[0].count) > 0;
    } catch (error) {
        console.error("Error al verificar calificación existente:", error);
        throw error;
    }
};

const getParticipantesParaCalificar = async (idEvento, idCalificador) => {
    try {
        // 💡 CAMBIO 2: Usar template literal de SQL (sql`) y $ en vez de ?
        const results = await sql`
            SELECT 
                u."Id" AS id_usuario, 
                u."Nombre" AS nombre_usuario
            FROM usuarios_x_evento ue
            JOIN usuarios u ON ue."Id_usuario" = u."Id"
            WHERE ue."Id_evento" = ${idEvento} 
              AND ue."Id_usuario" != ${idCalificador}
        `;
        // 💡 CAMBIO 5: postgres devuelve el array de resultados directamente
        // Atención: PostgreSQL usa minúsculas en las columnas, por lo que 'Id' debe ser 'id'. 
        // Si tu DB/modelo usa mayúsculas/snake_case, usa comillas dobles (como hice arriba).
        return results;
    } catch (error) {
        console.error("Error al obtener participantes para calificar:", error);
        throw error;
    }
};

const getCalificacionesPorCalificador = async (idEvento, idCalificador) => {
    try {
        const results = await sql`
            SELECT "Id_usuario_calificado" 
            FROM calificaciones 
            WHERE "Id_evento" = ${idEvento} 
              AND "Id_usuario_calificador" = ${idCalificador}
        `;
        // 💡 CAMBIO 5: mapear el array de resultados
        return results.map(row => row.Id_usuario_calificado);
    } catch (error) {
        console.error("Error al obtener calificaciones previas:", error);
        throw error;
    }
};

/**
 * (Opcional) Calcula la calificación promedio de un usuario.
 */
const getCalificacionPromedio = async (idUsuario) => {
    try {
        const results = await sql`
            SELECT 
                AVG("Puntaje") AS promedio,
                COUNT("Id") AS total
            FROM calificaciones
            WHERE "Id_usuario_calificado" = ${idUsuario}
        `;
        // 💡 CAMBIO 5: postgres devuelve [ { promedio: X, totalcalificaciones: Y } ]
        // Los nombres de columna AVG/COUNT serán en minúsculas si no se aliasan con comillas
        return results[0]; // Retorna el primer objeto { promedio: X, totalcalificaciones: Y }
    } catch (error) {
        console.error("Error al obtener calificación promedio:", error);
        throw error;
    }
};

module.exports = {
    crearCalificacion,
    checkIfAlreadyRated,
    getParticipantesParaCalificar,
    getCalificacionesPorCalificador,     
    getCalificacionPromedio,
};