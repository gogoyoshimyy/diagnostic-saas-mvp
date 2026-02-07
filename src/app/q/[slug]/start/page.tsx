import { notFound } from "next/navigation";

async function getQuizData(slug: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/q/${slug}`, {
        next: { revalidate: 60 }
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch quiz");
    }

    return res.json();
}

export default async function QuizStartPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getQuizData(slug);

    if (!data) {
        notFound();
    }

    const { quiz } = data;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="max-w-2xl w-full bg-white shadow-lg rounded-xl overflow-hidden p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{quiz.title}</h1>

                <div className="mb-8">
                    <p className="text-gray-700 mb-4">診断を開始します。以下の質問に答えてください。</p>

                    {/* Display first question if available */}
                    {quiz.questions && quiz.questions.length > 0 ? (
                        <div className="space-y-6">
                            <div className="p-6 bg-blue-50 rounded-lg">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    質問 1 / {quiz.questions.length}
                                </h2>
                                <p className="text-lg text-gray-700 mb-6">
                                    {quiz.questions[0].text}
                                </p>

                                {/* Display options */}
                                <div className="space-y-3">
                                    <button
                                        className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                                    >
                                        {quiz.questions[0].optionA}
                                    </button>
                                    <button
                                        className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                                    >
                                        {quiz.questions[0].optionB}
                                    </button>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 text-center">
                                このページはMVP版です。質問への回答や結果表示機能は次のステップで実装予定です。
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg">
                            <p className="font-semibold">質問がまだ設定されていません</p>
                            <p className="text-sm mt-2">ダッシュボードから質問を作成してください。</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t">
                    <a
                        href={`/q/${slug}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                        ← 診断ページに戻る
                    </a>
                </div>
            </div>
        </div>
    );
}
