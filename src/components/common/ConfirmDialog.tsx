import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface GenericReactivateConfirmationDialogProps {
    itemId: string | number;
    itemDescription: string;
    onConfirm: (id: string | number) => Promise<void>;
    onSuccess: () => void;
}

export function GenericReactivateConfirmationDialog({
    itemId,
    itemDescription,
    onConfirm,
    onSuccess
}: GenericReactivateConfirmationDialogProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const handleConfirm = async () => {
        setIsProcessing(true);

        try {
            await onConfirm(itemId);
            onSuccess();
            setIsOpen(false);
        } catch (error) {
            console.error("Error al ejecutar la función de reactivación:", error);
            alert(t("genericDialogs.reactivate.error", "Ocurrió un error al intentar reactivar la pregunta."));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:bg-emerald-50"
                    disabled={isProcessing}
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-gray-800">
                        {t("genericDialogs.reactivate.title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("genericDialogs.reactivate.description", {
                            itemName: itemDescription
                        })}
                        <br />
                        {t("genericDialogs.reactivate.message")}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel className="hover:bg-sky-50 text-gray-700">
                        {t("genericDialogs.reactivate.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-white transition-colors"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t("common.loading")}
                            </>
                        ) : (
                            <>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                {t("genericDialogs.reactivate.confirmAction")}
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
