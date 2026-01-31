import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle, Trash } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface GenericDeleteConfirmationDialogProps {
    itemId: string | number; // ID del ítem a borrar 
    itemDescription: string; // Descripción del ítem para el mensaje
    onConfirm: (id: string | number) => Promise<void>; // función que ejecuta la llamada DELETE
    onSuccess: () => void; // Función para realizar una acción posterior al éxito
    disabled?: boolean; // Controla si el botón está deshabilitado
}

export function GenericDeleteConfirmationDialog({ itemId, itemDescription, onConfirm, onSuccess, disabled = false }: GenericDeleteConfirmationDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            // Ejecuta la función de borrado pasada por props, esperando su resultado
            await onConfirm(itemId);

            onSuccess();
            setIsOpen(false);
        } catch (error) {
            console.error('Error al ejecutar la función de borrado:', error);
            // error alert
            alert(`Ocurrió un error al intentar eliminar ${itemDescription}.`);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        // Controla estado abierto/cerrado del modal
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>

            {/* Botón de Disparo  */}
            <AlertDialogTrigger asChild>

                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-100"
                    disabled={isDeleting || disabled}
                >
                    <Trash className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>

            {/* Contenido del Modal */}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <AlertDialogTitle className="text-xl font-bold text-gray-800">
                            {t('genericDialogs.delete.title')}
                        </AlertDialogTitle>
                    </div>

                    <AlertDialogDescription>

                        {itemDescription}
                        <br />
                        {t('genericDialogs.delete.message')}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    {/* Cancelar */}
                    <AlertDialogCancel className="hover:bg-sky-50 text-gray-700">
                        {t('genericDialogs.delete.cancel')}
                    </AlertDialogCancel>

                    {/* Confirmar */}
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 font-semibold text-white transition-colors"
                    >
                        {isDeleting ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('common.deleting')}</>
                        ) : (
                            <><Trash2 className="w-4 h-4 mr-2" /> {t('genericDialogs.delete.confirmAction')}</>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}