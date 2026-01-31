import React, { useState } from 'react';
import { CloudUpload, CloudDownload, ListChecks, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { toast } from "sonner";
import { API_BASE } from '@/lib/config';

type FetchResponse = {
    message: string;
    status: number;
    data?: UploadResponse;
};

type UploadResponse = {
    created: number;
    skipped: string[];
    totalReceived: number;
}

type UploadQuestionsDialogProps = {
    fetchQuestions: () => void;
    showInfoModal(response: UploadResponse): void;
};


export default function UploadQuestionsDialog({ fetchQuestions, showInfoModal }: UploadQuestionsDialogProps) {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [open, setOpen] = useState(false);


    const API_URL = `${API_BASE}/questions/upload2`;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        } else {
            setFile(null);
        }
        // Limpiar estados al cambiar el archivo
        setUploadStatus('idle');
        setMessage('');
    };


    const handleDownloadTemplate = async () => {
        const url = `${API_BASE}/questions/template/download`;

        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            // si OK, descarga nativa del archivo
            const a = document.createElement("a");
            a.href = url;
            a.rel = "noopener";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch {
            toast.error(t('questions.upload.downloadTemplateError'));
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage(t('questions.upload.selectFile'));
            return;
        }

        setIsUploading(true);
        setUploadStatus('idle');
        setMessage(t('questions.upload.uploading'));

        const formData = new FormData();
        formData.append('csv_file', file);
        formData.append('csv_type', "question");
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            const result: FetchResponse = await response.json();

            console.log('Response from server:', result);

            if (response.ok && result.status === 200) {

                setUploadStatus('success');

                setMessage(t('questions.upload.success'));
                showInfoModal(result.data!);
                fetchQuestions(); // refresca la lista de preguntas
                toast.success(t('questions.upload.success'));

                // Limpiar después de 1.3 segundos y cerrar auto
                setTimeout(() => {
                    setOpen(false);
                    setUploadStatus('idle');
                    setMessage('');
                }, 1300);
            } else {
                setUploadStatus('error');
                setMessage(result.message || t('questions.upload.error'));
            }

        } catch (error) {
            setUploadStatus('error');
            setMessage(t('questions.upload.connectionError'));
            console.error('Fetch error:', error);
        } finally {
            setIsUploading(false);
            setFile(null); // Limpiar el archivo después de la subida

        }
    };

    return (
        <Dialog open={open} onOpenChange={(open: boolean) => {
            setOpen(open);
            if (!open) {
                setUploadStatus('idle');
                setMessage('');
                setFile(null);
            }
        }}>
            {/* Botón de Abrir el Modal */}
            <DialogTrigger asChild>
                <Button className="bg-sky-500 hover:bg-sky-600 font-semibold shadow-md shadow-sky-300/40">
                    <ListChecks className="w-4 h-4 mr-2" /> {t('questions.uploadCsv')}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <CloudUpload className="w-5 h-5 text-sky-500" /> {t('questions.upload.title')}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        {t('questions.upload.description')}
                    </DialogDescription>

                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="csvFile" className="text-right font-medium">
                            {t('questions.upload.fileLabel')}
                        </Label>
                        <Input
                            id="csvFile"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="col-span-3 border-sky-300 focus:border-sky-500"
                        />
                    </div>

                    {isUploading && (
                        <div className="mt-4">
                            <Progress value={isUploading ? 75 : 0} className="w-full h-2 bg-sky-100" />
                            <p className="text-center text-sm text-sky-600 mt-2 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {message}
                            </p>
                        </div>
                    )}

                    {/* Mensaje de Estado */}
                    {uploadStatus !== 'idle' && !isUploading && (
                        <p className={`mt-2 p-2 rounded-md font-semibold text-sm ${uploadStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {message}
                        </p>
                    )}
                </div>

                {/* Botón para descargar plantilla */}
                <div className="mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        className="w-full border-sky-200 text-sky-700 hover:bg-sky-50"
                    >
                        <CloudDownload className="w-4 h-4 mr-2" />
                        {t('questions.upload.buttonDownloadTemplate')}
                    </Button>
                    <p className="mt-1 text-xs text-gray-500">
                        {t('questions.upload.downloadTemplateHint')}
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className={`bg-sky-500 hover:bg-sky-600 font-semibold transition-all ${!file || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUploading ? t('questions.upload.buttonProcessing') : t('questions.upload.buttonUpload')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}