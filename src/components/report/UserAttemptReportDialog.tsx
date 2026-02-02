import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Loader2, CheckCircle2, XCircle, Clock, Trophy, Target, Heart, Users, Hash, Calendar, User, FileText, List } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { UserAttemptReportPdf } from "./UserAttemptReportPdf";
import { API_BASE } from "@/lib/config";
import { formatMysqlMadridToUser } from "@/lib/utils";


interface QuestionDetail {
    answer_id: string;
    question_id: string;
    title: string;
    description: string;
    tip_note: string;
    feedback: string;
    is_correct: number;
    started_on: string;
    finished_on: string;
    time_spent_sec: number;
    selected_option_id: string;
    correct_option_id: string;
    correct_option_text: string;
    options: {
        id: string;
        text: string;
        is_correct: number;
    }[];
}

interface GameReportSummary {
    id: string;
    user_id: string;
    username: string | null;
    group_id: string;
    question_quantity: number;
    correct_answers: number;
    wrong_answers: number;
    lives_number: number;
    score: number;
    total_time: number;
    status: string;
    created_on: string;
    updated_on: string;
    deleted_on: string | null;
    name: string | null;
    game_id: string;
    group_name: string;
    group_code: string;
    user_name: string;
    game_started_on: string;
    game_finished_on: string;
}

interface GameReportData {
    summary: GameReportSummary;
    questions: QuestionDetail[];
}

interface UserAttemptReportDialogProps {
    groupId: string;
    userId: string;
    gameId: string;
    triggerComponent: React.ReactNode;
}

