// 📁 src/hooks/useAuth.ts (NUEVO ARCHIVO)

import { useState, useEffect } from 'react';
import { getSessionData, SessionData } from '@/utils/authUtils';

// Definición de lo que el hook exportará
interface AuthState extends SessionData {
    isLoaded: boolean; // Indica si la lectura inicial de localStorage ha terminado
}

export const useAuth = (): AuthState => {
    // Estado inicial: no autenticado y aún no cargado.
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        uid: null,
        id: null,
        isAdmin: false,
        isLoaded: false, // 🚨 CLAVE: Inicialmente false
    });

    useEffect(() => {
        // Ejecutar getSessionData solo una vez al montar
        const session = getSessionData();
        
        setAuthState({
            ...session,
            isLoaded: true, // 🚨 CLAVE: Marcamos como cargado después de leer localStorage
        });
        
        // NOTA: Para reaccionar a cambios de login/logout, 
        // podrías añadir un Listener de localStorage aquí, pero por ahora esto es suficiente.
    }, []);

    return authState;
};