//Layout.tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  User, 
  Calendar, 
  BarChart3, 
  Home, 
  LogOut, 
  Users, 
  Trophy, 
  Building, 
  UserCheck,
  LucideIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Notificacion,
    SocketNotification,
    connectSocket, 
    disconnectSocket, 
    fetchUnreadNotifications, 
    markNotificationsAsRead 
} from '../services/notificationService';

// Lista de navegación BASE (CONSTANTE, NO FILTRADA)
const NAVIGATION_LINKS = [
    { name: "Eventos", href: "/eventos", icon: Calendar, requiresAdmin: false },
    { name: "Usuarios", href: "/usuarios", icon: Users, requiresAdmin: false }, // REQUIERE ADMIN
    { name: "Amigos", href: "/amigos", icon: UserCheck, requiresAdmin: false },
    { name: "Deportes", href: "/deportes", icon: Trophy, requiresAdmin: false },
    { name: "Instalaciones", href: "/instalaciones", icon: Building, requiresAdmin: false },
];

const getInternalUserId = (): number | null => {
    // 🚨 CLAVE: Debes asegurarte de que este ID sea el NUMÉRICO INTERNO de la DB
    const id = localStorage.getItem('userId'); 
    return id ? parseInt(id, 10) : null;
}

const formatNotificationDate = (dateString: string): string => {
    if (!dateString) return 'Fecha desconocida';

    // 1. Intentar crear el objeto Date directamente. 
    //    Esto es robusto para formatos ISO 8601 (con T y Z).
    const date = new Date(dateString);

    // 2. Verificación. Si el parseo falla, getTime() devuelve NaN.
    if (isNaN(date.getTime())) {
        console.error("Fallo al parsear fecha:", dateString);
        return 'Fecha desconocida';
    }

    // 3. Formatear la fecha para la localización del usuario (es-ES)
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        // Opcional: mostrar la zona horaria para debug, luego puedes quitarlo
        // timeZoneName: 'short' 
    });
};
const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notificacion[]>([])

  // Obtenemos el token y el ID del usuario al inicio
    const token: string | null = localStorage.getItem('idToken');
    const internalId: number | null = getInternalUserId();

    const unreadCount: number = notifications.length;

    // --- LÓGICA DE GESTIÓN DE NOTIFICACIONES ---

    // Función para cargar notificaciones no leídas (memorizada)
    const loadNotifications = useCallback(async () => {
        if (internalId && token) {
            const fetched = await fetchUnreadNotifications(token);
            setNotifications(fetched);
        }
    }, [internalId, token]);


    // Función para manejar una nueva notificación en tiempo real
    const handleNewNotification = (newNotif: SocketNotification): void => {
        console.log("Notificación en tiempo real recibida:", newNotif);
        // Cuando llega una notificación, recargamos la lista completa de la DB
        // para obtener la nueva entrada con su ID, fecha y contenido final.
        loadNotifications(); 
    };


    // Manejar el marcado como leídas
    const handleMarkAllRead = useCallback(async () => {
        if (unreadCount === 0 || !token) return;

        const idsToMark: number[] = notifications.map(n => n.id);

        const success = await markNotificationsAsRead(idsToMark, token);
        
        if (success) {
            // Limpiamos el estado local de notificaciones
            setNotifications([]); 
        }
    }, [unreadCount, notifications, token]);

  useEffect(() => {
    const roleId = localStorage.getItem('userRoleId');
    // El rol Admin es el ID 1
    const currentIsAdmin = roleId === '1';
    setIsAdmin(currentIsAdmin);

    if (internalId) {
            // 1. Conectar Socket.IO
            const socket = connectSocket(internalId);

            // 2. Escuchar evento en tiempo real
            socket.on('nuevaNotificacion', handleNewNotification);

            // 3. Carga inicial de notificaciones persistentes
            loadNotifications();
        }
    
    // 💡 DEBUG: Revisa la consola para ver qué rol se leyó.
    console.log("Rol de usuario leído:", roleId); 
    console.log("Es Admin:", currentIsAdmin); 
  }, []);

  // 🚨 1. APLICAR EL FILTRO AQUÍ: Generamos la lista `navigation` filtrada
  // Esto se recalcula en cada renderizado (incluyendo cuando isAdmin cambia de false a true)
  const navigation = NAVIGATION_LINKS.filter(item => {
    // Retorna true si NO requiere ser admin O si requiere ser admin Y el usuario ES admin
    return !item.requiresAdmin || isAdmin;
  });


  const handleLogout = () => {
        // 1. Limpiar token y rol
        localStorage.removeItem('idToken');
        localStorage.removeItem('userRoleId');
        localStorage.removeItem('userId'); // Limpiar ID interno
        disconnectSocket(); // 🚨 Desconectar el socket al cerrar sesión

        // 2. Redirigir al login usando React Router
        navigate('/login');
    };
    
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-2xl font-bold text-primary">
                SportMeet
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => { // 🚨 2. USAMOS LA LISTA FILTRADA
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

<div className="flex items-center space-x-4">
  {/* Menu móvil - SOLO se ve en pantallas pequeñas */}
                            <div className="md:hidden">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Home className="w-6 h-6" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-48">
                                  {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                      <DropdownMenuItem
                                        key={item.name}
                                        onClick={() => navigate(item.href)}
                                      >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.name}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {/* 🚨 DROPDOWN DE NOTIFICACIONES */}
                            <DropdownMenu onOpenChange={async (open) => {
                                if (!open && unreadCount > 0) {
                                    await handleMarkAllRead();
                                }
                            }}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500 flex items-center justify-center" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                
                                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                                    <DropdownMenuItem disabled className="font-bold text-lg border-b">
                                        Notificaciones ({unreadCount})
                                    </DropdownMenuItem>

                                    {unreadCount === 0 ? (
                                        <DropdownMenuItem disabled className="text-muted-foreground justify-center">
                                            No tienes notificaciones nuevas.
                                        </DropdownMenuItem>
                                    ) : (
                                        notifications.map((notif: Notificacion) => (
                                            <DropdownMenuItem 
                                                key={notif.id}
                                                className="flex flex-col items-start space-y-1 py-2 cursor-pointer hover:bg-accent"
                                                onClick={() => {
                                                    // Redirección
                                                    if (notif.tipo === 'SOLICITUD_RECIBIDA') {
                                                        navigate('/amigos'); 
                                                    } 
                                                    if (notif.tipo === 'EVENTO_CREADO' || notif.tipo === 'EVENTO_CANCELADO' || notif.tipo === 'RECORDATORIO') {
                                                      if (notif.referenciaId) {
                                                          // Redirigimos al detalle del evento usando el ID de referencia
                                                          navigate(`/eventos/${notif.referenciaId}`);
                                                      } else {
                                                          // Si no hay ID de referencia, redirigimos a la lista de eventos
                                                          navigate('/eventos');
                                                      }
                                                    }
                                                   
                                                }}
                                            >
                                                <span className="font-medium text-sm">{notif.contenido}</span>
                                                <span className="text-xs text-muted-foreground">{formatNotificationDate(notif.fechaCreacion)}</span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><User className="w-5 h-5" /></Button></DropdownMenuTrigger>
                                
                                <DropdownMenuContent align="end" className="bg-popover">
                                    <DropdownMenuItem onClick = {() => navigate('/perfil')}>
                                        <User className="w-4 h-4 mr-2" />
                                        Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick = {handleLogout}>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Cerrar Sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;