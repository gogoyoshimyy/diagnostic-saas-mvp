"use client";

import { useRouter } from "next/navigation";

export default function QuizStartButton({ slug }: { slug: string }) {
    const router = useRouter();

    const handleStart = () => {
        // Navigate to the first question
        router.push(`/q/${slug}/start`);
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
