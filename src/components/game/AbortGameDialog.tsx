import { useState } from "react";
import { Ban, AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface AbortGameDialogProps {
  onConfirm: () => Promise<boolean>;
  onSuccess?: () => void;
  triggerComponent: React.ReactNode;
  disabled?: boolean;
}

export function AbortGameDialog({
  onConfirm,
  onSuccess,
  triggerComponent,
  disabled = false,
}: AbortGameDialogProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);

    try {
      const wasSuccessful = await onConfirm();
      if (wasSuccessful) {
        onSuccess?.();
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error al abortar la partida:", error);
      alert(t("game.abort.error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild disabled={disabled}>
        {triggerComponent}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <AlertDialogTitle className="text-xl font-bold text-gray-800">
              {t("game.abort.title")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {t("game.abort.description")}
            <br />
            {t("game.abort.message")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-sky-50 text-gray-700">
            {t("game.abort.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700 font-semibold text-white transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <Ban className="w-4 h-4 mr-2" />
                {t("game.abort.confirm")}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
