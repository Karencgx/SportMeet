// 📁 src/models/eventModel.js 

// 💡 CAMBIO: Usar la instancia 'sql' de postgres
const sql = require("../config/db").default; 
const { toLowercaseKeys } = require("../utils/formatData");


// Obtener todos los eventos
const getAllEvents = async () => {
    const rows = await sql`
        SELECT 
        e.*, 
        d."Nombre" AS nombre_deporte,
        (
            SELECT COUNT(*) 
            FROM usuarios_x_evento ux 
            WHERE ux."Id_evento" = e."Id"
        ) AS participantes
    FROM eventos e
    JOIN deportes d ON e."Id_deporte" = d."Id"
    WHERE e."Id_estado" = 10;
    `;
    return toLowercaseKeys(rows);
};

// Obtener evento por ID
const getEventById = async (id) => {
  // 1. Obtener datos del evento con los nombres relacionados y el conteo
  const rows = await sql`
    SELECT 
      e.*, 
      i."Nombre" AS nombre_instalacion,
      u."Nombre" AS nombre_organizador,
      d."Nombre" AS nombre_deporte,
      (
        SELECT COUNT(*)
        FROM usuarios_x_evento ux
        WHERE ux."Id_evento" = e."Id"
      ) AS participantes
    FROM eventos e
    JOIN instalacion_deportiva i ON e."Id_instalacion" = i."Id"
    JOIN usuarios u ON e."Id_organizador" = u."Id"
    JOIN deportes d ON e."Id_deporte" = d."Id"
    WHERE e."Id" = ${id}
  `;

  if (rows.length === 0) return null;

  const evento = toLowercaseKeys(rows[0]);

  // 2. Obtener lista de participantes
  const participants = await sql`
    SELECT 
      u."Id", 
      u."Nombre", 
      u."Email"
    FROM usuarios_x_evento ux
    JOIN usuarios u ON ux."Id_usuario" = u."Id"
    WHERE ux."Id_evento" = ${id}
  `;

  // 3. Agregar la lista al objeto evento
  evento.participanteslist = toLowercaseKeys(participants);

  return evento;
};


// Crear evento
const createEvent = async ({
    Id_instalacion,
    Id_deporte,
    Id_organizador, // uid de Firebase
    Nombre,
    Descripcion,
    Fecha,
    Hora,
    Hora_final,
    Capacidad_evento
}) => {
    console.log("✅ createEvent recibió:", {
        Id_instalacion,
        Id_deporte,
        Id_organizador,
        Nombre,
        Descripcion,
        Fecha,
        Hora,
        Hora_final,
        Capacidad_evento
    });

    // 1. Buscar ID interno
    const usuarioRows = await sql`
        SELECT "Id" 
        FROM usuarios 
        WHERE "Uid" = ${Id_organizador}
    `;

    if (usuarioRows.length === 0) {
        throw new Error("UID de organizador inválido");
    }

    const IdReal = usuarioRows[0].Id;
    const Id_estado = 10;

    // 2. Insertar evento
    const result = await sql`
        INSERT INTO eventos 
            ("Id_instalacion", "Id_deporte", "Id_organizador", "Nombre", "Descripcion", "Fecha", "Hora", "Capacidad_evento", "Id_estado", "Hora_final") 
        VALUES 
            (${Id_instalacion}, ${Id_deporte}, ${IdReal}, ${Nombre}, ${Descripcion}, ${Fecha}, ${Hora}, ${Capacidad_evento || 0}, ${Id_estado}, ${Hora_final})
        RETURNING "Id"
    `;

    // 💡 CAMBIO: Obtener Id_evento del resultado RETURNING
    const Id_evento = result[0].Id;

    // 3. Insertar al organizador en usuarios_x_evento
    await sql`
        INSERT INTO usuarios_x_evento ("Id_usuario", "Id_evento") 
        VALUES (${IdReal}, ${Id_evento})
    `;

    console.log("✅ Organizador agregado a usuarios_x_evento");

    return {
        Id: Id_evento,
        Id_instalacion,
        Id_deporte,
        Id_organizador_interno: IdReal, 
        Nombre,
        Descripcion,
        Fecha,
        Hora,
        capacidad_evento: Capacidad_evento || 0
    };
};

