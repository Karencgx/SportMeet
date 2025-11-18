// src/components/PerfilUsuario.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
// Asegúrate de que este hook esté disponible
import { useToast } from '@/hooks/use-toast'; 
import {UserRatingDisplay} from '../UserRatingDisplay';


// Define la interfaz Usuario para asegurar la tipificación de los datos
// Esta interfaz es esencial para el tipado en TypeScript/React
interface Usuario {
  id?: number;
  uid: string;
  nombre: string;
  email: string;
  telefono?: string;
  avatar?: string;
  fechaRegistro?: string;
  rolId?: number;
}

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [datosEditados, setDatosEditados] = useState<Partial<Usuario>>({});
  const { toast } = useToast();

  // Se ejecuta solo una vez al cargar el componente
  useEffect(() => {
    cargarUsuario();
  }, []);

  // Función para cargar los datos del usuario autenticado
  const cargarUsuario = async () => {

    const idToken = localStorage.getItem('idToken');
    console.log("Token de LocalStorage:", idToken ? "Encontrado" : "NO ENCONTRADO"); 

    if (!idToken) {
      toast({ title: "No autenticado", description: "Inicia sesión para ver tu perfil.", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Llama al endpoint protegido que devuelve el perfil del usuario autenticado
      const response = await fetch('https://sportmeet-kjh8.onrender.com/api/usuarios/perfil', {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el perfil.");
      }

      const backendData = await response.json();
      const imageUrl = backendData.foto || '';

      const safeAvatarUrl = (url: string | undefined): string => {
          if (!url) return '';
          // Solo forzamos HTTPS; el backend ya se encargó de la prioridad y de URLs rotas.
          if (url.startsWith('http://')) {
              return url.replace('http://', 'https://');
          }
          return url;
      };
        const mappedUser: Usuario = {
            id: backendData.id,
            uid: backendData.uid,
            nombre: backendData.nombre,
            email: backendData.email,
            telefono: backendData.telefono,
            avatar: safeAvatarUrl(imageUrl) , // Usamos 'foto' del log para el campo 'avatar'
            fechaRegistro: backendData.creado_en,
            rolId: backendData.rolId,
        };
      console.log("URL de Avatar en Frontend (mappedUser):", mappedUser.avatar); 

      setUsuario(mappedUser);
      setDatosEditados(mappedUser); // Inicializa los datos de edición con la información cargada
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
      toast({ title: "Error", description: "No se pudo cargar el perfil del usuario.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar los cambios en el perfil del usuario
  const handleGuardar = async () => {
    if (!usuario) return;

    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
      toast({ title: "Error", description: "Token no encontrado." });
      return;
    }

    try {
      setGuardando(true);
      // Realiza la petición PUT para actualizar el perfil del usuario
      // Se asume que el backend utiliza el UID para identificar al usuario
      const response = await fetch(`https://sportmeet-kjh8.onrender.com/api/usuarios/${usuario.uid}`, { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosEditados),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el perfil.");
      }
      const backendData: any = await response.json();
      const imageUrl = backendData.foto || '';
      const safeAvatarUrl = (imageUrl: string): string => {
        if (imageUrl.includes('googleusercontent.com') && imageUrl.startsWith('http://')) {
         return imageUrl.replace('http://', 'https://');
        }
       return imageUrl;
      };
      const usuarioActualizado: Usuario = {
            id: backendData.id,
            uid: backendData.uid,
            nombre: backendData.nombre,
            email: backendData.email,
            telefono: backendData.telefono,
            avatar: safeAvatarUrl(imageUrl), 
            fechaRegistro: backendData.creado_en,
        };

      setUsuario(usuarioActualizado);
      setEditando(false);
      toast({ title: "Perfil actualizado", description: "Los cambios se han guardado correctamente." });

    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
    } finally {
      setGuardando(false);
    }
  };

  // Función para cancelar la edición y revertir los cambios
  const handleCancelar = () => {
    // Revierta los datosEditados al estado actual del usuario
    setDatosEditados(usuario || {}); 
    setEditando(false);
  };
  
  // Maneja el estado de carga
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Maneja el caso en que el usuario no se encuentra (e.g., sin token)
  if (!usuario) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <Card className="border-destructive">
          <CardContent className="text-center py-8">
            <p className="text-destructive font-semibold">No se pudo cargar el perfil del usuario. Por favor, inicia sesión.</p>
            <Button className="mt-4" onClick={() => window.location.href = '/login'}>Ir a Iniciar Sesión</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interfaz de Usuario Principal
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Mi Perfil</h1>
        
        {/* Botones de acción */}
        {!editando ? (
          <Button onClick={() => setEditando(true)} className="shadow-md">
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex space-x-3">
            <Button onClick={handleGuardar} disabled={guardando} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button variant="outline" onClick={handleCancelar} disabled={guardando}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Avatar y Datos Básicos */}
        <div className="lg:col-span-1">
          <Card className="shadow-xl">
            <CardContent className="text-center pt-8">
              <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-primary shadow-lg">
                <AvatarImage 
                  src={editando ? datosEditados.avatar : usuario.avatar} 
                  alt={usuario.nombre} 
                  onError={(e) => console.error("❌ ERROR CARGANDO IMG:", e.currentTarget.src, e)}
                />
                <AvatarFallback className="text-3xl font-semibold bg-primary text-primary-foreground">
                  {usuario.nombre?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {editando ? (
                <div className="space-y-4">
                  <Label htmlFor="avatar-url" className="text-left block font-medium">URL del Avatar</Label>
                  <Input
                    id="avatar-url"
                    value={datosEditados.avatar || ''}
                    onChange={(e) => setDatosEditados({...datosEditados, avatar: e.target.value})}
                    placeholder="https://ejemplo.com/avatar.jpg"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{usuario.nombre}</h2>
                  {usuario.id && (
                  <div className="my-3 flex justify-center">
                      <UserRatingDisplay idUsuario={usuario.id} />
                  </div>
                      )}
                  <p className="text-md text-muted-foreground mt-1 flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {usuario.email}
                  </p>
                  {usuario.fechaRegistro && (
                    <p className="text-sm text-gray-500 mt-3 flex items-center justify-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Miembro desde {new Date(usuario.fechaRegistro).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Información Detallada y Edición */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold">
                <User className="h-5 w-5 mr-2 text-primary" />
                Detalles del Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Campos de Nombre y Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nombre */}
                <div>
                  <Label htmlFor="nombre" className="flex items-center mb-2 font-medium">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    Nombre completo
                  </Label>
                  {editando ? (
                    <Input
                      id="nombre"
                      value={datosEditados.nombre || ''}
                      onChange={(e) => setDatosEditados({...datosEditados, nombre: e.target.value})}
                    />
                  ) : (
                    <p className="p-3 bg-muted rounded-lg border">{usuario.nombre}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="flex items-center mb-2 font-medium">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    Email (No editable)
                  </Label>
                  {/* El email generalmente es fijo y se mantiene en modo visual */}
                  <p className="p-3 bg-gray-100 rounded-lg border text-gray-500">{usuario.email}</p>
                </div>
              </div>

              {/* Campos de Teléfono y Ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Teléfono */}
                <div>
                  <Label htmlFor="telefono" className="flex items-center mb-2 font-medium">
                    <Phone className="h-4 w-4 mr-2 text-green-500" />
                    Teléfono
                  </Label>
                  {editando ? (
                    <Input
                      id="telefono"
                      value={datosEditados.telefono || ''}
                      onChange={(e) => setDatosEditados({...datosEditados, telefono: e.target.value})}
                      placeholder="Número de teléfono"
                    />
                  ) : (
                    <p className="p-3 bg-muted rounded-lg border">{usuario.telefono || 'No especificado'}</p>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}