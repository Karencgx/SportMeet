// 📁 src/pages/Usuarios.tsx
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import ListaUsuarios from '@/components/Usuarios/ListaUsuarios'; 
import CrearUsuario from '@/components/Usuarios/CrearUsuario';
import { Usuario } from '@/services/usuariosService';
import { getSessionData } from '@/utils/authUtils'; 
// 🚨 Importamos la capa de autenticación para obtener el UID, ID y el rol

export default function Usuarios() {
    const [mostrarCrear, setMostrarCrear] = useState(false);
    const [actualizarLista, setActualizarLista] = useState(0); 
    
    // 🚨 Llamada a la utilidad de sesión
    const { 
        id: currentUserId, 
        uid: currentUserUid, 
        isAdmin, 
        isLoaded // 🚨 Usar el flag de carga
    } = useAuth(); // Obtiene los datos del hook

    const handleUsuarioCreado = (usuario: Usuario) => {
        setMostrarCrear(false);
        setActualizarLista(prev => prev + 1);
    };
    
    const handleAgregarClick = () => {
        setMostrarCrear(true);
    };

    if (!isLoaded) {
        return (
            <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Cargando datos de sesión...
            </div>
        );
    }
    // 🚨 CORRECCIÓN: No hay variable 'loading' ya que `getSessionData` es síncrona.
    // Usamos `isAuthenticated` (implícito en la verificación de `currentUserUid`) para proteger la ruta.
    // if (loading) return <div className="container mx-auto p-6 text-center">Cargando sesión...</div>;
    
    // Si no hay UID (no autenticado o token inválido), mostramos error.
    if (!currentUserUid) return <div className="container mx-auto p-6 text-center text-red-600">Acceso no autorizado. Debe iniciar sesión.</div>;



    // 2. Muestra la lista de usuarios
    return (
        <div className="container mx-auto p-6">
            
            
            {/* 🚨 PASAMOS LAS PROPS DE AUTORIZACIÓN, INCLUYENDO EL ID NUMÉRICO */}
            <ListaUsuarios 
                key={actualizarLista} // Forzar un remount (recarga de datos)
                isAdmin={isAdmin}
                currentUserUid={currentUserUid}
                currentUserId={currentUserId} // 🚨 Es crucial pasar este ID numérico
                internalDbId={currentUserId}
            />
        </div>
    );
}