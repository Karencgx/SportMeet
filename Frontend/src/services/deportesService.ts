const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Deporte {
  id: number;
  nombre: string;
}

export const deportesService = {
  async getAll(): Promise<Deporte[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/deportes`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener deportes:', error);
      throw error;
    }
  },

  async crear(deporte: Omit<Deporte, 'id'>): Promise<Deporte> {
    try {
      const response = await fetch(`${API_BASE_URL}/deportes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deporte),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al crear deporte:', error);
      throw error;
    }
  },
};