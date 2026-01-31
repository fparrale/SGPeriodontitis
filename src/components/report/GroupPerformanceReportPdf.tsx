import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type QuestionGroupData = {
    question: string;
    question_id: string;
    question_added_on: string;
};

type GroupQuestionStats = {
    question_id: string;
    opt_a?: number;
    opt_b?: number;
    opt_c?: number;
    opt_d?: number;
    avg_response_time?: number;
    accuracy?: number;
    correct_option_letter?: string | null;
};

type GameStats = {
    id: string;
    user_id: string;
    username: string | null;
    name: string | null;
    group_id: string;
    question_quantity: number;
    correct_answers: number;
    wrong_answers: number;
    lives_number: number;
    score: number;
    total_time: number;
    created_on: string;
    status: string;
    game_id: string;
};

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
    page: { padding: 28, fontSize: 10, color: "#111827" },
    header: { marginBottom: 14 },
    title: { fontSize: 18, fontWeight: 700 },
    subtitle: { marginTop: 4, color: "#374151" },

    sectionTitle: { marginTop: 14, marginBottom: 8, fontSize: 12, fontWeight: 700 },

    kpiGrid: { display: "flex", flexDirection: "column", gap: 8 },
    kpiRow: { flexDirection: "row", gap: 8 },
    //kpi: { flexGrow: 1, border: "1px solid #E5E7EB", borderRadius: 8, padding: 10 },
    kpi: { flex: 1, border: "1px solid #E5E7EB", borderRadius: 8, padding: 10 },
    kpiLabel: { color: "#6B7280", fontSize: 9 },
    kpiValue: { marginTop: 4, fontSize: 14, fontWeight: 700 },

    table: { border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" },
    tr: { flexDirection: "row", borderBottom: "1px solid #E5E7EB" },
    th: { backgroundColor: "#F3F4F6" },
    cell: { padding: 6 },
    cellCenter: { textAlign: "center" },

    // columnas
    colIdx: { width: 22 },
    colQuestion: {
        width: 220,
        flexShrink: 0,
    },
    colSmall: { width: 46 },
    colTime: { width: 60 },
    colAcc: { width: 60 },

    footer: {
        position: "absolute",
        bottom: 18,
        left: 28,
        right: 28,
        fontSize: 9,
        color: "#6B7280",
        textAlign: "right",
    },

    badgeOk: { backgroundColor: "#DCFCE7", color: "#166534", padding: 3, borderRadius: 6, fontSize: 9 },
    badgeWarn: { backgroundColor: "#FEF3C7", color: "#92400E", padding: 3, borderRadius: 6, fontSize: 9 },

    // Estilos para opciones correctas/incorrectas
    cellCorrect: { backgroundColor: "#D1FAE5", color: "#065F46", fontWeight: 700 },
    cellIncorrect: { backgroundColor: "#FEE2E2", color: "#991B1B" },
});

