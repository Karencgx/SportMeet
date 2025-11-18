// 📁 src/components/RatingModal.tsx

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Star, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { calificacionesService } from '@/services/calificacionesService';


interface Evento {
    id: number;
    nombre: string;
}

// Tipo de Participante (retornado por la API del Controller)
export interface Participante {
    id_usuario: number;
    nombre_usuario: string;
    yaCalificado: boolean;
}

// Estado de la calificación de cada participante en el formulario
interface CalificacionState {
    puntaje: number;
    comentario: string; 
}

// --- Propiedades del Modal ---

interface RatingModalProps {
    eventToRate: Evento | null; 
    idCalificador: number;      
    onClose: () => void;        
    onRatedSuccess: (eventId: number) => void; 
}

/**
 * Componente Modal para calificar a los participantes de un evento finalizado.
 */
const RatingModal: React.FC<RatingModalProps> = ({ eventToRate, idCalificador, onClose, onRatedSuccess }) => {
    const { toast } = useToast();
    const [participantes, setParticipantes] = useState<Participante[]>([]);
    const [ratings, setRatings] = useState<Record<number, CalificacionState>>({}); 
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const eventId = eventToRate?.id;

    // 1. Cargar Participantes y Reiniciar Estado
    useEffect(() => {
        if (eventToRate) {
            setLoading(true);
            const fetchParticipantes = async () => {
                try {
                    // 🚨 CORRECCIÓN 1: Aseguramos que el tipo de 'data' sea Participante[]
                    // Esto asume que el servicio ya devuelve el formato correcto del backend.
                    const data: Participante[] = await calificacionesService.obtenerParticipantesParaCalificar(eventToRate.id); 
                    
                    // 1. Establecer el estado con los participantes (no se requiere mapeo)
                    setParticipantes(data);
                    
                    // 2. Inicializar el estado de ratings
                    const initialRatings: Record<number, CalificacionState> = {};
                    data.forEach(p => {
                        if (!p.yaCalificado) {
                            initialRatings[p.id_usuario] = { puntaje: 0, comentario: "" };
                        }
                    });
                    setRatings(initialRatings); 
                    
                } catch (error) {
                    console.error("Error al cargar participantes:", error); 
                    toast({
                        title: "Error de Carga",
                        description: "No se pudieron cargar los participantes del evento. Intente de nuevo.",
                        variant: "destructive"
                    });
                    onClose();
                } finally {
                    setLoading(false);
                }
            };
            fetchParticipantes();
        }
    }, [eventToRate, toast, onClose]); 

    // 2. Manejar la selección de calificación
    const handleRatingChange = (userId: number, puntaje: number) => {
        setRatings(prev => ({
            ...prev,
            [userId]: { ...prev[userId], puntaje }
        }));
    };

    // 3. Manejar el envío de calificaciones
    const handleSubmit = async () => {
        setSubmitting(true);
        let successCount = 0;
        let failCount = 0;
        
        const ratingsToSend = Object.entries(ratings).filter(([, rating]) => rating.puntaje > 0);

        if (ratingsToSend.length === 0) {
            toast({ title: "Atención", description: "Debes seleccionar al menos una calificación."});
            setSubmitting(false);
            return;
        }

        if (!eventId) return;

        // Iterar y enviar cada calificación
        for (const [id_calificado, { puntaje, comentario }] of ratingsToSend) {
            try {
                // 🚨 CORRECCIÓN 2: El modal solo pasa 4 argumentos. 
                // La función del servicio DEBE aceptar 4 argumentos.
                await calificacionesService.enviarCalificacion(
                    eventId, 
                    parseInt(id_calificado), 
                    puntaje,
                    comentario || null // Envía null si el comentario está vacío
                );
                successCount++;
            } catch (error: any) {
                console.error(`Error calificando al usuario ${id_calificado}:`, error.message);
                failCount++;
            }
        }
        
        setSubmitting(false);
        
        toast({
            title: successCount > 0 ? "¡Calificaciones Enviadas!" : "No se pudo Calificar",
            description: `${successCount} calificación(es) enviada(s). ${failCount > 0 ? `Fallaron ${failCount}.` : ''}`,
        });

        if (successCount > 0) {
            onRatedSuccess(eventId); 
            onClose();
        }
    };
    
    if (!eventToRate) return null;

    const participantesPendientes = participantes.filter(p => !p.yaCalificado);
    const isFormReady = Object.values(ratings).some(r => r.puntaje > 0);

    return (
        <Dialog open={!!eventToRate} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Calificar Participantes: {eventToRate.nombre}</DialogTitle>
                    <DialogDescription>
                        Asigna una puntuación (1 a 5 estrellas) a tus compañeros de evento.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                        <p>Cargando participantes...</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-4">
                        {participantes.length === 0 ? (
                            <p className="text-center text-muted-foreground py-10">No hay otros participantes para calificar.</p>
                        ) : (
                            participantes.map((p) => (
                                <div key={p.id_usuario} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                                        <div className="font-medium">{p.nombre_usuario}</div> 
                                        {p.yaCalificado ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Calificado
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-500">
                                                Pendiente
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <div className="flex space-x-1 mt-2 sm:mt-0">
                                        {[1, 2, 3, 4, 5].map((starValue) => {
                                            const currentRating = ratings[p.id_usuario]?.puntaje || 0; 
                                            return (
                                                <React.Fragment key={starValue}> 
                                                    <Star
                                                        className={`w-5 h-5 cursor-pointer transition-colors ${
                                                            starValue <= currentRating 
                                                                ? 'fill-yellow-500 text-yellow-500' 
                                                                : 'fill-gray-300 text-gray-400'
                                                        } ${p.yaCalificado ? 'opacity-50 pointer-events-none' : ''}`}
                                                        onClick={() => !p.yaCalificado && handleRatingChange(p.id_usuario, starValue)}
                                                    />
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                        {participantesPendientes.length > 0 && (
                            <div className="text-sm text-center text-muted-foreground pt-3">
                                Tienes {participantesPendientes.length} participante(s) pendiente(s) de calificar.
                            </div>
                        )}
                    </div>
                )}
                
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Cerrar
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!isFormReady || submitting || loading}
                    >
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {submitting ? 'Enviando...' : 'Guardar Calificaciones'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RatingModal;