const validarUnion = async (eventoId, usuarioId) => {
    
    // 1. Buscar ID interno
    const usuarioRows = await sql`
        SELECT "Id" 
        FROM usuarios 
        WHERE "Uid" = ${usuarioId}
    `;

    if (usuarioRows.length === 0) {
        return { ok: false, error: "Usuario no encontrado" };
    }

    const usuarioIdReal = usuarioRows[0].Id;

    // 2. Verificar si ya se unió
    const existe = await sql`
        SELECT * FROM usuarios_x_evento 
        WHERE "Id_evento" = ${eventoId} AND "Id_usuario" = ${usuarioIdReal}
    `;

    if (existe.length > 0) {
        return { ok: false, error: "Ya estás registrado en este evento" };
    }

    // 3. Verificar cupo
    // En PostgreSQL, la subconsulta debe ejecutarse como una columna separada.
    const eventoRows = await sql`
        SELECT 
            e."Capacidad_evento" AS capacidad,
            (SELECT COUNT(*) FROM usuarios_x_evento WHERE "Id_evento" = ${eventoId}) AS inscritos
        FROM eventos e 
        WHERE e."Id" = ${eventoId}
    `;

    const evento = eventoRows[0];
    
    if (!evento) {
        return { ok: false, error: "Evento no encontrado" };
    }

    // PostgreSQL devuelve COUNT como string, debemos parsearlo
    if (parseInt(evento.inscritos) >= evento.capacidad) {
        return { ok: false, error: "El evento está lleno" };
    }

    return { ok: true };
};

// ✅ insertar participante
const unirseEvento = async (eventoId, usuarioId) => {
    // 1. Buscar ID interno
    const usuarioRows = await sql`
        SELECT "Id" 
        FROM usuarios 
        WHERE "Uid" = ${usuarioId}
    `;

    if (usuarioRows.length === 0) {
        return { ok: false, error: "Usuario no encontrado" };
    }

    const usuarioIdReal = usuarioRows[0].Id;

    // 2. Insertar
    await sql`
        INSERT INTO usuarios_x_evento ("Id_evento", "Id_usuario")
        VALUES (${eventoId}, ${usuarioIdReal})
    `;
};

// Actualizar estado
const updateEstado = async (id, nuevoEstado) => {
    await sql`
        UPDATE eventos 
        SET "Id_estado" = ${nuevoEstado}
        WHERE "Id" = ${id}
    `;
    // Reutilizamos la función getEventById (ya modificada)
    return await getEventById(id);
};

const getEventosByEstado = async (estado) => {
    const rows = await sql`
        SELECT * FROM eventos
        WHERE "Id_estado" = ${estado}
    `;
    return rows;
};

// Eliminar evento (Marcar como cancelado)
const cancelEvent = async (id) => {
    const CANCELADO_ID = 11; // 11: cancelado
    
    // 💡 CAMBIO: Usar RETURNING para saber si se afectó alguna fila
    const result = await sql`
        UPDATE eventos 
        SET "Id_estado" = ${CANCELADO_ID} 
        WHERE "Id" = ${id}
        RETURNING "Id"
    `;
    
    // Si se retornó un ID, significa que se actualizó una fila
    return result.length > 0; 
};

const getEventsByOrganizadorUid = async (uid) => {
    // 1. Buscar el id interno del organizador
    const userRow = await sql`
        SELECT "Id", "Nombre" 
        FROM usuarios 
        WHERE "Uid" = ${uid}
    `;

    if (userRow.length === 0) {
        return [];
    }
    
    const organizadorNombre = userRow[0].Nombre;
    const estado = 10;
    
    // 2. Obtener todos los eventos organizados por ese usuario
    const rows = await sql`
        SELECT 
            e.*, 
            i."Nombre" AS nombre_instalacion,
            d."Nombre" AS nombre_deporte,
            es."Nombre_estado" AS nombre_estado,
            COUNT(ux."Id_usuario") AS participantes
        FROM eventos e
        JOIN instalacion_deportiva i ON e."Id_instalacion" = i."Id"
        JOIN deportes d ON e."Id_deporte" = d."Id"
        JOIN estados es ON e."Id_estado" = es."Id_estado"
        LEFT JOIN usuarios_x_evento ux ON e."Id" = ux."Id_evento"
        JOIN usuarios u ON e."Id_organizador" = u."Id"
        WHERE u."Uid" = ${uid} AND e."Id_estado" = ${estado}
        GROUP BY e."Id", i."Nombre", d."Nombre", es."Nombre_estado"
    `;

    if (rows.length === 0) return [];

    // 3. Convertir claves a minúsculas (según tu helper)
    const eventos = toLowercaseKeys(rows);

    // 4. Obtener lista de participantes para cada evento
    for (const evento of eventos) {
        const participants = await sql`
            SELECT 
                u."Id", 
                u."Nombre", 
                u."Email"
            FROM usuarios_x_evento ux
            JOIN usuarios u ON ux."Id_usuario" = u."Id"
            WHERE ux."Id_evento" = ${evento.id}
        `;

        evento.participanteslist = toLowercaseKeys(participants);
        evento.nombre_organizador = organizadorNombre; // añadimos el nombre del organizador
    }

    return eventos;
};

