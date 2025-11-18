// 📁 src/models/estadoModel.js
const sql = require("../config/db").default;

// Obtener todos los estados
const getAllEstados = async () => {
    // Asumiendo que 'estados' y sus columnas son todas minúsculas (o snake_case) 
    // y no requieren comillas, a excepción de las que usen mayúsculas.
    const rows = await sql`
        SELECT * FROM estados
    `;
    return rows;
};

// Obtener estado por ID
const getEstadoById = async (id) => {
    const rows = await sql`
        SELECT * FROM estados 
        WHERE "Id_estado" = ${id}
    `;
    return rows[0];
};

// Crear estado
const createEstado = async (data) => {
    const { entidad, nombre_estado } = data;
    // Usamos RETURNING para obtener el id_estado generado
    const result = await sql`
        INSERT INTO estados ("Entidad", "Nombre_estado") 
        VALUES (${entidad}, ${nombre_estado})
        RETURNING "Id_estado"
    `;
    const insertedId = result[0].id_estado;
    return { id_estado: insertedId, entidad, nombre_estado };
};


// Eliminar estado
const deleteEstado = async (id) => {
    await sql`
        DELETE FROM estados 
        WHERE "Id_estado" = ${id}
    `;
    return { message: "Estado eliminado" };
};

module.exports = { getAllEstados, getEstadoById, createEstado, deleteEstado };