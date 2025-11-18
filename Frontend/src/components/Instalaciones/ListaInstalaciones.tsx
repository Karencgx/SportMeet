// src/components/Instalaciones/ListaInstalaciones.tsx

import { useState, useEffect } from "react";
import { instalacionesService, type Instalacion } from "@/services/instalacionesService";

export default function ListaInstalaciones() {
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstalaciones = async () => {
      try {
        const data = await instalacionesService.getAll();
        setInstalaciones(data);
      } catch (err) {
        console.error("Error al obtener las instalaciones:", err);
        setError("Error al cargar las instalaciones.");
      } finally {
        setLoading(false);
      }
    };
    fetchInstalaciones();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Cargando instalaciones...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (instalaciones.length === 0) {
    return <div className="p-6 text-center text-gray-500">No hay instalaciones para mostrar.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {instalaciones.map((instalacion) => (
        <div key={instalacion.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all">
          <h3 className="font-semibold text-lg">{instalacion.nombre}</h3>
          <p className="text-sm text-gray-500">{instalacion.ubicacion}</p>
        </div>
      ))}
    </div>
  );
}