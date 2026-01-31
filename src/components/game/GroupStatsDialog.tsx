import { useEffect, useState } from "react";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Trophy, Clock, User, Heart, CalendarClock, CircleCheck, CircleX, BadgeQuestionMark } from "lucide-react";
import { API_BASE } from "@/lib/config";

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


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto w-[95vw]">
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
                            <div className="hidden md:block rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
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
                                                    <CircleX className="w-4 h-4" />
                                                    {t('game.groupStats.incorrect')}
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
                                                    <Clock className="w-4 h-4" />
                                                    {t('game.groupStats.time')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <BadgeQuestionMark className="w-4 h-4" />
                                                    {t('game.groupStats.status')}
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stats.map((stat) => (
                                            <TableRow key={stat.id} className={parsedUserData && parsedUserData.id === stat.user_id ? "bg-green-50" : ""}>
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
                                                    <span className="font-semibold text-red-600">
                                                        {stat.wrong_answers}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-semibold text-blue-600">
                                                        {stat.created_on}
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
                                                        {stat.status === "finished" ? t('game.groupStats.finished') : stat.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Vista minimalista para móvil */}
                            <div className="md:hidden space-y-2">
                                {stats.map((stat) => (
                                    <div key={stat.id} className="border rounded-lg p-3 bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold text-gray-800 text-sm truncate pr-2">
                                                {stat.username || ` ${stat.name}`}
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

                <DialogFooter>
                    <Button
                        onClick={onClose}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                        {t('game.groupStats.close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
