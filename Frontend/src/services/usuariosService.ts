// 📁 usuariosService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- TIPOS ---
export type FriendshipStatus = 'NONE' | 'PENDING' | 'REQUESTED' | 'ACCEPTED';
export type InactivationPeriod = '3_DAYS' | '7_DAYS' | 'INDEFINITE';

export interface Usuario {
    uid: string;
    id: number;
    nombre: string;
    email: string;
    activo: 0 | 1;
    avatar?: string;
    creado_en?: string;
    friendshipStatus?: FriendshipStatus; 
}

interface ToggleStatusResponse {
    message: string;
    user: Usuario; 
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('idToken');
    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
        };
    }
    return {
        'Content-Type': 'application/json',
    };
};



async function cambiarEstado(
    uid: string, 
    nuevoEstado: 0 | 1, 
    period?: InactivationPeriod // 'period' es opcional
): Promise<ToggleStatusResponse> {
    try {
        const payload = {
            estado: nuevoEstado,
            ...(period && { period }) 
        };

        const response = await fetch(`${API_BASE_URL}/usuarios/${uid}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload), // <-- Usamos el payload correcto
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error ${response.status}: Fallo al cambiar el estado.`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error al cambiar el estado del usuario:', error);
        throw error;
    }
}


async function inactivarTemporalmente(
    uid: string, 
    period: InactivationPeriod
): Promise<ToggleStatusResponse> {
    // La inactivación temporal siempre establece activo = 0
    return cambiarEstado(uid, 0, period); 
}

export const usuariosService = {
    async obtenerTodos(internalDbId?: number | null): Promise<Usuario[]> { 
        let url = `${API_BASE_URL}/usuarios`;
        if (internalDbId) {
            url += `?currentUserId=${internalDbId}`;
        }
        const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
        if (!response.ok) {
            throw new Error(`Error ${response.status}: Unauthorized or Forbidden`); 
        }
        return await response.json();
    },

    async obtenerPorId(id: number): Promise<Usuario> {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, { method: 'GET', headers: getAuthHeaders() });
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    },

    async crear(usuario: Omit<Usuario, 'id'>): Promise<Usuario> {
        const response = await fetch(`${API_BASE_URL}/usuarios/register`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(usuario) });
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    },

    async actualizar(id: number, datos: Partial<Usuario>): Promise<Usuario> {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(datos) });
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    },
    
    async toggleStatus(uid: string, nuevoEstado: 0 | 1): Promise<ToggleStatusResponse> {
        return cambiarEstado(uid, nuevoEstado);
    },

    inactivarTemporalmente,
    
    cambiarEstado,
};