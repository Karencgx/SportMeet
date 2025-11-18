import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { usuariosService, Usuario } from '@/services/usuariosService';
import { useToast } from '@/hooks/use-toast';

interface CrearUsuarioProps {
  onUsuarioCreado?: (usuario: Usuario) => void;
  onCancelar?: () => void;
}

export default function CrearUsuario({ onUsuarioCreado, onCancelar }: CrearUsuarioProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Nombre y email son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const nuevoUsuario = await usuariosService.crear({
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        avatar: formData.avatar.trim() || undefined,
        uid: '',
        activo: 0
      });
      
      toast({
        title: "¡Usuario creado!",
        description: `${nuevoUsuario.nombre} ha sido registrado exitosamente`,
      });

      // Limpiar formulario
      setFormData({ nombre: '', email: '', avatar: '' });
      
      // Notificar al componente padre
      onUsuarioCreado?.(nuevoUsuario);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear usuario';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Crear Usuario</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">URL del Avatar (opcional)</Label>
            <Input
              id="avatar"
              name="avatar"
              type="url"
              value={formData.avatar}
              onChange={handleInputChange}
              placeholder="https://ejemplo.com/avatar.jpg"
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </>
              )}
            </Button>
            
            {onCancelar && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancelar}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}