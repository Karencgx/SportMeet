// 📁 src/components/UserRatingDisplay.tsx

import React, { useState, useEffect } from 'react';
import { Loader2, Star } from "lucide-react";
import { calificacionesService, CalificacionPromedio } from '@/services/calificacionesService';
import { Badge } from '@/components/ui/badge'; // Asumiendo que usas shadcn/ui

interface UserRatingDisplayProps {
    idUsuario: number; // ID del usuario cuyo promedio se quiere mostrar
}

export const UserRatingDisplay: React.FC<UserRatingDisplayProps> = ({ idUsuario }) => {
    const [ratingData, setRatingData] = useState<CalificacionPromedio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRating = async () => {
            setLoading(true);
            setError(null);
            try {
                // Llama a la nueva función del servicio
                const data = await calificacionesService.getCalificacionPromedio(idUsuario);
                setRatingData(data);
            } catch (err: any) {
                setError(err.message || "No se pudo cargar el promedio.");
                setRatingData({ promedio: 0, total: 0 }); // Limpiar datos si hay error
            } finally {
                setLoading(false);
            }
        };

        if (idUsuario) {
            fetchRating();
        }
    }, [idUsuario]);

    if (loading) {
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }

    if (error) {
        return <span className="text-sm text-red-500">{error}</span>;
    }

    if (!ratingData || ratingData.total === 0) {
        return <span className="text-sm text-muted-foreground">Sin calificaciones</span>;
    }

    // ⭐ Renderizado del Promedio
    return (
        <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-lg">
                {ratingData.promedio.toFixed(1)} 
            </span>
            <Badge variant="secondary" className="text-xs">
                ({ratingData.total} votos)
            </Badge>
        </div>
    );
};

