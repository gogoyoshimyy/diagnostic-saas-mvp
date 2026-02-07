import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"

// Components
import BasicSettings from "./_components/BasicSettings"
import QuestionsEditor from "./_components/QuestionsEditor"
import ResultsEditor from "./_components/ResultsEditor"
// import QuestionsViewer from "./_components/QuestionsViewer" // Backup if needed
// import ResultsViewer from "./_components/ResultsViewer"
// import PublishPanel from "./_components/PublishPanel"

export default async function QuizEditorPage(props: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const params = await props.params;

    const quiz = await prisma.quiz.findUnique({
        where: { id: params.id },
        include: {
            axes: true,
            questions: true,
            resultTypes: true
        }
    })

    if (!quiz || quiz.creatorId !== session?.user?.id) {
        notFound()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questions = quiz.questions.map((q: any) => ({ ...q, id: q.id, text: q.text, optionA: q.optionA, optionB: q.optionB, axisKey: q.axisKey, weight: q.weight, aSide: q.aSide }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = quiz.resultTypes.map((r: any) => ({ ...r, id: r.id, code: r.code, name: r.name, descriptionShort: r.descriptionShort ?? undefined, descriptionLong: r.descriptionLong ?? undefined }))

    return (
        <div className="container mx-auto py-6 px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{quiz.title}</h1>
                        <span className="text-sm text-gray-500 font-mono">{quiz.slug}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/quizzes/${quiz.id}/publish`}>
                        <Button>公開設定</Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="basics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basics">基本情報</TabsTrigger>
                    <TabsTrigger value="questions">質問・ロジック</TabsTrigger>
                    <TabsTrigger value="results">診断結果</TabsTrigger>
                </TabsList>

                <TabsContent value="basics" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>基本設定</CardTitle>
                            <CardDescription>タイトルや説明文を編集します。</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BasicSettings quiz={{
                                id: quiz.id,
                                title: quiz.title,
                                description: quiz.description,
                                slug: quiz.slug
                            }} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="questions" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>質問とロジック</CardTitle>
                            <CardDescription>最大4つの軸と、それに基づいた質問を定義します。</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <QuestionsEditor
                                quizId={quiz.id}
                                questions={questions}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="results" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>診断結果タイプ</CardTitle>
                            <CardDescription>診断の結未パターンを定義します。</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResultsEditor
                                quizId={quiz.id}
                                results={results}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
