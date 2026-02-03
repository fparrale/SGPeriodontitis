import { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '@/lib/config';

type UploadResponse = {
    created: number;
    skipped: string[];
    totalReceived: number;
}

interface GenAiQuestionDialogProps {
    fetchQuestions(): void;
    showInfoModal(response: UploadResponse): void;
}

export default function GenAiQuestionDialog({ fetchQuestions, showInfoModal }: GenAiQuestionDialogProps) {
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [open, setOpen] = useState(false);
    const [questionCount, setQuestionCount] = useState(5);
    const [selectedDifficulty, setSelectedDifficulty] = useState('baja');
    const [selectedLanguage, setSelectedLanguage] = useState('es');

    const difficultyLevels = [
        { value: 'baja', label: t('questions.genAI.levels.low') },
        { value: 'media', label: t('questions.genAI.levels.medium') },
        { value: 'alta', label: t('questions.genAI.levels.high') },
    ];

    const languageOptions = [
        { value: 'es', label: t('questions.genAI.languages.es') },
        { value: 'en', label: t('questions.genAI.languages.en') },
    ];


    const API_URL = `${API_BASE}/questions/ai/generate`;

    const handleGenerate = async () => {
        setIsGenerating(true);
        setUploadStatus('idle');
        setMessage(t('questions.genAI.generating'));
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    count: questionCount,
                    difficulty: selectedDifficulty,
                    lang: selectedLanguage,
                }),
            });

            const data = await response.json();

            if (response.ok && data.status === 200) {
                setUploadStatus('success');
                setMessage(`${t('questions.genAI.success')} ${data.message}`);
                showInfoModal(data.data);
                fetchQuestions(); // Refrescar la lista de preguntas
            } else {
                setUploadStatus('error');
                setMessage(`${t('questions.genAI.error')} ${data.message}`);
            }
        } catch (error) {
            console.error('Error generating questions with AI:', error);
            setUploadStatus('error');
            setMessage(t('questions.genAI.connectionError'));
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={(open: boolean) => {
            setOpen(open);
            if (!open) {
                setUploadStatus('idle');
                setQuestionCount(5);
                setSelectedDifficulty('baja');
                setSelectedLanguage('es');
                setMessage('');
            }
        }}>
            {/* Botón que Abre el Modal */}
            <DialogTrigger asChild>
                <Button className="bg-sky-500 hover:bg-sky-600 font-semibold shadow-md shadow-sky-300/40" >
                    <Wand2 className="w-4 h-4 mr-2" /> {t('questions.generateWithAI')}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Wand2 className="w-4 h-4 mr-2" /> {t('questions.genAI.title')}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        {t('questions.genAI.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cantidad" className="text-right font-medium">
                            {t('questions.genAI.quantity')}
                        </Label>
                        <div className="col-span-3 flex gap-2">
                            {[5, 10, 15].map((count) => (
                                <Button
                                    key={count}
                                    type="button"
                                    variant={questionCount === count ? "default" : "outline"}
                                    onClick={() => setQuestionCount(count)}
                                    className={`flex-1 transition-all ${questionCount === count
                                        ? 'bg-sky-200 hover:bg-sky-300 text-gray-800 border border-sky-400 shadow-sm'
                                        : 'hover:bg-sky-50 hover:border-sky-400'
                                        }`}
                                    disabled={isGenerating}
                                >
                                    {count}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dificultad" className="text-right font-medium">
                            {t('questions.genAI.difficulty')}
                        </Label>
                        <div className="col-span-3 flex gap-2">
                            {difficultyLevels.map((level) => (
                                <Button
                                    key={level.value}
                                    type="button"
                                    variant={selectedDifficulty === level.value ? "default" : "outline"}
                                    onClick={() => setSelectedDifficulty(level.value)}
                                    className={`flex-1 transition-all ${selectedDifficulty === level.value
                                        ? 'bg-sky-200 hover:bg-sky-300 text-gray-800 border border-sky-400 shadow-sm'
                                        : 'hover:bg-sky-50 hover:border-sky-400'
                                        }`}
                                    disabled={isGenerating}
                                >
                                    {level.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="idioma" className="text-right font-medium">
                            {t('questions.genAI.language')}
                        </Label>
                        <Select onValueChange={setSelectedLanguage} defaultValue='es' disabled={isGenerating}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('questions.genAI.selectLanguage')} defaultValue={selectedLanguage} />
                            </SelectTrigger>

                            <SelectContent>
                                {languageOptions.map((l) => (
                                    <SelectItem key={l.value} value={l.value}>
                                        {l.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>


                    {isGenerating && (
                        <div className="mt-4">
                            <Progress value={isGenerating ? 75 : 0} className="w-full h-2 bg-sky-100" />
                            <p className="text-center text-sm text-sky-600 mt-2 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {message}
                            </p>
                        </div>
                    )}

                    {/* Mensaje de Estado */}
                    {uploadStatus !== 'idle' && !isGenerating && (
                        <p className={`mt-2 p-2 rounded-md font-semibold text-sm ${uploadStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {message}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => handleGenerate()}
                        disabled={questionCount <= 0 || selectedDifficulty === '' || isGenerating}
                        className={`bg-sky-500 hover:bg-sky-600 font-semibold transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isGenerating ? t('questions.genAI.buttonGenerating') : t('questions.genAI.buttonGenerate')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}