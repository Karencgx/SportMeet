import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase'; // Importa el servicio de autenticación

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Función no disponible",
      description: "La autenticación aún no está implementada",
    });
  };

  const handleSocialLogin = async (providerName: string) => {
  if (providerName === "Google") {
    const googleProvider = new GoogleAuthProvider();
    try {
      // 1. Inicia sesión con el pop-up de Google
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. Obtén el ID Token del usuario
      const idToken = await result.user.getIdToken();
      localStorage.setItem("idToken", idToken);
      

      // 3. Envía el token a tu backend para verificación y creación de usuario
      const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 🚨 CAMBIO CLAVE AÑADIDO AQUÍ:
        // El backend debe devolver 'userRoleId' en el objeto 'data'
        const internalDbId = data.id || data.userId;
        const userRole = data.userRoleId;
        if (userRole) {
            // Se guarda el rol en localStorage para que el Layout pueda leerlo
            // Lo convertimos a string porque localStorage solo almacena strings
            localStorage.setItem("userRoleId", userRole.toString());
        } else {
            // Manejo de error si el backend no devuelve el rol. 
            // Esto puede causar problemas si el rol es crucial.
            console.error("El backend no devolvió el userRoleId.");
                        toast({
                            title: "Advertencia de Rol",
                            description: "No se pudo obtener el rol del usuario. Algunas vistas podrían fallar.",
                            variant: "destructive"
                        });
        }
        if (internalDbId ) { 
            // Usamos data.id si existe, si no, usamos data.userId
            // Guardar el ID numérico en localStorage para que authUtils lo lea.
            localStorage.setItem("userId", internalDbId.toString()); 
        } else {
            console.error("El backend no devolvió el ID numérico (id/userId).");
                        toast({
                            title: "Advertencia Crítica",
                            description: "Falta el ID numérico. Las funciones de amistad están deshabilitadas.",
                            variant: "destructive"
                        });
        }
        toast({
          title: "¡Sesión iniciada!",
          description: "Bienvenido a SportMeet."
        });
        // 4. Redirige al dashboard
        navigate("/dashboard"); 
      } else {
        // 🚨 VERIFICACIÓN AÑADIDA: Manejar el estado 403 (Forbidden)
        if (response.status === 403 && data.error === "Cuenta Inactiva") {
            localStorage.removeItem("idToken"); // Limpiar token local por seguridad
            toast({
                title: "Acceso Denegado 🔒",
                description: data.message || "Tu cuenta ha sido desactivada y no puedes iniciar sesión.",
                variant: "destructive"
            });
            return; // Detener el flujo para no ejecutar el throw
        }
        if (response.status === 404) {
                            // El backend dice: "Usuario no registrado, no puedo hacer login"
                            toast({
                                title: "Cuenta no encontrada",
                                description: "Tu cuenta de Google no está registrada en SportMeet. Por favor, regístrate.",
                                variant: "destructive"
                            });
                            navigate("/register"); // Redirige al registro
                            return;
                        }  
            throw new Error(data.error || "Error al autenticar con el servidor.")      
          }
    } catch (error: any) {
      console.error("Error de autenticación:", error);
      toast({
        title: "Error de autenticación",
        description: error.message || "No se pudo iniciar sesión con Google. Intenta de nuevo."
      });
    }

  } else {
    // Lógica para otros proveedores sociales
    toast({
      title: "Función no disponible",
      description: `Login con ${providerName} aún no está implementado`,
    });
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
    style={{
        // 1. Define la imagen: ¡REEMPLAZA ESTA URL CON TU PROPIA IMAGEN!
        backgroundImage: "url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjBWo0ZOrihWlUVi3PAtWHws1keWCoZq6akY_JAjPGwHktXWjau5V6CxlyLa86GFCC04GgwtGCxEf8mz6y2ecaMRPXdFtO4Mtuo_SNhvzuDot_AAwXHBjINBbcnmgXyYw4__9Qr7U6vMSs/s640/Coliseo+universitario+Universidad+de+Antioquia+Medellin+ciudad+universitaria+Colombia+%25285%2529.JPG')", 
        // 2. Propiedades de cobertura y centrado
        backgroundSize: "cover", // Asegura que la imagen cubra todo el fondo
        backgroundPosition: "center", // Centra la imagen
        // 3. Opcional: Capa de color semitransparente (overlay) para mejorar la legibilidad de la tarjeta
        backgroundColor: "rgba(0, 0, 0, 0.7)", // Fondo oscuro
        backgroundBlendMode: "overlay" // Combina la imagen con el color
      }}
    >
      <Card className="w-full max-w-md 
                  bg-white/90                                          // 🔑 Opacidad del blanco ajustada
                  shadow-2xl 
                  backdrop-blur-md                                    // 🔑 Desenfoque aumentado
                  border border-white/30l">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">SportMeet</CardTitle>
          <CardDescription>Inicia sesión en tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 text-sm"
              onClick={() => handleSocialLogin("Google")}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>
          </div>

          <Separator />

          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link to="/register" className="text-primary hover:underline font-medium">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;