function avg(nums: number[]) {
    if (nums.length === 0) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function GroupPerformanceReportPdf(props: {
    groupName: string;
    groupCode?: string;
    createdOn?: string;
    selectedQuestions: QuestionGroupData[];
    statsByQuestionId: Map<string, GroupQuestionStats>;
    gameStats: GameStats[];
}) {
    const { groupName, groupCode, createdOn, selectedQuestions, statsByQuestionId, gameStats } = props;

    const totalGames = gameStats.length;
    const uniqueParticipants = new Set(gameStats.map(g => g.user_id)).size;

    const avgAcc = Math.round(
        avg(gameStats.map(g => (g.question_quantity ? (g.correct_answers / g.question_quantity) * 100 : 0)))
    );

    const finished = gameStats.filter(g => g.status === "finished").length;
    const completionRate = gameStats.length ? Math.round((finished / gameStats.length) * 100) : 0;

    // Puntos
    const scores = gameStats.map(g => g.score ?? 0);
    const avgScore = Math.round(avg(scores));
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const minScore = scores.length ? Math.min(...scores) : 0;


    // Tiempo (en segundos)
    const times = gameStats.map(g => g.total_time ?? 0);
    const avgTimeSec = Math.round(avg(times));
    const bestTimeSec = times.length ? Math.min(...times) : 0;
    const worstTimeSec = times.length ? Math.max(...times) : 0;

    const generatedAt = new Date().toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    function formatDateTime(iso?: string | null): string {
        if (!iso) return "-";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Encabezado */}
                <View style={styles.header}>
                    <Text style={styles.title}>Reporte de desempeño del grupo</Text>
                    <Text style={styles.subtitle}>
                        Grupo: {groupName}
                        {groupCode ? ` (#${groupCode})` : ""}
                        {createdOn ? ` • Creado: ${createdOn}` : ""}
                    </Text>
                    <Text style={styles.subtitle}>
                        Reporte generado: {generatedAt}
                    </Text>
                </View>

                {/* Resumen KPIs */}
                <Text style={styles.sectionTitle}>Resumen</Text>

                <View style={styles.kpiGrid}>
                    {/* Volumen */}
                    <View style={styles.kpiRow}>
                        <View style={styles.kpi}>
                            <Text style={styles.kpiLabel}>Total partidas</Text>
                            <Text style={styles.kpiValue}>{totalGames}</Text>
                        </View>
                        <View style={styles.kpi}>
                            <Text style={styles.kpiLabel}>Jugadores</Text>
                            <Text style={styles.kpiValue}>{uniqueParticipants}</Text>
                        </View>
                        <View style={styles.kpi}>
                            <Text style={styles.kpiLabel}>Prom. Precisión</Text>
                            <Text style={styles.kpiValue}>{avgAcc}%</Text>
                        </View>
                    </View>

                    {/* Puntaje */}
                    <View style={styles.kpiRow}>
                        <View style={styles.kpi}>
                            <Text style={styles.kpiLabel}>Prom. puntos</Text>
                            <Text style={styles.kpiValue}>{avgScore}</Text>
                        </View>
                        <View style={styles.kpi}>
                            <Text style={styles.kpiLabel}>Puntaje máx.</Text>
                            <Text style={styles.kpiValue}>{maxScore}</Text>
                        </View>
                        <View style={styles.kpi}>
                            <Text style={styles.kpiLabel}>Puntaje mín.</Text>
                            <Text style={styles.kpiValue}>{minScore}</Text>
                        </View>
                    </View>

                    {/* Tiempo */}
                    <View style={styles.kpiRow}>
                        <View style={styles.kpi}>
                            <Text style={styles.kpiLabel}>Prom. tiempo de juego</Text>
                            <Text style={styles.kpiValue}>{formatTime(avgTimeSec)}</Text>
                        </View>
                        <View style={styles.kpi}>
                            <Text style={styles.kpiLabel}>Mejor tiempo de juego</Text>
                            <Text style={styles.kpiValue}>{formatTime(bestTimeSec)}</Text>
                        </View>
                        <View style={styles.kpi}>
                            <Text style={styles.kpiLabel}>Peor tiempo de juego</Text>
                            <Text style={styles.kpiValue}>{formatTime(worstTimeSec)}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 8 }}>
                    <Text style={{ color: "#374151" }}>
                        Tasa de finalización:{" "}
                        <Text style={completionRate >= 70 ? styles.badgeOk : styles.badgeWarn}>
                            {completionRate}%
                        </Text>
                    </Text>
                </View>

                {/* Tabla de preguntas */}
                <Text style={styles.sectionTitle}>Desempeño por preguntas</Text>
                <View style={styles.table}>
                    {/* Header */}
                    <View style={[styles.tr, styles.th]}>
                        <Text style={[styles.cell, styles.colIdx]}>#</Text>
                        <Text style={[styles.cell, styles.colQuestion]}>Pregunta</Text>
                        <Text style={[styles.cell, styles.colSmall, styles.cellCenter]}>Opc. A</Text>
                        <Text style={[styles.cell, styles.colSmall, styles.cellCenter]}>Opc. B</Text>
                        <Text style={[styles.cell, styles.colSmall, styles.cellCenter]}>Opc. C</Text>
                        <Text style={[styles.cell, styles.colSmall, styles.cellCenter]}>Opc. D</Text>
                        <Text style={[styles.cell, styles.colTime, styles.cellCenter]}>Prom. Tiempo</Text>
                        <Text style={[styles.cell, styles.colAcc, styles.cellCenter]}>Precisión</Text>
                    </View>

                    {/* Rows */}
                    {selectedQuestions.map((q, idx) => {
                        const s = statsByQuestionId.get(q.question_id);
                        const correctOpt = s?.correct_option_letter;

                        const getOptStyle = (letter: string) => {
                            if (!correctOpt) return [styles.cell, styles.colSmall, styles.cellCenter];
                            return correctOpt === letter
                                ? [styles.cell, styles.colSmall, styles.cellCenter, styles.cellCorrect]
                                : [styles.cell, styles.colSmall, styles.cellCenter, styles.cellIncorrect];
                        };

                        return (
                            <View key={q.question_id} style={styles.tr} wrap={false}>
                                <Text style={[styles.cell, styles.colIdx]}>{idx + 1}</Text>
                                <Text style={[styles.cell, styles.colQuestion]}>{q.question}</Text>
                                <Text style={getOptStyle("A")}>{s?.opt_a ?? 0}</Text>
                                <Text style={getOptStyle("B")}>{s?.opt_b ?? 0}</Text>
                                <Text style={getOptStyle("C")}>{s?.opt_c ?? 0}</Text>
                                <Text style={getOptStyle("D")}>{s?.opt_d ?? 0}</Text>
                                <Text style={[styles.cell, styles.colTime, styles.cellCenter]}>
                                    {s?.avg_response_time ?? 0}s
                                </Text>
                                <Text style={[styles.cell, styles.colAcc, styles.cellCenter]}>
                                    {s?.accuracy ?? 0}%
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Tabla de resumen de partidas */}
                <Text style={styles.sectionTitle}>Resultados de partidas</Text>
                <View style={styles.table}>
                    <View style={[styles.tr, styles.th]}>
                        <Text style={[styles.cell, { width: 65 }]}>Fecha</Text>
                        <Text style={[styles.cell, { width: 110 }]}>Usuario</Text>
                        <Text style={[styles.cell, { width: 60 }, styles.cellCenter]}>Puntos</Text>
                        <Text style={[styles.cell, { width: 80 }, styles.cellCenter]}>Correctas</Text>
                        <Text style={[styles.cell, { width: 70 }, styles.cellCenter]}>Incorrectas</Text>
                        <Text style={[styles.cell, { width: 45 }, styles.cellCenter]}>Vidas</Text>
                        <Text style={[styles.cell, { width: 60 }, styles.cellCenter]}>Tiempo</Text>
                        <Text style={[styles.cell, { flexGrow: 1 }, styles.cellCenter]}>Estado</Text>
                    </View>

                    {gameStats.map((g) => (
                        <View key={g.id} style={styles.tr} wrap={false}>
                            <Text style={[styles.cell, { width: 70 }]}>
                                {formatDateTime(g.created_on)}
                            </Text>
                            <Text style={[styles.cell, { width: 120 }]}>
                                {g.username || g.name || "Usuario..."}
                            </Text>
                            <Text style={[styles.cell, { width: 60 }, styles.cellCenter]}>{g.score}</Text>
                            <Text style={[styles.cell, { width: 80 }, styles.cellCenter]}>
                                {g.correct_answers}/{g.question_quantity}
                            </Text>
                            <Text style={[styles.cell, { width: 70 }, styles.cellCenter]}>{g.wrong_answers}</Text>
                            <Text style={[styles.cell, { width: 45 }, styles.cellCenter]}>{g.lives_number}</Text>
                            <Text style={[styles.cell, { width: 60 }, styles.cellCenter]}>{formatTime(g.total_time)}</Text>
                            <Text style={[styles.cell, { flexGrow: 1 }, styles.cellCenter]}>
                                {g.status === "finished" ? "Finalizado" : g.status}
                            </Text>
                        </View>
                    ))}
                </View>
                <Text
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
}
