// 📁 src/models/deporteModel.js
const sql = require("../config/db").default;
const { toLowercaseKeys } = require("../utils/formatData");


// Obtener todos los deportes
const getAllDeportes = async () => {
    try {
        const rows = await sql`
            SELECT * FROM deportes
        `;
        return toLowercaseKeys(rows);
    } catch (error) {
        console.error("❌ Error en getAllDeportes:", error.message);
        throw error;
    }
};

// Obtener deporte por ID
const getDeporteById = async (id) => {
    const rows = await sql`
        SELECT * FROM deportes 
        WHERE "Id" = ${Number(id)}
    `;
    return rows[0];
};

// Crear un deporte
const createDeporte = async (data) => {
    const { nombre } = data;
    const result = await sql`
        INSERT INTO deportes ("Nombre") 
        VALUES (${nombre})
        RETURNING "Id"
    `;
    const insertedId = result[0].Id;
    return { id: insertedId, nombre };
};

// Actualizar un deporte
const updateDeporte = async (id, data) => {
    const { nombre } = data;
    await sql`
        UPDATE deportes 
        SET "Nombre" = ${nombre} 
        WHERE "Id" = ${id}
    `;
    return { id, Nombre: nombre }; // Corregí para devolver 'Nombre' actualizado
};

// Eliminar un deporte
const deleteDeporte = async (id) => {
    const result = await sql`
        DELETE FROM deportes 
        WHERE "Id" = ${id}
        RETURNING "Id"
    `;
    if (result.length > 0) {
        return { message: "Deporte eliminado" };
    } else {
        return { message: "Deporte no encontrado o no eliminado" };
    }
};

module.exports = {
    getAllDeportes,
    getDeporteById,
    createDeporte,
    updateDeporte,
    deleteDeporte,
};