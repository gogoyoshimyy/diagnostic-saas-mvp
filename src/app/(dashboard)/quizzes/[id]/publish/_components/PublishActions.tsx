"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PublishActions({ quizId, currentStatus }: { quizId: string, currentStatus: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const updateStatus = async (newStatus: string) => {
        setLoading(true)
        try {
            await fetch(`/api/quizzes/${quizId}/publish`, {
                method: "POST",
                body: JSON.stringify({ status: newStatus }),
                headers: { "Content-Type": "application/json" }
            })
            router.refresh()
        } catch (e) {
            console.error(e)
            alert("Failed to update status")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            {currentStatus !== 'PUBLIC' && (
                <Button onClick={() => updateStatus('PUBLIC')} disabled={loading}>
                    公開する
                </Button>
            )}
            {currentStatus !== 'UNLISTED' && (
                <Button variant="secondary" onClick={() => updateStatus('UNLISTED')} disabled={loading}>
                    限定公開にする
                </Button>
            )}
            {currentStatus !== 'DRAFT' && (
                <Button variant="outline" onClick={() => updateStatus('DRAFT')} disabled={loading}>
                    下書きに戻す
                </Button>
            )}
        </div>
    )
}
