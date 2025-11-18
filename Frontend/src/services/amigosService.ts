// 📁 src/services/amigosService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL;

// La interfaz debe coincidir con lo que devuelve el backend Y con lo que usa el frontend.
// Si el frontend usa la UID de Firebase (string) para la comparación, estos campos DEBEN ser string.
export interface Amistad {
  id: number;
  // 🚨 CORRECCIÓN CRÍTICA: Cambiar a 'string' si el backend devuelve la UID de Firebase
  // y si el frontend usa la UID para el filtro de solicitudes.
  usuarioId: number; 
  amigoId: number;
  
  Id_estado: number; 
  estado: 'aceptada' | 'pendiente' | 'rechazada' | string;
   usuario?: {
    id: number; // Asumimos que los datos del usuario dentro de la relación usan ID numérica
    nombre: string;
    email: string;
    avatar?: string;
  };
  amigo?: {
    id: number;
    nombre: string;
    email: string;
    avatar?: string;
  };
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('idToken');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`; 
    }
    return headers;
};

const estadoMap  = {
    'aceptada': 8, // ID numérica de 'aceptada'
    'rechazada': 9,  // ID numérica de 'rechazada'
    // 'pendiente': 7 // La solicitud ya está pendiente, no la actualizaremos a este estado
};
 
const mapEstadoToId = (estado: 'aceptada' | 'rechazada'): number => {
    switch (estado) {
        case 'aceptada':
            return 8; 
        case 'rechazada':
            return 9; 
        default:
            // TS asegura que esto no ocurra, pero es un buen fallback
            throw new Error(`Estado de amistad no válido: ${estado}`);
    }
};

export const amigosService = {
    // 🚨 CORRECCIÓN: Usar 'string' en minúscula
    async obtenerTodos(userId: string): Promise<Amistad[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/amigos/${userId}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                // 🚨 CORRECCIÓN: Intentar obtener el mensaje de error del cuerpo de la respuesta
                const errorData = await response.json().catch(() => ({})); 
                throw new Error(errorData.error || `Error ${response.status}: Fallo al cargar amistades`);
            }

            const data: any[] = await response.json(); 
        
            return data.map(item => ({
            ...item,
            // Aplicar el mapeo de ID a string
            estado: item.estado,
        })) as Amistad[];
        } catch (error) {
            console.error('Error al obtener amistades:', error);
            throw error;
        }
    },

async obtenerPorId(id: number): Promise<Amistad> {
        try {
            const response = await fetch(`${API_BASE_URL}/amigos/${id}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: Fallo al obtener amistad.`);
            }
            // 🚨 NOTA: Se asume que este endpoint devuelve una Amistad ya mapeada y válida.
            return await response.json();
        } catch (error) {
            console.error('Error al obtener amistad:', error);
            throw error;
        }
    },

async crear(amistad: { usuarioId: number; amigoId: number, id_estado: number }): Promise<Amistad> {
        try {
            // 🚨 CORRECCIÓN: Si el usuario logueado es la UID de Firebase (string), 
            // este tipo debe reflejarse aquí.
            const response = await fetch(`${API_BASE_URL}/amigos`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(amistad),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: Fallo al crear solicitud de amistad.`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al crear solicitud de amistad:', error);
            throw error;
        }
    },


async actualizarEstado(
    id: number, 
    estado: 'aceptada' | 'rechazada',
    internalDbId: number // 👈 ¡Nuevo parámetro!
    ): Promise<Amistad> {
    try {
      const id_estado = mapEstadoToId(estado);
      
      // 🚨 CORRECCIÓN CLAVE: Enviar el ID del usuario aceptante al backend
      const bodyData: any = { 
        Id_estado: id_estado 
      };

      // SOLO si estamos aceptando, necesitamos enviar el ID del aceptante
      if (estado === 'aceptada') {
        // La propiedad 'usuarioAceptaId' es la que espera el backend
        bodyData.usuarioAceptaId = internalDbId; 
      }
      
      const response = await fetch(`${API_BASE_URL}/amigos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(bodyData), // 👈 ¡Ahora envía el ID del aceptante si es 'aceptada'!
      });
      // ... (resto de la lógica) ...
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: Fallo al actualizar estado de amistad.`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar estado de amistad:', error);
      throw error;
    }
  },

  async eliminarAmigo(id: number): Promise<{ message: string }> { // <--- ¡AÑADIR ESTE MÉTODO!
        try {
            // Usamos la ruta DELETE /api/amigos/:id
            const response = await fetch(`${API_BASE_URL}/amigos/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: Fallo al eliminar amistad.`);
            }

            // El backend devuelve un mensaje de éxito
            return await response.json(); 
        } catch (error) {
            console.error('Error al eliminar amistad:', error);
            throw error;
        }
    }, // <--- ¡Asegúrate de la coma aquí!
};