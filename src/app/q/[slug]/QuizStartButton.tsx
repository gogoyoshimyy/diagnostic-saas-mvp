"use client";

import { useRouter } from "next/navigation";

export default function QuizStartButton({ slug }: { slug: string }) {
    const router = useRouter();

    const handleStart = () => {
        // Navigate to the quiz flow (to be implemented)
        // For now, show an alert as MVP placeholder
        alert(`診断を開始します！\n\nスラッグ: ${slug}\n\n次のステップ:\n- 質問ページの実装\n- 回答の保存\n- 結果ページへの遷移`);

        // TODO: When quiz flow is implemented, use:
        // router.push(`/q/${slug}/1`); // Navigate to first question
    };

    return (
        <button
            onClick={handleStart}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
        >
            Start Diagnosis
        </button>
    );
}
