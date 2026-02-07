import QuizFlow from "./QuizFlow";

export default async function QuizStartPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return <QuizFlow slug={slug} />;
}
