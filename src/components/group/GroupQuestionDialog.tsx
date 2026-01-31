
import { Button } from "../ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Dialog, DialogTrigger } from "../ui/dialog"

import { useCallback, useEffect, useState } from "react"
import { useMemo } from "react";
import type { Question, QuestionResponse } from "@/types/questionType"
import { MinusIcon, PlusIcon, Wand2 } from "lucide-react";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { API_BASE } from "@/lib/config";


interface QuestionGroup {
    question_id: string;
    question: string;
    question_added_on: string;
    ai_generated?: boolean;
}



// Propiedades del componente
interface GroupQuestionDialogProps {
    groupId?: string; // Si se recibe es modo edición
    //groupName?: string;
    triggerComponent: React.ReactNode;
    onSuccess: () => void;
}
const GroupQuestionDialog = ({ groupId, triggerComponent, onSuccess }: GroupQuestionDialogProps) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuestions, setSelectedQuestions] = useState<QuestionGroup[]>([]);
    const [questions, setQuestions] = useState<QuestionResponse>({
        success: false,
        data: []

    });
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [loadingGroupQuestions, setLoadingGroupQuestions] = useState(false);
    const [_insertQuestions, setInsertQuestions] = useState<QuestionGroup[]>([]);
    const [newSelectedQuestions, setNewSelectedQuestions] = useState<QuestionGroup[]>([]);
    const [filterAvailable, setFilterAvailable] = useState("");
    const [filterSelected, setFilterSelected] = useState("");


    // GET /groups/{groupId}/questions - Endpoint para obtener preguntas de un grupo mediante id UUID 
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
            setNewSelectedQuestions(data.data ?? []);
            setLoadingGroupQuestions(false);
            setError(null);

            console.log('Preguntas del grupo obtenidas sp_get_group_questions:', data);
        } catch (err) {
            setError('Error al cargar las preguntas del grupo.');
            setSelectedQuestions([]);
        }
    }, []);

    const fetchQuestions = useCallback(async ({ accionName, groupId, questionId }: { accionName: string, groupId: string, questionId: string }) => {
        setLoadingQuestions(true);

        try {
            const response = await fetch(
                `${API_BASE}/groups/questions/to-add`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(
                        {
                            accion_name: accionName,
                            group_id: groupId,
                            question_id: questionId
                        })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            setQuestions(data);
            console.log('Preguntas obtenidas (to-add) sp_questions_group_accion:', data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }, []);


    useEffect(() => {
        if (!isOpen) {
            setSelectedQuestions([]);
            setError(null);
            return;
        }

        if (groupId) {
            fetchQuestions({ accionName: 'OF', groupId: groupId, questionId: '' });
            getGroupQuestions(groupId);

        }
    }, [groupId, isOpen, getGroupQuestions, fetchQuestions]);

    const handleAddQuestions = (question: Question) => {
        setNewSelectedQuestions(prev => {
            if (prev.some(q => q.question_id === question.id)) {
                return prev; // ya existe
            }

            return [
                {
                    question_id: question.id,
                    question: question.description,
                    question_added_on: question.created_on,
                    ai_generated: question.ai_generated,
                },
                ...prev
            ];
        });

        setInsertQuestions(prev => {
            if (prev.some(q => q.question_id === question.id)) {
                return prev; // evita duplicado
            }

            return [
                {
                    question_id: question.id,
                    question: question.description,
                    question_added_on: question.created_on,
                    ai_generated: question.ai_generated,
                },
                ...prev
            ];
        });

        setQuestions(prev => ({
            ...prev,
            data: prev.data.filter(q => q.id !== question.id),
        }));
    };


    const handleDeleteQuestions = async (question: QuestionGroup) => {

        setQuestions((prev) => ({
            ...prev,
            data: [
                {
                    id: question.question_id,
                    title: '',
                    description: question.question,
                    type: '',
                    tip_note: '',
                    created_on: '',
                    options: [],
                    ai_generated: question.ai_generated ?? false,
                    lang: '',
                    feedback: '',
                    status: '',
                },
                ...prev.data,
            ],
        }));
        setNewSelectedQuestions(prev => prev.filter(q => q.question_id !== question.question_id));
        setInsertQuestions((prev) => prev.filter(q => q.question_id !== question.question_id));
    };


    const insertIds = useMemo(() => {
        return newSelectedQuestions
            .filter(nsq => !selectedQuestions.some(sq => sq.question_id === nsq.question_id))
            .map(q => q.question_id);
    }, [newSelectedQuestions, selectedQuestions]);


    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        const deleteIds = selectedQuestions
            .filter(sq => !newSelectedQuestions.some(nsq => nsq.question_id === sq.question_id))
            .map(sq => sq.question_id);

        console.log('Preguntas a eliminar:', deleteIds);


        try {
            const response = await fetch(
                `${API_BASE}/groups/questions/add`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(
                        {
                            groupId: groupId,
                            questionIds: insertIds,
                            deleteIds: deleteIds
                        }
                    )
                }
            );

            const data = await response.json();
            if (!response.ok || data.success === false) {
                throw new Error(`Fallo al actualizar la pregunta: ${data.message || response.statusText}`);
            }
            console.log(response)
            onSuccess(); // Refrescar la tabla en el componente padre
            setIsOpen(false);
            toast.success(t('groups.questions.successUpdate'));
        } catch (err) {
            setError(t('groups.questions.errorUpdate'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasChanges = useMemo(() => {
        if (selectedQuestions.length !== newSelectedQuestions.length) {
            return true;
        }

        const originalIds = selectedQuestions.map(q => q.question_id).sort();
        const newIds = newSelectedQuestions.map(q => q.question_id).sort();

        return !originalIds.every((id, index) => id === newIds[index]);
    }, [selectedQuestions, newSelectedQuestions]);


    const normalizeText = (text: string) =>
        text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();


    const filteredQuestions = useMemo(() => {
        const filter = normalizeText(filterAvailable);

        return questions.data.filter(q =>
            normalizeText(q.description).includes(filter)
        );
    }, [questions.data, filterAvailable]);


    const filteredSelectedQuestions = useMemo(() => {
        const filter = normalizeText(filterSelected);

        return newSelectedQuestions.filter(q =>
            normalizeText(q.question).includes(filter)
        );
    }, [newSelectedQuestions, filterSelected]);


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>

            {/* Botón de Disparo  */}
            <DialogTrigger asChild>{triggerComponent}</DialogTrigger>


            <DialogContent className="min-w-[400px] sm:min-w-[700px] lg:min-w-[800px] ">
                {loadingQuestions && loadingGroupQuestions ? (

                    <div>{t('groups.questions.loading')}</div>
                ) :

                    (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {t('groups.questions.title')}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('groups.questions.description')}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg flex-1">
                                    <h2 className="font-bold mb-2">{t('groups.questions.listTitle')} ({questions.data.length})</h2>
                                    <Input
                                        placeholder={t('groups.questions.searchPlaceholder')}
                                        className="mb-3 bg-white rounded-sm h-6 py-4"
                                        value={filterAvailable}
                                        onChange={(e) => setFilterAvailable(e.target.value)}

                                    />
                                    <div className="max-h-96 overflow-y-auto flex flex-col gap-2 pr-1">
                                        {filteredQuestions.map((question, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded-sm gap-2">
                                                <p className="font-semibold text-sm">{question.description} {question.ai_generated ? <Wand2 className="w-4 h-4 inline text-yellow-600" /> : null}</p>
                                                <Button

                                                    className="bg-blue-500 hover:bg-blue-600 text-white w-3 h-6 cursor-pointer"
                                                    onClick={() => handleAddQuestions(question)}
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                </Button>

                                            </div>
                                        ))}


                                    </div>

                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg flex-1">
                                    <h2 className="font-bold mb-2">{t('groups.questions.selectedTitle')} ({newSelectedQuestions.length})</h2>
                                    <Input
                                        placeholder={t('groups.questions.searchPlaceholder')}
                                        className="mb-3 bg-white rounded-sm h-6 py-4"
                                        value={filterSelected}
                                        onChange={(e) => setFilterSelected(e.target.value)}

                                    />
                                    <div className="max-h-96 overflow-y-auto flex flex-col gap-2 pr-1">

                                        {filteredSelectedQuestions.length > 0 ? filteredSelectedQuestions.map((question, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded-sm gap-2">
                                                <p className="font-semibold text-sm">
                                                    {question.question} {question.ai_generated ? <Wand2 className="w-4 h-4 inline text-yellow-600" /> : null}
                                                </p>
                                                <Button
                                                    onClick={() => handleDeleteQuestions(question)}
                                                    className="bg-red-500 hover:bg-red-600 text-white w-3 h-6 cursor-pointer" >
                                                    <MinusIcon className="w-4 h-4" />
                                                </Button>

                                            </div>
                                        )) : (
                                            <p className="text-sm text-gray-600">{t('groups.questions.noSelected')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mensaje de Error */}
                            {error && (
                                <p className="col-span-4 text-center text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-200">
                                    {error}
                                </p>
                            )}

                            <DialogFooter className="mt-4">
                                <div>
                                    <Button variant="secondary" type="button" onClick={() => setIsOpen(false)} className="mr-2">
                                        {t('groups.questions.buttonCancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        className='bg-sky-500 hover:bg-sky-600'
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !hasChanges}>
                                        {isSubmitting ? t('groups.questions.buttonSaving') : t('groups.questions.buttonSave')}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </>

                    )}
            </DialogContent>
        </Dialog>
    )
}

export default GroupQuestionDialog