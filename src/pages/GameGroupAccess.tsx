import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GameStartResponse } from "@/types/gameType";
import type { Group, GroupByCodeResponse } from "@/types/groupType";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trans, useTranslation } from "react-i18next";
import { API_BASE } from "@/lib/config";


export const GameGroupAccess = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loadingGroup, setLoadingGroup] = useState(false);
  //const [error, setError] = useState<string | null>(null);
  //const [userName, setUserName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [groupData, setGroupData] = useState<Group | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loadingGame, setLoadingGame] = useState(false);

  const getGroupQuestions = async () => {
    try {
      setLoadingGroup(true);
      const response = await fetch(
        `${API_BASE}/groups/code/${gameCode}`
      );
      const data = await response.json() as GroupByCodeResponse;

      if (data.status === 200) {
        setGroupData(data.data);
        setIsModalOpen(true);
        setLoadingGroup(false);
      } else if (data.status === 400) {
        toast.error(data.message); // Mostrar el mensaje al usuario
        setGroupData(null);
        setLoadingGroup(false);
      } else if (data.status === 500) {
        toast.error(t('game.access.serverError'));
        setGroupData(null);
        setLoadingGroup(false);
      }

    } catch (err) {
      toast.error(t('game.access.errorLoadingGroup'));
      setGroupData(null);
      setLoadingGroup(false);

    }
  };

  const createGameSession = async () => {
    try {
      const userSession = JSON.parse(localStorage.getItem('auth_user') || 'null'); // Obtener user_id desde local storage

      if (!userSession || !userSession.id) {
        toast.error(t('game.access.unauthenticatedUser'));
        return;
      }

      setLoadingGroup(true);
      const response = await fetch(
        `${API_BASE}/games/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          action: 'INS',
          user_id: userSession.id, // get from local storage
          group_id: groupData?.code,
          grade: 0

        }),
      }
      );
      const data = await response.json() as GameStartResponse;

      if (data.status === 200 || data.status === 201) {

        toast.success(t('game.access.redirect'));
        setLoadingGame(false);
        navigate(`/game/${data.data.id}`);

      } else if (data.status === 400) {

        toast.error(data.message); // Mostrar el mensaje al usuario

        setLoadingGame(false);
      } else if (data.status === 500) {
        toast.error(t('game.access.serverError'));
        setLoadingGame(false);
      } else if (data.status === 409) {
        const errorMessage = data.message.includes(':') ? data.message.split(':')[1].trim() : data.message;
        toast.error(errorMessage);
        setLoadingGame(false);
      }

    } catch (err) {
      toast.error(t('game.access.errorLoading'));
      setLoadingGame(false);
    }

  };


  return (
    <div className="flex items-center justify-center h-full w-full">
      <Card className="min-w-[30%] shadow-2xl border-t-4 border-sky-300">
        {/* Encabezado de la Card  */}
        <CardHeader className="space-y-1 text-center bg-blue-50 p-6 rounded-t-lg">
          <CardTitle className="text-2xl font-extrabold text-gray-800 ">
            {t('game.access.title')}
          </CardTitle>

        </CardHeader>
        <CardContent className="p-6">
          {/* 2. Contenido de la Card - Pregunta y Opciones */}
          <div className="space-y-6">
            {/* <Label htmlFor="gameUsername">{t('game.access.userNameLabel')}</Label>
            <Input
              id="gameUsername"
              type="text"
              maxLength={40}
              placeholder={t('game.access.userNamePlaceholder')}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            /> */}
            <Label htmlFor="gameCode">{t('game.access.gameCodeLabel')}</Label>
            <Input
              id="gameCode"
              type="text"
              maxLength={6}
              placeholder={t('game.access.gameCodePlaceholder')}
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
            />

          </div>
          <Button
            className="w-full mt-6 bg-sky-500 hover:bg-sky-600 text-white"
            onClick={getGroupQuestions}
            disabled={loadingGroup || gameCode.length !== 6}
          >
            {loadingGroup ? t('game.access.loading') : t('game.access.accessButton')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} >
        <DialogContent className="sm:max-w-[450px]" >

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {t('game.found.title')}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              <Trans
                i18nKey="game.found.message"
                values={{ code: groupData?.code, name: groupData?.name }}
                components={{ b: <b /> }}
              />
              {/* ¿Estás seguro de que deseas iniciar el juego <b>"#{groupData?.code}"</b> como <b>"{userName}"</b>? */}

            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button
              className="w-full bg-sky-500 hover:bg-sky-600 text-white"
              onClick={createGameSession}
              disabled={loadingGame}
            >
              {loadingGame ? t('game.access.loading') : t('game.found.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
}