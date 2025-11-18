// 📁 src/models/UserModel.js
const dbModule = require("../config/db");
const sql = dbModule.default;
const { toLowercaseKeys } = require("../utils/formatData");
sql.join = require('postgres').join;
sql.array = require('postgres').array;

// Obtener todos los usuarios
const getAllUsers = async () => {
    try {
        const rows = await sql`SELECT *, "Foto" AS "Avatar" FROM usuarios`; 
        return toLowercaseKeys(rows);
        
    } catch (error) {
        console.error("Error en UserModel.getAllUsers:", error);
        throw error;
    }
};

const assignRoleToUser = async (idUsuarioInterno, rolId) => {
    const roleQuery = sql`
INSERT INTO usuarios_x_rol ("Id_usuario", "Id_rol") 
VALUES (${Number(idUsuarioInterno)}, ${Number(rolId)})
`; 
    try {
        await roleQuery; 
    } catch (error) {
        console.error(`❌ ERROR al asignar rol ${rolId} al usuario ID ${idUsuarioInterno}:`, error);
        throw error;
    }
};

// Crear usuario
const registerNewUser = async (userData) => {
    const { uid, displayName, email, phone, foto } = userData;
    // CORRECCIÓN 1: Usar comillas dobles en el INSERT INTO y RETURNING.
    const query = sql`
INSERT INTO usuarios ("Uid", "Nombre", "Email", "Telefono", "Activo", "Foto", "Proveedor") 
VALUES (${uid}, ${displayName}, ${email}, ${phone}, 1, ${foto}, 'Google')
RETURNING "Id"
`;
    const DEFAULT_USER_ROLE_ID = 2;
    try {
        const results = await query;
        // Asumimos que toLowercaseKeys ya se encarga de convertir el resultado ("Id") a 'id'.
        
        const idUsuarioInterno = results[0].Id; 
        
        await assignRoleToUser(idUsuarioInterno, DEFAULT_USER_ROLE_ID);  

        const newUserObject = await getUserByUid(uid);

        return {
            // Aseguramos que el ID numérico sea accesible como 'id' (minúscula)
            id: idUsuarioInterno, 
            // Añadimos el Rol para que el frontend lo capture de forma inmediata
            userRoleId: DEFAULT_USER_ROLE_ID, 
            // Añadimos el resto de las propiedades que trae getUserByUid
            ...newUserObject 
        };
        
    } catch (error) {
        console.error("❌ ERROR CRÍTICO al insertar nuevo usuario:", error);
        throw error; 
    }
};

// Obtener usuario por UID
const getUserByUid = async (uid) => {
    try {
        // CORRECCIÓN 2: Usar "Uid" en WHERE.
        console.log("📍 UID recibido en getUserByUid:", uid);
        const query = sql`SELECT * FROM usuarios WHERE "Uid" = ${String(uid)}`;
        const rows = await query;

        if (!rows || rows.length === 0) {
            return null;
        }
        
        return toLowercaseKeys(rows[0]); 
    } catch (error) {
        console.error("Error en UserModel.getUserByUid:", error);
        throw error;
    }
};

const updateUserByUid = async (uid, data) => {
    // 1. Mapeo de camelCase (Frontend) a snake_case/mayúscula (DB)
    const dbData = {};
    // Las claves del objeto deben coincidir con la convención de la DB (Nombre, Telefono, Foto)
    if (data.nombre !== undefined) dbData.Nombre = data.nombre; // Cambiado a "Nombre"
    if (data.telefono !== undefined) dbData.Telefono = data.telefono; // Cambiado a "Telefono"
    if (data.foto !== undefined) dbData.Foto = data.foto; // 'avatar' mapea a 'Foto'

    if (Object.keys(dbData).length === 0) {
        return true; 
    }
    
    // 2. Construir la consulta UPDATE dinámicamente
    // Usamos sql(key) para interpolar el nombre de la columna de forma segura (con su mayúscula/minúscula)
    // El driver postgres debería manejar el quoting de las keys, pero las nombramos con mayúscula en dbData para seguridad.
    const updates = Object.keys(dbData).map(key => sql`${sql(key)} = ${dbData[key]}`);
    
    const updateClauses = updates.reduce((prev, current, index) => {
        if (index === 0) return current;
        // Usamos una coma (`, `) entre cada cláusula SET
        return sql`${prev}, ${current}`; 
    });

    const query = sql`
        UPDATE usuarios 
        SET ${updateClauses} 
        WHERE "Uid" = ${uid}
    `;
    
    try {
        const result = await query;
        return result.count > 0; 
    } catch (error) {
        console.error("Error en updateUserByUid:", error);
        throw error;
    }
};

