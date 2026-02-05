import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { useTranslation } from "react-i18next";

interface ConfirmStartgameProps {
    onConfirm: () => void;

}

export const ConfirmStartgame = ({ onConfirm }: ConfirmStartgameProps) => {
    const { t } = useTranslation();
    return (
        <Card className="w-[85vh]">
            <CardHeader>
                <CardTitle className="text-2xl font-extrabold text-gray-800 tracking-wider">
                    {t('game.confirmStartGame.welcome')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-gray-800 font-medium leading-relaxed">
                        {t('game.confirmStartGame.periodontitisInfo')}
                    </p>
                    <p className="text-gray-900 font-semibold">
                        {t('game.confirmStartGame.attentionNote')}
                    </p>
                    <div className="space-y-2 mb-1">
                        <p className="text-gray-700">
                            {t('game.confirmStartGame.ready')}
                        </p>
                        <p className="text-gray-700">
                            {t('game.confirmStartGame.noPause')}
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                    onClick={onConfirm}
                >
                    {t('game.confirmStartGame.startButton')}
                </Button>
            </CardFooter>
        </Card>
    );
}    