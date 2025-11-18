// 📁 src/utils/authUtils.ts (CORREGIDO)

// ... (interface DecodedToken y decodeToken sin cambios)
interface DecodedToken {
    uid: string; // Firebase UID
    user_id?: string; // a veces 'user_id' es el UID
    sub?: string; // a veces 'sub' es el UID
    id?: number; // El ID numérico
    exp: number; // Expiración
    [key: string]: any;
}

export const decodeToken = (token: string): DecodedToken | null => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Usa `atob` para decodificar Base64
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload) as DecodedToken;
    } catch (e) {
        // En caso de un token inválido
        return null;
    }
};
export interface SessionData {
    isAuthenticated: boolean;
    uid: string | null;
    id: number | null; 
    isAdmin: boolean;
}

export const getSessionData = (): SessionData => {
    const token = localStorage.getItem('idToken');
    const userRoleId = localStorage.getItem('userRoleId'); 
    
    // 🚨 Obtener el ID numérico de la DB (el 1, 2, 3...) desde localStorage
    // Suponemos que tu lógica de login guarda este valor como string.
    const userIdFromStorage = localStorage.getItem('userId');
    const parsedUserId = userIdFromStorage ? parseInt(userIdFromStorage, 10) : null;
    
    if (!token) {
        return { isAuthenticated: false, uid: null, id: null, isAdmin: false };
    }

    const decoded = decodeToken(token);
    
    if (!decoded || decoded.exp * 1000 < Date.now()) { 
        // Limpiar todo, incluyendo el nuevo 'userId'
        localStorage.removeItem('idToken');
        localStorage.removeItem('userRoleId');
        localStorage.removeItem('userId'); 
        return { isAuthenticated: false, uid: null, id: null, isAdmin: false };
    }
    
    const uid = decoded.uid || decoded.sub || null;
    const isAdmin = userRoleId === '1'; 

    // 🚨 Lógica corregida para obtener el ID numérico:
    // 1. Buscar en el token (decoded.id)
    // 2. Si no está en el token, usar el valor de localStorage (parsedUserId)
    const dbId = decoded.id || parsedUserId;
    console.log("DB ID desde authUtils:", dbId); // <--- AÑADE ESTO
    
    return {
        isAuthenticated: true,
        uid,
        // 🚨 CLAVE: Devuelve null si no se encuentra. NO devuelvas 0.
        id: dbId, 
        isAdmin,
    };
};