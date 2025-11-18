import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, AlertCircle } from 'lucide-react';
import DetalleEvento from '@/components/Eventos/DetalleEvento';
import { eventosService, Evento } from '@/services/eventosService';

export default function Eventos() {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        const data = await eventosService.obtenerTodos();
        setEventos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar eventos');
      } finally {
        setLoading(false);
      }
    };
    cargarEventos();
  }, []);

  const formatFecha = (isoString) => {
  const [y, m, d] = isoString.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};

  const eventosFiltrados = eventos.filter(evento =>
    evento.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    evento.nombre_deporte.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (eventoSeleccionado) {
    return (
      <div>
        <div className="p-4 border-b">
          <Button variant="outline" onClick={() => setEventoSeleccionado(null)}>
            ← Volver a la lista
          </Button>
        </div>
        <DetalleEvento eventoId={eventoSeleccionado} />
      </div>
    );
  }

  if (loading) return <p className="p-6">Cargando eventos...</p>;
  if (error)
    return (
      <div className="p-6 flex items-center space-x-2 text-red-500">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Eventos Deportivos</h1>
        </div>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o deporte..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de eventos */}
      <div className="grid gap-4">
        {eventosFiltrados.map((evento) => (
          <Card
            key={evento.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{evento.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{evento.nombre_deporte}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFecha(evento.fecha)} {evento.hora} - {evento.hora_final}
                  </p>
                </div>
                <Button onClick={() => setEventoSeleccionado(evento.id)}>
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {eventosFiltrados.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {busqueda
                ? 'No se encontraron eventos con esa búsqueda'
                : 'No hay eventos disponibles'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
