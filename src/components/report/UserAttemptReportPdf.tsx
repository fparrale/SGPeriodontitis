import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";

// Tipos
interface QuestionDetail {
    answer_id: string;
    title: string;
    description: string;
    feedback: string;
    is_correct: number;
    time_spent_sec: number;
    selected_option_id: string;
    correct_option_text: string;
    options: { id: string; text: string; is_correct: number }[];
}

interface GameReportSummary {
    score: number;
    correct_answers: number;
    wrong_answers: number;
    lives_number: number;
    total_time: number;
    group_name: string;
    group_code: string;
    user_name: string;
    game_started_on: string;
    game_finished_on: string;
}

export interface GameReportData {
    summary: GameReportSummary;
    questions: QuestionDetail[];
}

// helpers
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const formatDateTime = (dateString: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
};

const styles = StyleSheet.create({
    page: { padding: 26, fontSize: 11, color: "#111827" },

    header: { marginBottom: 12 },
    titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    title: { fontSize: 18, fontWeight: 800 },
    subtitle: { marginTop: 4, fontSize: 10, color: "#4B5563" },

    divider: { height: 1, backgroundColor: "#E5E7EB", marginTop: 10, marginBottom: 10 },

    sectionTitle: { fontSize: 12, fontWeight: 800, marginTop: 14, marginBottom: 8 },

    // “Card” estilos
    card: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, backgroundColor: "#FFFFFF" },
    cardSoft: { borderWidth: 1, borderColor: "#BFDBFE", borderRadius: 10, padding: 12, backgroundColor: "#EFF6FF" },

    row: { flexDirection: "row", gap: 10 },
    col: { flexGrow: 1 },

    label: { fontSize: 9, color: "#6B7280" },
    value: { fontSize: 11, fontWeight: 800, marginTop: 2 },

    // mini stats
    statGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
    statItem: { width: "50%", paddingRight: 8, marginTop: 8 },

    // badges
    badge: { alignSelf: "flex-start", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999 },
    badgeOk: { backgroundColor: "#16A34A" },
    badgeBad: { backgroundColor: "#DC2626" },
    badgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: 800 },

    // question card
    qCard: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, marginTop: 10 },
    qHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    qTitle: { marginTop: 6, fontSize: 11, fontWeight: 800 },
    qMeta: { fontSize: 9, color: "#6B7280" },

    // options
    optBox: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 8, marginTop: 6, backgroundColor: "#F9FAFB" },
    optUserCorrect: { borderColor: "#86EFAC", backgroundColor: "#F0FDF4" },
    optUserWrong: { borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" },
    optText: { fontSize: 10 },
    optMark: { fontSize: 10, fontWeight: 800 },

    // info boxes
    infoGreen: { borderWidth: 1, borderColor: "#86EFAC", backgroundColor: "#ECFDF5", borderRadius: 10, padding: 10, marginTop: 8 },
    infoBlue: { borderWidth: 1, borderColor: "#BFDBFE", backgroundColor: "#EFF6FF", borderRadius: 10, padding: 10, marginTop: 8 },
    infoTitleGreen: { fontSize: 10, fontWeight: 800, color: "#065F46" },
    infoTitleBlue: { fontSize: 10, fontWeight: 800, color: "#1D4ED8" },
    infoTextGreen: { fontSize: 10, marginTop: 4, color: "#065F46" },
    infoTextBlue: { fontSize: 10, marginTop: 4, color: "#1D4ED8" },

    footer: { position: "absolute", bottom: 16, left: 26, right: 26, fontSize: 9, color: "#6B7280" },
});

