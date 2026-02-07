import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus } from "lucide-react"

async function getQuizzes(userId: string) {
    return await prisma.quiz.findMany({
        where: { creatorId: userId },
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: {
                select: { responses: true } // Or dailyStats sum if we implemented that logic perfectly, but raw count ok for now or 0
            }
        }
    })
}

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.id) return null // Should be handled by middleware/layout usually but safe check

    const quizzes = await getQuizzes(session.user.id)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">診断一覧</h1>
                <Link href="/quizzes/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        新規診断作成
                    </Button>
                </Link>
            </div>

            {quizzes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                    <p className="text-gray-500 mb-4">まだ診断がありません。</p>
                    <Link href="/quizzes/new">
                        <Button variant="outline">最初の診断を作成する</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {quizzes.map((quiz: any) => (
                        <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                                    <Badge variant={
                                        quiz.status === 'PUBLIC' ? 'default' :
                                            quiz.status === 'UNLISTED' ? 'secondary' : 'outline'
                                    }>
                                        {quiz.status === 'PUBLIC' ? '公開中' :
                                            quiz.status === 'UNLISTED' ? '限定公開' : '下書き'}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {quiz.description || "説明なし"}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="flex justify-between border-t pt-4">
                                <span className="text-xs text-gray-500">
                                    更新: {new Date(quiz.updatedAt).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2">
                                    <Link href={`/quizzes/${quiz.id}/edit`}>
                                        <Button variant="ghost" size="sm">編集</Button>
                                    </Link>
                                    {(quiz.status === 'PUBLIC' || quiz.status === 'UNLISTED') && (
                                        <Link href={`/q/${quiz.slug}`} target="_blank">
                                            <Button variant="ghost" size="sm" className="text-blue-600">確認</Button>
                                        </Link>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
