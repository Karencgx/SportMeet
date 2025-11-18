// 📁 src/controllers/calificacionController.js
const calificacionModel = require('../models/calificacionModel'); // Asegúrate de que esta ruta sea correcta

/**
 * GET /api/calificaciones/evento/:idEvento/participantes
 * Obtiene la lista de participantes de un evento para ser calificados.
 */
const getParticipantesParaCalificar = async (req, res) => {
    // Convierte el ID del evento a entero
    const idEvento = parseInt(req.params.idEvento);
    
    // ⚠️ Asume que el ID del usuario logueado (el calificador) viene inyectado por un middleware (ej. req.userId)
    const id_calificador = req.internalUserId; 

    if (!idEvento || isNaN(idEvento)) {
        return res.status(400).json({ message: "ID de evento inválido." });
    }
    if (!id_calificador) {
        return res.status(401).json({ message: "Usuario no autenticado." });
    }

   try {
        // 1. Obtener todos los participantes elegibles (incluyendo los ya calificados, por ahora)
        let participantes = await calificacionModel.getParticipantesParaCalificar(idEvento, id_calificador);
        console.log("DEBUG 1: Participantes (antes de filtrar):", participantes);       
         // 2. Obtener la lista de IDs de usuarios que el calificador YA calificó
        const idsCalificadosPrevios = await calificacionModel.getCalificacionesPorCalificador(idEvento, id_calificador);
        console.log("DEBUG 2: IDs ya calificados:", idsCalificadosPrevios);
        // 3. Mapear y marcar si ya fue calificado
        participantes = participantes.map(p => ({
            id_usuario: p.id_usuario,
            nombre_usuario: p.nombre_usuario,
            yaCalificado: idsCalificadosPrevios.includes(p.id_usuario)
        }));
        console.log("DEBUG 3: Participantes mapeados (con yaCalificado):", participantes);
        // 4. 🛑 ¡PASO CRUCIAL! Filtrar solo a los pendientes de calificación
        const participantesPendientes = participantes.filter(p => !p.yaCalificado);
        console.log("DEBUG 4: Participantes PENDIENTES (Resultado Final):", participantesPendientes);
        // 5. Devolver SOLO los pendientes al frontend
        res.json(participantesPendientes); // ⬅️ Cambiado para devolver solo los pendientes
    } catch (error) {
        console.error("Error obteniendo participantes para calificar:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

/**
 * POST /api/calificaciones
 * Registra una nueva calificación.
 */
const crearCalificacion = async (req, res) => {
    // Desestructurar los datos del cuerpo de la solicitud
    const { id_evento, id_calificado, puntaje, comentario } = req.body;
    
    // ⚠️ ID del usuario logueado (el calificador)
    const id_calificador = req.internalUserId; 

    // Validación de datos requeridos y rango de puntaje
    if (!id_evento || !id_calificado || puntaje === undefined || puntaje < 1 || puntaje > 5) {
        return res.status(400).json({ message: "Datos de calificación inválidos o incompletos." });
    }
    if (!id_calificador) {
        return res.status(401).json({ message: "Usuario no autenticado." });
    }

    try {
        // 1. Validación: ¿Ya calificó a este usuario en este evento?
        const alreadyRated = await calificacionModel.checkIfAlreadyRated(id_evento, id_calificador, id_calificado);
        if (alreadyRated) {
            return res.status(409).json({ message: "Ya has calificado a este usuario en este evento." });
        }
        
        // 2. Registrar en la DB
        await calificacionModel.crearCalificacion(id_evento, id_calificador, id_calificado, puntaje, comentario || null);
        
        // 3. Respuesta de éxito
        res.status(201).json({ message: "Calificación registrada con éxito." });

    } catch (error) {
        console.error("Error al registrar calificación:", error);
        res.status(500).json({ message: "Error interno del servidor al registrar la calificación." });
    }
};

/**
 * GET /api/usuarios/:idUsuario/calificacion-promedio
 * Obtiene la calificación promedio y el total de calificaciones recibidas por un usuario.
 */
const getCalificacionPromedio = async (req, res) => {
    const idUsuario = parseInt(req.params.idUsuario);

    if (isNaN(idUsuario)) {
        return res.status(400).json({ message: "ID de usuario inválido." });
    }

    try {
        const data = await calificacionModel.getCalificacionPromedio(idUsuario);

        // Formatear el promedio a un decimal si existe
        const promedio = data.promedio ? Number(data.promedio).toFixed(1) : 0;
        const totalVotos = data.total ? parseInt(data.total) : 0;

        res.json({
            promedio: parseFloat(promedio), // Devolver como número formateado
            total: totalVotos,
        });

    } catch (error) {
        console.error("Error al obtener promedio de calificación:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

module.exports = {
    getParticipantesParaCalificar,
    crearCalificacion,
    getCalificacionPromedio,
};