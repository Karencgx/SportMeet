// 📁 src/models/analyticsModel.js
const sql = require("../config/db").default;
const { toLowercaseKeys } = require("../utils/formatData");

// 💡 NOTA: Las tablas y vistas con nombres como 'mat_exito_por_instalacion' 
// son sensibles a mayúsculas/minúsculas en PostgreSQL si fueron creadas con comillas.
// Asumo que 'Instalacion', 'Deporte', 'Franja_horaria', 'Dia_semana', 'Id_evento', 'Porcentaje_exito'
// están escritos exactamente como en las consultas originales (con mayúsculas).

const getExitoPorInstalacion = async (nombreInstalacion) => {
    const rows = await sql`
        SELECT * FROM mat_exito_por_instalacion 
        WHERE "Instalacion" = ${nombreInstalacion}
    `;
    return toLowercaseKeys(rows);
};

const getExitoPorDeporte = async (nombreDeporte) => {
    const rows = await sql`
        SELECT * FROM mat_exito_por_deporte 
        WHERE "Deporte" = ${nombreDeporte}
    `;
    return toLowercaseKeys(rows);
};

const getExitoPorHorario = async (franja) => {
    const rows = await sql`
        SELECT * FROM mat_exito_por_horario 
        WHERE "Franja_horaria" = ${franja}
    `;
    return toLowercaseKeys(rows);
};

const getExitoPorDia = async (dia) => {
    const rows = await sql`
        SELECT * FROM mat_exito_por_dia 
        WHERE "Dia_semana" = ${dia}
    `;
    return toLowercaseKeys(rows);
};

const getTasaAsistencia = async (idEvento) => {
    const rows = await sql`
        SELECT * FROM mat_tasa_asistencia 
        WHERE "Id_evento" = ${idEvento}
    `;
    return toLowercaseKeys(rows);
};

export const calcularProbabilidadExito = async (evento) => {
    const {
        nombreInstalacion,
        nombreDeporte,
        franjaHoraria,
        diaSemana,
    } = evento;

    // Consultas paralelas
    const [
        exitoInstalacionRows,
        exitoDeporteRows,
        exitoHorarioRows,
        exitoDiaRows,
    ] = await Promise.all([
        getExitoPorInstalacion(nombreInstalacion),
        getExitoPorDeporte(nombreDeporte),
        getExitoPorHorario(franjaHoraria),
        getExitoPorDia(diaSemana),
    ]);
    
    // Obtener el primer elemento de cada resultado (que es el array después de toLowercaseKeys)
    const exitoInstalacion = exitoInstalacionRows[0];
    const exitoDeporte = exitoDeporteRows[0];
    const exitoHorario = exitoHorarioRows[0];
    const exitoDia = exitoDiaRows[0];

    // Asumo que las claves en minúsculas son: porcentaje_exito, instalacion, etc.
    const pInstalacion = exitoInstalacion?.porcentaje_exito || 0;
    const pDeporte = exitoDeporte?.porcentaje_exito || 0;
    const pHorario = exitoHorario?.porcentaje_exito || 0;
    const pDia = exitoDia?.porcentaje_exito || 0;

    const probabilidad = (pInstalacion + pDeporte + pHorario + pDia) / 4;

    // ✅ Solo devuelves el número
    return Number(probabilidad.toFixed(2));
};

module.exports = {
    getExitoPorInstalacion,
    getExitoPorDeporte,
    getExitoPorHorario,
    getExitoPorDia,
    getTasaAsistencia,
    calcularProbabilidadExito,
};