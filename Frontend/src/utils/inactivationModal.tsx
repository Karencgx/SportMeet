// 📁 InactivationModal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Asegúrate de que esta ruta sea correcta
// Asegúrate de que los imports de Dialog y RadioGroup sean correctos según shadcn/ui o tu librería
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; 
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// --- 1. Definición de Tipos ---

export type InactivationPeriod = '3_DAYS' | '7_DAYS' | 'INDEFINITE';

const PERIOD_LABELS: Record<InactivationPeriod, string> = {
    '3_DAYS': '3 días',
    '7_DAYS': '7 días',
    'INDEFINITE': 'Indeterminado',
};

interface InactivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string; // He cambiado a string, ya que tu backend usa UID (string) para toggleStatus
    onConfirmInactivation: (id: string, period: InactivationPeriod) => Promise<void>;
}

// --- 2. Componente de Modal (Functional Component) ---

export const InactivationModal: React.FC<InactivationModalProps> = ({
    isOpen,
    onClose,
    itemId,
    onConfirmInactivation,
}) => {
    // Estado para guardar el período seleccionado por el usuario
    const [selectedPeriod, setSelectedPeriod] = useState<InactivationPeriod>('7_DAYS'); // Default: 7 días
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            // Llama a la función de confirmación que contiene la lógica de la API
            await onConfirmInactivation(itemId, selectedPeriod); 
        } catch (error) {
            console.error("Fallo en la inactivación:", error);
            // Manejar error si es necesario
        } finally {
            setIsLoading(false);
            onClose(); // Cierra el modal después de la acción (éxito o fallo)
        }
    };

    // La función DEBE DEVOLVER JSX (el paréntesis inicial es clave)
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirmar Inactivación</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="mb-4 text-sm text-muted-foreground">
                        ¿Por cuánto tiempo deseas inactivar el usuario?
                    </p>
                    
                    <RadioGroup 
                        // El value debe ser un string (que es el tipo InactivationPeriod)
                        value={selectedPeriod} 
                        // El handler debe tomar el string del RadioGroupItem
                        onValueChange={(value: string) => setSelectedPeriod(value as InactivationPeriod)}
                        className="space-y-2"
                        disabled={isLoading}
                    >
                        {(Object.keys(PERIOD_LABELS) as InactivationPeriod[]).map((period) => (
                            <div key={period} className="flex items-center space-x-2">
                                {/* Aseguramos que el valor y el id sean correctos */}
                                <RadioGroupItem value={period} id={`period-${period}`} />
                                <Label htmlFor={`period-${period}`}>{PERIOD_LABELS[period]}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? 'Inactivando...' : 'Confirmar Inactivación'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};