"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    computeAxisScores,
    computeResultCode,
    filterRecommendations,
    AnswerValue,
    ScorableQuestion,
    AxisDef,
    RecommendationDef
} from "@/lib/score";

// API Response Types matching route.ts
type Question = {
    id: string;
    text: string;
    optionA: string;
    optionB: string;
    axisKey: string;
    aSide: string; // "LEFT" | "RIGHT"
    weight: number;
};

type ResultType = {
    code: string;
    name: string;
    tagline: string;
    description: string;
};

type Quiz = {
    id: string;
    slug: string;
    title: string;
    description: string;
    questions: Question[];
    results: ResultType[];
    axes: Array<{
        key: string;
        leftLabel: string;
        rightLabel: string;
    }>;
    recommendations: RecommendationDef[];
};

export default function QuizFlow({ slug }: { slug: string }) {
    const router = useRouter();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
    const [showResult, setShowResult] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const handleAnswer = (val: AnswerValue) => {
        if (!quiz) return;

        const questionId = quiz.questions[currentQuestion].id;
        setAnswers(prev => ({ ...prev, [questionId]: val }));

        // Move to next question or show result
        if (currentQuestion < quiz.questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestion(prev => prev + 1);
            }, 250); // Slight delay for feedback
        } else {
            calculateAndShowResult({ ...answers, [questionId]: val });
        }
    };

    const calculateAndShowResult = (finalAnswers: Record<string, AnswerValue>) => {
        if (!quiz) return;

        // 1. Calculate scores
        const axisScores = computeAxisScores(
            quiz.questions,
            finalAnswers,
            quiz.axes
        );

        // 2. Determine Result Code
        const resultCode = computeResultCode(axisScores, quiz.axes);
        console.log("Calculated Result Code:", resultCode);

        // 3. Find matching result type
        // fallback to first if not found (MVP)
        const matchedResult = quiz.results.find(r => r.code === resultCode) || quiz.results[0];

        // 4. Filter Recommendations based on scores
        const validRecommendations = filterRecommendations(quiz.recommendations, axisScores);

        const resultData = {
            ...matchedResult,
            axisScores,
            recommendations: validRecommendations
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

    if (showResult && result) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
                <div className="max-w-2xl w-full bg-white shadow-lg rounded-xl overflow-hidden p-8 animate-in fade-in zoom-in duration-300">
                    <div className="text-center mb-6">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-2">
                            診断結果
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{result.name}</h1>
                        {result.tagline && (
                            <p className="text-xl text-blue-600 font-medium">{result.tagline}</p>
                        )}
                    </div>

                    <div className="mb-8 p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {result.description}
                        </p>
                    </div>

                    {/* Axis Scores */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>📊</span> 分析スコア
                        </h2>
                        <div className="space-y-4">
                            {quiz.axes.map(axis => {
                                const score = result.axisScores[axis.key];
                                const percent = 50 + (score.normalized * 50); // -1.0~1.0 -> 0~100%
                                return (
                                    <div key={axis.key}>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
                                            <span>{axis.leftLabel}</span>
                                            <span>{axis.rightLabel}</span>
                                        </div>
                                        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                            {/* Center marker */}
                                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white z-10 opacity-50"></div>
                                            <div
                                                className={`h-full transition-all duration-1000 ease-out rounded-full ${score.normalized < 0
                                                        ? "bg-gradient-to-r from-blue-400 to-blue-500 float-right origin-left" // This logic is visualizing... wait.
                                                        // Simple bar: width from 0 to 100%
                                                        : "bg-gradient-to-r from-blue-500 to-blue-600"
                                                    }`}
                                                style={{
                                                    width: `${percent}%`,
                                                    background: `linear-gradient(90deg, 
                                                        ${percent < 50 ? '#93c5fd' : '#e0f2fe'} 0%, 
                                                        ${percent < 50 ? '#3b82f6' : '#93c5fd'} ${Math.max(0, percent)}%, 
                                                        ${percent > 50 ? '#3b82f6' : '#e0f2fe'} ${Math.min(100, Math.max(0, percent))}%, 
                                                        ${percent > 50 ? '#1d4ed8' : '#e0f2fe'} 100%)`
                                                    // Simpler visualization:
                                                }}
                                            />
                                            {/* Re-doing bar visualization for clarity */}
                                            <div
                                                className="absolute top-0 bottom-0 bg-blue-500 transition-all duration-1000"
                                                style={{
                                                    left: score.normalized < 0 ? `${percent}%` : '50%',
                                                    width: `${Math.abs(score.normalized * 50)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span>💡</span> あなたにおすすめ
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {result.recommendations.map((rec: any) => (
                                    <a
                                        key={rec.id}
                                        href={rec.url || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
                                    >
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                                {rec.title}
                                            </h3>
                                            {rec.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {rec.description}
                                                </p>
                                            )}
                                        </div>
                                        {rec.priority === "HIGH" && (
                                            <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 text-center">
                                                おすすめ
                                            </div>
                                        )}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => {
                                setCurrentQuestion(0);
                                setAnswers({});
                                setShowResult(false);
                                setResult(null);
                            }}
                            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                        >
                            もう一度
                        </button>
                        <button
                            onClick={() => router.push(`/q/${slug}`)}
                            className="flex-1 py-3 px-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                        >
                            トップに戻る
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    // Scale Options Definition
    const scaleOptions: { val: AnswerValue; label: string; size: string }[] = [
        { val: -2, label: "すごくA", size: "h-12 w-12" },
        { val: -1, label: "Aに近い", size: "h-10 w-10" },
        { val: 0, label: "どちらとも\nいえない", size: "h-8 w-8 text-xs" },
        { val: 1, label: "Bに近い", size: "h-10 w-10" },
        { val: 2, label: "すごくB", size: "h-12 w-12" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
            <div className="max-w-2xl w-full">
                {/* Progress Bar */}
                <div className="mb-8 px-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                        <span>Question {currentQuestion + 1} / {quiz.questions.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden p-6 sm:p-10 relative">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 text-center leading-relaxed">
                        Q. {question.text}
                    </h1>

                    {/* A/B Labels Area */}
                    <div className="flex justify-between items-stretch gap-4 mb-8">
                        <div className="flex-1 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-900 font-medium text-center flex items-center justify-center">
                            {question.optionA}
                        </div>
                        <div className="hidden sm:flex items-center text-gray-300 font-bold text-sm">
                            VS
                        </div>
                        <div className="flex-1 p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-orange-900 font-medium text-center flex items-center justify-center">
                            {question.optionB}
                        </div>
                    </div>

                    {/* Scale Buttons (Mobile Optimized) */}
                    <div className="relative">
                        {/* Connecting line */}
                        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-100 -z-0 -translate-y-1/2 rounded-full hidden sm:block"></div>

                        <div className="flex justify-between items-center sm:gap-2">
                            {scaleOptions.map((opt, idx) => {
                                // Color logic
                                const isA = opt.val < 0;
                                const isB = opt.val > 0;
                                const baseColor = isA ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" :
                                    isB ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" :
                                        "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200";
                                const activeRing = "active:ring-2 ring-offset-2 ring-gray-300";
                                return (
                                    <button
                                        key={opt.val}
                                        onClick={() => handleAnswer(opt.val)}
                                        className={`
                                            relative z-10 rounded-full border-2 flex flex-col items-center justify-center transition-all transform hover:scale-110 ${activeRing}
                                            ${opt.size}
                                            ${baseColor}
                                        `}
                                        aria-label={opt.label}
                                    >
                                        <span className={`hidden sm:block absolute -bottom-8 whitespace-nowrap text-xs font-bold ${isA ? "text-blue-600" : isB ? "text-orange-600" : "text-gray-400"}`}>
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {/* Mobile labels helper below buttons */}
                        <div className="flex justify-between mt-3 px-1 sm:hidden">
                            <span className="text-xs font-bold text-blue-600">A</span>
                            <span className="text-[10px] text-gray-400">中立</span>
                            <span className="text-xs font-bold text-orange-600">B</span>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        {currentQuestion > 0 && (
                            <button
                                onClick={() => setCurrentQuestion(prev => prev - 1)}
                                className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
                            >
                                ← 戻る
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
