const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Instalacion {
  id: number;
  nombre: string;
  ubicacion: string;
  capacidad_base: number;
  deportesDisponibles: string[];
  horarioApertura?: string;
  horarioCierre?: string;
  precioHora?: number;
  disponible: boolean;
  contacto?: string;
  imagenes?: string[];
}

export const instalacionesService = {
  async getAll(): Promise<Instalacion[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/instalaciones`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener instalaciones:', error);
      throw error;
    }
  },

  async getBySport(sportId: number): Promise<Instalacion[]> {
    const res = await fetch(`${API_BASE_URL}/instalaciones/deporte/${sportId}`);
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return await res.json();
  },
};