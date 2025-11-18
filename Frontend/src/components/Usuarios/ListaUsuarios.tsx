    // 📁 sr/components/Usuarios/ListaUsuarios.tsx
    import { useState, useEffect, useMemo } from 'react';
    import { useToast } from '@/hooks/use-toast';
    import { useNavigate } from 'react-router-dom';
    import { usuariosService, Usuario } from '@/services/usuariosService';
    import { amigosService } from '@/services/amigosService'; 
    import { InactivationModal, InactivationPeriod } from '@/utils/inactivationModal';
    import UserCardList from './UserCardList'; 

    // 🚨 ACTUALIZAR PROPS para recibir la información de sesión
    interface ListaUsuariosProps {
        internalDbId: number | null;
        isAdmin: boolean;
        currentUserUid: string;
        currentUserId: number | null;
    }

    export default function ListaUsuarios({ isAdmin, currentUserUid,currentUserId, internalDbId }: ListaUsuariosProps) {
        // Estados y Hooks
        const [usuarios, setUsuarios] = useState<Usuario[]>([]);
        const [busqueda, setBusqueda] = useState('');
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [userToInactivate, setUserToInactivate] = useState<Usuario | null>(null);
        const { toast } = useToast();
        const navigate = useNavigate();

        // Lógica de Filtrado (sin cambios)
        const usuariosFiltrados = useMemo(() => {
            if (!busqueda) return usuarios; 
            const termino = busqueda.toLowerCase();
            return usuarios.filter(usuario => 
                usuario.nombre.toLowerCase().includes(termino) ||
                usuario.email.toLowerCase().includes(termino)
            );
        }, [usuarios, busqueda]);


        // Lógica de Carga (sin cambios)
        const cargarUsuarios = async () => {
            try {
                setLoading(true);
                setError(null);
                // 🚨 Asumimos que obtenerTodos trae la lista completa con el campo friendshipStatus
                const data = await usuariosService.obtenerTodos(internalDbId); 
                // Filtrar al usuario actual para no mostrar su propia tarjeta
                const listaLimpia = data.filter(u => u.uid !== currentUserUid).filter(u => u.uid && u.uid.length > 0);
                setUsuarios(listaLimpia);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios';
                setError(errorMessage);
                toast({ title: "Error", description: errorMessage, variant: "destructive" });
            } finally {
                setLoading(false); 
            }
        };
        useEffect(() => { cargarUsuarios(); }, [currentUserUid]);

        
        // 🚨 1. Lógica Específica de Administración (toggleStatus)
            const handleOpenInactivationModal = (usuario: Usuario) => {
            if (!isAdmin) return; // Validación de seguridad
            // Si el usuario ya está inactivo, simplemente lo activamos sin modal
            if (usuario.activo === 0) {
                handleToggleStatus(usuario); // Reutilizamos la antigua lógica de activación
                return;
            }
            // Si el usuario está activo (1), abrimos el modal para elegir período
            setUserToInactivate(usuario);
            setIsModalOpen(true);
        };

        const handleToggleStatus = async (usuario: Usuario) => {
            if (!isAdmin) return; // Validación de seguridad
            
            // 💡 Si llegamos aquí desde handleOpenInactivationModal, 
            // sabemos que usuario.activo ES 0, así que queremos ACTIVO (1).
            const estadoActivo: 1 = 1; 
            
            try {
                // Usamos toggleStatus (que es un alias de cambiarEstado en el servicio)
                // Solo pasamos UID y 1 (ACTIVO). NO pasamos 'period'.
                const result = await usuariosService.toggleStatus(usuario.uid, estadoActivo);
                
                setUsuarios(prevUsuarios => 
                    prevUsuarios.map(u => u.uid === result.user.uid ? result.user : u)
                );
                toast({ title: "Éxito", description: result.message });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error al cambiar el estado';
                toast({ title: "Error de Acción", description: errorMessage, variant: "destructive" });
            }
        };


        const handleConfirmInactivation = async (uid: string, period: InactivationPeriod) => {
            if (!isAdmin) return;
            
            try {
                // 🚨 AQUÍ LLAMAS A TU SERVICIO CON EL PERÍODO
                // ASUMIMOS que usuariosService tiene una nueva función `inactivarTemporalmente`
                // que acepta el UID y el período.
                const result = await usuariosService.inactivarTemporalmente(uid, period);
                
                // Actualizar la lista de usuarios con el nuevo estado/período
                setUsuarios(prevUsuarios => 
                    prevUsuarios.map(u => u.uid === result.user.uid ? result.user : u)
                );
                
                toast({ 
                    title: "Inactivación Exitosa", 
                    description: `Usuario ${userToInactivate?.nombre} inactivado por el período: ${period}.` 
                });
                
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error al inactivar temporalmente';
                toast({ title: "Error de Inactivación", description: errorMessage, variant: "destructive" });
            } finally {
                // Cierra el modal y limpia el estado del usuario.
                setIsModalOpen(false);
                setUserToInactivate(null);
            }
        };
            
        const handleViewProfile = (usuario: Usuario) => {
            navigate(`/usuarios/${usuario.uid}`);
        };

        // 🚨 2. Lógica Específica de Amistad (AddFriend)
    const handleAgregarAmigo = async (persona: Usuario) => {
            // Asegurarse de que el ID numérico del usuario logueado existe
            // Ya tienes esta validación de los pasos anteriores
            console.log("ID del usuario logueado al hacer clic:", internalDbId); 
            if (!internalDbId) {
                toast({ title: "Error", description: "Faltan datos de sesión (ID Numérica) para enviar la solicitud.", variant: "destructive" });
                return;
            }
            try {
                // 🚨 CORRECCIÓN: Pasar un objeto con los IDs numéricos
                await amigosService.crear({
                    // El usuario logueado que envía la solicitud
                    usuarioId: internalDbId, 
                    // La persona que recibe la solicitud
                    amigoId: persona.id,
                    id_estado : 7,

                });
                
                // Actualización optimista
                setUsuarios(prevUsuarios => 
                    prevUsuarios.map(p => 
                        p.uid === persona.uid 
                            ? { ...p, friendshipStatus: 'REQUESTED' } as Usuario
                            : p
                    )
                );
                toast({ title: "Éxito", description: `Solicitud de amistad enviada a ${persona.nombre}.` });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error al enviar solicitud de amistad';
                toast({ title: "Error", description: errorMessage, variant: "destructive" });
            }
        };


        // 🚨 DEFINICIÓN DINÁMICA DE ACCIONES para UserCardList
    const actions = useMemo(() => {
    const baseActions = [];

    // ACCIÓN 1: Ver Perfil (Siempre disponible y con su etiqueta correcta)

    
    // ACCIÓN 2: Estado de Amistad (Solo visible para NO-Admin)
    // Contiene la lógica condicional para AGREGAR, ENVIADA, PENDIENTE, AMIGOS.
     // 👈 SOLUCIÓN 2: Solo visible si NO es Admin
        baseActions.push({
            // Etiqueta y handler por defecto (se sobrescriben en dynamicProps)
            label: "Agregar Amigo", 
            variant: "default" as const,
            onClick: handleAgregarAmigo,

            dynamicProps: (usuario: Usuario) => {
                // Si ya son amigos
                if (usuario.friendshipStatus === 'ACCEPTED') {
                    return { 
                        label: 'Amigos', 
                        disabled: true, 
                        variant: "secondary" as const,
                        onClick: () => {} // Deshabilitar la acción de clic
                    };
                }
                // Si tú enviaste la solicitud
                if (usuario.friendshipStatus === 'REQUESTED') {
                    return { 
                        label: 'Solicitud Enviada', 
                        disabled: true, 
                        variant: "secondary" as const,
                        onClick: () => {} 
                    };
                }
                // Si ellos enviaron la solicitud (Pendiente de tu aprobación)
                if (usuario.friendshipStatus === 'PENDING') {
                    return { 
                        label: 'Pendiente de Aprobación', 
                        disabled: true, // Se gestiona en otra vista
                        variant: "secondary" as const,
                        onClick: () => {} 
                    };
                }
                
                // Por defecto (NONE/REJECTED): Mostrar Agregar Amigo
                return { 
                    label: 'Agregar Amigo', 
                    disabled: false, 
                    variant: "default" as const,
                    onClick: handleAgregarAmigo 
                };
            },
        });
    

    // ACCIÓN 3: Activar/Inactivar (Solo si es Admin)
    if (isAdmin) {
        baseActions.push({
            label: "Cambiar Estado",
            variant: "default" as const,
            onClick: handleOpenInactivationModal,
            dynamicProps: (usuario: Usuario) => ({
                label: usuario.activo === 1 ? 'Inactivar Temporalmente' : 'Activar',
                variant: usuario.activo === 1 ? "destructive" as const : "default" as const,
                disabled: false
            }),
        });
    }

    return baseActions;
}, [isAdmin, handleViewProfile, handleAgregarAmigo, handleOpenInactivationModal, handleToggleStatus]);


        return (
            <>
            <UserCardList
                titulo="Usuarios"
                usuarios={usuariosFiltrados}
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                loading={loading}
                error={error}
                actions={actions}
            />
            {userToInactivate && (
                <InactivationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)} // Función simple para cerrar
                    itemId={userToInactivate.uid} // O el ID que necesites en el modal
                    onConfirmInactivation={handleConfirmInactivation}
                />
            )}
        </>
        
        );
    }