export function UserAttemptReportPdf({ data }: { data: GameReportData }) {
    const s = data.summary;

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>Reporte de resultados</Text>
                        <Text style={styles.qMeta}>Generado: {formatDateTime(new Date().toISOString())}</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Jugador: {s.user_name || "N/A"} · Grupo: {s.group_name} ({s.group_code})
                    </Text>
                </View>

                {/* Resumen*/}
                <View style={[styles.cardSoft]}>
                    <Text style={{ fontSize: 12, fontWeight: 800 }}>Resumen de la partida</Text>

                    <View style={[styles.row, { marginTop: 10 }]}>
                        <View style={[styles.col]}>
                            <Text style={styles.label}>Puntaje</Text>
                            <Text style={styles.value}>{s.score} pts</Text>

                            <View style={styles.statGrid}>
                                <View style={styles.statItem}>
                                    <Text style={styles.label}>Respuestas correctas</Text>
                                    <Text style={styles.value}>{s.correct_answers}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.label}>Respuestas incorrectas</Text>
                                    <Text style={styles.value}>{s.wrong_answers}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.label}>Vidas restantes</Text>
                                    <Text style={styles.value}>{s.lives_number}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.label}>Duración</Text>
                                    <Text style={styles.value}>{formatTime(s.total_time)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.col, { marginRight: 10 }]}>
                            <Text style={[styles.label, { marginRight: 10 }]}>Inicio</Text>
                            <Text style={[styles.value, { marginRight: 10 }]}>{formatDateTime(s.game_started_on)}</Text>

                            <Text style={[styles.label, { marginTop: 10, marginRight: 10 }]}>Fin</Text>
                            <Text style={[styles.value, { marginRight: 10 }]}>{formatDateTime(s.game_finished_on)}</Text>
                        </View>
                    </View>
                </View>

                {/* Detalle */}
                <Text style={styles.sectionTitle}>Detalle de preguntas</Text>

                {data.questions.map((q, idx) => {
                    const ok = q.is_correct === 1;

                    return (
                        <View key={q.answer_id} style={styles.qCard} wrap>
                            <View wrap={false}>
                                <View style={styles.qHeaderRow}>
                                    <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeBad]}>
                                        <Text style={styles.badgeText}>{ok ? "Correcta" : "Incorrecta"}</Text>
                                    </View>
                                    <Text style={styles.qMeta}>Tiempo de respuesta: {formatTime(q.time_spent_sec)}</Text>
                                </View>

                                <Text style={styles.qTitle}>{idx + 1}. {q.description}</Text>
                                {q.title ? <Text style={styles.qMeta}>{q.title}</Text> : null}

                                <Text style={[styles.label, { marginTop: 10, fontSize: 10, fontWeight: 800, color: "#374151" }]}>
                                    Opciones
                                </Text>
                            </View>

                            {q.options.map((opt) => {
                                const isUser = opt.id === q.selected_option_id;
                                const isCorrect = opt.is_correct === 1;

                                let boxStyle: any = styles.optBox;
                                if (isUser && isCorrect) boxStyle = [styles.optBox, styles.optUserCorrect];
                                if (isUser && !isCorrect) boxStyle = [styles.optBox, styles.optUserWrong];

                                return (
                                    <View key={opt.id} style={boxStyle} wrap={false}>
                                        <Text style={styles.optText}>
                                            <Text style={styles.optMark}>
                                                {isUser ? "(x) " : "( ) "}
                                            </Text>
                                            {opt.text}
                                            {isCorrect ? " " : ""}
                                        </Text>
                                    </View>
                                );
                            })}

                            <View style={styles.divider} />

                            {/* Correct answer info */}
                            {!ok ? (
                                <View style={styles.infoGreen} wrap={false}>
                                    <Text style={styles.infoTitleGreen}>La respuesta correcta era:</Text>
                                    <Text style={styles.infoTextGreen}>{q.correct_option_text}</Text>
                                </View>
                            ) : null}

                            {/* Feedback */}
                            {q.feedback ? (
                                <View style={styles.infoBlue} wrap={false}>
                                    <Text style={styles.infoTitleBlue}>Retroalimentación</Text>
                                    <Text style={styles.infoTextBlue}>{q.feedback}</Text>
                                </View>
                            ) : null}
                        </View>
                    );
                })}

                {/* Footer con num páginas */}
                <Text
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
}