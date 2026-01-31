import { Select } from "@radix-ui/react-select";
import StatsBarChart from "../common/CorrectnessBarChart";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "@/lib/config";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { GroupQuestionStats } from "@/types/questionType";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { User, Trophy, CircleCheck, CircleX, Clock, Heart, FileText, BadgeQuestionMark, CircleEllipsis, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { UserAttemptReportDialog } from "../report/UserAttemptReportDialog";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { GroupPerformanceReportPdf } from "../report/GroupPerformanceReportPdf";

// Define el tipo para la respuesta individual del grupo
export interface GameGroup {
    id: string;
    name: string;
    description: string | null;
    created_on: string;
    code: string;
    status: 'active' | 'inactive' | 'archived' | string; //  tipo de estado
}

interface GameStats {
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
}

type FetchResponse = {
    message: string;
    status: number;
    data?: GameGroup[];
};

type GameGroupStatsResponse = {
    message: string;
    status: number;
    data?: GroupQuestionStats[];
};

type QuestionGroupData = {
    question: string;
    question_id: string;
    question_added_on: string;
}

const DashboardHome = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { groupId } = useParams<{ groupId?: string }>();
    const [groups, setGroups] = useState<FetchResponse | null>(null);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [groupQuestionStats, setGroupQuestionStats] = useState<GroupQuestionStats[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<QuestionGroupData[]>([]);
    //const [loadingGroupQuestions, setLoadingGroupQuestions] = useState(false);
    //const [error, setError] = useState<string | null>(null);
    const [gameStats, setGameStats] = useState<GameStats[]>([]);
    const [loadingGameStats, setLoadingGameStats] = useState(false);

    const fetchGroups = useCallback(async () => {
        setLoadingGroups(true);
        try {
            // API URL obtener grupos
            const response = await fetch(`${API_BASE}/groups`);
            const data = await response.json();


            setGroups(data);

        } catch (error) {
            console.error('Error fetching game groups:', error);

        } finally {
            setLoadingGroups(false);
        }
    }, []);

    const fetchStats = async (groupId: string) => {

        try {
            console.log('Selected Group ID for stats:', groupId);

            const response = await fetch(`${API_BASE}/questions/stats/group/${groupId}`);
            const data: GameGroupStatsResponse = await response.json();
            setGroupQuestionStats(data.data || []);
            console.log('Fetching stats for group ID:', groupId);
            console.log('Stats data:', data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }

    };

    // GET /groups/{groupId}/questions - Endpoint para obtener preguntas del grupo id
    const getGroupQuestions = useCallback(async (groupId: string) => {
        try {
            const response = await fetch(
                `${API_BASE}/groups/${groupId}/questions`
            );

            if (!response.ok) {
                throw new Error('Error HTTP');
            }

            const data = await response.json();
            setSelectedQuestions(data.data ?? []);

        } catch (err) {
            console.error('Error fetching group questions:', err);
            setSelectedQuestions([]);
        }
    }, []);

    const fetchGroupGameStats = useCallback(async (groupId: string) => {
        setLoadingGameStats(true);
        try {
            const response = await fetch(
                `${API_BASE}/stats/game/group/${groupId}`
            );
            const result = await response.json();

            if (result.status === 200) {
                setGameStats(result.data || []);
            } else {
                setGameStats([]);
            }
        } catch (err) {
            console.error('Error fetching group game stats:', err);
            setGameStats([]);
        } finally {
            setLoadingGameStats(false);
        }
    }, []);

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    useEffect(() => {
        fetchGroups();

    }, [fetchGroups]);

    useEffect(() => {
        if (groupId) {
            setSelectedGroup(groupId);
        }
    }, [groupId]);

    useEffect(() => {
        if (selectedGroup && selectedGroup !== "all") {
            fetchStats(selectedGroup);
            getGroupQuestions(selectedGroup);
            fetchGroupGameStats(selectedGroup);
        }
    }, [selectedGroup, fetchGroupGameStats, getGroupQuestions]);

    const handleGroupChange = (value: string) => {
        setSelectedGroup(value);
        if (value && value !== "all") {
            navigate(`/dashboard/home/${value}`, { replace: true });
        } else {
            navigate(`/dashboard/home`, { replace: true });
        }
    };

    // obtener ids de preguntas actualmente agregadas al grupo
    const selectedQuestionIds = new Set(
        selectedQuestions.map(q => q.question_id)
    );

    // filtrar estadísticas solo para preguntas seleccionadas
    const filteredGroupQuestionStats = groupQuestionStats.filter(stat =>
        selectedQuestionIds.has(stat.question_id)
    );

    // map de estadísticas por ID de pregunta 
    const statsByQuestionId = new Map(
        filteredGroupQuestionStats.map(s => [s.question_id, s])
    );

    const optCellClass = (correct: string | null | undefined, letter: string) => {
        if (!correct) return "whitespace-normal"; // si  null no cambia el estilo
        return `whitespace-normal ${correct === letter
            ? "bg-emerald-100 text-emerald-800 font-semibold"
            : "bg-rose-50 text-rose-700"
            }`;
    };


    if (loadingGroups) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-gray-600">{t('common.loading')}</div>
            </div>
        );
    }
    console.log("stats original", groupQuestionStats);
    console.log("data al chart", filteredGroupQuestionStats);
    return (
        <div className="space-y-2">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-6 shadow-lg  lg:flex justify-between">
                <div>
                    <h2 className="text-4xl font-extrabold text-white mb-2">{t('dashboard.title')}</h2>
                    <p className="text-sky-100 text-lg">{t('dashboard.home.subtitle')}</p>
                </div>
                <div className="flex gap-4">
                    <div className="max-w-md text-white">
                        <label className="text-sm font-semibold text-white mb-2 block">
                            {t('dashboard.home.filterLabel')}
                        </label>
                        <Select value={selectedGroup} onValueChange={handleGroupChange}>
                            <SelectTrigger className="h-11 border-white focus:ring-2 focus:ring-sky-500 data-[placeholder]:text-white  ">
                                <SelectValue placeholder={t('dashboard.home.selectPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t('dashboard.home.allGroups')}
                                </SelectItem>
                                {groups?.data?.map((g) => (
                                    <SelectItem key={g.id} value={g.id} className="text-black">
                                        {g.name} (#{g.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {filteredGroupQuestionStats?.length > 0 && selectedQuestions?.length > 0 && selectedGroup && selectedGroup !== "all" && (
                        <div className="text-white">
                            <label className="text-sm font-semibold text-white mb-2 block">
                                {t('dashboard.home.reportLabel', 'Reporte')}
                            </label>
                            <PDFDownloadLink
                                document={
                                    <GroupPerformanceReportPdf
                                        groupName={groups?.data?.find(g => g.id === selectedGroup)?.name ?? "Grupo"}
                                        groupCode={groups?.data?.find(g => g.id === selectedGroup)?.code}
                                        createdOn={groups?.data?.find(g => g.id === selectedGroup)?.created_on}
                                        selectedQuestions={selectedQuestions}
                                        statsByQuestionId={statsByQuestionId}
                                        gameStats={gameStats}
                                    />
                                }
                                fileName={`group-report-${selectedGroup}.pdf`}
                            >
                                {({ loading }) => (
                                    <Button
                                        variant="outline"
                                        disabled={loading}
                                        className="h-9 bg-white text-sky-600 hover:bg-sky-50 border-white"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        {loading ? t('dashboard.home.generatingPdf', 'Generando...') : t('dashboard.home.downloadPdf', 'Descargar PDF')}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    )}

                </div>


            </div>

            {/* Stats Section */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                {filteredGroupQuestionStats?.length > 0 ? (
                    <div className="grid grid-cols-1 h-1/5 lg:grid-cols-2 gap-6">
                        {/* Gráfico */}
                        <div className="h-fit">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('dashboard.stats.chartTitle')}</h3>
                            <StatsBarChart data={filteredGroupQuestionStats} />
                        </div>


                        {/* Tabla de Preguntas y Estadísticas */}
                        <div className="h-fit overflow-auto">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('dashboard.stats.groupQuestionsStatsTableTitle')}</h3>
                            {selectedQuestions?.length > 0 ? (
                                <div className="border rounded-lg overflow-auto w-[850px] max-h-[410px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10">#</TableHead>
                                                <TableHead>{t('dashboard.stats.questionColumn', 'Pregunta')}</TableHead>
                                                <TableHead className="text-center">{t('dashboard.stats.optionA', 'Opc. A')}</TableHead>
                                                <TableHead className="text-center">{t('dashboard.stats.optionB', 'Opc. B')}</TableHead>
                                                <TableHead className="text-center">{t('dashboard.stats.optionC', 'Opc. C')}</TableHead>
                                                <TableHead className="text-center">{t('dashboard.stats.optionD', 'Opc. D')}</TableHead>
                                                <TableHead className="text-center">{t('dashboard.stats.avgTime', 'Prom. Tiempo')}</TableHead>
                                                <TableHead className="text-center">{t('dashboard.stats.accuracy', 'Precisión')}</TableHead>
                                            </TableRow>

                                        </TableHeader>
                                        <TableBody>
                                            {selectedQuestions.map((q, index) => {
                                                const stats = statsByQuestionId.get(q.question_id);
                                                const correctOpt = stats?.correct_option_letter;

                                                return (
                                                    <TableRow key={q.question_id}>
                                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                                        <TableCell className="whitespace-normal">{q.question}</TableCell>
                                                        <TableCell className={`${optCellClass(correctOpt, "A")} text-center align-middle tabular-nums`}>{stats?.opt_a ?? "0"}</TableCell>
                                                        <TableCell className={`${optCellClass(correctOpt, "B")} text-center align-middle tabular-nums`}>{stats?.opt_b ?? "0"}</TableCell>
                                                        <TableCell className={`${optCellClass(correctOpt, "C")} text-center align-middle tabular-nums`}>{stats?.opt_c ?? "0"}</TableCell>
                                                        <TableCell className={`${optCellClass(correctOpt, "D")} text-center align-middle tabular-nums`}>{stats?.opt_d ?? "0"}</TableCell>
                                                        <TableCell className="text-center align-middle">{stats?.avg_response_time ?? "0"} {"s"}</TableCell>
                                                        <TableCell className="text-center align-middle">{stats?.accuracy ?? "0"}{"%"}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 border rounded-lg bg-gray-50">
                                    <p className="text-gray-500">{t('dashboard.home.noQuestions', 'No hay preguntas disponibles')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                        <svg
                            className="w-24 h-24 text-gray-300 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">{t('dashboard.home.noStats')}</p>
                    </div>
                )}
            </div>

            {/* Tabla de Estadísticas de Juegos del Grupo */}
            {selectedGroup && selectedGroup !== 'all' && (
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        {t('dashboard.gameStats.title', 'Resultados de Partidas del Grupo')}
                    </h3>

                    {loadingGameStats ? (
                        <div className="text-center py-8 text-gray-600">
                            {t('dashboard.gameStats.loading', 'Cargando resultados de partidas...')}
                        </div>
                    ) : gameStats.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">
                            {t('dashboard.gameStats.noGameStats', 'No hay datos de partidas disponibles para este grupo')}
                        </div>
                    ) : (
                        <>
                            {/* Vista de tabla para desktop */}
                            <div className="hidden md:block rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[150px]">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {t('dashboard.gameStats.user', 'Usuario')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Trophy className="w-4 h-4" />
                                                    {t('dashboard.gameStats.score', 'Puntos')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <CircleCheck className="w-4 h-4" />
                                                    {t('dashboard.gameStats.correct', 'Correctas')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <CircleX className="w-4 h-4" />
                                                    {t('dashboard.gameStats.incorrect', 'Incorrectas')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Heart className="w-4 h-4" />
                                                    {t('dashboard.gameStats.lives', 'Vidas')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {t('dashboard.gameStats.time', 'Tiempo')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <BadgeQuestionMark className="w-4 h-4" />
                                                    {t('dashboard.gameStats.status', 'Estado')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {t('dashboard.gameStats.date', 'Fecha')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <CircleEllipsis className="w-4 h-4" />
                                                    {t('dashboard.gameStats.action', 'Acción')}
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {gameStats.map((stat) => (
                                            <TableRow key={stat.id}>
                                                <TableCell className="font-medium">
                                                    {stat.username || stat.name || 'Usuario...'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-bold text-blue-600">
                                                        {stat.score}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-semibold text-green-600">
                                                        {stat.correct_answers}/{stat.question_quantity}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-semibold text-red-600">
                                                        {stat.wrong_answers}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-semibold text-pink-600">
                                                        {stat.lives_number}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center text-purple-600 font-medium">
                                                    {formatTime(stat.total_time)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span
                                                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${stat.status === "finished"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                            }`}
                                                    >
                                                        {stat.status === "finished" ? "Finalizado" : stat.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {formatDate(stat.created_on)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {stat.game_id && (
                                                        <UserAttemptReportDialog
                                                            groupId={stat.group_id}
                                                            userId={stat.user_id}
                                                            gameId={stat.game_id}
                                                            triggerComponent={
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="gap-1"
                                                                >
                                                                    <FileText className="w-4 h-4" />
                                                                    {t('dashboard.viewReport', 'Ver Reporte')}
                                                                </Button>
                                                            }
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Vista minimalista para móvil */}
                            <div className="md:hidden space-y-2">
                                {gameStats.map((stat) => (
                                    <div key={stat.id} className="border rounded-lg p-3 bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold text-gray-800 text-sm truncate pr-2">
                                                {stat.username || stat.name || 'Usuario...'}
                                            </div>
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${stat.status === "finished"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {stat.status === "finished" ? "✓" : "..."}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Trophy className="w-3 h-3 text-blue-500" />
                                                    <span className="font-bold text-blue-600">{stat.score}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CircleCheck className="w-3 h-3 text-green-500" />
                                                    <span className="font-medium text-green-600">{stat.correct_answers}/{stat.question_quantity}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CircleX className="w-3 h-3 text-red-500" />
                                                    <span className="font-medium text-red-600">{stat.wrong_answers}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <Heart className="w-3 h-3 text-pink-500" />
                                                    <span className="font-medium text-pink-600">{stat.lives_number}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-purple-500" />
                                                    <span className="font-medium text-purple-600">{formatTime(stat.total_time)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {stat.game_id && (
                                            <div className="mt-2">
                                                <UserAttemptReportDialog
                                                    groupId={stat.group_id}
                                                    userId={stat.user_id}
                                                    gameId={stat.game_id}
                                                    triggerComponent={
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full gap-1 text-xs"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                            {t('dashboard.viewReport', 'Ver Reporte')}
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default DashboardHome;