import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Usuario } from '@/services/usuariosService'; 
import { Loader2 } from 'lucide-react';
import { UserRatingDisplay } from '../UserRatingDisplay';


// Ya no necesitamos DynamicString ni DynamicVariant aquí si usamos dynamicProps
// type DynamicString = string | ((usuario: Usuario) => string);
// type DynamicVariant = "default" | "destructive" | "outline" | ((usuario: Usuario) => "default" | "destructive" | "outline");

// 🚨 Nuevo tipo para la acción dinámica (incluye 'secondary' que es común en el diseño)
interface Action {
    label: string; 
    variant: "default" | "destructive" | "outline" | "secondary"; 
    onClick: (usuario: Usuario) => void;
    
    // 🚨 CLAVE: Función que devuelve las propiedades del botón específicas para ese usuario
    dynamicProps: (usuario: Usuario) => ({
        label: string;
        variant: "default" | "destructive" | "outline" | "secondary";
        disabled: boolean;
        hidden?: boolean; // Añadimos 'hidden' por si el botón no aplica
    });
}

// Define los props para el componente base (ajustamos la interfaz para usar el nuevo Action)
interface UserCardListProps {
  usuarios: Usuario[]; // La lista ya filtrada
  busqueda: string;
  setBusqueda: (value: string) => void;
  loading: boolean;
  error: string | null;
  
  // 🚨 Usamos la nueva interfaz Action
  actions: Action[]; 
  
  titulo: string; // Título de la lista (Usuarios o Personas)
}

export default function UserCardList({
  usuarios,
  busqueda,
  setBusqueda,
  loading,
  error,
  actions,
  titulo,
}: UserCardListProps) {
  
  if (loading) return <div>Cargando {titulo.toLowerCase()}...</div>;
  if (error) return <div>Error: {error}</div>;


return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <Users className="h-6 w-6" />
                    <h1 className="text-2xl font-bold">{titulo} ({usuarios.length})</h1>
                </div>
            </div>

            {/* 🚨 CORRECCIÓN 1: Reducir y Centrar el Contenedor del Buscador */}
            <div className="max-w-xl mx-auto"> 
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-center">Buscar {titulo.toLowerCase()}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={`Buscar por nombre o email en ${titulo}...`}
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline">Filtros</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Lista de Tarjetas */}
            {/* 🚨 CORRECCIÓN 2: Mejorar la Definición de Cuadrícula (más compacta) */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {usuarios.map((usuario) => (
    <Card
      key={usuario.uid}
      className="hover:shadow-md transition-all duration-200 border rounded-xl"
    >
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9">
           {/* 1. Usar AvatarImage si la URL de la foto existe */}
            {usuario.avatar ? (
              <AvatarImage 
                src={usuario.avatar} 
                alt={`Foto de ${usuario.nombre}`} 
                
                // Opcional: Para evitar problemas de caché, puedes usar el cache-buster
                // src={`${usuario.foto}?v=${Date.now()}`} 
              />
            ) : null}
              
            {/* 2. Usar AvatarFallback si la foto no existe o no se carga */}
            <AvatarFallback>
              {usuario.nombre
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold truncate">
              {usuario.nombre}
            </CardTitle>
            <p className="text-xs text-muted-foreground truncate">
              {usuario.email}
            </p>

            {usuario.id && (
              <div className="mt-1">
                <UserRatingDisplay idUsuario={usuario.id} />
              </div>
            )}

            <p
              className={`text-[10px] mt-1 font-medium ${
                usuario.activo === 1 ? "text-green-600" : "text-red-500"
              }`}
            >
              {usuario.activo === 1 ? "Activo" : "Inactivo"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 pt-2">
        {usuario.creado_en && (
          <p className="text-[11px] text-muted-foreground mb-2 border-t pt-2 truncate">
            Registrado:{" "}
            {new Date(usuario.creado_en).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })}
          </p>
        )}

        <div className="flex flex-col space-y-1">
          {actions.map((action) => {
            const props = action.dynamicProps(usuario);
            if (props.hidden) return null;

            return (
              <Button
                key={action.label}
                variant={props.variant}
                size="sm"
                className="w-full h-7 text-[12px]"
                disabled={props.disabled}
                onClick={() => action.onClick(usuario)}
              >
                {props.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  ))}
</div>

            {/* ... (Mensaje de no resultados sin cambios) */}

        </div>
    );
}