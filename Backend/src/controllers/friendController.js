// 📁 friendController.js

const friendModel = require('../models/friendModel');
const UserModel = require('../models/UserModel'); 
const NotificationModel = require('../models/notificationModel');
const { getIO, getUserSocketMap } = require('../socketManager');     

// Función de utilidad para obtener el nombre del usuario que acepta/envía
const getUserName = async (userId) => {
    const user = await UserModel.getUserById(userId);
    if (user) {
        // --- 🚨 MANTÉN EL LOG DE DEPURACIÓN CLAVE POR AHORA 🚨 ---
        // Necesitamos ver el objeto REAL que sale del modelo.
        console.log(`[DEBUG] Objeto Usuario (ID ${userId}):`, user); 
        
        // 🚨 CLAVE: Solo comprueba la clave en minúscula 'nombre', que es lo que debe devolver el modelo.
        if (user.nombre) {
            console.log('[DEBUG] Usando nombre (lowercase)');
            return user.nombre;
        }
    }
    
    // Si llegamos aquí, ni 'Nombre' ni 'nombre' existen, por lo que devolvemos 'Un usuario' (fallback).
    // Antes se devolvía undefined, lo que causaba "undefined ha aceptado..."
    console.warn(`[DEBUG] No se encontró el nombre para el usuario ID ${userId}.`);
    return 'Un usuario';
};


// ✅ Obtener todas las amistades de un usuario (Sin cambios)
const getAllAmigos = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('1. UID de Firebase recibida:', userId); 
    if (!userId) {
      return res.status(400).json({ message: 'El ID de usuario es obligatorio' });
    }
    const user = await UserModel.getUserByUid(userId);
    if (!user || !user.id) {
        console.warn(`Usuario con UID ${userId} no encontrado o sin ID interna.`);
        return res.status(200).json([]); 
    }

    const internalUserId = user.id; 
    console.log('2. ID Numérica Interna (internalUserId) resuelta:', internalUserId); 

    const amigos = await friendModel.getAllAmigos(internalUserId); 
    console.log('3. Amistades obtenidas con éxito:', amigos.length); 
    
    res.status(200).json(amigos);
  } catch (error) {
    console.error('Error al obtener las amistades:', error);
    res.status(500).json({ message: 'Error al obtener las amistades', error });
  }
};

// ✅ Obtener una amistad por su ID (Sin cambios)
const getAmigoById = async (req, res) => {
  try {
    const id = req.params.id;
    const amigo = await friendModel.getAmigoById(id);

    if (!amigo) {
      return res.status(404).json({ message: 'Amistad no encontrada' });
    }

    res.status(200).json(amigo);
  } catch (error) {
    console.error('Error al obtener la amistad:', error);
    res.status(500).json({ message: 'Error al obtener la amistad', error });
  }
};

// 📧 Crear una nueva solicitud de amistad (CON NOTIFICACIÓN)
const createAmigo = async (req, res) => {
  try {
    // usuarioId es quien ENVÍA, amigoId es quien RECIBE
    const { usuarioId, amigoId, id_estado } = req.body; 
    
    // 🔸 Validaciones básicas
    if (!usuarioId || !amigoId) { 
      return res.status(400).json({ message: 'Ambos IDs de usuario son obligatorios' });
    }
    if (usuarioId === amigoId) {
      return res.status(400).json({ message: 'No puedes enviarte una solicitud a ti mismo' });
    }

    // 🔸 Verificar si ya existe una relación
    const existing = await friendModel.checkExistingAmigo(usuarioId, amigoId);

    if (existing) {
            // 🚨 CLAVE: Manejo de estados existentes 🚨
            const estadoActual = existing.Id_estado;

            // Bloquear si la relación está PENDIENTE (7) o ACEPTADA (8)
            if (estadoActual === 7 || estadoActual === 8) {
                return res.status(409).json({ 
                    message: `Ya existe una relación activa (${estadoActual}) entre estos usuarios.`,
                    estadoId: estadoActual 
                });
            }
            
            // 💡 SI el estado es RECHAZADA (9) o ELIMINADA (10), 
            // no creamos una nueva fila, sino que la reactivamos (UPDATE).
            if (estadoActual === 9 || estadoActual === 6) {
                // 1. Reactivar la solicitud existente
                // Usamos la ID de la fila existente
                const amistadReactivada = await friendModel.updateAmigo(existing.Id, { 
                    Id_estado: 7 // Volver a poner como PENDIENTE
                });

                // 2. Ejecutar la lógica de notificación (duplicada de abajo)
                const receptorId = amigoId; 
                const emisorNombre = await getUserName(usuarioId);
                
                await NotificationModel.createNotification(
                    receptorId,
                    'SOLICITUD_RECIBIDA',
                    `${emisorNombre} te ha enviado una solicitud de amistad `,
                    existing.Id
                );
                // (Opcional: Añadir lógica de Socket.IO aquí también)

                return res.status(200).json({ // 200 OK porque fue una actualización exitosa
                    message: 'Solicitud de amistad reactivada correctamente',
                    id: existing.Id 
                });
            }
        }

    // 🔸 Crear solicitud
    const nuevaAmistad = await friendModel.createAmigo({ 
        Id_usuario_1: usuarioId, 
        Id_usuario_2: amigoId,
        Id_estado: id_estado || 7 
    });
    
    // --- 🚨 LÓGICA DE NOTIFICACIÓN AÑADIDA ---
    const receptorId = amigoId; 
    const emisorNombre = await getUserName(usuarioId);
    
    // 1. Crear la notificación persistente en la DB
    await NotificationModel.createNotification(
        receptorId,
        'SOLICITUD_RECIBIDA',
        `${emisorNombre} te ha enviado una solicitud de amistad.`,
        nuevaAmistad.insertId || nuevaAmistad.Id // Usamos la ID insertada (podría ser insertId)
    );

    // 2. Enviar notificación en tiempo real (Socket.IO)
    try {
        const io = getIO(); // Obtener instancia
        const userSocketMap = getUserSocketMap(); // Obtener mapa

        const receptorSocketId = userSocketMap.get(receptorId);
        if (receptorSocketId) {
            io.to(receptorSocketId).emit('nuevaNotificacion', {
                tipo: 'SOLICITUD_RECIBIDA',
                contenido: `${emisorNombre} te ha enviado una solicitud de amistad.`,
                referenciaId: nuevaAmistad.insertId || nuevaAmistad.Id 
            });
            console.log(`[Socket.IO] Solicitud notificada a usuario DB ID: ${receptorId}`);
        }
    } catch (socketError) {
        console.warn(`[Socket.IO] No se pudo enviar la notificación en tiempo real: ${socketError.message}`);
        // No lanzamos error para que la transacción siga su curso
    }
    // ------------------------------------------

    // 🚨 CORRECCIÓN CLAVE: Devolver solo datos simples para evitar el Error 500
    res.status(201).json({
      message: 'Solicitud de amistad enviada correctamente',
      id: nuevaAmistad.insertId || nuevaAmistad.Id // Devolvemos solo la ID
    });
  } catch (error) {
    console.error('Error al crear la solicitud de amistad:', error);
    res.status(500).json({ message: 'Error al crear la solicitud de amistad', error: error.message || 'Error desconocido' });
  }
};

