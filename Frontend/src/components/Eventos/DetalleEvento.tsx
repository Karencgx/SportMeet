import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User,
  AlertCircle,
  Trophy
} from 'lucide-react';
import { eventosService, Evento } from '@/services/eventosService';
import { useToast } from '@/hooks/use-toast';

interface DetalleEventoProps {
  eventoId: number;
}

function obtenerUserIdDesdeToken(token: string): string | null {
  if (!token || token.split(".").length < 2) {
    console.error("⚠️ Token inválido o incompleto:", token);
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("🔍 Payload del token:", payload);
    return payload.user_id || payload.sub || payload.uid || null;
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
}

export default function DetalleEvento({ eventoId }: DetalleEventoProps) {
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uniendose, setUniendose] = useState(false);
  const { toast } = useToast();
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
      const token = localStorage.getItem("idToken");
      if (token) {
        const userId = obtenerUserIdDesdeToken(token);
        console.log("🧩 UID decodificado:", userId);
        setUid(userId);
      }
    }, []);

  useEffect(() => {
    cargarEvento();
  }, [eventoId]);

  const cargarEvento = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventosService.obtenerPorId(eventoId);
      console.log("📦 Evento recibido desde la API:", data);
      setEvento(data);
    } catch (err) {
      console.error("Error al cargar evento:", error);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar evento';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnirseEvento = async () => {
  if (!evento) return;

  try {
    setUniendose(true);

    const usuarioId = uid;  

    await eventosService.unirseEvento(evento.id, usuarioId);

    toast({
      title: "¡Te has unido al evento!",
      description: `Ahora eres participante de "${evento.nombre}"`,
    });

    // ✅ Recargar el evento desde el backend
    await cargarEvento();

  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "No se pudo unir al evento",
      variant: "destructive",
    });
  } finally {
    setUniendose(false);
  }
  };

  const getSportColor = (sport: string) => {
    const colors: { [key: string]: string } = {
      'Fútbol': 'bg-green-100 text-green-800',
      'Baloncesto': 'bg-orange-100 text-orange-800',
      'Tenis': 'bg-yellow-100 text-yellow-800',
      'Natación': 'bg-blue-100 text-blue-800',
      'Voleibol': 'bg-purple-100 text-purple-800',
    };
    return colors[sport] || 'bg-gray-100 text-gray-800';
  };
  const formatFecha = (isoString) => {
  const [y, m, d] = isoString.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="flex items-center space-x-2 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-destructive font-medium">Error al cargar evento</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={cargarEvento} className="mt-2" size="sm">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventoLleno = evento.espacios_disponibles <= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header del evento */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{evento.nombre}</CardTitle>
              <Badge className={getSportColor(evento.nombre_deporte)}>
                <Trophy className="h-3 w-3 mr-1" />
                {evento.nombre_deporte}
              </Badge>
            </div>
            <Button onClick={handleUnirseEvento}
             disabled={eventoLleno || uniendose} 
             size="lg" 
             > 
             {uniendose ? 'Uniéndose...' : eventoLleno ? 'Evento Lleno' : 'Unirse al Evento'} 
             </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{evento.descripcion}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatFecha(evento.fecha)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{evento.hora}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{evento.nombre_instalacion}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {evento.participantes}/{evento.capacidad_evento} participantes
              </span>
            </div>
          </div>

          {evento.nombre_organizador && (
            <div className="flex items-center space-x-2 pt-2 border-t">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Organizador: {evento.nombre_organizador}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participantes */}
      <Card>
        <CardHeader>
          <CardTitle>Participantes ({evento.participantes})</CardTitle>
        </CardHeader>
        <CardContent>
          {evento.participanteslist && evento.participanteslist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {evento.participanteslist.map((participante) => (
                <div key={participante.id} className="flex items-center space-x-3 p-2 border rounded">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {participante.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{participante.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">{participante.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Aún no hay participantes registrados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Espacios disponibles */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Espacios disponibles</p>
              <p className="text-sm text-muted-foreground">
                {evento.espacios_disponibles > 0 
                  ? `Quedan ${evento.espacios_disponibles} espacios` 
                  : 'Evento completo'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{evento.espacios_disponibles}</p>
              <p className="text-sm text-muted-foreground">de {evento.capacidad_evento}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}