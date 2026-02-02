import type { QuestionOption, QuestionResponse } from "@/types/questionType";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Check, ChevronDown, ChevronUp, HelpCircle, Key, ListChecks, Plus, Edit, BadgeQuestionMark, Wand2, X, MessageSquare, Loader2, Globe, SearchX, PlusCircle, Search } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState, useCallback } from "react";
import UploadQuestionsDialog from "./UploadFileModal";
import { InfoDialog } from "../common/InfoDialog";
import { GenericDeleteConfirmationDialog } from "../common/DeleteDialog";
import { GenericReactivateConfirmationDialog } from "../common/ConfirmDialog";
import { QuestionUpsertDialog } from "../question/QuestionUpsertDialog";
import { toast } from "sonner";
import GenAiQuestionDialog from "../question/GenAiQuestionDialog";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { API_BASE } from "@/lib/config";
import { formatMysqlMadridToUser } from "@/lib/utils";

type UploadResponse = {
    created: number;
    skipped: string[];
    totalReceived: number;
}

const DashboardQuestions = () => {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState<QuestionResponse | null>(null);
    const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
    const [showInfo, setShowInfo] = useState(false);

    const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
    const [infoData, setInfoData] = useState<UploadResponse | null>(null);

    // Filtros
    const [inputValue, setInputValue] = useState<string>("");
    const [q, setQ] = useState<string>("");
    const [ai, setAi] = useState<string>("all");
    const [lang, setLang] = useState<string>("all");
    const [status, setStatus] = useState<string>("active");
    const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
    const [filteredQuestions, setFilteredQuestions] = useState<QuestionResponse | null>(null);

    //  alternar la visibilidad de detalles de la pregunta
    const handleToggle = (id: string) => {
        setOpenQuestionId(openQuestionId === id ? null : id);
    };

    const fetchQuestions = async () => {
        await fetch(`${API_BASE}/questions/all`)
            .then(response => response.json())
            .then(data => setQuestions(data))
            .catch(error => console.error('Error fetching questions data:', error))
            .finally(() => setLoadingQuestions(false));

    }

    const fetchFilteredQuestions = useCallback(async () => {
        console.log("entrando a fetch filtered questions");
        if (!q.trim() && ai === "all" && lang === "all" && status === "active") { // si se limpian todos los filtros (default)
            await fetchQuestions(); // refrescar la data principal
            setFilteredQuestions(null); // limpiar data filtrada y mostrar todas las preguntas
            return;
        }
        setLoadingSearch(true);
        const params = new URLSearchParams();
        if (q.trim()) params.append('q', q.trim());
        if (ai !== "all") params.append('ai', ai);
        if (lang !== "all") params.append('lang', lang);
        if (status !== "all") params.append('status', status);
        const url = `${API_BASE}/questions/search?${params.toString()}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            setFilteredQuestions(data);
            console.log("traida data filtrada desde la bd");
        } catch (error) {
            console.error('Error fetching filtered questions:', error);
            setFilteredQuestions(null);
        } finally {
            setLoadingSearch(false);
        }
    }, [q, ai, lang, status]);

    useEffect(() => {
        console.log("use effect all");

        fetchQuestions();

    }, []);
    // Debounce para inputValue a q 
    useEffect(() => {
        console.log("use effect input to q");
        const timer = setTimeout(() => {
            setQ(inputValue);
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);
    // Debounce para todos los filtros (esperar 1s después de cambios)
    useEffect(() => {
        console.log("use effect solo filters");
        const timer = setTimeout(() => {
            setOpenQuestionId(null); // cerrar cualquier pregunta abierta al cambiar filtros
            fetchFilteredQuestions();
        }, 1000);
        return () => clearTimeout(timer);
    }, [q, ai, lang, status, fetchFilteredQuestions]);
    // si cambian las preguntas y hay filtros activos refresca tambien los filtrados
    useEffect(() => {
        console.log("use effect questions change");
        if (q.trim() || ai !== "all" || lang !== "all" || status !== "active") {
            fetchFilteredQuestions();
        }
    }, [questions]);


    // borrar (deshabilitar) pregunta
    const deleteQuestion = async (id: string): Promise<void> => {
        const API_URL = `${API_BASE}/questions/delete/${id}`;

        const response = await fetch(API_URL, {
            method: 'PUT',

        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(t('questions.deleteError'));
        }

        toast.success(t('questions.deleteSuccess'));
        console.log('Delete response data:', data);

    };

    // reactivar pregunta
    const reactivateQuestion = async (id: string): Promise<void> => {
        const url = `${API_BASE}/questions/reactivate/${id}`;

        const response = await fetch(url, {
            method: 'PUT',

        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(t('questions.reactivateError'));
        }

        toast.success(t('questions.reactivateSuccess'));
        console.log('Reactivate response data:', data);


    };

    // mapeo para el Tipo de Pregunta
    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'multiple_option':
                return <Badge className="bg-sky-500 hover:bg-sky-600 font-medium">{t('questions.types.multiple_option')}</Badge>;
            case 'true_false':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">{t('questions.types.true_false')}</Badge>;
            case 'fill_in_the_blank':
                return <Badge variant="secondary" className="text-gray-600 border-gray-300">{t('questions.types.fill_in_the_blank')}</Badge>;
            default:
                return <Badge variant="outline">{t('questions.types.unknown')}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(formatMysqlMadridToUser(dateString));
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // mapear el status de las preguntas a texto traducido
    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'active':
                return t('questions.statusLabel.active', "Activa");
            case 'inactive':
                return t('questions.statusLabel.inactive', "Inactiva");
            case 'deleted':
                return t('questions.statusLabel.deleted', "Eliminada");
            default:
                return t('questions.statusLabel.unknown', "Desconocido");
        }
    };

    // mapear el idioma de la pregunta a texto traducido
    const getLangLabel = (lang: string): string => {
        switch (lang) {
            case 'es':
                return t('questions.languageLabel.es', "ESP");
            case 'en':
                return t('questions.languageLabel.en', "ENG");
            default:
                return t('questions.languageLabel.notAvailable', "N/D");
        }
    };

    const showInfoModal = (response: UploadResponse) => {

        setInfoData(response);
        setShowInfo(true);

    }


    if (loadingQuestions) { // loader inicial (animacion)
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-600">{t('questions.loading')}</p>
            </div>
        );
    }

    return (
        <Card className="w-full h-[81vh] shadow-xl border-t-4 border-sky-300 flex flex-col">

            <CardHeader className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col gap-4 flex-shrink-0">
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <HelpCircle className="w-6 h-6 text-sky-500" />
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            {t('questions.title')}
                        </CardTitle>
                    </div>
                    <div className="flex gap-2" >
                        <QuestionUpsertDialog
                            triggerComponent={
                                <Button className="bg-sky-500 hover:bg-sky-600 font-semibold shadow-md shadow-sky-300/40">
                                    <Plus className="w-4 h-4 mr-2" /> {t('questions.createNew')}
                                </Button>
                            }
                            onSuccess={fetchQuestions}
                        />
                        <GenAiQuestionDialog fetchQuestions={fetchQuestions} showInfoModal={showInfoModal} />
                        <UploadQuestionsDialog fetchQuestions={fetchQuestions} showInfoModal={showInfoModal} />
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-3 items-center mt-3 w-full">
                    <div className="flex items-center gap-2 flex-1 min-w-64">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder={t('questions.searchPlaceholder')}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="pl-10 border-sky-200 focus:border-sky-500"
                                maxLength={80}
                            />
                        </div>
                        {loadingSearch && <Loader2 className="w-4 h-4 animate-spin text-sky-500" />}
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <Select value={ai} onValueChange={setAi}>
                                        <SelectTrigger className="w-32 border-sky-200 focus:border-sky-500">
                                            <SelectValue>
                                                <div className="flex items-center gap-2">
                                                    <ListChecks className="w-4 h-4 text-gray-500" />
                                                    <span>{ai === "all" ? t('questions.all') : ai === "1" ? t('questions.ai') : t('questions.manual')}</span>
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('questions.all')}</SelectItem>
                                            <SelectItem value="1">{t('questions.ai')}</SelectItem>
                                            <SelectItem value="0">{t('questions.manual')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('questions.filterAI')}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <Select value={lang} onValueChange={setLang}>
                                        <SelectTrigger className="w-32 border-sky-200 focus:border-sky-500">
                                            <SelectValue>
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-gray-500" />
                                                    <span>{lang === "all" ? t('questions.all') : lang === "es" ? t('questions.spanish') : t('questions.english')}</span>
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('questions.all')}</SelectItem>
                                            <SelectItem value="es">{t('questions.spanish')}</SelectItem>
                                            <SelectItem value="en">{t('questions.english')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('questions.filterLang')}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="w-32 border-sky-200 focus:border-sky-500">
                                            <SelectValue>
                                                <div className="flex items-center gap-2">
                                                    <BadgeQuestionMark className="w-4 h-4 text-gray-500" />
                                                    <span>{status === "all" ? t('questions.all') : status === "active" ? t('questions.statusLabel.actives') : t('questions.statusLabel.inactives')}</span>
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('questions.all')}</SelectItem>
                                            <SelectItem value="active">{t('questions.statusLabel.actives')}</SelectItem>
                                            <SelectItem value="inactive">{t('questions.statusLabel.inactives')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('questions.filterStatus')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <InfoDialog title={t('questions.uploadDetails.title')} description={infoData ? (
                    <div>
                        <p>{t('questions.uploadDetails.totalReceived')}: {infoData.totalReceived}</p>
                        <p>{t('questions.uploadDetails.created')}: {infoData.created}</p>
                        <p>{t('questions.uploadDetails.skipped')}: {infoData.skipped.length}</p>
                        {infoData.skipped.map((qId, index) => (
                            <div key={index}>

                                <p>-{qId}</p>
                            </div>
                        ))}
                    </div>
                ) : null} isOpen={showInfo} onClose={() => setShowInfo(false)} />
            </CardHeader>

            <CardContent className="p-0 overflow-auto flex-1">

                {/* mapeo principal para la lista tipo acordeón */}
                <div className="divide-y divide-gray-100">
                    {(filteredQuestions || questions)?.data.map((q) => {
                        const isOpen = openQuestionId === q.id;
                        return (
                            <div key={q.id} className="w-full">

                                {/* fila del Título (Clickable Header) */}
                                <div
                                    className={`flex items-center justify-between p-4 transition-colors duration-200  ${isOpen ? 'bg-sky-50/70' : 'hover:bg-sky-50'}`}

                                >
                                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleToggle(q.id)}>
                                        {/* ícono de Estado Abierto/Cerrado */}
                                        {isOpen ? (
                                            <ChevronUp className="w-5 h-5 shrink-0 text-sky-600" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 shrink-0 text-gray-400" />
                                        )}
                                        {/* Título y Descripción de la Pregunta */}
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-800">{q.description} {q.ai_generated ? <span ><Wand2 className="w-4 h-4 inline text-yellow-600" /></span> : null}</h3>
                                            <p className="text-sm text-gray-500">{q.title}</p>
                                        </div>
                                    </div>

                                    {/* datos en la Fila Principal (Tipo, Creado y Estado) */}
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="flex flex-col items-end">
                                            <span className="text-gray-500">{t('questions.type')}</span>
                                            {getTypeBadge(q.type)}
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <span className="text-gray-500">{t('questions.created')}</span>
                                            <span className="font-medium text-gray-700">{formatDate(q.created_on)}</span>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <span className="text-gray-500">{t('questions.language')}</span>
                                            <span className="font-medium text-gray-700">{getLangLabel(q.lang)}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-gray-500">{t('questions.status')}</span>
                                            <span className="font-medium text-gray-700">{getStatusLabel(q.status)}</span>
                                        </div>
                                        {/* Botones de Acción */}
                                        <TooltipProvider>

                                            {/* Botón de Reactivar */}
                                            {q.status === "inactive" && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div>
                                                            <GenericReactivateConfirmationDialog
                                                                itemId={q.id}
                                                                itemDescription={q.description}
                                                                onConfirm={() => reactivateQuestion(q.id)}
                                                                onSuccess={fetchQuestions}
                                                            />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{t("common.reactivate")}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}

                                            {/* Botón de Editar */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <QuestionUpsertDialog
                                                            questionId={q.id}
                                                            triggerComponent={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-sky-500 hover:bg-sky-100"
                                                                    disabled={q.status !== "active"}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            }
                                                            onSuccess={fetchQuestions}
                                                        />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('common.edit')}</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            {/* Botón de Eliminar */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <GenericDeleteConfirmationDialog
                                                            itemId={q.id}
                                                            itemDescription={t('genericDialogs.delete.description', {
                                                                itemType: t('genericDialogs.delete.itemTypes.question'),
                                                                itemName: q.description
                                                            })}
                                                            onConfirm={() => deleteQuestion(q.id)}
                                                            onSuccess={fetchQuestions}
                                                            disabled={q.status !== "active"}
                                                        />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{t('common.delete')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>

                                {/* contenido Expandible (Detalles y Opciones de respuesta) */}
                                {isOpen && (
                                    <div className="p-6 bg-white border-t border-sky-100">
                                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                            <ListChecks className="w-4 h-4 text-sky-500" /> {t('questions.responseOptions')}
                                        </h4>

                                        <ul className="space-y-2">
                                            {q.options.map((opt: QuestionOption, index: number) => (
                                                <li
                                                    key={index}
                                                    className={`flex items-center p-3 rounded-lg border-l-4 ${opt.is_correct === 1 ? 'border-green-500 bg-green-50/50' : 'border-red-500/50 bg-red-50/50'}`}
                                                >
                                                    {opt.is_correct === 1 ? (
                                                        <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                                    ) : (
                                                        <X className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                                                    )}
                                                    <span className={`text-gray-800 ${opt.is_correct === 1 ? 'font-semibold' : 'font-normal'}`}>
                                                        {opt.text_option}
                                                    </span>
                                                    {opt.is_correct === 1 && (
                                                        <Badge className="ml-auto bg-green-500 hover:bg-green-600">{t('questions.correct')}</Badge>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* pista de la pregunta */}
                                        <p className="mt-4 text-sm text-sky-700 p-2 bg-sky-50 rounded-md border border-sky-200 flex items-center gap-2">
                                            <Key className="w-4 h-4 flex-shrink-0" /> <strong>{t('questions.tipNote')}</strong> {q.tip_note}
                                        </p>

                                        {/* Feedback */}
                                        <p className="mt-2 text-sm text-gray-700 p-2 bg-gray-50 rounded-md border border-gray-200 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 flex-shrink-0" /> <strong>{t('questions.feedback')}</strong> {q.feedback || '---'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {filteredQuestions && filteredQuestions.data.length === 0 && (
                        <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
                            <SearchX className="w-12 h-12 text-gray-400" />
                            <p>{t('questions.noResults')}</p>
                        </div>
                    )}
                    {!filteredQuestions && questions && questions.data.length === 0 && (
                        <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
                            <PlusCircle className="w-12 h-12 text-gray-400" />
                            <p>{t('questions.noQuestions')}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


export default DashboardQuestions;