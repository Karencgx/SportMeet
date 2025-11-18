// src/components/Deportes/GestionDeportes.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Plus, Loader2, AlertCircle } from 'lucide-react';
import { deportesService, type Deporte } from '@/services/deportesService';
import { useToast } from '@/hooks/use-toast';

interface GestionDeportesProps {
    isAdmin: boolean; // Propiedad necesaria para la validación
}

export default function ({ isAdmin }: GestionDeportesProps) {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
  });

  useEffect(() => {
    cargarDeportes();
  }, []);

  const cargarDeportes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deportesService.getAll();
      setDeportes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar deportes';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del deporte es obligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreando(true);
      const nuevoDeporte = await deportesService.crear({
        nombre: formData.nombre.trim(),
      });
      
      setDeportes(prev => [...prev, nuevoDeporte]);
      setFormData({ nombre: '' });
      setMostrarFormulario(false);
      
      toast({
        title: "¡Deporte creado!",
        description: `${nuevoDeporte.nombre} ha sido agregado exitosamente`,
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear deporte';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreando(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="flex items-center space-x-2 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-destructive font-medium">Error de conexión</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={cargarDeportes} className="mt-2" size="sm">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Deportes disponibles ({deportes.length})</h1>
        </div>
                {isAdmin && (
                    <Button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Deporte
                    </Button>
                )}
      </div>

      {isAdmin && mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Deporte</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Deporte *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Fútbol, Baloncesto..."
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={creando}>
                  {creando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Deporte
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deportes.map((deporte) => (
          <Card key={deporte.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{deporte.nombre}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {deportes.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay deportes registrados</p>
            <p className="text-sm text-muted-foreground">Crea el primer deporte para empezar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}