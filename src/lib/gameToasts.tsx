import { t } from "i18next";
import { Trophy, HeartCrack } from "lucide-react";
import { toast as sonnerToast } from "sonner";

// Toast personalizado para respuesta correcta
export const toastCorrect = (message?: string) => {
    const messages = [
        t("toasts.correctMessages.0"),
        t("toasts.correctMessages.1"),
        t("toasts.correctMessages.2"),
        t("toasts.correctMessages.3"),
        t("toasts.correctMessages.4"),
        t("toasts.correctMessages.5"),
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const finalMessage = message || randomMessage;

    return sonnerToast.custom(
        () => (
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border-2 border-green-300 animate-in slide-in-from-top-5 duration-300">
                <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 animate-bounce" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-lg">{finalMessage}</p>
                    <p className="text-sm text-green-100">{t("toasts.correctAnswer")}</p>
                </div>
            </div>
        ),
        {
            duration: 2500,
            position: "top-center",
        }
    );
};

// Toast personalizado para respuesta incorrecta
export const toastIncorrect = (message?: string) => {
    const messages = [
        t("toasts.incorrectMessages.0"),
        t("toasts.incorrectMessages.1"),
        t("toasts.incorrectMessages.2"),
        t("toasts.incorrectMessages.3"),
        t("toasts.incorrectMessages.4"),
        t("toasts.incorrectMessages.5"),
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const finalMessage = message || randomMessage;

    return sonnerToast.custom(
        () => (
            <div className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-xl shadow-2xl border-2 border-red-300 animate-in slide-in-from-top-5 duration-300">
                <div className="flex items-center gap-2">
                    <HeartCrack className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-lg">{finalMessage}</p>
                    <p className="text-sm text-red-100">{t("toasts.incorrectAnswer")}</p>
                </div>
            </div>
        ),
        {
            duration: 2500,
            position: "top-center",
        }
    );
};
