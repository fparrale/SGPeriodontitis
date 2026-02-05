import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { UserAttemptReportDialog } from "../report/UserAttemptReportDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Trophy, Clock, User, Heart, CalendarClock, CircleCheck, CircleX, Target, Medal, ChartNoAxesColumn } from "lucide-react";
import { API_BASE } from "@/lib/config";
import { formatMysqlMadridToUser } from "@/lib/utils";

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
    game_id: string; //new supp field
}

interface GroupStatsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
}

export const GroupStatsDialog = ({
    isOpen,
    onClose,
    groupId,
}: GroupStatsDialogProps) => {
    const [stats, setStats] = useState<GameStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    //get userdata fron local storage
    const userData = localStorage.getItem("auth_user") || null;
    const parsedUserData = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        if (isOpen && groupId) {
            fetchGroupStats();
        }
    }, [isOpen, groupId]);

    const fetchGroupStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${API_BASE}/stats/game/group/${groupId}`
            );
            const result = await response.json();

            if (result.status === 200) {
                console.log(result.data)
                setStats(result.data || []);
            } else {
                setError(result.message || t('game.groupStats.error'));
            }
        } catch (err) {
            setError(t('game.groupStats.serverError'));
            console.error("Error fetching group stats:", err);
        } finally {
            setLoading(false);
        }
    };

    // const formatTime = (timeString: string) => {
    //     // Format: "2026-01-15 00:00:24" -> "24s" or "00:24"
    //     const timePart = timeString.split(" ")[1];
    //     if (!timePart) return timeString;

    //     const [hours, minutes, seconds] = timePart.split(":").map(Number);

    //     if (hours > 0) {
    //         return `${hours}h ${minutes}m ${seconds}s`;
    //     } else if (minutes > 0) {
    //         return `${minutes}m ${seconds}s`;
    //     }
    //     return `${seconds}s`;
    // };

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    const calculateAccuracy = (correct: number, total: number): number => {
        if (total === 0) return 0;
        return Math.round((correct / total) * 100);
    };

    const getAccuracyColor = (accuracy: number): string => {
        if (accuracy >= 75) return "text-green-600";
        if (accuracy >= 25) return "text-yellow-600";
        return "text-red-600";
    };

    const getPodiumStyle = (index: number) => {
        switch (index) {
            case 0: // first place - Gold
                return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 hover:from-yellow-100 hover:to-yellow-200";
            case 1: // second place - Silver
                return "bg-gradient-to-r from-slate-50 to-slate-100 border-l-4 border-slate-500 hover:from-slate-100 hover:to-slate-200";
            case 2: // third place - Bronze
                return "bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-amber-600 hover:from-orange-100 hover:to-orange-200";
            default:
                return "bg-blue-50 hover:bg-blue-100";
        }
    };

    const getPodiumIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Medal className="w-5 h-5 text-yellow-500 fill-yellow-400" />;
            case 1:
                return <Medal className="w-5 h-5 text-slate-500 fill-slate-400" />;
            case 2:
                return <Medal className="w-5 h-5 text-amber-700 fill-amber-600" />;
            default:
                return null;
        }
    };

    const latestGameId = useMemo(() => {
        if (!parsedUserData?.id) return "";

        const userGames = stats.filter(s => s.user_id === parsedUserData.id);
        if (userGames.length === 0) return "";

        const latestGame = userGames.reduce((latest, current) => {
            return new Date(current.created_on) > new Date(latest.created_on)
                ? current
                : latest;
        });

        return latestGame.game_id ?? "";
    }, [stats, parsedUserData?.id]);


    const isUserLatestGame = (stat: GameStats): boolean => {
        if (!parsedUserData) return false;
        return stat.user_id === parsedUserData.id && stat.game_id === latestGameId;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[85vw] max-h-[85vh] overflow-y-auto w-[90vw]">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                        <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500" />
                        {t('game.groupStats.title')}
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600 text-sm sm:text-base">
                        {t('game.groupStats.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loading && (
                        <div className="text-center py-8 text-gray-600">
                            {t('game.groupStats.loading')}
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8 text-red-600">
                            {error}
                        </div>
                    )}

                    {!loading && !error && stats.length === 0 && (
                        <div className="text-center py-8 text-gray-600">
                            {t('game.groupStats.noStats')}
                        </div>
                    )}

                    {!loading && !error && stats.length > 0 && (
                        <>
                            {/* Vista de tabla para desktop */}
                            <div className="hidden md:block rounded-md border overflow-x-auto max-h-[50vh] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px] text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Trophy className="w-4 h-4" />
                                                    {t('game.groupStats.position')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[150px]">
                                                <div className="flex items-center justify-start gap-1">
                                                    <User className="w-4 h-4" />
                                                    {t('game.groupStats.user')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Trophy className="w-4 h-4" />
                                                    {t('game.groupStats.score')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <CircleCheck className="w-4 h-4" />
                                                    {t('game.groupStats.correct')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <CalendarClock className="w-4 h-4" />
                                                    {t('game.groupStats.date')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Target className="w-4 h-4" />
                                                    {t('game.groupStats.accuracy')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {t('game.groupStats.time')}
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stats.map((stat, index) => (
                                            <TableRow
                                                key={stat.id}
                                                className={`
                                                    ${getPodiumStyle(index)} 
                                                    ${isUserLatestGame(stat) ? "animate-pulse" : ""}
                                                `}
                                            >
                                                <TableCell className="text-center font-bold">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {getPodiumIcon(index)}
                                                        <span className={index < 3 ? "text-lg" : ""}>
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {parsedUserData && parsedUserData.id === stat.user_id ? `${stat.name} ${t('game.groupStats.me')}` : stat.username || `${t('game.groupStats.user')}...`}
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
                                                    <span className="font-semibold text-blue-600">
                                                        {formatMysqlMadridToUser(stat.created_on).toLocaleString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`font-bold ${getAccuracyColor(calculateAccuracy(stat.correct_answers, stat.question_quantity))}`}>
                                                        {calculateAccuracy(stat.correct_answers, stat.question_quantity)}%
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center text-purple-600 font-medium">
                                                    {formatTime(stat.total_time)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Vista minimalista para móvil */}
                            <div className="md:hidden space-y-2">
                                {stats.map((stat, index) => (
                                    <div key={stat.id} className={`border rounded-lg p-3 ${getPodiumStyle(index)} ${index >= 3 ? "bg-gray-50" : ""} ${isUserLatestGame(stat) ? "animate-pulse" : ""}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    {getPodiumIcon(index)}
                                                    <span className={`font-bold ${index < 3 ? "text-lg" : "text-sm"}`}>
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                                <div className="font-semibold text-gray-800 text-sm truncate pr-2">
                                                    {stat.username || ` ${stat.name}`}
                                                </div>
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
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    {!loading && !error && stats.length > 0 && parsedUserData && (
                        <UserAttemptReportDialog
                            groupId={groupId}
                            userId={parsedUserData.id}
                            gameId={latestGameId}
                            triggerComponent={
                                <Button
                                    variant="outline"
                                    disabled={!latestGameId}
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-800 animate-fade-in disabled:opacity-50"
                                >
                                    <ChartNoAxesColumn className="w-4 h-4 mr-2" />
                                    {t('game.groupStats.viewMyResult')}
                                </Button>
                            }
                        />
                    )}
                    <Button
                        onClick={onClose}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        {t('game.groupStats.close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
