// 📁 src/models/rolModel.js
const sql = require("../config/db").default;

// Obtener todos los roles
const getAllRoles = async () => {
    const rows = await sql`
        SELECT * FROM roles
    `;
    return rows;
};

// Obtener rol por ID
const getRoleById = async (id) => {
    const rows = await sql`
        SELECT * FROM roles 
        WHERE "Id" = ${id}
    `;
    return rows[0];
};

// Crear rol
const createRole = async (data) => {
    const { Nombre } = data;
    const result = await sql`
        INSERT INTO roles ("Nombre") 
        VALUES (${Nombre})
        RETURNING "Id"
    `;
    const insertedId = result[0].Id;
    return { Id: insertedId, Nombre };
};


module.exports = {
    getAllRoles,
    getRoleById,
    createRole
};