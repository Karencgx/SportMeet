const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Evento {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  hora: string;
  hora_final: string;
  capacidad_evento: number;
  id_instalacion: number;
  id_deporte: number;
  id_organizador: number;
  nombre_deporte: string;
  nombre_instalacion: string;
  nombre_organizador: string;
  nombre_estado: string;
  participantes?: number; // cantidad de participantes
  participanteslist?: Usuario[];
  espacios_disponibles: number;
}

export interface CrearEventoDTO {
  id_instalacion: number;
  id_deporte: number;
  id_organizador: string;  // ✅ aquí sí es string porque es el UID
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  hora_final: string;
  max_participantes: number;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export const eventosService = {
  async obtenerTodos(): Promise<Evento[]> {
    try {
      console.log("👉 Fetching:", `${API_BASE_URL}/eventos`);
      const response = await fetch(`${API_BASE_URL}/eventos`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error al obtener eventos:", error);
      throw error;
    }
  },

  async unirseEvento(eventoId: number, usuarioId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}/unirse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuarioId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al unirse al evento");
      }

      return await response.json();
    } catch (error) {
      console.error("Error unirse al evento:", error);
      throw error;
    }
  },

  async obtenerPorId(id: number): Promise<Evento> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos/${id}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data: Evento = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener evento:", error);
      throw error;
    }
  },

  async obtenerPorOrganizadorUid(uid: string): Promise<Evento[]> {
    try {
      console.log("🔹 Llamando al endpoint:", `${API_BASE_URL}/eventos/organizador/${uid}`);
      const response = await fetch(`${API_BASE_URL}/eventos/organizador/${uid}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data: Evento[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener eventos por organizador:", error);
      throw error;
    }
  },

  async obtenerPorParticipanteId(id: string): Promise<Evento[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos/participante/${id}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data: Evento[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener eventos por participante:", error);
      throw error;
    }
  },

  async crear(evento: Omit<CrearEventoDTO, "id" | "participantes">): Promise<Evento> {
    try {
      console.log("POST a:", `${API_BASE_URL}/eventos`);
      const response = await fetch(`${API_BASE_URL}/eventos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evento),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error al crear evento:", error);
      throw error;
    }
  },

  async obtenerHorasDisponibles(fecha: string, id_instalacion: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/eventos/horas-disponibles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fecha, id_instalacion }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener horas disponibles:", error);
    throw error;
  }
 },

 async salirEvento(id_evento: number, id_usuario: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/eventos/salir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_evento, id_usuario }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al salir del evento:", error);
    throw error;
  }
},

async obtenerProbabilidadEvento(evento: {
    Id_instalacion: number;
    Id_deporte: number;
    Fecha: string;
    Hora: string;
  }): Promise<number | null> {
    try {
      console.log("👉 Calculando probabilidad:", `${API_BASE_URL}/eventos/probabilidad`);

      const response = await fetch(`${API_BASE_URL}/eventos/probabilidad`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(evento)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.probabilidad_final ?? null;

    } catch (error) {
      console.error("Error al obtener la probabilidad del evento:", error);
      return null;
    }
  },

async cancelarEvento(id_evento: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/eventos/${id_evento}/cancelar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al cancelar el evento:", error);
    throw error;
  }
}

};
