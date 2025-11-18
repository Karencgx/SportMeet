    //ListaAmigos
    import { useState, useEffect, useCallback } from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { 
      Users, 
      UserCheck, 
      UserX, 
      Clock, 
      AlertCircle,
      CheckCircle,
      XCircle,
    Loader2
    } from 'lucide-react';
    // IMPORTANTE: Debes asegurarte que en amigosService.ts, obtenerTodos espera string.
    import { amigosService, Amistad } from '@/services/amigosService'; 
    import { useToast } from '@/hooks/use-toast';



    export default function ListaAmigos() {
      const [amistades, setAmistades] = useState<Amistad[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [procesando, setProcesando] = useState<number | null>(null);
      const { toast } = useToast();

      // Estado para la ID de Firebase (string alfanumérico)
      const [userId, setUserId] = useState<string | null>(null);
      // Estado para la ID numérica interna (number)
      const [internalDbId, setInternalDbId] = useState<number | null>(null);

    function obtenerUserIdDesdeToken(token: string): string | null { 
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.user_id || payload.sub || payload.uid || null;
        } catch (error) {
          console.error('Error al decodificar el token:', error);
          return null;
        }
      }

     // ✅ PRIMER useEffect: Carga las IDs de forma inicial (se ejecuta una sola vez)
     useEffect(() => {
            const token = localStorage.getItem('idToken');
            const storedDbId = localStorage.getItem('userId');

            if (storedDbId) {
                setInternalDbId(parseInt(storedDbId));
            }

            if (token) {
                const stringId = obtenerUserIdDesdeToken(token);
                if (stringId) {
                    setUserId(stringId); 
                } else {
                    setError('ID de usuario no válida en el token.');
                    setLoading(false);
                }
            } else {
                setError('No se encontró el token de usuario.');
                setLoading(false);
            }
        }, []);
      
      // cargarAmistades: Función de carga de API
    const cargarAmistades = useCallback(async (currentUserId: string) => {
        try {
            setError(null);
            const data = await amigosService.obtenerTodos(currentUserId); 
            console.log("Datos de amistades recibidos del Backend:", data); 
            console.log("ID del usuario logueado (UID para comparación):", currentUserId);
            setAmistades(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar amistades';
            setError(errorMessage);
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
      },[toast]);

    // ✅ SEGUNDO useEffect: Dispara la carga solo cuando las IDs están listas
      useEffect(() => {
          if (userId && internalDbId !== null) {
              setLoading(true);
              cargarAmistades(userId);
          }
          else if (!userId && !error) { 
            setLoading(false);
        }
      }, [userId, internalDbId,cargarAmistades,error]);

      const handleRespuestaSolicitud = async (id: number, estado: 'aceptada' | 'rechazada') => {
    // 🚨 VERIFICACIÓN DE SEGURIDAD
            if (internalDbId === null) {
                toast({
                    title: "Error de Sesión",
                    description: "No se pudo obtener tu ID interna para confirmar la acción.",
                    variant: "destructive",
                });
                return; // Bloquear la acción si no hay ID
            }
        try {
          setProcesando(id);
          await amigosService.actualizarEstado(id, estado,internalDbId);
          
          // Actualizar el estado local
          setAmistades(prev => 
            prev.map(amistad => 
              amistad.id === id 
                ? { ...amistad, estado, fechaRespuesta: new Date().toISOString() }
                : amistad
            )
          );

          toast({
            title: estado === 'aceptada' ? "Solicitud aceptada" : "Solicitud rechazada",
            description: `La solicitud de amistad ha sido ${estado}`,
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al procesar solicitud';
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setProcesando(null);
        }
      };

      const getEstadoBadge = (estado: string) => {
    // ... (mantenemos la lógica de getEstadoBadge sin cambios)
        switch (estado) {
          case 'aceptada':
            return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Amigos</Badge>;
          case 'rechazada':
            return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rechazada</Badge>;
          case 'pendiente':
            return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
          default:
            return <Badge variant="secondary">{estado}</Badge>;
        }
      };

    const getOtherUser = (amistad: Amistad, currentId: number) => {
        // Si el usuario logueado es el que inicia la relación, el amigo es el target
        if (amistad.usuarioId === currentId && amistad.amigo) {
            return amistad.amigo;
        }
        // Si el usuario logueado es el que recibe la relación, el amigo es el initiator
        if (amistad.amigoId === currentId && amistad.usuario) {
            return amistad.usuario;
        }
        return null; // Caso de error o datos incompletos
    };

    const handleEliminarAmigo = async (amistadId: number) => {
        // ⚠️ Bloqueamos si ya estamos procesando algo
        if (procesando !== null) return; 

        try {
            setProcesando(amistadId);
            
            // 1. Llamar al servicio DELETE, que ahora ejecuta un Soft Delete (cambia estado a 'eliminada' o 'rechazada')
            await amigosService.eliminarAmigo(amistadId); 
            
            // 2. Actualizar el estado local para eliminar la Card de la vista (Filtramos)
            setAmistades(prev => 
                prev.filter(a => a.id !== amistadId)
            );

            toast({
                title: "Amigo Eliminado",
                description: "La amistad ha sido eliminada correctamente.",
                variant: "default",
            });
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al eliminar amigo';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setProcesando(null);
        }
    };

    // --- Lógica de Filtros CORREGIDA ---
    // ✅ Bloqueamos el filtro si internalDbId aún es null (en el primer render)
    const esIdLista = internalDbId !== null;

    const amigosAceptados = esIdLista 
        ? amistades.filter(a => a.estado === 'aceptada')
        : [];

    const solicitudesPendientesEntrantes = esIdLista
        ? amistades.filter(
            a => a.estado === 'pendiente' && a.amigoId === internalDbId
        )
        : [];

        
      console.log('ID Numérica del Usuario Logueado:', internalDbId);
    console.log('Amistades para filtrar:', amistades);
    console.log('Solicitudes Entrantes filtradas (Longitud):', solicitudesPendientesEntrantes.length);
    // --- Fin Lógica de Filtros CORREGIDA ---

      if (loading) {
    // ... (Lógica de loading sin cambios)
        return (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      if (error) {
    // ... (Lógica de error sin cambios)
        return (
          <div className="p-6">
            <Card className="border-destructive">
              <CardContent className="flex items-center space-x-2 pt-6">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-destructive font-medium">Error de conexión</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button onClick={() => userId && cargarAmistades(userId)} className="mt-2" size="sm">
                    Reintentar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

    // ... (Resto del componente de retorno, sin cambios)
      return (
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Amigos y Solicitudes</h1>
            </div>
            
          </div>

          <Tabs defaultValue="amigos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="amigos" className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span>Mis Amigos ({amigosAceptados.length})</span>
              </TabsTrigger>
              <TabsTrigger value="solicitudes" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Solicitudes ({solicitudesPendientesEntrantes.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="amigos" className="space-y-4">
            {amigosAceptados.length > 0 ? (
                // 👇 Cambiamos la grilla para mostrar varias columnas
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {amigosAceptados.map((amistad) => {
                    const otherUser = getOtherUser(amistad, internalDbId!);
                    if (!otherUser) return null;

                    return (
                    <Card
                        key={amistad.id}
                        className="w-full shadow-sm rounded-xl border border-border hover:shadow-md transition"
                    >
                        <CardContent className="flex flex-col items-center text-center p-4 space-y-3">
                        <div className="flex flex-col items-center space-y-2">
                            <Avatar className="h-14 w-14">
                            <AvatarImage src={otherUser.avatar} />
                            <AvatarFallback>
                                {otherUser.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="font-semibold text-sm">{otherUser.nombre}</p>
                            <p className="text-xs text-muted-foreground">{otherUser.email}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center space-y-2">
                            {getEstadoBadge(amistad.estado)}
                            <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleEliminarAmigo(amistad.id)}
                            disabled={procesando === amistad.id}
                            className="flex items-center"
                            >
                            {procesando === amistad.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <UserX className="h-4 w-4 mr-1" />
                            )}
                            {procesando === amistad.id ? "Eliminando..." : "Eliminar Amigo"}
                            </Button>
                        </div>
                        </CardContent>
                    </Card>
                    );
                })}
                </div>
            ) : (
                <Card>
                <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aún no tienes amigos</p>
                    <p className="text-sm text-muted-foreground">
                    Envía solicitudes de amistad para empezar
                    </p>
                </CardContent>
                </Card>
            )}
            </TabsContent>

 <TabsContent value="solicitudes" className="space-y-4">
  {solicitudesPendientesEntrantes.length > 0 ? (
    // 👇 Ajuste: grilla con varias columnas, alineada a la izquierda
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-start">
      {solicitudesPendientesEntrantes.map((amistad) => (
        <Card
          key={amistad.id}
          className="w-full shadow-sm rounded-xl border border-border hover:shadow-md transition"
        >
          <CardContent className="flex flex-col items-center text-center p-4 space-y-3">
            {/* Avatar y nombre */}
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-14 w-14">
                <AvatarImage src={amistad.usuario?.avatar} />
                <AvatarFallback>
                  {amistad.usuario?.nombre
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{amistad.usuario?.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {amistad.usuario?.email}
                </p>
              </div>
            </div>

            {/* Estado y botones */}
            <div className="flex flex-col items-center space-y-3">
              {getEstadoBadge(amistad.estado)}
              <div className="flex justify-center space-x-3">
                <Button
                  size="sm"
                  onClick={() =>
                    handleRespuestaSolicitud(amistad.id, "aceptada")
                  }
                  disabled={procesando === amistad.id}
                  className="flex items-center"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Aceptar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleRespuestaSolicitud(amistad.id, "rechazada")
                  }
                  disabled={procesando === amistad.id}
                  className="flex items-center"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Rechazar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ) : (
    <Card>
      <CardContent className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No tienes solicitudes pendientes</p>
      </CardContent>
    </Card>
  )}
</TabsContent>
          </Tabs>
        </div>
      );
    }