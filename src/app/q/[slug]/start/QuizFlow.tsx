"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Question = {
    id: string;
    text: string;
    optionA: string;
    optionB: string;
    axisKey: string;
    aSide: string;
    weight: number;
};

type Quiz = {
    id: string;
    slug: string;
    title: string;
    description: string;
    questions: Question[];
    results: Array<{
        code: string;
        name: string;
        tagline: string;
        description: string;
    }>;
    axes: Array<{
        key: string;
        leftLabel: string;
        rightLabel: string;
    }>;
};

export default function QuizFlow({ slug }: { slug: string }) {
    const router = useRouter();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, "A" | "B">>({});
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/q/${slug}`)
            .then(res => res.json())
            .then(data => {
                setQuiz(data.quiz);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [slug]);

    const handleAnswer = (choice: "A" | "B") => {
        if (!quiz) return;

        const questionId = quiz.questions[currentQuestion].id;
        setAnswers(prev => ({ ...prev, [questionId]: choice }));

        // Move to next question or show result
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            calculateAndShowResult();
        }
    };

    const calculateAndShowResult = () => {
        if (!quiz) return;

        // Calculate axis scores
        const axisScores: Record<string, number> = {};
        quiz.axes.forEach(axis => {
            axisScores[axis.key] = 0;
        });

        quiz.questions.forEach(question => {
            const answer = answers[question.id];
            if (!answer) return;

            const weight = question.weight || 1;
            const side = question.aSide; // "LEFT" or "RIGHT"

            if (answer === "A") {
                // If A maps to LEFT, increase left score (negative)
                axisScores[question.axisKey] += side === "LEFT" ? -weight : weight;
            } else {
                // If B is opposite of A
                axisScores[question.axisKey] += side === "LEFT" ? weight : -weight;
            }
        });

        // For MVP, just show the first result
        // In production, you'd match based on axis scores
        const resultData = {
            code: quiz.results[0]?.code || "DEFAULT",
            name: quiz.results[0]?.name || "あなたの結果",
            tagline: quiz.results[0]?.tagline || "",
            description: quiz.results[0]?.description || "診断が完了しました。",
            axisScores
        };

        setResult(resultData);
        setShowResult(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">読み込み中...</div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">診断が見つかりませんでした</div>
            </div>
        );
    }

    if (showResult) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
                <div className="max-w-2xl w-full bg-white shadow-lg rounded-xl overflow-hidden p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{result.name}</h1>
                    {result.tagline && (
                        <p className="text-lg text-blue-600 mb-6">{result.tagline}</p>
                    )}

                    <div className="mb-8">
                        <p className="text-gray-700 whitespace-pre-wrap">{result.description}</p>
                    </div>

                    {/* Axis Scores */}
                    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">あなたのスコア</h2>
                        {quiz.axes.map(axis => (
                            <div key={axis.key} className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>{axis.leftLabel}</span>
                                    <span>{axis.rightLabel}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all"
                                        style={{
                                            width: `${50 + (result.axisScores[axis.key] || 0) * 5}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setCurrentQuestion(0);
                                setAnswers({});
                                setShowResult(false);
                                setResult(null);
                            }}
                            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                        >
                            もう一度診断する
                        </button>
                        <button
                            onClick={() => router.push(`/q/${slug}`)}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                        >
                            診断ページに戻る
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="max-w-2xl w-full">
                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>質問 {currentQuestion + 1} / {quiz.questions.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-xl overflow-hidden p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">{quiz.title}</h1>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">
                            {question.text}
                        </h2>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleAnswer("A")}
                                className="w-full p-6 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span className="text-lg">{question.optionA}</span>
                            </button>
                            <button
                                onClick={() => handleAnswer("B")}
                                className="w-full p-6 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span className="text-lg">{question.optionB}</span>
                            </button>
                        </div>
                    </div>

                    {currentQuestion > 0 && (
                        <button
                            onClick={() => setCurrentQuestion(prev => prev - 1)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            ← 前の質問に戻る
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
