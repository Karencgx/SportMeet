import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { eventosService, Evento } from '@/services/eventosService';
import { useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import RatingModal from '@/components/RatingModal';

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

const Dashboard = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [myEvents, setMyEvents] = useState<Evento[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [eventToCancelId, setEventToCancelId] = useState<number | null>(null);
  const [eventToRate, setEventToRate] = useState<Evento | null>(null); // 🚨 NUEVO ESTADO
  const [showResultMessage, setShowResultMessage] = useState<{ visible: boolean, title: string, description: string }>({ 
      visible: false, 
      title: '', 
      description: '' 
  });

  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("idToken");
    if (token) {
      const userId = obtenerUserIdDesdeToken(token);
      console.log("🧩 UID decodificado:", userId);
      setUid(userId);
    }
  }, []);

  useEffect(() => {
    if (!uid) return;

    const fetchMyEvents = async () => {
      try {
        const eventos = await eventosService.obtenerPorOrganizadorUid(uid);
        console.log("📦 Eventos como organizador:", eventos);
        setMyEvents(eventos);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log("🚀 UID listo para consulta:", uid);
    fetchMyEvents();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const fetchJoinedEvents = async () => {
        try {
          const eventos = await eventosService.obtenerPorParticipanteId(uid);
          console.log("📦 Eventos como participante:", eventos);
          setJoinedEvents(eventos);
        } catch (error) {
          console.error("Error al cargar eventos en los que participo:", error);
        } finally {
          setLoading(false);
        }
      };

    fetchJoinedEvents();
  }, [uid]);

  const getSportColor = (sport: string) => {
    const colors: { [key: string]: string } = {
      "Fútbol": "bg-primary text-primary-foreground",
      "Baloncesto": "bg-orange-500 text-white",
      "Ping Pong": "bg-purple-500 text-white",
      "Voleibol": "bg-blue-500 text-white",
      "Tenis": 'bg-yellow-100 text-yellow-800',
      "Natación": "bg-cyan-500 text-white", // Color del agua
      "Rugby": "bg-amber-800 text-white", // Color tierra/marrón oscuro
      "Renis": "bg-lime-500 text-black", // Color de la cancha
      "Microfútbol": "bg-green-600 text-white", // Verde más intenso
      "Atletismo": "bg-red-600 text-white", // Color de la pista
      "Voleibol playa": "bg-yellow-400 text-black", // Color de la arena
      "Baile": "bg-pink-500 text-white", // Color vivo
      "Entrenamiento físico": "bg-indigo-600 text-white" // Color de energía
    };
    return colors[sport] || "bg-secondary text-secondary-foreground";
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      "iniciado": "bg-green-100 text-green-800",
      "programado": "bg-blue-100 text-blue-800",
      "finalizado": "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      "iniciado": "Iniciado",
      "programado": "Programado",
      "finalizado": "Finalizado"
    };
    return texts[status] || status;
  };

    const handleSalir = async (idEvento) => {
    try {
      const respuesta = await eventosService.salirEvento(idEvento, uid);
      console.log("Saliste del evento:", respuesta);
      setJoinedEvents(prevEvents => prevEvents.filter(event => event.id !== idEvento));
      toast({
          title: "¡Salida Exitosa!",
          description: respuesta.message || "Te has salido del evento correctamente.",
          // Opcional: acción para cerrar o ir a otro lado
          // action: <ToastAction altText="Ir a eventos" onClick={() => navigate('/eventos')}>Ver</ToastAction>,
      });

    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelarEvento = (id_evento: number) => {
      // 1. En lugar de window.confirm, guardamos el ID y abrimos el diálogo de pregunta.
      setEventToCancelId(id_evento);
      setShowCancelDialog(true);
  };

  const confirmCancelation = async () => {
      if (!eventToCancelId) return;

      const id_evento = eventToCancelId;
      setShowCancelDialog(false); // Cerramos el diálogo de confirmación

      try {
          await eventosService.cancelarEvento(id_evento);
          
          // 1. Actualizar el estado local (eliminar de la lista)
          setMyEvents(prevEvents => prevEvents.filter(event => event.id !== id_evento));
          
          // 2. Mostrar el mensaje de éxito (reemplaza alert)
          setShowResultMessage({
              visible: true,
              title: "¡Evento Cancelado!",
              description: "El evento ha sido cancelado exitosamente. Se ha notificado a todos los participantes.",
          });

      } catch (error) {
          console.error("Error al cancelar el evento:", error);
          
          // 3. Mostrar el mensaje de error (reemplaza alert)
          setShowResultMessage({
              visible: true,
              title: "Error al Cancelar",
              description: "No se pudo cancelar el evento. Revisa la conexión o los permisos.",
          });
      } finally {
          setEventToCancelId(null); // Limpiamos el ID
      }
  };

    const getInternalUserId = (): number | null => {
      const idString = localStorage.getItem('userId');
      if (idString) {
          // Asegúrate de que el ID sea un número
          return parseInt(idString, 10);
      }
      return null;
  };
  const internalUserId = getInternalUserId(); // Obtener el ID al cargar el componente


  // 🚨 FUNCIÓN PARA VERIFICAR SI EL EVENTO HA TERMINADO 🚨
  const isFinished = (event: Evento): boolean => {
    // 1. Extraer solo la fecha (YYYY-MM-DD) de la cadena ISO (que incluye T...Z)
    const datePart = event.fecha.split('T')[0];
    
    // 2. Combinar solo la fecha con la hora final.
    // Ejemplo: "2025-11-08T00:00:00" (Esto es un formato ISO válido)
    const eventEndDateTimeString = `${datePart}T${event.hora_final}`;
    
    const eventEndDateTime = new Date(eventEndDateTimeString);
    
    // El evento terminó si la hora final es anterior a la hora actual
    return eventEndDateTime < new Date();
  };

  const formatFecha = (isoString) => {
  const [y, m, d] = isoString.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
};



  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mi Dashboard</h1>
        <Link to="/create-event">
          <Button className="gap-2">
            <Plus className="w-5 h-5" />
            Crear Evento
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="my-events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-events">Mis Eventos</TabsTrigger>
          <TabsTrigger value="joined-events">Eventos Unidos</TabsTrigger>
        </TabsList>

        <TabsContent value="my-events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos que organizo</CardTitle>
              <CardDescription>
                Gestiona los eventos que has creado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{event.nombre}</CardTitle>
                        <Badge className={getSportColor(event.nombre_deporte)}>
                          {event.nombre_deporte}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatFecha(event.fecha)} - {event.hora} - {event.hora_final}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.nombre_instalacion}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {event.participantes}/{event.capacidad_evento} participantes
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <Badge className={getStatusColor(event.nombre_estado)}>
                          {getStatusText(event.nombre_estado)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-colors"
                            onClick={() => handleCancelarEvento(event.id)}
                          >
                            Cancelar evento
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="joined-events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eventos a los que me he unido</CardTitle>
              <CardDescription>
                Eventos en los que participas como invitado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinedEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{event.nombre}</CardTitle>
                        <Badge className={getSportColor(event.nombre_deporte)}>
                          {event.nombre_deporte}
                        </Badge>
                      </div>
                      <CardDescription>Organizado por {event.nombre_organizador}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatFecha(event.fecha)} - {event.hora} - {event.hora_final}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.nombre_instalacion}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <Badge className={getStatusColor(event.nombre_estado)}>
                          {getStatusText(event.nombre_estado)}
                        </Badge>
                          <div className="flex gap-2">
                                    {/* LÓGICA DEL BOTÓN DE CALIFICACIÓN */}
                                    {isFinished(event) && event.nombre_estado === 'finalizado' && (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => setEventToRate(event)} // Abre el modal de calificación
                                            >
                                            Calificar Participantes
                                        </Button>
                                    )}

                                    {/* BOTÓN SALIR DEL EVENTO (Se muestra si el evento NO ha terminado) */}
                                    {(!isFinished(event) || event.nombre_estado === 'pending' || event.nombre_estado === 'active') && event.nombre_estado !== "cancelado" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSalir(event.id)}
                                        >
                                            Salir del evento
                                        </Button>
                                    )}
                                </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">
                      Confirmar Cancelación
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                      Estás a punto de cancelar el evento. 
                      ¿Estás completamente seguro? Esta acción es irreversible y notificará a todos los participantes.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setEventToCancelId(null)}>
                      Mantener Evento
                  </AlertDialogCancel>
                  <AlertDialogAction 
                      onClick={confirmCancelation} 
                      className="bg-red-600 hover:bg-red-700"
                  >
                      Cancelar Evento
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      {/* 🚨 2. DIÁLOGO DE RESULTADO (Reemplaza alert) 🚨 */}
      <AlertDialog 
          open={showResultMessage.visible} 
          onOpenChange={(visible) => setShowResultMessage(prev => ({ ...prev, visible }))}
      >
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle className={showResultMessage.title.includes("Error") ? "text-red-600" : "text-green-600"}>
                      {showResultMessage.title}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                      {showResultMessage.description}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogAction>
                      Aceptar
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
    {/* 🚨 3. COMPONENTE MODAL DE CALIFICACIÓN 🚨 */}
    {internalUserId && (
        <RatingModal
            eventToRate={eventToRate}
            idCalificador={internalUserId} // Pasamos el ID numérico
            onClose={() => setEventToRate(null)}
            // Al calificar con éxito, cerramos el modal y limpiamos el estado del evento
            onRatedSuccess={() => setEventToRate(null)} 
        />
    )}
    </>
  );
};

export default Dashboard;