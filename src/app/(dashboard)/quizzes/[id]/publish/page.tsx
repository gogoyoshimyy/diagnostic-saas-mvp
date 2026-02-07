import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import PublishActions from "./_components/PublishActions"
// We will create PublishActions component to handle client-side logic (status toggle, generation)

export default async function PublishPage(props: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const params = await props.params;

    const quiz = await prisma.quiz.findUnique({
        where: { id: params.id },
        include: {
            shareAssets: true,
        }
    })

    if (!quiz || quiz.creatorId !== session?.user?.id) {
        notFound()
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quiz.slug}`

    // Identify assets
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subcopies = quiz.shareAssets.filter((a: any) => a.kind === "SUBCOPY");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shareTexts = quiz.shareAssets.filter((a: any) => a.kind === "SHARETEXT");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedSubcopy = subcopies.find((a: any) => a.selected) || subcopies[0];

    // Promo card URL (dynamic)
    const promoCardUrl = `/api/q/${quiz.slug}/promo-card?title=${encodeURIComponent(quiz.title)}&subcopy=${encodeURIComponent(selectedSubcopy?.content || "")}`

    return (
        <div className="container mx-auto py-6 px-4 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/quizzes/${quiz.id}/edit`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Publish Settings</h1>
            </div>

            <div className="grid gap-6">
                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>公開ステータス</CardTitle>
                        <CardDescription>診断の公開範囲を設定します。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Label>現在のステータス:</Label>
                            <Badge variant={
                                quiz.status === 'PUBLIC' ? 'default' :
                                    quiz.status === 'UNLISTED' ? 'secondary' : 'outline'
                            }>
                                {quiz.status === 'PUBLIC' ? '公開中' :
                                    quiz.status === 'UNLISTED' ? '限定公開' : '下書き'}
                            </Badge>
                        </div>

                        {quiz.status !== 'DRAFT' && (
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                                <Label className="text-xs text-green-800">公開URL</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input readOnly value={publicUrl} className="bg-white h-8 text-sm" />
                                    <Link href={publicUrl} target="_blank">
                                        <Button size="sm" variant="outline"><ExternalLink className="h-3 w-3" /></Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        <PublishActions quizId={quiz.id} currentStatus={quiz.status} />
                    </CardContent>
                </Card>

                {/* Promo Card Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>SNS用プロモカード</CardTitle>
                        <CardDescription>
                            シェア時に表示される画像です。診断タイトルとサブコピーを使用して動的に生成されます。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center bg-gray-100 p-8 rounded-b-lg">
                        {/* Using key to force refresh if needed, simplified for MVP */}
                        <div className="relative shadow-xl rounded-xl overflow-hidden" style={{ width: '270px', height: '480px' }}>
                            {/* We display the actual API generated image scaled down */}
                            <img
                                src={promoCardUrl}
                                alt="Promo Card Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Share Assets Generation Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>シェア用テキスト (AI生成)</CardTitle>
                        <CardDescription>SNSでシェアするための魅力的なテキストを生成します。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-400">
                            [MVP制限事項] 以下の機能は未実装です。
                            <br />1. サブコピー生成 API
                            <br />2. シェアテキスト生成 API
                            <br />3. アセット選択/編集 UI
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
