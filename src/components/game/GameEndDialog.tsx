import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Trophy, Clock, CircleStar, CircleCheck } from "lucide-react";
import { GroupStatsDialog } from "./GroupStatsDialog";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface GameEndDialogProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  totalQuestions: number;
  timeElapsed: string;
  correctAnswers: number;
  groupId?: string;
}

export const GameEndDialog = ({
  isOpen,
  onClose,
  score,
  totalQuestions,
  timeElapsed,
  correctAnswers,
  groupId,
}: GameEndDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showGroupStats, setShowGroupStats] = useState(false);

  const handleShowGroupStats = () => {
    setShowGroupStats(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              {t("game.gameEnd.title")}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 text-lg mt-2">
              {t("game.gameEnd.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Score */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleStar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">
                    {t("game.gameEnd.score")}
                  </span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{score} {t("game.gameEnd.pts", "pts.")}</span>
              </div>
            </div>

            {/* Correct Answers */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleCheck className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-700">
                    {t("game.gameEnd.correctAnswer")}
                  </span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {correctAnswers} / {totalQuestions}
                </span>
              </div>
            </div>

            {/* Time */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-700">
                    {t("game.gameEnd.totalTime")}
                  </span>
                </div>
                <span className="text-xl font-bold text-purple-600">
                  {timeElapsed}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => { navigate("/", { replace: true }); }}
              className=" bg-blue-500 hover:bg-blue-600 text-white"
            >
              {t("game.gameEnd.backToMenu")}
            </Button>
            {groupId && (
              <Button
                onClick={handleShowGroupStats}
                className=" bg-purple-500 hover:bg-purple-600 text-white"
              >
                {t("game.gameEnd.groupStats")}
              </Button>
            )}

          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GroupStatsDialog
        isOpen={showGroupStats}
        onClose={() => setShowGroupStats(false)}
        groupId={groupId || ""}
      />
    </>
  );
};
