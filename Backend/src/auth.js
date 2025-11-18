// src/auth.js
const UserModel = require('./models/UserModel');

const admin = require('firebase-admin');

// Middleware para verificar el token de Firebase
const verifyToken = async (req, res, next) => {
    // Asegúrate de que este console.log se esté ejecutando al inicio
     console.log("🚀 INICIO: Middleware verifyToken."); 

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No se encontró un token de autenticación.' });
    }


    try {
        // 🚨 SOLUCIÓN: Hacemos la extracción del token de forma segura
        
        // 1. Limpiar espacios alrededor y convertir a minúsculas para una comprobación segura
        const parts = authHeader.trim().split(' ');
        
        // 2. Verificar que el formato sea "Bearer [token]"
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
             console.error('❌ ERROR 401: Formato de token inválido.');
             return res.status(401).json({ error: 'Formato de token de autenticación inválido. Use Bearer [token].' });
        }

        // 3. Extraer el token
        const idToken = parts[1];
        
        // Si el token llega hasta aquí, ahora lo podemos verificar
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        console.log(`✅ ÉXITO: Token verificado. UID: ${decodedToken.uid}`); 

        const internalId = await UserModel.getInternalIdByUid(uid);

        if (!internalId) {
            console.error(`❌ ERROR 401: Usuario con UID ${uid} no encontrado en la DB interna.`);
            return res.status(401).json({ error: 'Usuario no registrado internamente.' });
        }
        
        req.user = decodedToken;
        req.internalUserId = internalId;
        
        next(); 
    } catch (error) {
        // ❌ Este error ahora solo se activará si el token es INVÁLIDO o EXPIRADO
        console.error('❌ ERROR FATAL DE FIREBASE (Token no válido/expirado):', error.message);
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

const requireAdmin = async (req, res, next) => {
    // Si llegamos aquí, verifyToken ya se ejecutó y req.user existe.
    if (!req.user || !req.user.uid) {
        return res.status(500).json({ error: "Error interno: UID no encontrado en la solicitud." });
    }
    
    const uid = req.user.uid;
    const ADMIN_ROLE_ID = 1; // ID del rol Administrador
    
    console.log(`🔒 INICIO: Middleware requireAdmin para UID: ${uid}`);
    
    try {
        // 1. Obtener los roles del usuario desde la base de datos
        // 🚨 IMPORTANTE: Asume que UserModel tiene una función getUserRoles(uid) 
        // que devuelve un array de IDs de rol.
        const roles = await UserModel.getUserRoles(uid); 

        // 2. Verificar si el usuario tiene el rol de Admin (ID 1)
        const isAdmin = roles.some(roleId => roleId === ADMIN_ROLE_ID);

        if (!isAdmin) {
            console.warn(`❌ ACCESO DENEGADO: Usuario ${uid} no es Administrador.`);
            return res.status(403).json({ error: "Acceso denegado. Se requiere rol de Administrador." });
        }

        console.log(`✅ AUTORIZADO: Usuario ${uid} es Administrador.`);
        next(); // Permitir el acceso
        
    } catch (error) {
        console.error("❌ ERROR FATAL en requireAdmin:", error);
        return res.status(500).json({ error: "Fallo en la verificación de autorización." });
    }
};

module.exports = { 
    verifyToken,
    requireAdmin 
};