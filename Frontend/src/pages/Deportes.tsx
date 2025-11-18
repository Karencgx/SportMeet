// 📁 Deportes.tsx

import GestionDeportes from '@/components/Deportes/GestionDeportes';
// 🚨 Importar el hook de autenticación/sesión
// (Ajusta la ruta si es diferente, por ejemplo: '@/context/AuthContext')
import { useAuth } from '@/hooks/useAuth';


export default function Deportes() {
    // 🚨 Obtener el estado isAdmin del usuario logueado
    // Asumimos que useAuth devuelve un objeto con isAdmin: boolean
    const { isAdmin, isLoaded } = useAuth(); 

    // Opcional: Manejar el estado de carga si es necesario
    if (!isLoaded) {
        // Podrías usar un spinner o un componente de skeleton aquí
        return <div>Cargando permisos de usuario...</div>; 
    }

    return (
        // 🚨 Pasar la propiedad isAdmin al componente hijo
        <GestionDeportes isAdmin={isAdmin} />
    );
}