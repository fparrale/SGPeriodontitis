import React from 'react';
import { Info, X } from 'lucide-react';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogHeader, 
    AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface InfoDialogProps {
    isOpen: boolean; // Control del estado desde el padre
    title: string; // Título del diálogo
    description: React.ReactNode; // Descripción o contenido a mostrar
    onClose: () => void; // Función para cerrar el diálogo
}

export function InfoDialog({ isOpen, title, description, onClose }: InfoDialogProps) {

      const hasDescription =
    typeof description === "string" ? description.trim().length > 0 : Boolean(description);

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            
            {/* Contenido del Modal */}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <AlertDialogTitle className="text-xl font-bold text-gray-800">
                            {title}
                        </AlertDialogTitle>
                    </div>
                    
                    {hasDescription && (
                        <AlertDialogDescription asChild>
                            <div className="text-gray-600">{description}</div>
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>

                {/* Botón Cerrar */}
                <AlertDialogAction 
                    onClick={onClose}
                    className="bg-blue-600 hover:bg-blue-700 font-semibold text-white transition-colors"
                >
                    <X className="w-4 h-4 mr-2" /> Cerrar
                </AlertDialogAction>
            </AlertDialogContent>
        </AlertDialog>
    );
}