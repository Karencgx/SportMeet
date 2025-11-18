import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock } from "lucide-react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { deportesService, type Deporte } from "@/services/deportesService";
import {
  instalacionesService,
  type Instalacion,
} from "@/services/instalacionesService";
import { eventosService, CrearEventoDTO } from '@/services/eventosService';

function obtenerUserIdDesdeToken(token: string): string | null {
  if (!token || token.split(".").length < 2) {
    console.error("⚠️ Token inválido o incompleto:", token);
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("🔍 Payload del token:", payload);
    return payload.user_id || payload.sub || payload.uid || null;
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
}

const CreateEvent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [filteredTimes, setFilteredTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("idToken");
    if (token) {
      const userId = obtenerUserIdDesdeToken(token);
      console.log("🧩 UID decodificado:", userId);
      setUid(userId);
      }
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    sport: "",
    date: "",
    time: "",
    time2: "",
    location: "",
    maxParticipants: "",
    description: "",
  });

  // Fecha mínima (hoy)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Cargar deportes al montar
  const cargarDeportes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deportesService.getAll();
      setDeportes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar deportes";
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

  useEffect(() => {
    cargarDeportes();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeporteSeleccionado = async (deporteId: string) => {
    try {
      handleInputChange("sport", deporteId);
      // traer instalaciones para el deporte seleccionado
      const data = await instalacionesService.getBySport(Number(deporteId));
      setInstalaciones(data || []);
      // resetear campos relacionados
      handleInputChange("location", "");
      handleInputChange("maxParticipants", "");
      setFilteredTimes([]);
    } catch (err) {
      console.error("Error al obtener instalaciones:", err);
      toast({
        title: "Error",
        description: "No se pudieron cargar las instalaciones para este deporte.",
        variant: "destructive",
      });
    }
  };

  // Función que consulta el backend por horas disponibles
  const fetchAvailableHours = async () => {
  if (!formData.date || !formData.location) {
    setFilteredTimes([]);
    return;
  }

  setLoadingTimes(true);
  try {
    const data = await eventosService.obtenerHorasDisponibles(
      formData.date,
      formData.location
    );
    setFilteredTimes(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error:", error);
    setFilteredTimes([]);
    toast({
      title: "Error",
      description: "No se pudieron obtener las horas disponibles.",
      variant: "destructive",
    });
  } finally {
    setLoadingTimes(false);
  }
};

  // Ejecutar fetchAvailableHours cuando cambie fecha o instalación
  useEffect(() => {
    fetchAvailableHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date, formData.location]);

  const getCapacidadMax = () => {
    const instalacionSeleccionada = instalaciones.find(
      (inst) => String(inst.id) === formData.location
    );
    return instalacionSeleccionada?.capacidad_base || 0;
  };

  const renderOpcionesCapacidad = () => {
    const capacidadMax = getCapacidadMax();

    if (!formData.location) {
      return (
        <div className="text-sm text-gray-500 px-2 py-1">
          Selecciona primero una instalación
        </div>
      );
    }

    if (capacidadMax < 2) {
      return (
        <div className="text-sm text-gray-500 px-2 py-1">Capacidad no válida</div>
      );
    }

    const opciones = Array.from({ length: capacidadMax - 1 }, (_, i) => i + 2);

    return opciones.map((num) => (
      <SelectItem key={num} value={String(num)}>
        {num}
      </SelectItem>
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("✅ handleSubmit ejecutado");

    // Validación básica
    if (
      !formData.title ||
      !formData.sport ||
      !formData.date ||
      !formData.time ||
      !formData.location ||
      !formData.maxParticipants
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }
    const payload: Omit<CrearEventoDTO, "id" | "participantes"> = {
    id_instalacion: Number(formData.location),
    id_deporte: Number(formData.sport),
    id_organizador: uid,
    titulo: formData.title,
    descripcion: formData.description,
    fecha: formData.date,
    hora: formData.time,
    hora_final: formData.time2,
    max_participantes: Number(formData.maxParticipants),
    };

    // ✅ LLAMADA A TU CONTROLADOR usando tu servicio
    console.log("Payload enviado:", payload);
    const data = eventosService.crear(payload);

    // Aquí iría la llamada para crear el evento (POST)
    toast({
      title: "¡Evento creado!",
      description: "Tu evento ha sido creado exitosamente",
    });

    navigate("/dashboard");
  };

  const handleCalcularProbabilidad = async () => {
  if (!formData.location || !formData.sport || !formData.date || !formData.time) {
    toast({
      title: "Datos incompletos",
      description: "Completa los datos básicos para calcular la probabilidad",
      variant: "destructive",
    });
    return;
  }

  const probabilidad = await eventosService.obtenerProbabilidadEvento({
    Id_instalacion: Number(formData.location),
    Id_deporte: Number(formData.sport),
    Fecha: formData.date,
    Hora: formData.time,
  });

  if (probabilidad !== null) {
    toast({
      title: "Probabilidad de éxito",
      description: `Este evento tiene una probabilidad de éxito del ${(probabilidad * 100).toFixed(1)}%.`,
    });
  } else {
    toast({
      title: "Advertencia",
      description: "No fue posible calcular la probabilidad",
      variant: "destructive",
    });
  }
  };

  function getEndTimes(startTime, allTimes) {
  if (!startTime) return [];

  const startIndex = allTimes.indexOf(startTime);
  if (startIndex === -1) return [];

  const result = [];

  for (let i = startIndex + 1; i < allTimes.length; i++) {
    const prev = allTimes[i - 1];
    const curr = allTimes[i];

    const [ph, pm] = prev.split(":").map(Number);
    const [ch, cm] = curr.split(":").map(Number);

    const prevMinutes = ph * 60 + pm;
    const currMinutes = ch * 60 + cm;

    if (currMinutes - prevMinutes === 15) {
      result.push(curr);
    } else {
      const extraMinutes = prevMinutes + 15;

      const eh = Math.floor(extraMinutes / 60);
      const em = extraMinutes % 60;

      const extraTime =
        String(eh).padStart(2, "0") + ":" + String(em).padStart(2, "0");

      result.push(extraTime);
      return result;
    }
  }

  // Validación extra: si la última hora visible llega a las 21:00,
  // extender hasta las 22:30 en franjas de 15 minutos
  const last = result[result.length - 1] || startTime;
  const [lh, lm] = last.split(":").map(Number);

  if (lh === 21 && lm === 0) {
    let total = lh * 60 + lm;

    while (true) {
      total += 15;
      const h = Math.floor(total / 60);
      const m = total % 60;

      const formatted = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
      result.push(formatted);

      if (h === 22 && m === 30) break;
    }
  }

  return result;
  }

  const formatLocalDate = (str) => {
    const [year, month, day] = str.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Crear Nuevo Evento
        </h1>
        <p className="text-sm text-muted-foreground">
          Organiza un evento deportivo y encuentra compañeros para practicar
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Detalles del Evento</CardTitle>
          <CardDescription>
            Completa la información para crear tu evento deportivo
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div className="space-y-1">
              <Label htmlFor="title">Título del Evento *</Label>
              <Input
                id="title"
                placeholder="Ej: Fútbol 5 de los viernes"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            {/* Deporte */}
            <div className="space-y-1">
              <Label htmlFor="sport">Deporte *</Label>
              <Select
                value={formData.sport}
                onValueChange={handleDeporteSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un deporte" />
                </SelectTrigger>
                <SelectContent>
                  {deportes.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha y ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div className="space-y-1">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.date
                      ? formatLocalDate(formData.date)
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <CalendarPicker
                    mode="single"
                    selected={
                      formData.date
                        ? (() => {
                            const [y, m, d] = formData.date.split("-");
                            return new Date(Number(y), Number(m) - 1, Number(d));
                          })()
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;

                    // Normalizamos a medianoche local sin UTC
                    const local = new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate()
                    );

                    const year = local.getFullYear();
                    const month = String(local.getMonth() + 1).padStart(2, "0");
                    const day = String(local.getDate()).padStart(2, "0");

                    handleInputChange("date", `${year}-${month}-${day}`);
                    console.log("Picker entrega:", date);
                    console.log("getDate():", date.getDate(), "- getUTCDate():", date.getUTCDate());
                    }}
                    disabled={(date) => {
                      const esDomingo = date.getDay() === 0;
                      const esFechaPasada = date < today;
                      return esDomingo || esFechaPasada;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

              {/* Ubicación */}
              <div className="space-y-1">
                <Label>Instalación *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => {
                    handleInputChange("location", value);
                    handleInputChange("time", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una instalación" />
                  </SelectTrigger>
                  <SelectContent>
                    {instalaciones.length > 0 ? (
                      instalaciones.map((inst) => (
                        <SelectItem key={inst.id} value={String(inst.id)}>
                          {inst.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 px-2 py-1">
                        Elige primero un deporte
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Horas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Hora inicial *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    className="pl-10 border border-input rounded-md h-10 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.time}
                    onChange={(e) => {
                      handleInputChange("time", e.target.value);
                      handleInputChange("endTime", "");
                    }}
                    disabled={loadingTimes || filteredTimes.length === 0}
                  >
                    <option value="">
                      {loadingTimes
                        ? "Cargando..."
                        : filteredTimes.length === 0
                        ? "No hay horas disponibles"
                        : "Selecciona hora inicial"}
                    </option>
                    {filteredTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Hora final *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    className="pl-10 border border-input rounded-md h-10 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.time2}
                    onChange={(e) => handleInputChange("time2", e.target.value)}
                    disabled={!formData.time}
                  >
                    <option value="">
                      {formData.time
                        ? "Selecciona hora final"
                        : "Primero elige hora inicial"}
                    </option>
                    {formData.time &&
                      getEndTimes(formData.time, filteredTimes).map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Participantes */}
            <div className="space-y-1">
              <Label>Número máximo de participantes *</Label>
              <Select
                value={formData.maxParticipants}
                onValueChange={(value) => handleInputChange("maxParticipants", value)}
                disabled={!formData.location}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un número" />
                </SelectTrigger>
                <SelectContent>{renderOpcionesCapacidad()}</SelectContent>
              </Select>
              {formData.location && getCapacidadMax() > 0 && (
                <p className="text-xs text-gray-500">
                  Capacidad máxima: {getCapacidadMax()}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Describe tu evento, nivel requerido, qué llevar, etc."
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            {/* Botones */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button
                
                onClick={handleCalcularProbabilidad}
                type="button"
                variant="secondary"
                
              >
                Calcular probabilidad
              </Button>
              <Button type="submit" className="bg-primary text-white">
                Crear Evento
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEvent;
