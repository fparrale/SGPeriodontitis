import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { useTranslation } from "react-i18next";

interface ConfirmStartgameProps {
    onConfirm: () => void;

}

export const  ConfirmStartgame = ({ onConfirm }: ConfirmStartgameProps) => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-extrabold text-gray-800 tracking-wider">
                    {t('game.confirmStartGame.welcome')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-gray-700">
                        {t('game.confirmStartGame.ready')}
                    </p>
                    <p className="text-gray-700">
                        {t('game.confirmStartGame.noPause')}
                    </p>
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