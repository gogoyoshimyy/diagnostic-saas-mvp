"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function CreateQuizPage() {
    const router = useRouter()
    const [topic, setTopic] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Handler to create a new quiz (Empty or AI)
    // For MVP, we will just create an empty shell, and THEN forward to edit page where AI can be triggered?
    // User Requirement: "AIで診断叩き台生成" button. 
    // Let's make an API call that creates the Quiz record + Runs AI Generation immediately, then redirects to edit.

    const handleCreate = async () => {
        if (!topic) return
        setIsLoading(true)

        try {
            const res = await fetch("/api/quizzes/create", {
                method: "POST",
                body: JSON.stringify({ topic }),
                headers: { "Content-Type": "application/json" }
            })

            if (!res.ok) throw new Error("Failed to create")

            const { id } = await res.json()
            router.push(`/quizzes/${id}/edit`)
        } catch (error) {
            console.error(error)
            alert("Failed to create quiz. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>新規診断作成</CardTitle>
                    <CardDescription>
                        テーマを入力して、AIで診断のたたき台を生成します。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="topic">テーマ / トピック</Label>
                        <Input
                            id="topic"
                            placeholder="例: あなたはどんな猫？"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <Button onClick={handleCreate} disabled={isLoading || !topic} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    AIが診断を作成中...
                                </>
                            ) : (
                                "AIで構成案を生成する"
                            )}
                        </Button>
                        <p className="text-xs text-center text-gray-400">
                            生成には10〜20秒ほどかかります。
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