const getEventsByParticipantId = async (idUsuario) => {
    try {
        // 1. Buscar ID interno
        const userRow = await sql`
            SELECT "Id" 
            FROM usuarios 
            WHERE "Uid" = ${idUsuario}
        `;

        if (userRow.length === 0) {
            console.log(`Usuario con uid ${idUsuario} no encontrado.`);
            return []; 
        }

        const idUsuarioInterno = userRow[0].Id;
        
        // 2. Obtener datos del evento y conteo de participantes
        const rows = await sql`
            SELECT 
                e.*, 
                i."Nombre" AS nombre_instalacion,
                d."Nombre" AS nombre_deporte,
                es."Nombre_estado" AS nombre_estado,
                uo."Nombre" AS nombre_organizador,
                COUNT(ux2."Id_usuario") AS participantes
            FROM usuarios_x_evento ux
            JOIN eventos e ON ux."Id_evento" = e."Id"
            JOIN instalacion_deportiva i ON e."Id_instalacion" = i."Id"
            JOIN deportes d ON e."Id_deporte" = d."Id"
            JOIN estados es ON e."Id_estado" = es."Id_estado"
            JOIN usuarios uo ON e."Id_organizador" = uo."Id"
            LEFT JOIN usuarios_x_evento ux2 ON e."Id" = ux2."Id_evento"
            WHERE ux."Id_usuario" = ${idUsuarioInterno}
            GROUP BY e."Id", i."Nombre", d."Nombre", es."Nombre_estado", uo."Nombre"
        `;

        if (rows.length === 0) return [];

        // 3. Por cada evento, obtener la lista de participantes
        const eventos = await Promise.all(
            rows.map(async (eventoRaw) => {
                const evento = toLowercaseKeys(eventoRaw);
                const participantes = await sql`
                    SELECT 
                        u."Id", 
                        u."Nombre", 
                        u."Email"
                    FROM usuarios_x_evento ux
                    JOIN usuarios u ON ux."Id_usuario" = u."Id"
                    WHERE ux."Id_evento" = ${evento.id}
                `;

                return {
                    ...evento,
                    participanteslist: participantes,
                };
            })
        );

        return toLowercaseKeys(eventos);
    } catch (error) {
        console.error("Error al obtener eventos por participante:", error);
        throw error;
    }
};

const getEventosByFecha = async (id_instalacion, fecha) => {
    const rows = await sql`
        SELECT "Hora", "Hora_final"
        FROM eventos
        WHERE "Id_instalacion" = ${id_instalacion} AND "Fecha" = ${fecha} AND "Id_estado" = 10
    `;
    return toLowercaseKeys(rows);
};

const removeUserFromEvent = async (idUsuario, idEvento) => {
    // 1. Buscar ID interno
    const userRow = await sql`
        SELECT "Id" 
        FROM usuarios 
        WHERE "Uid" = ${idUsuario}
    `;

    if (userRow.length === 0) {
        console.log(`Usuario con uid ${idUsuario} no encontrado.`);
        return false; 
    }
    
    const idUsuarioInterno = userRow[0].Id;

    // 2. Eliminar
    const result = await sql`
        DELETE FROM usuarios_x_evento 
        WHERE "Id_usuario" = ${idUsuarioInterno} AND "Id_evento" = ${idEvento}
        RETURNING "Id_usuario"
    `;

    // Si se retornó una fila, la eliminación fue exitosa
    return result.length > 0; 
};