const getUserRoles = async (uid) => {
  try {
    console.log("📍 UID original:", uid);
    console.log("📍 UID JSON.stringify:", JSON.stringify(uid));

    const cleanUid = String(uid).trim();
    console.log("📍 UID limpio:", cleanUid);
    console.log("📍 UID limpio JSON:", JSON.stringify(cleanUid));

    // 🔹 Test de conexión básica
    const test = await sql`SELECT 1 + 1 AS test`;
    console.log("✅ Test SQL OK:", test[0].test);

    // 🔹 Prueba 1: consulta directa sin WHERE
    const usuariosPrueba = await sql`SELECT "Id", "Uid" FROM usuarios LIMIT 3`;
    console.log("👀 Usuarios existentes:", usuariosPrueba);

    // 🔹 Prueba 2: consulta controlada
    const idQuery = sql`
      SELECT "Id"
      FROM usuarios
      WHERE "Uid" = ${cleanUid}
    `;
    const userRows = await idQuery;
    console.log("🧠 Resultado userRows:", userRows);

    if (!userRows || userRows.length === 0) return [];

    const idUsuarioInterno = userRows[0].Id;
    console.log("🧩 idUsuarioInterno:", idUsuarioInterno);

    const rolesQuery = sql`
      SELECT "Id_rol"
      FROM usuarios_x_rol
      WHERE "Id_usuario" = ${idUsuarioInterno}
    `;
    const roles = await rolesQuery;
    console.log("🎭 Roles obtenidos:", roles);

    return roles.map(r => r.Id_rol);
  } catch (error) {
    console.error("❌ Error en getUserRoles:", error);
    throw error;
  }
};

const toggleUserStatus = async (uid, nuevoEstado, fechaReactivacion) => {
    const finalFechaReactivacion = nuevoEstado === 1 ? null : fechaReactivacion;
    // CORRECCIÓN 5: Usar "Activo" y "Fecha_reactivacion" (asumiendo esa convención) y "Uid" en WHERE.
    const query = sql`
UPDATE usuarios 
SET "Activo" = ${nuevoEstado}, "Fecha_reactivacion" = ${finalFechaReactivacion} 
WHERE "Uid" = ${uid}
RETURNING "Id"
`;
    try {
        const result = await query;        
        return result.count > 0;
    } catch (error) {
        console.error("❌ Error en UserModel.toggleUserStatus:", error);
        throw error;
    }
};

const getInternalIdByUid = async (uid) => {
    try {
        // CORRECCIÓN 6: Usar "Id" en SELECT y "Uid" en WHERE.
        const rows = await sql`SELECT "Id" FROM usuarios WHERE "Uid" = ${uid}`;
        return rows.length > 0 ? rows[0].Id : null;
    } catch (error) {
        console.error("Error en getInternalIdByUid:", error);
        throw error;
    }
};

const getUserById = async (id) => {
    try {
        // CORRECCIÓN 7: Usar "Id" en WHERE.
        const query = sql`SELECT * FROM usuarios WHERE "Id" = ${id}`;
        const rows = await query;

        if (!rows || rows.length === 0) {
            return null;
        }
        
        return toLowercaseKeys(rows[0]); 
    } catch (error) {
        console.error("Error en UserModel.getUserById:", error);
        throw error;
    }
};

module.exports = { 
    getAllUsers, 
    assignRoleToUser, 
    registerNewUser, 
    getUserByUid, 
    updateUserByUid, 
    getUserRoles, 
    toggleUserStatus,
    getInternalIdByUid, 
    getUserById 
};