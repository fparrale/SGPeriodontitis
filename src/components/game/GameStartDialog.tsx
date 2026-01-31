import { useState } from "react";
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"


// Propiedades del componente
interface GameStartDialogProps {
    groupName: string;
    groupCode: string;
    isLoading?: boolean;

    onConfirm: () => Promise<void>; // ejecuta la llamada DELETE
    onSuccess: () => void; // recargar la lista o realizar una acción posterior al éxito
    triggerComponent: React.ReactNode; //elemento que abre el modal
}

export const GameStartDialog = ({ groupName, groupCode, isLoading, onConfirm, onSuccess, triggerComponent }: GameStartDialogProps) => {

    const [isOpen, setIsOpen] = useState(false);
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        onSuccess();

    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange} >
            <DialogTrigger asChild>{triggerComponent}</DialogTrigger>

            <DialogContent className="sm:max-w-[450px]" >
                {isLoading ? (
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2 my-5 justify-center">
                            Cargando..
                        </DialogTitle>

                    </DialogHeader>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                Iniciar Juego {groupCode}
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                ¿Estás seguro de que deseas iniciar el juego {groupName}?
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="pt-4">
                            <Button onClick={onConfirm} className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                                Iniciar
                            </Button>
                        </DialogFooter>

                    </>

                )}

            </DialogContent>

        </Dialog>

    )
}