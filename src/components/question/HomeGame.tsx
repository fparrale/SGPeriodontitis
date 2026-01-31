import { Separator } from "@radix-ui/react-select";
import { Loader2, Bookmark, ChevronRight, CircleDot, Check, X, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

// Interfaces
interface QuestionOption {
    text_option: string;
    is_correct: 0 | 1;
}

export interface Question {
    id: string;
    title: string;
    description: string;
    type: 'multiple_option' | 'true_false' | 'fill_in_the_blank';
    tip_note: string;
    created_on: string;
    options: QuestionOption[];
}

// Datos de Prueba
const mockPlayerQuestions: Question[] = [
    {
        id: "q1",
        title: "Fundamentos Periodontales",
        description: "¿Cuál de las siguientes es una característica clave de la gingivitis?",
        type: "multiple_option",
        tip_note: "Piensa en el primer signo visible de inflamación.",
        created_on: "2025-11-23 00:34:31",
        options: [
            { text_option: "Movilidad dental", is_correct: 0 },
            { text_option: "Sangrado de encías", is_correct: 1 },
            { text_option: "Pérdida ósea", is_correct: 0 }
        ]
    },
    {
        id: "q2",
        title: "Etiología de la Periodontitis",
        description: "La presencia de placa bacteriana es el único factor etiológico en la periodontitis. (Verdadero/Falso)",
        type: "true_false",
        tip_note: "Considera otros factores de riesgo, como la genética o el tabaquismo.",
        created_on: "2025-11-23 00:34:31",
        options: [
            { text_option: "Verdadero", is_correct: 0 },
            { text_option: "Falso", is_correct: 1 }
        ]
    },
    {
        id: "q3",
        title: "Anatomía Dental",
        description: "El ligamento periodontal une el diente al ______.",
        type: "fill_in_the_blank",
        tip_note: "Es el hueso que sostiene el diente.",
        created_on: "2025-11-23 00:34:31",
        options: [
            { text_option: "hueso alveolar", is_correct: 1 }
        ]
    },
];

export const HomeGame = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);


    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setQuestions(mockPlayerQuestions);
            setLoading(false);
        };
        fetchQuestions();
    }, []);

    const handleSelectQuestion = (id: string) => {
        setSelectedQuestion(selectedQuestion === id ? null : id);
        setSelectedOption(null);
        setFeedback(null);
    };

    const handleOptionClick = (optionText: string, isCorrect: 0 | 1) => {
        setSelectedOption(optionText);
        setFeedback(isCorrect === 1 ? 'correct' : 'incorrect');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-sky-200">
                <Loader2 className="w-16 h-16 animate-spin text-sky-600" />
                <p className="ml-4 text-2xl font-semibold text-sky-700">Cargando desafío...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-sky-200 p-8 flex flex-col items-center">

            <h1 className="text-5xl font-extrabold text-sky-800 drop-shadow-lg mb-12 animate-fade-in">
                Tu Desafío Diario 🧠
            </h1>

            <div className="w-full max-w-3xl space-y-6">
                {questions.map((q) => (
                    <Card
                        key={q.id}
                        className={`overflow-hidden rounded-xl shadow-xl border-t-8 **animate-fade-in-up** ${ // Usando animate-fade-in-up
                            selectedQuestion === q.id
                                ? 'border-sky-500 transform scale-102 transition-all duration-300'
                                : 'border-blue-300 hover:shadow-2xl hover:scale-101 transition-all duration-300'
                            }`}
                    >
                        {/* Header de la Pregunta (Clickable) */}
                        <CardHeader
                            className={`flex flex-row items-center justify-between p-6 cursor-pointer ${selectedQuestion === q.id ? 'bg-sky-50' : 'bg-white hover:bg-blue-50'
                                } transition-colors duration-200`}
                            onClick={() => handleSelectQuestion(q.id)}
                        >
                            <div className="flex items-center gap-4">
                                <Bookmark className={`w-6 h-6 ${selectedQuestion === q.id ? 'text-sky-600' : 'text-blue-400'}`} />
                                <CardTitle className="text-2xl font-bold text-gray-800">
                                    {q.title}
                                </CardTitle>
                            </div>
                            <ChevronRight className={`w-6 h-6 transform ${selectedQuestion === q.id ? 'rotate-90 text-sky-600' : 'text-blue-400'} transition-transform duration-200`} />
                        </CardHeader>

                        {/* Contenido Expandible (Descripción y Opciones) */}
                        {selectedQuestion === q.id && (
                            <CardContent className="p-6 pt-4 bg-white **animate-fade-in-down**"> {/* Usando animate-fade-in-down */}
                                <p className="text-gray-700 text-lg mb-4">{q.description}</p>

                                <Separator className="my-4 bg-blue-100" />

                                <h3 className="text-xl font-semibold text-sky-700 mb-3 flex items-center gap-2">
                                    <CircleDot className="w-5 h-5" /> Elige tu respuesta:
                                </h3>

                                <div className="space-y-3">
                                    {q.options.map((option, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className={`w-full py-3 h-auto text-left flex justify-between items-center text-lg rounded-lg border-2 
                                                ${selectedOption === option.text_option
                                                    ? (feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-700 font-bold'
                                                        : 'border-red-500 bg-red-50 text-red-700 font-bold')
                                                    : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800'
                                                } transition-all duration-200`}
                                            onClick={() => handleOptionClick(option.text_option, option.is_correct)}
                                            disabled={!!feedback} // Deshabilitar después de una selección
                                        >
                                            <span className="flex-1">{option.text_option}</span>
                                            {selectedOption === option.text_option && (
                                                feedback === 'correct'
                                                    ? <Check className="w-5 h-5 text-green-600" />
                                                    : <X className="w-5 h-5 text-red-600" />
                                            )}
                                        </Button>
                                    ))}
                                </div>

                                {feedback && (
                                    <p className={`mt-6 p-4 rounded-lg text-xl font-bold text-center **animate-bounce-in** ${ // Usando animate-bounce-in
                                        feedback === 'correct'
                                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                            : 'bg-red-100 text-red-700 border-2 border-red-300'
                                        }`}>
                                        {feedback === 'correct' ? '¡Respuesta Correcta! 🎉' : '¡Respuesta Incorrecta! 😔'}
                                    </p>
                                )}

                                <p className="mt-8 text-md text-sky-700 p-3 bg-blue-50/70 rounded-md border border-blue-200 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 flex-shrink-0" /> **Pista:** {q.tip_note}
                                </p>

                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>

        </div>
    );
}