// ✅ Actualizar el estado de una amistad (CON NOTIFICACIÓN)
const updateAmigo = async (req, res) => {
  try {
    const id = req.params.id; // ID de la solicitud
    // Asegúrate de que Id_estado y usuarioAceptaId vengan en el body
    const { Id_estado, usuarioAceptaId } = req.body; 

    // Validar existencia
    const existing = await friendModel.getAmigoById(id);
    if (!existing) {
      return res.status(404).json({ message: 'La solicitud de amistad no existe' });
    }

    // Validar cambio válido
    if (![7, 8, 9].includes(Id_estado)) {
      return res.status(400).json({
        message: 'Estado no válido. Usa 7 (pendiente), 8 (aceptada) o 9 (rechazada)'
      });
    }

    // Actualizar
    const amistadActualizada = await friendModel.updateAmigo(id, { Id_estado });

    // --- 🚨 LÓGICA DE NOTIFICACIÓN AÑADIDA (SOLO si es ACEPTADA) ---
    if (Id_estado === 8) { // Estado Aceptada
        // El usuario a notificar es quien HIZO la solicitud original (Id_usuario_1)
        const emisorOriginalId = existing.Id_usuario_1; 
        
        // El nombre a usar es el del usuario que ACEPTÓ (usuarioAceptaId)
        const aceptadorNombre = await getUserName(usuarioAceptaId);
        
        // 1. Crear la notificación persistente en la DB
        await NotificationModel.createNotification(
            emisorOriginalId, // Notifica al EMISOR ORIGINAL
            'AMISTAD_ACEPTADA',
            `${aceptadorNombre} ha aceptado tu solicitud de amistad.`,
            id // ID de la solicitud
        );

        // 2. Enviar notificación en tiempo real (Socket.IO)
        try {
            const io = getIO();
            const userSocketMap = getUserSocketMap();

            const emisorSocketId = userSocketMap.get(emisorOriginalId);
            if (emisorSocketId) {
                io.to(emisorSocketId).emit('nuevaNotificacion', {
                    tipo: 'AMISTAD_ACEPTADA',
                    contenido: `${aceptadorNombre} ha aceptado tu solicitud de amistad.`,
                    referenciaId: id
                });
                console.log(`[Socket.IO] Aceptación notificada a usuario DB ID: ${emisorOriginalId}`);
            }
        } catch (socketError) {
            console.warn(`[Socket.IO] No se pudo enviar la notificación en tiempo real: ${socketError.message}`);
        }
    }
    // -------------------------------------------------------------
    
    res.status(200).json({
      message: 'Estado de amistad actualizado correctamente',
    });
  } catch (error) {
    console.error('Error al actualizar la amistad:', error);
    res.status(500).json({ message: 'Error al actualizar la amistad', error: error.message || 'Error desconocido' });
  }
};

const deleteAmigo = async (req, res) => {
  try {
    const id = req.params.id;

    // Validar existencia antes de eliminar
    const existing = await friendModel.getAmigoById(id);
    if (!existing) {
      return res.status(404).json({ message: 'La amistad no existe' });
    }

    await friendModel.deleteAmigo(id);
    res.status(200).json({ message: 'Amistad eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la amistad:', error);
    res.status(500).json({ message: 'Error al eliminar la amistad', error });
  }
};

module.exports = {
  getAllAmigos,
  getAmigoById,
  createAmigo,
  updateAmigo,
  deleteAmigo,
};