const getEventsForReminder = async () => {
    const rows = await sql`
        SELECT 
        e."Id" AS id_evento,                           
        e."Id_organizador" AS id_organizador,
        e."Nombre" AS titulo_evento,
        e."Fecha",
        e."Hora",
        u."Id" AS id_usuario,                           
        u."Uid" AS Usuario_uid,                         
        u."Nombre" AS nombre_usuario
        FROM eventos e
        JOIN usuarios_x_evento uxe ON e."Id" = uxe."Id_evento"
        JOIN usuarios u ON uxe."Id_usuario" = u."Id"
        WHERE e."Id_estado" = 10 
        AND e."Recordatorio_enviado" = 0 
        AND (e."Fecha" + e."Hora"::interval) BETWEEN
        (CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota' + interval '25 minutes') 
        AND 
        (CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota' + interval '35 minutes')
        ORDER BY e."Id"
    `;

    // ... (La lógica de JS de agrupación se mantiene igual)
    const eventosMap = {};
    rows.forEach(row => {
        if (!eventosMap[row.id_evento]) {
            eventosMap[row.id_evento] = {
                id: row.id_evento,
                idOrganizador: row.id_organizador, // ID interno del organizador
                titulo: row.titulo_evento,
                fecha: row.Fecha,
                hora: row.Hora,
                participantes: [],
            };
        }
        eventosMap[row.id_evento].participantes.push({
            id: row.id_usuario, // ID interno
            nombre: row.nombre_usuario
        });
    });

    return Object.values(eventosMap);
};

// Nueva función para marcar el recordatorio como enviado
const markReminderSent = async (eventoId) => {
    await sql`
        UPDATE eventos 
        SET "Recordatorio_enviado" = 1 
        WHERE "Id" = ${eventoId}
    `;
};

const getProbabilidadFactores = async (evento) => {
    const { Id_instalacion, Id_deporte, Fecha, Hora } = evento;

    // Convertir fecha para obtener día de la semana
    const fechaJS = new Date(Fecha);
    // 💡 CAMBIO: PostgreSQL usa EXTRACT(DOW) 0=domingo, 6=sábado. MySQL usa 1=domingo.
    // Usaremos el día de la semana de JS (0-6) para buscar en la tabla de PostgreSQL 
    // si asumes que los datos de la vista vm_eventos_por_dia_semana ya fueron ajustados.
    const diaSemanaJS = fechaJS.getDay(); 

    // Convertir hora a número
    const horaPartes = Hora.split(':');
    const horaNumero = parseInt(horaPartes[0], 10);

    let franja;
    if (horaNumero >= 6 && horaNumero <= 11) franja = 'mañana';
    else if (horaNumero >= 12 && horaNumero <= 17) franja = 'tarde';
    else if (horaNumero >= 18 && horaNumero <= 21) franja = 'noche';
    else franja = 'fuera_rango';

    // Consultas
    const instalacion = await sql`
        SELECT prob_exito 
        FROM vm_eventos_por_instalacion 
        WHERE "Id_instalacion" = ${Id_instalacion}
    `;

    const deporte = await sql`
        SELECT prob_exito 
        FROM vm_eventos_por_deporte 
        WHERE "Id_deporte" = ${Id_deporte}
    `;

    // 💡 CAMBIO: Ajustamos la variable a enviar, asumiendo que tu tabla usa el formato 0-6.
    const dia = await sql`
        SELECT prob_exito 
        FROM vm_eventos_por_dia_semana 
        WHERE dia_semana = ${diaSemanaJS}
    `;

    const franjaHoraria = await sql`
        SELECT prob_exito 
        FROM vm_eventos_por_franja_horaria 
        WHERE franja = ${franja}
    `;
    
    // Accedemos directamente a [0] porque postgres devuelve un array de filas
    return {
        prob_instalacion: instalacion[0]?.prob_exito ?? null,
        prob_deporte: deporte[0]?.prob_exito ?? null,
        prob_dia: dia[0]?.prob_exito ?? null,
        prob_franja: franjaHoraria[0]?.prob_exito ?? null
    };
};

module.exports = { getAllEvents, getEventById, createEvent, updateEstado,
    cancelEvent, getEventsByOrganizadorUid, getEventsByParticipantId,
    getEventosByFecha, validarUnion, unirseEvento, removeUserFromEvent,
    markReminderSent, getEventsForReminder, getEventosByEstado, getProbabilidadFactores };