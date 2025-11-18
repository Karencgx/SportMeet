const eventModel = require("../models/eventModel");
const NotificationModel = require("../models/notificationModel"); 
const UserModel = require("../models/UserModel");

// GET /eventos → listar todos
const getAllEvents = async (req, res) => {
  try {
    const eventos = await eventModel.getAllEvents();
    res.json(eventos);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// GET /eventos/:id → obtener detalle
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await eventModel.getEventById(id);

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

     const capacidad = Number(evento.capacidad_evento);
    const ocupados = Number(evento.participantes);

    // Depuración útil por si sigue fallando
    console.log("DEBUG capacidad:", evento.capacidad_evento);
    console.log("DEBUG ocupados:", evento.participantes);
    console.log("DEBUG convertidos:", capacidad, ocupados);

    const espacios_disponibles = capacidad - ocupados;

    const eventoConCapacidad = {
      ...evento,
      espacios_disponibles
    };

    res.json(eventoConCapacidad);

  
  } catch (error) {
    console.error("Error al obtener evento:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// POST /eventos → crear
const createEvent = async (req, res) => {
  console.log("✅ Llegó al controller:", req.body);
  try {
    const {
      id_instalacion,
      id_deporte,
      id_organizador,
      titulo,
      descripcion,
      fecha,
      hora,
      hora_final,
      max_participantes
    } = req.body;

    const nuevoEvento = await eventModel.createEvent({
      Id_instalacion: id_instalacion,
      Id_deporte: id_deporte,
      Id_organizador: id_organizador,
      Nombre: titulo,
      Descripcion: descripcion,
      Fecha: fecha,
      Hora: hora,
      Hora_final: hora_final,
      Capacidad_evento: max_participantes,
    });

    const idOrganizadorInterno = nuevoEvento.Id_organizador_interno; // <-- OBTENIDO DEL MODELO

      if (idOrganizadorInterno) {
          // Obtenemos el objeto completo del organizador usando su ID INTERNO
          const organizador = await UserModel.getUserById(idOrganizadorInterno); 
          console.log(`[DEBUG] Objeto Organizador obtenido: ${organizador ? organizador.nombre : 'NULL'}`);
          if (organizador) {
              // 2a. Obtener los IDs internos de los amigos
              const amigosIds = await NotificationModel.getAmigosIds(idOrganizadorInterno);
              console.log(`[DEBUG] IDs de amigos para notificación: [${amigosIds.join(', ')}]`);

              const notifTipo = "EVENTO_CREADO";
              // Usamos 'nombre' del objeto 'organizador' (en minúscula gracias a toLowercaseKeys)
              const notifContenido = `Tu amigo(a) ${organizador.nombre} ha creado un nuevo evento: "${titulo}". ¡Únete!`;

              console.log(`[NOTIF] Encontrados ${amigosIds.length} amigos. Iniciando envío...`);
              
              // 2b. Enviar la notificación a cada amigo
              for (const amigoId of amigosIds) {
                    try {
                        await NotificationModel.createNotification(
                            amigoId, 
                            notifTipo, 
                            notifContenido, 
                            nuevoEvento.Id 
                        );
                    } catch (error) {
                        // Loguea el error de la DB para ese amigo, pero permite que los otros continúen
                        console.error(`❌ Falló la notificación para el amigo ID ${amigoId}: ${error.message}`);
                    }
                  }

                  console.log(`[NOTIF] Envío de notificaciones finalizado.`);
              }
    }
    res.status(201).json(nuevoEvento);
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const unirseEvento = async (req, res) => {
  try {
    const eventoId = req.params.id;
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ error: "usuarioId es requerido" });
    }

    // Validar cupo y si ya está inscrito
    const puedeUnirse = await eventModel.validarUnion(eventoId, usuarioId);

    if (!puedeUnirse.ok) {
      return res.status(400).json({ error: puedeUnirse.error });
    }

    // Unirse al evento
    await eventModel.unirseEvento(eventoId, usuarioId);

    res.json({ message: "Te has unido al evento exitosamente" });
  } catch (error) {
    console.error("Error uniendo al evento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// PUT /eventos/:id
const updateEvent = async (req, res) => {
  try {
    const evento = await eventModel.updateEvent(req.params.id, req.body);
    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// DELETE /eventos/:id
const cancelEvent = async (req, res) => {
  try {
    const eventoId = req.params.id;
    
    // 1. Obtener datos del evento ANTES de modificarlo
    const evento = await eventModel.getEventById(eventoId);
    if (!evento) {
        return res.status(404).json({ message: "Evento no encontrado para cancelar" });
    }

    // 2. Obtener los IDs de los participantes
    const participantesIds = await NotificationModel.getParticipantesIds(eventoId);

    // 3. 🚨 CAMBIO CRUCIAL: Llamar a eventModel.cancelEvent en lugar de deleteEvent
    await eventModel.cancelEvent(eventoId);
    
    // 4. CREAR NOTIFICACIONES
    const titulo = "🚨 ¡Evento Cancelado!";
    // Usamos 'nombre' del objeto evento (camelCase)
    const mensaje = `El evento "${evento.nombre}" al que estabas unido(a) ha sido cancelado por el organizador.`; 
    
    participantesIds.forEach(participanteId => {
        NotificationModel.createNotification(
            participanteId, 
            'EVENTO_CANCELADO', 
            mensaje, 
            eventoId
        );
    });
    console.log(`[NOTIF] Evento ${eventoId} cancelado. Avisados ${participantesIds.length} participantes.`);

    // Mensaje de respuesta actualizado
    res.json({ message: "Evento cancelado correctamente (Estado actualizado a 11)" });
  } catch (error) {
    console.error("Error al cancelar evento:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const getEventsByOrganizadorUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const eventos = await eventModel.getEventsByOrganizadorUid(uid); // usando la función que hicimos antes
    res.json(eventos);
  } catch (error) {
    console.error("Error al obtener eventos por organizador:", error);
    res.status(500).json({ message: "Error al obtener eventos del organizador" });
  }
};

const getEventsByParticipantId = (req, res) => {
  const { id } = req.params; // id_usuario

  eventModel
    .getEventsByParticipantId(id)
    .then((eventos) => res.json(eventos))
    .catch((error) => {
      console.error("Error al obtener eventos del participante:", error);
      res.status(500).json({ message: "Error al obtener eventos del participante" });
    });
};

function generateAllTimes() {
  const times = [];
  for (let h = 6; h <= 21; h++) {
    for (const m of [0, 15, 30, 45]) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
}

function addMinutes(time, minsToAdd) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date(0, 0, 0, h, m + minsToAdd);
  const newH = date.getHours().toString().padStart(2, "0");
  const newM = date.getMinutes().toString().padStart(2, "0");
  return `${newH}:${newM}`;
}

const getAvailableHours = async (req, res) => {
  try {
    const { fecha, id_instalacion } = req.body;
    if (!fecha || !id_instalacion)
      return res.status(400).json({ error: "Faltan datos: fecha o instalación" });

    const reservas = await eventModel.getEventosByFecha(id_instalacion, fecha);
    const allTimes = generateAllTimes(); // cada 15 minutos

    if (!reservas || reservas.length === 0) {
      return res.json(filtrarPorFechaActual(fecha, allTimes));
    }

    const occupiedTimes = new Set();

    reservas.forEach((reserva) => {
      const start = reserva.hora;
      const end = reserva.hora_final;

      const margen = 14; // minutos bloqueados antes del evento
      const extendedStart = addMinutes(start, -margen);

      allTimes.forEach((t) => {
        if (t >= extendedStart && t < end) {
          occupiedTimes.add(t);
        }
      });
    });

    let availableTimes = allTimes.filter((t) => !occupiedTimes.has(t));

    availableTimes = availableTimes.filter((t) => t <= "21:00");

    availableTimes = filtrarPorFechaActual(fecha, availableTimes);

    res.json(availableTimes);
  } catch (error) {
    console.error("Error al obtener horas disponibles:", error);
    res.status(500).json({ error: "Error al obtener horas disponibles" });
  }

  function filtrarPorFechaActual(fecha, horas) {
  // Obtener fecha de hoy en formato YYYY-MM-DD sin usar toISOString()
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const dd = String(ahora.getDate()).padStart(2, "0");
  const hoy = `${yyyy}-${mm}-${dd}`;

  // Si la fecha NO es hoy → permitir solo hasta 21:00
  if (fecha !== hoy) {
    return horas.filter((t) => t <= "21:00");
  }

  // --- Si la fecha ES hoy ---
  const twoHoursLater = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);

  // Obtener HH:mm en formato 24h
  const minTime =
    String(twoHoursLater.getHours()).padStart(2, "0") +
    ":" +
    String(twoHoursLater.getMinutes()).padStart(2, "0");

  return horas.filter((t) => t >= minTime && t <= "21:00");
}
};

const leaveEvent = async (req, res) => {
  try {
    const { id_usuario, id_evento } = req.body;

    if (!id_usuario || !id_evento) {
      return res.status(400).json({
        message: "Faltan parámetros: id_usuario y id_evento son requeridos",
      });
    }

    const removed = await eventModel.removeUserFromEvent(id_usuario, id_evento);

    if (!removed) {
      return res.status(404).json({
        message: "El usuario no estaba inscrito en este evento",
      });
    }

    return res.status(200).json({
      message: "Te has salido del evento exitosamente.",
    });
  } catch (error) {
    console.error("Error al salir del evento:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const getProbabilidadEvento = async (req, res) => {
  try {
    const evento = req.body;

    // Validación rápida para evitar errores tontos
    if (!evento.Id_instalacion || !evento.Id_deporte || !evento.Fecha || !evento.Hora) {
      return res.status(400).json({
        ok: false,
        msg: "Faltan datos para calcular la probabilidad"
      });
    }

    // Obtener los 4 factores desde las vistas materializadas
    const factores = await eventModel.getProbabilidadFactores(evento);

    const {
      prob_instalacion,
      prob_deporte,
      prob_dia,
      prob_franja
    } = factores;

    // Arreglo para eliminar valores null
    const valores = [
      prob_instalacion != null ? { valor: prob_instalacion, peso: 0.40 } : null,
      prob_deporte != null ? { valor: prob_deporte, peso: 0.30 } : null,
      prob_dia != null ? { valor: prob_dia, peso: 0.20 } : null,
      prob_franja != null ? { valor: prob_franja, peso: 0.10 } : null
    ].filter(x => x !== null);

    let prob_final = null;

    if (valores.length > 0) {
      const sumaPesos = valores.reduce((acc, x) => acc + x.peso, 0);
      const suma = valores.reduce((acc, x) => acc + (x.valor * x.peso), 0);
      prob_final = suma / sumaPesos;
    }

    return res.json({
      ok: true,
      probabilidad_final: prob_final
    });

  } catch (error) {
    console.error("Error en getProbabilidadEvento:", error);
    res.status(500).json({
      ok: false,
      msg: "Ocurrió un error al calcular la probabilidad"
    });
  }
};

module.exports = { getAllEvents, leaveEvent, getEventById, createEvent,
                  updateEvent, cancelEvent, getEventsByOrganizadorUid, getProbabilidadEvento,
                  getEventsByParticipantId, getAvailableHours, unirseEvento };


