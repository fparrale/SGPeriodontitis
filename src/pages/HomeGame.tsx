import { ConfirmStartgame } from "@/components/game/ConfirmStartgame";
import { GameEndDialog } from "@/components/game/GameEndDialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Game, GameStartResponse } from "@/types/gameType";

import {
  Key,
  Ban,
  Heart,
  HeartCrack,
  Lightbulb,
  Trophy,
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  Copy
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { toastCorrect, toastIncorrect } from "@/lib/gameToasts";
import { t } from "i18next";
import { API_BASE } from "@/lib/config";
import { formatMysqlMadridToUser } from "@/lib/utils";
import { AbortGameDialog } from "@/components/game/AbortGameDialog";

// Interfaces
interface QuestionOption {
  id?: string; // algunas respuestas llegan como id
  option_id?: string; // otras option_id
  text_option: string;
  is_correct: 0 | 1;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  type: "multiple_option" | "true_false" | "fill_in_the_blank";
  tip_note: string;
  created_on: string;
  feedback: string;
  lang: string;
  options: QuestionOption[];
}

type answerResponseType = {
  id: string;
  group_id: string;
  user_id: string;
  question_id: string;
  q_option_id: string;
  is_correct: number;
  started_on: string;
  finished_on: string;
  game_id: string;
  is_active: number;
};

export const HomeGame = () => {
  //show tip note state
  const [showTip, setShowTip] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [actualQuestionIndex, setActualQuestionIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  // const [score, setScore] = useState(0);
  const [showGameEndDialog, setShowGameEndDialog] = useState(false);
  //const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameData, setGameData] = useState<Game | null>(null);
  const [loadingGame, setLoadingGame] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [currentAnswerId, setCurrentAnswerId] = useState<string | null>(null);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [loadingGameData, setLoadingGameData] = useState(false);
  const [isSearchingFirstQuestion, setIsSearchingFirstQuestion] =
    useState(false);
  const [hasFoundFirstQuestion, setHasFoundFirstQuestion] = useState(false);
  const [answerResponse, setAnswerResponse] =
    useState<answerResponseType | null>(null);
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
  const [previousScore, setPreviousScore] = useState<number>(0);
  const [isAbortingGame, setIsAbortingGame] = useState(false);
  const { gameId } = useParams();
  const userSession = JSON.parse(localStorage.getItem("auth_user") || "null");

  // Refresca gameData sin bloquear la UI
  const refreshGameData = useCallback(async (): Promise<Game | null> => {
    if (!userSession || !userSession.id || !gameId) return null;
    try {
      setLoadingGameData(true);
      setLoadingUpdate(true);
      const response = await fetch(`${API_BASE}/games/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEL_ID",
          game_id: gameId,
        }),
      });

      const data = (await response.json()) as GameStartResponse;
      if (data.status === 201 || data.status === 200) {
        console.log("refreshGameData - data.data:", data.data);
        console.log("refreshGameData - lifes:", data.data.lifes);
        // incluir lifes
        const gameDataWithLifes = { ...data.data, lifes: data.data.lifes };
        setGameData(gameDataWithLifes);
        setLoadingGameData(false);
        console.log("gameData refrescado:", data.data);
        setLoadingUpdate(false);
        return gameDataWithLifes;
      }
    } catch (error) {
      console.error("No se pudo refrescar gameData:", error);
    }
    return null;
  }, [gameId, userSession]);

  const getGameCreated = useCallback(async () => {
    try {
      if (!userSession || !userSession.id) {
        toast.error("Usuario no autenticado.");
        return;
      }

      setLoadingGame(true);
      const response = await fetch(`${API_BASE}/games/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEL_ID",
          game_id: gameId,
        }),
      });

      const data = (await response.json()) as GameStartResponse;

      if (data.status === 201) {
        console.log("Data antes de setGameData:", data.data);
        console.log("lifes en data.data:", data.data.lifes);
        // Forzar inclusión de lifes con spread operator
        const gameDataWithLifes = { ...data.data, lifes: data.data.lifes };
        console.log("gameDataWithLifes:", gameDataWithLifes);
        setGameData(gameDataWithLifes);
        console.log("Después de setGameData - gameData debería tener lifes");
        setLoadingGame(false);
      } else if (data.status === 400) {
        toast.error(data.message);
        setGameData(null);
      } else if (data.status === 500) {
        toast.error("Error del servidor. Intente más tarde.");
        setGameData(null);
      }
    } catch (err) {
      console.error("Error al cargar el juego:", err);
      toast.error("Error cargar el juego.");
      setGameData(null);
    }
  }, [gameId, userSession]);

  const startGame = async () => {
    try {
      if (!userSession || !userSession.id) {
        toast.error("Usuario no autenticado.");
        return;
      }

      setLoadingUpdate(true);
      const response = await fetch(`${API_BASE}/games/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STR",
          game_id: gameId,
          user_id: userSession.id,
        }),
      });

      const data = (await response.json()) as GameStartResponse;

      if (data.status === 201) {
        // Forzar inclusión de lifes
        const gameDataWithLifes = { ...data.data, lifes: data.data.lifes };
        setGameData(gameDataWithLifes);
        toast.success("Obteniendo Preguntas");
        await fetchQuestions(data.data.group_id);
        setLoadingGame(false);
        setLoadingUpdate(false);
        console.log("Juego iniciado:", data.data);
      } else if (data.status === 400) {
        toast.error(data.message);
        setGameData(null);
      } else if (data.status === 500) {
        toast.error("Error del servidor. Intente más tarde.");
        setGameData(null);
      }
    } catch (err) {
      console.error("Error al iniciar el juego:", err);
      toast.error("Error cargar el juego.");
      setGameData(null);
    }
  };

  const abortGame = async (): Promise<boolean> => {
    if (!userSession || !userSession.id || !gameId) {
      toast.error(t("game.access.unauthenticatedUser"));
      return false;
    }

    try {
      setIsAbortingGame(true);
      const response = await fetch(`${API_BASE}/games/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "FNS",
          game_id: gameId,
          user_id: userSession.id,
        }),
      });

      const data = (await response.json()) as GameStartResponse;

      if (data.status === 200 || data.status === 201) {
        const gameDataWithLifes = { ...data.data, lifes: data.data.lifes };
        setGameData(gameDataWithLifes);

        await refreshGameData();

        setShowGameEndDialog(true);
        toast.success(t("game.abort.success"));
        return true;
      } else {
        toast.error(data.message || t("game.abort.error"));
        return false;
      }
    } catch (error) {
      console.error("Error al abortar la partida:", error);
      toast.error(t("game.abort.error"));
      return false;
    } finally {
      setIsAbortingGame(false);
    }
  };

  useEffect(() => {
    if (gameId && gameData === null) {
      getGameCreated();
    }
  }, [gameId, getGameCreated, gameData]);

  useEffect(() => {
    console.log("useEffect gameData cambió:", gameData);
    console.log("useEffect gameData.lifes:", gameData?.lifes);
  }, [gameData]);

  const fetchQuestions = async (id: string) => {
    setLoadingQuestions(true);
    try {
      const response = await fetch(`${API_BASE}/groups/${id}/questions/all`);
      const value = await response.json();
      setQuestions(value.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Error al cargar las preguntas");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Verificar si una pregunta ya fue respondida
  const checkIfQuestionAnswered = async (
    questionId: string,
  ): Promise<boolean> => {
    if (!userSession || !userSession.id || !gameData) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/questions/answer/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer_id: null,
          group_id: gameData.group_id,
          user_id: userSession.id,
          question_id: questionId,
          q_option_id: null,
          game_id: gameId,
        }),
      });

      const data = await response.json();

      if (data.status === 201 || data.status === 200) {
        setCurrentAnswerId(data.data.id);
        setAnswerResponse(data.data);
        return false; // No fue respondida
      } else if (
        data.status === 500 &&
        data.message.includes("ya respondió esta pregunta")
      ) {
        return true; // Ya fue respondida
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      console.log("Error al verificar respuesta:", err);
      return false;
    }
  };

  // Buscar la primera pregunta no respondida
  const findFirstUnansweredQuestion = async () => {
    if (!questions.length || !gameData) return;

    setIsSearchingFirstQuestion(true);

    for (let i = 0; i < questions.length; i++) {
      const isAnswered = await checkIfQuestionAnswered(questions[i].id);

      if (!isAnswered) {
        // Encontramos la primera pregunta no respondida
        setActualQuestionIndex(i);
        setIsSearchingFirstQuestion(false);
        setHasFoundFirstQuestion(true);
        return;
      }
    }

    // todas las preguntas fueron respondidas
    setIsSearchingFirstQuestion(false);
    setHasFoundFirstQuestion(true);
    // No abrimos el modal aquí, se espera que finished_on venga del backend
  };

  // Finalizar respuesta con la opción seleccionada
  const finalizeAnswer = async (optionId: string): Promise<boolean> => {
    if (!userSession || !userSession.id || !gameData || !currentAnswerId) {
      toast.error("Error: No hay respuesta activa.");
      return false;
    }



    const datatosend = {
      answer_id: currentAnswerId,
      group_id: gameData.group_id,
      user_id: userSession.id,
      question_id: questions[actualQuestionIndex].id,
      q_option_id: optionId,
      game_id: gameData.id,
    };

    console.log("Datos a enviar para finalizar respuesta:", datatosend);
    try {
      setLoadingUpdate(true);
      const response = await fetch(`${API_BASE}/questions/answer/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer_id: currentAnswerId,
          group_id: gameData.group_id,
          user_id: userSession.id,
          question_id: questions[actualQuestionIndex].id,
          q_option_id: optionId,
          game_id: gameId,
        }),
      });

      const data = await response.json();

      if (data.status === 201 || data.status === 200) {
        const isCorrect = data.data.is_correct === 1;

        // Actualizar answerResponse con la respuesta actual
        setAnswerResponse(data.data);

        if (isCorrect) {
          //setScore(prev => prev + 100);
          //setCorrectAnswers(prev => prev + 1);
          toastCorrect();
        } else {
          toastIncorrect();
        }

        // permitir continuar después de guardar, sin importar si fue correcta.
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (err) {
      console.error("Error al finalizar respuesta:", err);
      toast.error("Error al guardar la respuesta.");
      return false;
    } finally {
      setLoadingUpdate(false);
    }
  };

  // Buscar primera pregunta no respondida al cargar (solo una vez)
  useEffect(() => {
    if (
      questions.length > 0 &&
      !loadingQuestions &&
      gameData &&
      !isSearchingFirstQuestion &&
      !hasFoundFirstQuestion &&
      actualQuestionIndex === 0 // Solo buscar si estamos al inicio
    ) {
      findFirstUnansweredQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length, loadingQuestions, gameData, hasFoundFirstQuestion]);


  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Función para generar corazones: 3 totales
  const renderHearts = (lifes: number) => {
    console.log(
      "renderHearts llamado con lifes:",
      lifes,
      "gameData:",
      gameData,
    );
    const heartsComponent = [];
    const totalLives = 3;

    for (let i = 0; i < totalLives; i++) {
      if (i < lifes) {
        heartsComponent.push(
          <Heart key={i} className="w-4 h-4 text-red-500 inline-block" />,
        );
      } else {
        heartsComponent.push(
          <HeartCrack key={i} className="w-4 h-4 text-gray-400 inline-block" />,
        );
      }
    }
    return heartsComponent;
  };



  useEffect(() => {
    if (
      !gameData ||
      !gameData.started_on ||
      showGameEndDialog ||
      gameData.finished_on !== null
    ) {
      return;
    }
    const interval = setInterval(() => {
      const startedOn = formatMysqlMadridToUser(gameData.started_on);
      console.log("data game:", startedOn);

      const elapsedSeconds = Math.floor(
        (Date.now() - startedOn.getTime()) / 1000,
      );
      setSeconds(elapsedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameData, showGameEndDialog]);

  useEffect(() => {
    if (gameData && gameData.finished_on !== null) {
      // Delay para permitir que se muestren los toasts antes de abrir el modal

      setShowGameEndDialog(true);
    }
  }, [gameData]);

  const getSecondsBetween = (start: string, end: string): number => {
    if (!start || !end) return 0;

    const startDate = formatMysqlMadridToUser(start);
    const endDate = formatMysqlMadridToUser(end);

    return Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  };

  function copyGroupCodeToClipboard(code: string) {
    toast.success(t("game.copySuccess"));
    return navigator.clipboard.writeText(code);
  }

  if (loadingGame || isSearchingFirstQuestion) {
    return (
      <div className="flex   items-center justify-center h-full w-full">
        <p className="text-gray-600">
          {isSearchingFirstQuestion
            ? "Preparando preguntas..."
            : "Cargando juego..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full w-full">
      {loadingQuestions ? (
        <ConfirmStartgame onConfirm={startGame} />
      ) : (
        <Card className="w-[70%] shadow-2xl border-t-4 border-sky-300">
          {/* encabezado del card */}
          <CardHeader className="space-y-1 text-center bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 p-6 rounded-t-lg border-b-2 border-sky-200">
            <CardTitle className="text-3xl font-black tracking-wide w-full">
              <div className="flex flex-col items-center gap-1">
                <span className="bg-gradient-to-r from-sky-500 via-blue-400 to-sky-500 bg-clip-text text-transparent drop-shadow-sm leading-[1.15] pb-1">
                  🦷 Gum Understanding Mission
                </span>
                {gameData?.code && (
                  <button
                    type="button"
                    onClick={() => copyGroupCodeToClipboard(gameData.code)}
                    className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/40 px-3 py-1 text-[11px] text-sky-700 hover:bg-white/70"
                    aria-label="Copy group code"
                    title={t("game.copy")}
                  >
                    <span className="uppercase tracking-widest text-blue-400">
                      {t("game.group")}
                    </span>
                    <span className="font-mono font-semibold tracking-wider text-sky-900">
                      {gameData.code}
                    </span>
                    <Copy className="h-3 w-3 text-sky-700 cursor-pointer" />
                  </button>
                )}
              </div>
            </CardTitle>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 mt-3">
              <div className="flex items-center justify-between rounded-md border border-sky-100 bg-white/60 px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                    {t("game.questionNumber")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-sky-900">
                  {actualQuestionIndex + 1}/{questions.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-md border border-sky-100 bg-white/60 px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                    {t("game.score")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-sky-900">
                  {gameData?.grade ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-md border border-sky-100 bg-white/60 px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                    {t("game.lives")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-sky-900">
                  {renderHearts(gameData?.lifes ?? 0)}
                  <span className="ml-1 text-xs text-sky-700">
                    ({gameData?.lifes ?? 0})
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between rounded-md border border-sky-100 bg-white/60 px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                    {t("game.time")}
                  </span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-sky-900">
                  {formatTime(seconds)}
                </span>
              </div>
            </div>
          </CardHeader>
          {questions.length > 0 && !loadingQuestions && (
            <>
              {/* 2. Contenido Principal (Formulario Estructurado) */}
              <CardContent className="">
                <div className="mt-4">
                  {loadingGameData || loadingNextQuestion ? (
                    //crear a loding spiner
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                    </div>
                  ) : (

                    <>

                      <div className="font-bold mb-4 text-lg">
                        {questions[actualQuestionIndex].description}
                      </div>

                      <div className="grid gap-2 grid-cols-2">
                        {questions[actualQuestionIndex].options.map(
                          (option, index) => {
                            const isSelected = selectedAnswer === option.text_option;
                            const isCorrectOption = option.is_correct === 1;
                            const showIconFeedback = showContinueButton && answerResponse;
                            const userWasCorrect = answerResponse?.is_correct === 1;

                            // estilo de fondo de las opciones segun la retroalimentación
                            let bgColor = "bg-blue-100";
                            if (showIconFeedback) {
                              if (isSelected && userWasCorrect) {
                                bgColor = "bg-blue-100 border-2 border-blue-300";
                              } else if (isSelected && !userWasCorrect) {
                                bgColor = "bg-blue-100";
                              } else if (isCorrectOption && !userWasCorrect) {
                                bgColor = "bg-blue-100";
                              }
                            }

                            return (
                              <div
                                key={index}
                                className={`flex p-3 rounded-lg items-center mb-1 cursor-pointer justify-between space-x-2 w-full ${bgColor}`}
                              >
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id={`option-${index}`}
                                    disabled={showContinueButton}
                                    name="question1"
                                    value={option.text_option}
                                    checked={isSelected}
                                    onChange={() =>
                                      setSelectedAnswer(option.text_option)
                                    }
                                    className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 focus:ring-sky-500"
                                  />
                                  <label
                                    htmlFor={`option-${index}`}
                                    className="text-sm font-medium text-gray-900"
                                  >
                                    {option.text_option}
                                  </label>
                                </div>
                                {showIconFeedback && (
                                  <div className="flex-shrink-0">
                                    {isSelected && userWasCorrect && (
                                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    )}
                                    {isSelected && !userWasCorrect && (
                                      <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    {!isSelected && isCorrectOption && !userWasCorrect && (
                                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>

                      {showContinueButton && answerResponse && (
                        <div
                          className={`mt-4 p-4 rounded-lg shadow-sm border-l-4 ${answerResponse.is_correct === 1
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-500"
                            : "bg-gradient-to-r from-orange-50 to-amber-50 border-yellow-500"
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <Lightbulb
                                className={`w-5 h-5 ${answerResponse.is_correct === 1
                                  ? "text-emerald-600"
                                  : "text-yellow-600"
                                  }`}
                              />
                            </div>
                            <div>
                              <p
                                className={`text-sm font-semibold mb-1 ${answerResponse.is_correct === 1
                                  ? "text-emerald-800"
                                  : "text-yellow-800"
                                  }`}
                              >
                                {answerResponse.is_correct === 1
                                  ? t("toasts.correctAnswer")
                                  : t("toasts.incorrectAnswer")}
                                {answerResponse.is_correct === 1 && gameData && (
                                  <span className="ml-2 font-bold text-emerald-600">
                                    +{gameData.grade - previousScore} {t("game.points")}
                                  </span>
                                )}
                              </p>
                              <p
                                className={`text-sm leading-relaxed ${answerResponse.is_correct === 1
                                  ? "text-emerald-700"
                                  : "text-yellow-700"
                                  }`}
                              >
                                {questions[actualQuestionIndex].feedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>

                  )

                  }
                </div>
                <div className="flex justify-between w-full mt-4">
                  <div className="flex justify-center items-center gap-2">
                    <AbortGameDialog
                      onConfirm={abortGame}
                      triggerComponent={
                        <Button
                          className="w-fit bg-transparent hover:bg-red-100 text-black cursor-pointer"
                          disabled={
                            isAbortingGame ||
                            loadingUpdate ||
                            gameData?.finished_on !== null
                          }
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      }
                      disabled={
                        isAbortingGame ||
                        loadingUpdate ||
                        gameData?.finished_on !== null
                      }
                    />
                    <Button
                      onClick={() => setShowTip(!showTip)}
                      className={`w-fit bg-transparent hover:bg-yellow-100 text-black cursor-pointer ${showTip
                        ? "ring-1 ring-offset-1 ring-yellow-300 bg-yellow-100"
                        : ""
                        }`}
                    >
                      <Key className="w-4 h-4 " />
                    </Button>
                    {showTip && (
                      <div className="flex justify-center items-center gap-2 text-blue-700">
                        <p className="text-sm leading-relaxed">
                          <span className="font-semibold text-blue-600">{t("game.tip")}: </span>
                          {questions[actualQuestionIndex].tip_note}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {gameData?.finished_on !== null && (
                      <Button
                        className="w-fit bg-purple-400 hover:bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          setShowGameEndDialog(true);
                        }}
                      >
                        {t("game.results")}
                      </Button>
                    )}

                    <Button
                      disabled={
                        (selectedAnswer === "" && !showContinueButton) ||
                        loadingUpdate ||
                        gameData?.finished_on !== null
                      }
                      className="w-fit bg-blue-400 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={async () => {
                        if (showContinueButton) {
                          setLoadingNextQuestion(true);
                          // Modo "Continuar" - Avanzar a la siguiente pregunta
                          setSelectedAnswer("");
                          setShowTip(false);
                          setCurrentAnswerId(null);
                          setShowContinueButton(false);
                          setAnswerResponse(null);
                          setPreviousScore(0);

                          // Refrescar gameData para traer vidas/puntaje actualizado


                          // El modal se abrirá automáticamente si finished_on !== null (vía useEffect)
                          // Si el juego no ha terminado, buscar siguiente pregunta
                          if (!gameData?.finished_on) {
                            // Buscar siguiente pregunta no respondida
                            let nextIndex = actualQuestionIndex + 1;
                            let foundNext = false;

                            while (nextIndex < questions.length && !foundNext) {
                              const isAnswered = await checkIfQuestionAnswered(
                                questions[nextIndex].id,
                              );
                              if (!isAnswered) {
                                setActualQuestionIndex(nextIndex);
                                foundNext = true;
                              } else {
                                nextIndex++;
                              }
                            }
                            await refreshGameData();
                          }
                          setLoadingNextQuestion(false);
                        } else {
                          // Modo "Responder" - Enviar respuesta
                          console.log(
                            "Respuesta seleccionada:",
                            questions[actualQuestionIndex],
                          );
                          const selectedOption = questions[
                            actualQuestionIndex
                          ].options.find(
                            (opt) => opt.text_option === selectedAnswer,
                          );
                          console.log("Opción seleccionada:", selectedOption);

                          if (!selectedOption) {
                            toast.error("Error: opción no encontrada");
                            return;
                          }

                          const optionId =
                            selectedOption.id ?? selectedOption.option_id;
                          if (!optionId) {
                            toast.error("Error: id de opción no encontrado");
                            return;
                          }

                          // guardar puntaje actual antes de enviar la respuesta
                          setPreviousScore(gameData?.grade ?? 0);

                          // Finalizar la respuesta en BD
                          const success = await finalizeAnswer(optionId);

                          // Refrescar gameData para tener puntaje/vidas actualizado
                          await refreshGameData();

                          // Si se guardó (sin importar si fue correcta), mostrar "Continuar"
                          if (success) {
                            setShowContinueButton(true);
                          }
                        }
                      }}
                    >
                      {loadingUpdate
                        ? t("game.saving")
                        : showContinueButton
                          ? t("game.continue")
                          : t("game.respond")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}
      <GameEndDialog
        isOpen={showGameEndDialog}
        onClose={() => setShowGameEndDialog(false)}
        score={gameData?.grade || 0}
        totalQuestions={gameData?.total_questions || 0}
        timeElapsed={formatTime(
          getSecondsBetween(
            gameData?.started_on || "",
            gameData?.finished_on || "",
          ),
        )}
        correctAnswers={gameData?.total_answered || 0}
        groupId={gameData?.group_id}
      />
    </div>
  );
};
