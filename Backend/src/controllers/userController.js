// src/controllers/UserController.js
const UserModel = require("../models/UserModel");
const admin = require("firebase-admin");
const friendModel = require("../models/friendModel"); 

// --- Función Auxiliar: Limpieza de URL de Google ---
const cleanGooglePhotoUrl = (url) => {
    if (!url) return '';
    
    // 1. Descartar la URL de Google si es el placeholder corto y roto (ej: .../picture/9)
    // Se mantiene la lógica robusta para descartar el placeholder.
    if (url.includes('/profile/picture/') && url.length < 70) { 
        console.warn("URL de Google descartada por ser el placeholder roto (ej: .../picture/9).");
        return '';
    }
    
    // 2. Forzar HTTPS
    let cleanedUrl = url.replace(/^http:\/\//i, 'https://');
    
    // 3. Limpiar parámetros existentes y añadir uno estable (=s200-c)
    let base = cleanedUrl.split('=')[0]; 
    
    // 4. Devolver la URL estable y segura
    return base + '=s200-c'; 
};

// --- Controladores de Autenticación y Usuarios ---

const loginUser = async (req, res) => {
  try { 
    const {idToken} = req.body;
    console.log("🔍 idToken recibido en backend:", req.body.idToken);
    if (!idToken) {
     return res.status(400).json({ error: "ID Token no proporcionado." });
     }
     // 1. Verificar el token de Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const {uid} = decodedToken;
    console.log("🔥 decodedToken:", decodedToken);

    // 2. Buscar el usuario en la base de datos
    const userInDb = await UserModel.getUserByUid(uid);
    
      if (!userInDb) {
      console.log(`❌ Usuario con UID ${uid} no encontrado para iniciar sesión. Sugerir registro.`);
      return res.status(404).json({ error: "Usuario no registrado. Por favor, regístrate primero." });
    }

    if (userInDb.activo === 0) {
        console.log(`❌ Acceso Denegado: Usuario con UID ${uid} está inactivo.`);
        // Devolvemos 403 Forbidden con un mensaje de error específico
        return res.status(403).json({ 
            error: "Cuenta Inactiva", 
            message: "Tu cuenta ha sido desactivada." 
        });
    }

    const roles = await UserModel.getUserRoles(uid);
    const rolId = roles.length > 0 ? roles[0] : 2;
    // 3. Si el usuario existe, devolvemos sus datos (Login exitoso)
    console.log("✅ Inicio de sesión exitoso. Rol ID:" , rolId);
    console.log("Datos enviados al frontend:", { 
      message: "Inicio de sesión exitoso", 
      user: userInDb, 
      userRoleId: rolId,
      userId: userInDb.id 
    });
    res.status(200).json({ message: "Inicio de sesión exitoso", user: userInDb, userRoleId: rolId,userId: userInDb.id }); 
  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN POST /api/usuarios/login:", error.message);
    console.error("Detalles del Error:", error);
    res.status(error.codePrefix === 'auth' ? 401 : 500).json({ error: "Fallo en el inicio de sesión o token inválido." });

  }
};

const getUsers = async (req, res) => {
    try {
        // 1. OBTENER EL ID NUMÉRICO DEL USUARIO LOGUEADO
        // Viene de la query string (Ej: /usuarios?currentUserId=15)
        // Asumimos que la ID ya fue validada y convertida a número en el frontend si se usa un hook.
        // Para mayor robustez, la obtenemos y la parseamos.
        const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId, 10) : null;
        
        if (!currentUserId) {
            console.warn("Advertencia: getUsers llamado sin currentUserId. Devolviendo lista sin estado de amistad.");
        }

        // 2. Obtener TODOS los usuarios (incluyéndote a ti)
        const users = await UserModel.getAllUsers(); 
        
        // 3. Obtener todas las relaciones de amistad del usuario logueado
        const relaciones = currentUserId ? await friendModel.getAllAmigos(currentUserId) : [];

        // 4. Mapear y adjuntar el estado de amistad a cada usuario
      const usersWithStatus = users
            // 🚨 FILTRADO A NIVEL DE BACKEND: No enviamos al usuario logueado
            .filter(user => user.id !== currentUserId) 
            .map(user => {

            // Buscar la relación con este usuario en la lista de relaciones
            const relacion = relaciones.find(r => 
                // La relación puede estar en cualquier orden (user -> target) o (target -> user)
                (r.usuarioId === currentUserId && r.amigoId === user.id) ||
                (r.amigoId === currentUserId && r.usuarioId === user.id)
            );

            let status = 'NONE';
            if (relacion) {
                switch (relacion.estado) {
                    case 'aceptada':
                        status = 'ACCEPTED';
                        break;
                    case 'rechazada':
                        status = 'NONE';
                        break;
                    case 'pendiente':
                        // Damos un estatus diferente basado en quién envió la solicitud
                        // Si currentUserId es el usuario 1 (el que envió) -> REQUESTED
                        if (relacion.usuarioId === currentUserId) {
                            status = 'REQUESTED'; // Tú enviaste la solicitud
                        } else {
                            status = 'PENDING'; // Te enviaron la solicitud (pendiente de tu acción)
                        }
                        break;
                }
            }

            return { ...user, friendshipStatus: status };
        });
        
        res.json(usersWithStatus);

    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
};

const registerUser  = async (req, res) => {
  try {
    const {idToken, phone} = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "ID Token no proporcionado." });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name: displayName } = decodedToken;

    // Obtener la URL de Firebase Auth para la foto de Google
    const userRecord = await admin.auth().getUser(uid);
    let fotoURL = userRecord.photoURL || ''; 

    // Limpiar y estabilizar la URL (o devolver vacío si es placeholder roto)
    fotoURL = cleanGooglePhotoUrl(fotoURL);

    console.log(`[REGISTRO] PhotoURL a guardar en DB: ${fotoURL}`);

    const userInDb = await UserModel.getUserByUid(uid);
    if (userInDb) {
      return res.status(409).json({ message: "El usuario ya se encuentra registrado. Por favor, inicia sesión." });
    }

    // 2. Crea el usuario en tu base de datos
    // Si fotoURL es vacío, la DB guardará '' o NULL (que es lo deseado)
    const newUser = await UserModel.registerNewUser({uid,email,displayName, phone,foto:fotoURL});
    console.log("Usuario creado en la base de datos.");

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error detallado al crear usuario:", error);

    res.status(500).json({ error: "Error al crear usuario" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    // Verifica que el ID en la URL coincida con el UID del token
    if (id !== uid) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    const user = await UserModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// 🚨 MODIFICACIÓN CLAVE: Mapeo de 'avatar' a 'foto'
const updateUser = async (req, res) => {
  try {
        const uidFromUrl = req.params.id; 
        const updatedFields = req.body; 
        
        // 1. Eliminar campos que no deben actualizarse (seguridad y evitar errores 500)
        delete updatedFields.uid;
        delete updatedFields.email;
        delete updatedFields.fechaRegistro; 
        
        // 🚨 2. MAPEO: Si el frontend usa 'avatar', lo cambiamos a 'foto' para la DB
        if (updatedFields.avatar !== undefined) {
             updatedFields.foto = updatedFields.avatar;
             delete updatedFields.avatar;
        }

        // 3. Llama al modelo para ejecutar la actualización
        const success = await UserModel.updateUserByUid(uidFromUrl, updatedFields); 
        
        if (!success) {
            return res.status(404).json({ error: "Usuario no encontrado o no se pudo actualizar." });
        }
        
        // 4. Obtener y devolver los datos actualizados
        const updatedUser = await UserModel.getUserByUid(uidFromUrl); 
        
        res.status(200).json(updatedUser); 

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Fallo interno del servidor al actualizar el perfil." });
    }
};

// 🚨 MODIFICACIÓN CLAVE: Lógica de Priorización de la Foto de Perfil
const getProfile = async (req, res) => {
    
    try {
        const uid = req.user.uid; 
        console.log(`[PERFIL] 1. UID recibido del token: ${uid}`);

        // 1. Obtener datos de Firebase Auth (para la URL de Google)
        const userRecord = await admin.auth().getUser(uid);
        const googlePhotoUrl = userRecord.photoURL || ''; 
        const cleanedGoogleUrl = cleanGooglePhotoUrl(googlePhotoUrl); // URL limpia de Google
        const roles = await UserModel.getUserRoles(uid);
        const rolId = roles.length > 0 ? roles[0] : 2;

        // 2. Buscar al usuario en la base de datos (DB)
        const userInDb = await UserModel.getUserByUid(uid); 

        if (!userInDb) {
            console.error(`[PERFIL] ❌ 2. ERROR: Usuario NO encontrado en la DB para UID: ${uid}`);
            return res.status(404).json({ error: "Perfil no encontrado. El usuario no existe en la base de datos." });
        }
        
        // 3. LÓGICA DE PRIORIDAD DE FOTO
        // Prioridad 1: Usar la foto de la DB (campo 'foto'), si existe.
        let finalPhotoUrl = userInDb.foto || ''; 

        // Prioridad 2: Si la DB está vacía, usar la URL limpia de Google como respaldo.
        if (!finalPhotoUrl) {
            finalPhotoUrl = cleanedGoogleUrl;
        }

        // 4. Limpiar campos sensibles antes de devolver (si aplica)
        if (userInDb.activo !== undefined) {
            delete userInDb.activo;
        }

        // 5. Devolver el perfil con la URL de foto priorizada
        const finalProfile = {
            ...userInDb,
            // Sobrescribimos el campo 'foto' de la DB con la URL priorizada
            foto: finalPhotoUrl, 
            rolId: rolId,
        };
        
        console.log("[PERFIL] ✅ 2. Usuario encontrado. Datos devueltos.");
        res.status(200).json(finalProfile);

    } catch (error) {
        console.error("❌ Error 500: Fallo al consultar la base de datos para el perfil:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener el perfil." });
    }
  }

  const toggleUserStatusController = async (req, res) => {
    // El UID del usuario a modificar viene de los parámetros de la URL
    const { id: uid } = req.params; 
    // El nuevo estado (0 o 1) viene del cuerpo de la solicitud
    const { estado,period } = req.body; 

    // 1. Validación de entrada
    // Usamos Number.isInteger ya que el estado se espera como 0 o 1
    if (estado === undefined || !Number.isInteger(estado) || (estado !== 0 && estado !== 1)) {
        return res.status(400).json({ error: "El estado proporcionado no es válido (debe ser 0 o 1)." });
    }
    let fechaReactivacion = null;

    if (estado === 0) {
        if (!period || period === 'INDEFINITE') {
            fechaReactivacion = null; // Inactivación permanente/indeterminada
        } else {
            // Usa una librería como `dayjs` o `moment` si la tienes, o Date nativo
            const now = new Date();
            
            if (period === '3_DAYS') {
                now.setDate(now.getDate() + 3);
            } else if (period === '7_DAYS') {
                now.setDate(now.getDate() + 7);
            }
            
            // Convertir la fecha al formato que acepta MySQL/MariaDB (YYYY-MM-DD HH:MM:SS)
            // Se asume que el driver de la DB manejará la conversión de zona horaria o UTC
            // Usamos ISO y cortamos para ser seguros.
            fechaReactivacion = now.toISOString().slice(0, 19).replace('T', ' '); 
        }
        
        console.log(`[INACTIVAR] Usuario ${uid} será inactivado hasta: ${fechaReactivacion || 'INDEFINITE'}`);
    }

    try {
        // 2. Llamar a la función del modelo
        const success = await UserModel.toggleUserStatus(uid, estado,fechaReactivacion);
        
        if (success) {
            // 3. Obtener el usuario actualizado para devolverlo (opcional, pero buena práctica)
            const updatedUser = await UserModel.getUserByUid(uid);
            
            return res.status(200).json({ 
                message: `Estado de usuario actualizado a ${estado === 1 ? 'Activo' : 'Inactivo'}.`,
                user: updatedUser
            });
        } else {
            // 4. Si no se afectó ninguna fila, el UID no existe o el estado ya era el mismo
            return res.status(404).json({ error: "Usuario no encontrado o ya tenía el estado solicitado." });
        }
    } catch (error) {
        console.error("Error al cambiar el estado del usuario:", error);
        res.status(500).json({ error: "Fallo interno del servidor al actualizar el estado." });
    }
};

module.exports = { getUsers, registerUser, getUserById, updateUser, getProfile, loginUser, toggleUserStatusController };