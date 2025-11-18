// 📁 src/models/installationModel.js
const sql = require("../config/db").default;
const { toLowercaseKeys } = require("../utils/formatData");


// Obtener todas las instalaciones
const getAllInstallations = async () => {
    try {
        const rows = await sql`
            SELECT * FROM instalacion_deportiva
        `;
        return toLowercaseKeys(rows);
    } catch (error) {
        throw error;
    }
};

// Obtener instalación por ID
const getInstallationById = async (id) => {
    const rows = await sql`
        SELECT * FROM instalacion_deportiva 
        WHERE "Id" = ${id}
    `;
    return rows[0];
};

const getInstallationsBySport = async (sportId) => {
    const rows = await sql`
        SELECT 
            i.*,
            dxi."Capacidad_base"
        FROM instalacion_deportiva i
        JOIN deportes_x_instalacion dxi ON i."Id" = dxi."Id_instalacion"
        WHERE dxi."Id_deporte" = ${sportId}
    `;
    return toLowercaseKeys(rows);
};

// Crear instalación
const createInstallation = async ({nombre, ubicacion}) => {
    const result = await sql`
        INSERT INTO instalacion_deportiva ("Nombre", "Ubicacion") 
        VALUES (${nombre}, ${ubicacion})
        RETURNING "Id"
    `;
    const insertedId = result[0].id;
    return { id: insertedId, nombre, ubicacion};
};

// Actualizar instalación
const updateInstallation = async (id, { nombre, ubicacion}) => {
    await sql`
        UPDATE instalacion_deportiva 
        SET "Nombre" = ${nombre}, 
            "Ubicacion" = ${ubicacion}, 
        WHERE "Id" = ${id}
    `;
    return { id, nombre, ubicacion};
};

// Eliminar instalación
const deleteInstallation = async (id) => {
    // 💡 CAMBIO: Usamos RETURNING para verificar si se eliminó
    const result = await sql`
        DELETE FROM instalacion_deportiva 
        WHERE "Id" = ${id}
        RETURNING "Id"
    `;
    if (result.length > 0) {
        return { message: "Instalación eliminada correctamente" };
    } else {
        return { message: "Instalación no encontrada o no eliminada" };
    }
};

module.exports = {
    getAllInstallations,
    getInstallationById,
    getInstallationsBySport,
    createInstallation,
    updateInstallation,
    deleteInstallation,
};