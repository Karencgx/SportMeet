// 📁 src/services/calificacionesService.ts

import { Participante } from '@/components/RatingModal'; // Asegúrate que el path sea correcto
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Función helper para obtener el token de auth y fallar si no existe.
 */
function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("idToken");
    if (!token) {
        throw new Error("Se requiere autenticación. Por favor, inicia sesión.");
    }
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

export interface CalificacionPromedio {
    promedio: number; // El valor del promedio (ej: 4.5)
    total: number;    // El número total de calificaciones
}

export const calificacionesService = {

    /**
     * Obtiene la lista de participantes de un evento que aún no han sido calificados
     * por el usuario actual.
     * @param idEvento ID del evento a calificar.
     * @returns Una promesa que resuelve a un array de usuarios (participantes).
     */
    async obtenerParticipantesParaCalificar(idEvento: number): Promise<Participante[]> {
        try {
            const headers = getAuthHeaders(); // Incluye el token
            
            const response = await fetch(`${API_BASE_URL}/calificaciones/evento/${idEvento}/participantes`, {
                method: "GET",
                headers,
            });

            if (response.status === 401) {
                throw new Error("No autorizado. Token inválido o expirado.");
            }
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `Error ${response.status}: Fallo al cargar participantes.`);
            }
            
            return await response.json(); 
        } catch (error) {
            console.error("Error al obtener participantes para calificar:", error);
            throw error;
        }
    },

    /**
     * Envía la calificación de un participante.
     * @param idEvento ID del evento.
     * @param idCalificador ID interno del usuario que califica (tú).
     * @param idCalificado ID interno del usuario calificado.
     * @param calificacion Valor de la calificación (ej: 1 a 5).
     */
    async enviarCalificacion(
        idEvento: number, 
        idCalificado: number, 
        calificacion: number,
        comentario: string | undefined
    ): Promise<void> {
        try {
            const headers = getAuthHeaders();
            
            const response = await fetch(`${API_BASE_URL}/calificaciones/enviar`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    id_evento: idEvento,
                    id_calificado: idCalificado,
                    puntaje: calificacion,
                    comentario:comentario,
                }),
            });

            if (response.status === 401) {
                throw new Error("No autorizado. Token inválido o expirado.");
            }
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `Error ${response.status}: Fallo al enviar calificación.`);
            }
            
            // Si la respuesta es 200/201, no se necesita devolver nada
            return; 
        } catch (error) {
            console.error("Error al enviar calificación:", error);
            throw error;
        }
    },

    async getCalificacionPromedio(idUsuario: number): Promise<CalificacionPromedio> {
        try {
            const headers = getAuthHeaders();
            
            const response = await fetch(`${API_BASE_URL}/calificaciones/usuarios/${idUsuario}/promedio`, {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `Error ${response.status}: Fallo al cargar el promedio.`);
            }
            
            // Retorna y tipa la respuesta
            return (await response.json()) as CalificacionPromedio; 

        } catch (error) {
            console.error("Error al obtener promedio de calificación:", error);
            throw error;
        }
    },
};