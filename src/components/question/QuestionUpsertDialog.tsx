import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Loader2, Save } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { QuestionOption } from "@/types/questionType";
import { API_BASE } from "@/lib/config";

interface QuestionFormData {
    title: string;
    description: string;
    tip_note: string;
    lang: string;
    feedback: string;
    options: QuestionOption[];
}

const createInitialFormData = (): QuestionFormData => ({
    title: '',
    description: '',
    tip_note: '',
    lang: 'es',
    feedback: '',
    options: [
        { text_option: '', is_correct: 0 },
        { text_option: '', is_correct: 0 },
        { text_option: '', is_correct: 0 },
        { text_option: '', is_correct: 0 },
    ],
});

interface QuestionUpsertDialogProps {
    questionId?: string;
    triggerComponent: React.ReactNode;
    onSuccess: () => void;
}

export function QuestionUpsertDialog({ questionId, triggerComponent, onSuccess }: QuestionUpsertDialogProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<QuestionFormData>(createInitialFormData());
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const isEditMode = !!questionId;
    const title = isEditMode ? t('questions.dialog.titleEdit') : t('questions.dialog.titleCreate');

    const getQuestionById = async (id: string) => {
        const API_URL = `${API_BASE}/questions/${id}`;

        const response = await fetch(API_URL, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error fetching question: ${response.statusText}`);
        }
        return response.json();
    }

    const fetchQuestionData = async (id: string) => {
        setIsLoading(true);
        try {
            const questionResponse = await getQuestionById(id);
            const questionData = questionResponse.data;

            setFormData({
                title: questionData.title ?? '',
                description: questionData.description ?? '',
                tip_note: questionData.tip_note ?? '',
                lang: questionData.lang || 'es',
                feedback: questionData.feedback ?? '',
                options: Array.isArray(questionData.options) && questionData.options.length
                    ? questionData.options
                    : createInitialFormData().options,
            });
        } catch (error) {
            console.error('Error loading question:', error);
            toast.error(t('questions.dialog.loadError'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && isEditMode && questionId) {
            fetchQuestionData(questionId);
        } else if (isOpen && !isEditMode) {
            setFormData(createInitialFormData());
        }
    }, [isOpen, isEditMode, questionId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (value: string) => {
        setFormData({ ...formData, lang: value });
    };

    const handleOptionChange = (index: number, field: 'text_option' | 'is_correct', value: any) => {
        const newOptions = [...formData.options];
        if (field === 'is_correct') {
            newOptions.forEach((opt, i) => {
                opt.is_correct = i === index ? 1 : 0;
            });
        } else {
            newOptions[index][field] = value;
        }
        setFormData({ ...formData, options: newOptions });
    };

    const isFormValid =
        (formData.title ?? '').trim() !== '' &&
        (formData.description ?? '').trim() !== '' &&
        (formData.tip_note ?? '').trim() !== '' &&
        (formData.feedback ?? '').trim() !== '' &&
        formData.lang !== '' &&
        formData.options.every(opt => (opt.text_option ?? '').trim() !== '') &&
        formData.options.some(opt => opt.is_correct === 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);

        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode
            ? `${API_BASE}/questions/${questionId}`
            : `${API_BASE}/questions/create`;

        try {
            console.log("formdata options", formData.options);
            console.log("data to API:", formData);

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            console.log('Respuesta de la API:', response);

            if (response.ok) {
                onSuccess();
                toast.success(isEditMode ? t('questions.dialog.messages.updated') : t('questions.dialog.messages.created'));
                setIsOpen(false);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || t('questions.dialog.saveError'));
            }
        } catch (error) {
            console.error('Network error:', error);
            toast.error(t('questions.dialog.networkError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{triggerComponent}</DialogTrigger>

            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        {isEditMode ? t('questions.dialog.descriptionEdit') : t('questions.dialog.descriptionCreate')}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                        <span className="ml-2 text-gray-600">{t('questions.dialog.loadingData')}</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        {/* Título */}
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="font-bold">{t('questions.dialog.fields.title')}</Label>
                            <Input
                                id="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                className="h-10 border-sky-200 focus:border-sky-500"
                                maxLength={70}
                                required
                            />
                        </div>

                        {/* Descripción */}
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="font-bold">{t('questions.dialog.fields.description')}</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="border-sky-200 focus:border-sky-500 resize-none"
                                required
                                maxLength={240}
                                rows={3}
                            />
                        </div>

                        {/* Pista */}
                        <div className="grid gap-2">
                            <Label htmlFor="tip_note" className="font-bold">{t('questions.dialog.fields.tipNote')}</Label>
                            <Textarea
                                id="tip_note"
                                value={formData.tip_note}
                                onChange={handleChange}
                                className="border-sky-200 focus:border-sky-500 resize-none"
                                required
                                maxLength={150}
                                rows={2}
                            />
                        </div>

                        {/* Retroalimentación */}
                        <div className="grid gap-2">
                            <Label htmlFor="feedback" className="font-bold">{t('questions.dialog.fields.feedback')}</Label>
                            <Textarea
                                id="feedback"
                                value={formData.feedback}
                                onChange={handleChange}
                                className="border-sky-200 focus:border-sky-500 resize-none"
                                required
                                maxLength={230}
                                rows={2}
                            />
                        </div>

                        {/* Idioma */}
                        <div className="grid gap-2">
                            <Label className="font-bold">{t('questions.dialog.fields.language')}</Label>
                            <Select value={formData.lang} onValueChange={handleSelectChange}>
                                <SelectTrigger className="border-sky-200 focus:border-sky-500 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="es">{t('common.languages.es')}</SelectItem>
                                    <SelectItem value="en">{t('common.languages.en')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Opciones de Respuesta */}
                        <div className="grid gap-3 mt-4">
                            <Label className="font-bold text-base">{t('questions.dialog.fields.options')}</Label>
                            <p className="text-sm text-gray-600">
                                {isEditMode
                                    ? t('questions.dialog.descriptionEditOptions')
                                    : t('questions.dialog.descriptionCreateOptions')
                                }
                            </p>
                            {formData.options.map((option, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center border border-sky-200 rounded-lg p-3">
                                    <Textarea
                                        placeholder={`${t('questions.dialog.fields.option')} ${index + 1}`}
                                        value={option.text_option}
                                        onChange={(e) => handleOptionChange(index, 'text_option', e.target.value)}
                                        className="col-span-9 border-sky-200 focus:border-sky-500 resize-none"
                                        maxLength={170}
                                        rows={2}
                                        required
                                    />
                                    <div className="col-span-3 flex items-center gap-2">
                                        <Checkbox
                                            id={`correct-${index}`}
                                            checked={option.is_correct === 1}
                                            onCheckedChange={() => handleOptionChange(index, 'is_correct', option.is_correct === 1 ? 0 : 1)}
                                            className="w-5 h-5"
                                        />
                                        <Label htmlFor={`correct-${index}`} className="text-sm font-medium cursor-pointer whitespace-nowrap">
                                            {t('questions.dialog.fields.correct')}
                                        </Label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="submit"
                                disabled={!isFormValid || isSubmitting}
                                className="bg-sky-500 hover:bg-sky-600 font-semibold shadow-md shadow-sky-300/40"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 " />}
                                {isEditMode ? t('questions.dialog.buttons.saveChanges') : t('questions.dialog.buttons.createQuestion')}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
