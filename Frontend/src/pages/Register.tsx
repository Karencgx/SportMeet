import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// 🚨 Asegúrate de que esta ruta a tu configuración de Firebase sea correcta
import { 
    auth, 
    googleProvider 
} from "../firebase"; 
import { 
    signInWithPopup 
} from "firebase/auth"; 
import { UserCredential } from "firebase/auth"; 

const Register = () => {
    // ----------------------------------------------------
    // 1. ESTADOS PARA EL FLUJO DE DOS FASES
    // ----------------------------------------------------
    const [needsPhoneForm, setNeedsPhoneForm] = useState(false); // Controla la fase 2
    const [tempToken, setTempToken] = useState<string | null>(null); // Guarda el token temporal de Google
    const [tempDisplayName, setTempDisplayName] = useState<string | null>(null); // Guarda el nombre de Google
    const [phone, setPhone] = useState(''); // El dato que necesitamos
    const [isLoading, setIsLoading] = useState(false); // Para manejar el estado de carga

    const { toast } = useToast();
    const navigate = useNavigate();

    // ----------------------------------------------------
    // 2. FUNCIÓN DE COMUNICACIÓN CON EL BACKEND (Registro Final)
    // ----------------------------------------------------
    const registerUserOnBackend = async (idToken: string, displayName: string, phone: string) => {
        setIsLoading(true);
        try {
            // 🚨 Llamada a la ruta de Registro del backend, incluyendo el 'phone'
            const response = await fetch('https://sportmeet-kjh8.onrender.com/api/usuarios/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken, phone }),
            });

            const data = await response.json();

            if (!response.ok) {
              if (response.status === 409) {
                    toast({
                        title: "Error de Registro",
                        description: "Ya tienes una cuenta. Por favor, inicia sesión.",
                        variant: "destructive",
                    });
                    // Redirigir al usuario a la página de login
                    navigate('/login'); 
                    return; // Detener la ejecución
                }
                throw new Error(data.error || "Fallo al guardar perfil en la base de datos");
                
            }
            const internalDbId = data.id;
            const userRole = data.userRoleId;

            if (internalDbId) {
                // Guarda el ID numérico para que authUtils lo lea
                localStorage.setItem('userId', internalDbId.toString());
            } else {
                console.warn("Advertencia: El backend no devolvió el ID numérico (data.id) en la respuesta de registro.");
            }

            if (userRole) {
                // Guarda el rol por defecto del usuario
                localStorage.setItem('userRoleId', userRole.toString());
            } else {
                console.warn("Advertencia: El backend no devolvió el Rol (data.userRoleId) en la respuesta de registro.");
            }

            // Éxito: Guardar token, mostrar toast y redirigir
            localStorage.setItem('idToken', idToken);
            toast({
                title: "¡Bienvenido!",
                description: `Tu cuenta ha sido creada, ${displayName}.`,
            });
            navigate('/perfil'); // Redirigir al perfil
            
        } catch (error: any) {
            console.error("Error en el backend:", error);
            toast({
                title: "Error de Registro",
                description: error.message || "No se pudo completar el registro en SportMeet.",
                variant: "destructive",
            });
            // Si el registro falla, volvemos a la fase 1
            setNeedsPhoneForm(false);
            setTempToken(null);
            
        } finally {
            setIsLoading(false);
        }
    };

    // ----------------------------------------------------
    // 3. LÓGICA DE REGISTRO CON GOOGLE (FASE 1)
    // ----------------------------------------------------
    const handleGoogleRegister = async () => {
        setIsLoading(true);
        try {
            // 1. Autenticación con Google
            const result: UserCredential = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            console.log("Token de Google Obtenido (Fragmento):", idToken.substring(0, 15) + '...'); 

            const displayName = result.user.displayName || result.user.email || "Usuario";
            
            // 2. Guardar token y pasar a la fase 2
            setTempToken(idToken);
            setTempDisplayName(displayName);
            setNeedsPhoneForm(true); 
            
        } catch (error: any) {
             console.error(`Error de autenticación con Google:`, error);
             if (error.code !== 'auth/popup-closed-by-user') {
                 toast({
                     title: "Fallo en Autenticación Social",
                     description: `No se pudo conectar con Google.`,
                     variant: "destructive",
                 });
             }
        } finally {
            setIsLoading(false);
        }
    };
    
    // ----------------------------------------------------
    // 4. FUNCIÓN FINAL DE ENVÍO DE DATOS (FASE 2 SUBMIT)
    // ----------------------------------------------------
    const handleFinalRegistrationSubmit = (e: React.FormEvent) => {
      console.log("Token antes de enviar al backend:", tempToken ? "Encontrado" : "NO ENCONTRADO");

      e.preventDefault();
        
        if (!phone) {
             toast({ title: "Error", description: "El teléfono es obligatorio.", variant: "destructive" });
             return;
        }
        
        if (!tempToken || !tempDisplayName) {
             toast({ title: "Error", description: "El token de Google se perdió. Intenta iniciar sesión de nuevo.", variant: "destructive" });
             setNeedsPhoneForm(false);
             return;
        }
        
        // 🚨 Llamar a la función que contacta al backend
        registerUserOnBackend(tempToken, tempDisplayName, phone);
    };

    // ----------------------------------------------------
    // 5. RENDERIZADO CONDICIONAL (Fase 1 vs Fase 2)
    // ----------------------------------------------------
    if (needsPhoneForm) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4"
            style={{
                    backgroundImage: "url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjBWo0ZOrihWlUVi3PAtWHws1keWCoZq6akY_JAjPGwHktXWjau5V6CxlyLa86GFCC04GgwtGCxEf8mz6y2ecaMRPXdFtO4Mtuo_SNhvzuDot_AAwXHBjINBbcnmgXyYw4__9Qr7U6vMSs/s640/Coliseo+universitario+Universidad+de+Antioquia+Medellin+ciudad+universitaria+Colombia+%25285%2529.JPG')", 
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.7)", 
                    backgroundBlendMode: "overlay" 
                }}>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">¡Hola, {tempDisplayName || 'Usuario'}!</CardTitle>
                        <CardDescription>Completa tu registro: necesitamos tu número de teléfono.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFinalRegistrationSubmit} className="space-y-4">
                            <Input
                                type="tel"
                                placeholder="Número de Teléfono (Ej: 999 999 9999)"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                            <Button 
                                type="submit" 
                                className="w-full"
                                disabled={isLoading} // Deshabilitar mientras carga
                            >
                                {isLoading ? "Registrando..." : "Finalizar Registro"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    // Vista de Registro Original (Fase 1)
    return (
        <div className="min-h-screen flex items-center justify-center p-4"
        style={{
                backgroundImage: "url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjBWo0ZOrihWlUVi3PAtWHws1keWCoZq6akY_JAjPGwHktXWjau5V6CxlyLa86GFCC04GgwtGCxEf8mz6y2ecaMRPXdFtO4Mtuo_SNhvzuDot_AAwXHBjINBbcnmgXyYw4__9Qr7U6vMSs/s640/Coliseo+universitario+Universidad+de+Antioquia+Medellin+ciudad+universitaria+Colombia+%25285%2529.JPG')", 
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "rgba(0, 0, 0, 0.7)", // Opacidad del 70%
                backgroundBlendMode: "overlay"
            }}
        >
            <Card className="w-full max-w-md 
                            bg-white/90                                 // 🔑 CAMBIO 2: Glassmorphism (Opacidad más baja)
                            shadow-2xl 
                            backdrop-blur-md                             // 🔑 CAMBIO 3: Desenfoque
                            border border-white/3">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">SportMeet</CardTitle>
                    <CardDescription>Crea tu cuenta y únete a la comunidad</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Botón de Registro Social (Google) */}
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full h-12 text-sm"
                            onClick={handleGoogleRegister} 
                            disabled={isLoading}
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {isLoading ? "Cargando..." : "Registrarse con Google"}
                        </Button>
                        
                       
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                    
                    </div>
                

                    <Separator />

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Inicia sesión
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;