export function UserAttemptReportDialog({ groupId, userId, gameId, triggerComponent }: UserAttemptReportDialogProps) {
    const { t } = useTranslation();
    const [reportData, setReportData] = useState<GameReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            const API_URL = `${API_BASE}/stats/game/group/${groupId}/user/${userId}/game/${gameId}/report`;
            const response = await fetch(API_URL, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Error fetching report: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.status === 200 && result.data) {
                setReportData(result.data);
            } else {
                toast.error(result.message || t('report.userAttempt.loadError'));
            }
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error(t('report.userAttempt.loadError'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchReportData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) setReportData(null);
    }, [isOpen]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return 'N/A';
        const date = new Date(formatMysqlMadridToUser(dateString));
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{triggerComponent}</DialogTrigger>

            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-end justify-between gap-2">
                    <div className="flex-1">
                        <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">

                            {t('report.userAttempt.title')}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 mt-1">
                            {t('report.userAttempt.description')}
                        </DialogDescription>
                    </div>
                    {reportData && (
                        <PDFDownloadLink
                            document={<UserAttemptReportPdf data={{
                                ...reportData,
                                summary: {
                                    ...reportData.summary,
                                    game_started_on: formatMysqlMadridToUser(reportData.summary.game_started_on).toISOString(),
                                    game_finished_on: formatMysqlMadridToUser(reportData.summary.game_finished_on).toISOString(),
                                }
                            }} />}
                            fileName={`game_report_${reportData.summary.user_name}_${reportData.summary.group_code}_${reportData.summary.game_id}.pdf`}
                        >
                            {({ loading }) => (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 flex-shrink-0"
                                    disabled={loading}
                                >
                                    <FileText className="w-4 h-4" />
                                    {loading ? t("report.userAttempt.downloadingPdf") : t("report.userAttempt.downloadPdf")}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    )}
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                        <span className="ml-2 text-gray-600">{t('report.userAttempt.loading')}</span>
                    </div>
                ) : reportData ? (
                    <div className="space-y-6">
                        {/* Resumen de la Partida */}
                        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-6 border border-sky-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-sky-600" />
                                {t('report.userAttempt.summary')}
                            </h3>

                            <div className="space-y-6">
                                {/* Información General */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">{t('report.userAttempt.generalInfo')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">{t('report.userAttempt.username')}</p>
                                                <p className="text-base font-bold text-gray-800">{reportData.summary.user_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-sky-600" />
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">{t('report.userAttempt.group')}</p>
                                                <p className="text-base font-semibold text-gray-800">{reportData.summary.group_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Hash className="w-5 h-5 text-sky-600" />
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">{t('report.userAttempt.groupCode')}</p>
                                                <p className="text-base font-semibold text-gray-800">{reportData.summary.group_code}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Resultados */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">{t('report.userAttempt.results')}</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Trophy className="w-5 h-5 text-yellow-600" />
                                            <div>
                                                <p className="text-xs text-gray-600 font-medium">{t('report.userAttempt.score')}</p>
                                                <p className="text-lg font-bold text-gray-800">{reportData.summary.score} pts</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-xs text-gray-600 font-medium">{t('report.userAttempt.correct')}</p>
                                                <p className="text-lg font-bold text-green-700">{reportData.summary.correct_answers}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <XCircle className="w-5 h-5 text-red-600" />
                                            <div>
                                                <p className="text-xs text-gray-600 font-medium">{t('report.userAttempt.incorrect')}</p>
                                                <p className="text-lg font-bold text-red-700">{reportData.summary.wrong_answers}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Heart className="w-5 h-5 text-pink-600" />
                                            <div>
                                                <p className="text-xs text-gray-600 font-medium">{t('report.userAttempt.lives')}</p>
                                                <p className="text-lg font-bold text-pink-700">{reportData.summary.lives_number}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Tiempos */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">{t('report.userAttempt.timeSection')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">{t('report.userAttempt.duration')}</p>
                                                <p className="text-base font-bold text-gray-800">{formatTime(reportData.summary.total_time)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-indigo-600" />
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">{t('report.userAttempt.started')}</p>
                                                <p className="text-base font-semibold text-gray-800">{formatDateTime(reportData.summary.game_started_on)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-indigo-600" />
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">{t('report.userAttempt.finished')}</p>
                                                <p className="text-base font-semibold text-gray-800">{formatDateTime(reportData.summary.game_finished_on)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Detalle de Preguntas */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <List className="w-5 h-5 text-sky-600" />
                                {t('report.userAttempt.questionDetail')}
                            </h3>

                            <div className="space-y-6">
                                {reportData.questions.map((question, index) => (
                                    <div key={question.answer_id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                                        {/* Header de la Pregunta */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={`text-xs ${question.is_correct
                                                        ? "bg-green-600 text-white hover:bg-green-700"
                                                        : "bg-destructive text-white hover:bg-red-700"
                                                        }`}
                                                    >
                                                        {question.is_correct ? (
                                                            <>
                                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                {t('report.userAttempt.badgeCorrect')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-3 h-3 mr-1" />
                                                                {t('report.userAttempt.badgeIncorrect')}
                                                            </>
                                                        )}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1" title={t('report.userAttempt.responseTimeTooltip')}>
                                                        <Clock className="w-3 h-3" />
                                                        {formatTime(question.time_spent_sec)}
                                                    </span>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-800">
                                                    {index + 1}. {question.description}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">{question.title}</p>
                                            </div>
                                        </div>

                                        {/* Opciones de Respuesta */}
                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm font-semibold text-gray-700">{t('report.userAttempt.optionsLabel')}</p>
                                            {question.options.map((option) => {
                                                const isUserSelection = option.id === question.selected_option_id;
                                                const isCorrectOption = option.is_correct === 1;

                                                return (
                                                    <div
                                                        key={option.id}
                                                        className={`flex items-start gap-2 p-3 rounded-md border ${isUserSelection && isCorrectOption
                                                            ? 'bg-green-50 border-green-300'
                                                            : isUserSelection && !isCorrectOption
                                                                ? 'bg-red-50 border-red-300'
                                                                : 'bg-gray-50 border-gray-200'
                                                            }`}
                                                    >
                                                        {isUserSelection && isCorrectOption && (
                                                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                        )}
                                                        {isUserSelection && !isCorrectOption && (
                                                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                        )}
                                                        {!isUserSelection && (
                                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                                                        )}
                                                        <p className="text-sm text-gray-700 flex-1">{option.text}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Respuesta Correcta (se muestra si la del usuario fue incorrecta) */}
                                        {!question.is_correct && (
                                            <div className="mb-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-4 shadow-sm">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-green-600 text-lg">ℹ</span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-green-800">
                                                            {t('report.userAttempt.correctAnswerInfo')}
                                                        </p>
                                                        <p className="text-sm text-green-700 mt-1">
                                                            {question.correct_option_text}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4 shadow-sm">
                                            <div className="flex items-start gap-2">
                                                <span className="text-blue-600 text-lg">💡</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-800">
                                                        {t('report.userAttempt.feedback')}
                                                    </p>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        {question.feedback}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-600">
                        {t('report.userAttempt.noData')}
                    </div>
                )}

                <Separator />

                <DialogFooter className="pt-1">
                    <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-sky-100 text-sky-700 hover:bg-sky-200"
                    >
                        {t("report.userAttempt.close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
