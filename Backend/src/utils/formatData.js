// src/utils/formatData.js
const toLowercaseKeys = (data) => {
    // Función auxiliar estricta para transformar las claves de un único objeto
    const transformObject = (item) => {
        // Solo proceder si es estrictamente un objeto y no un array ni null
        if (typeof item !== 'object' || item === null || Array.isArray(item)) {
            return item; // Devuelve valores primitivos (strings, numbers) y arrays tal cual.
        }

        const newItem = {};
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                // El valor se asigna directamente sin ninguna transformación o recursividad,
                // manteniendo la fecha como string.
                newItem[key.toLowerCase()] = item[key];
            }
        }
        return newItem;
    };

    // Si es un Array, mapear y transformar cada objeto
    if (Array.isArray(data)) {
        // Mapea sobre el array aplicando la función transformObject a cada elemento.
        // Si el elemento del array no es un objeto, transformObject lo devolverá sin cambios.
        return data.map(transformObject);
    } 
    
    // Si es un Objeto (el evento individual) o cualquier otra cosa, transformar o devolver.
    return transformObject(data);
};

module.exports = { toLowercaseKeys };