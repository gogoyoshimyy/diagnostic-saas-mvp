import { notFound } from "next/navigation";
import { Metadata } from "next";
import QuizStartButton from "./QuizStartButton";

// Requirement: Fetch from API
async function getQuizData(slug: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/q/${slug}`, {
        // Cache is handled by the API response headers usually, 
        // but fetch in Next.js Server Components defaults to 'force-cache' unless dynamic.
        // We want to respect the API's cache control or revalidate.
        // For PUBLIC, revalidate every 60s
        next: { revalidate: 60 }
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch quiz");
    }

    return res.json();
}

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const param = await params;
    const data = await getQuizData(param.slug);
    if (!data) return {};

    const { quiz } = data;
    const robots = quiz.status === "UNLISTED" ? "noindex, nofollow" : "index, follow";

    return {
        title: quiz.title,
        description: quiz.description,
        openGraph: {
            title: quiz.title,
            description: quiz.description,
        },
        robots: {
            index: quiz.status !== "UNLISTED",
            follow: quiz.status !== "UNLISTED",
        }
    };
}

export default async function QuizPublicPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const data = await getQuizData(params.slug);

    if (!data) {
        notFound();
    }

    const { quiz } = data;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="max-w-2xl w-full bg-white shadow-lg rounded-xl overflow-hidden p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                <p className="text-gray-600 mb-6">{quiz.description}</p>

                <div className="space-y-4">
                    <QuizStartButton slug={quiz.slug} />
                </div>

            </div>

            {/* Footer / Debug */}
            <div className="mt-8 text-xs text-gray-400">
                テンプレート: {quiz.designTemplate} | スラッグ: {quiz.slug}
            </div>
        </div>
    );
}
