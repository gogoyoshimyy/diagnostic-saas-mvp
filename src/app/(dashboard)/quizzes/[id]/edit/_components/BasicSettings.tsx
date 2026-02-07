"use client"

import { useActionState } from "react"
import { updateBasic } from "@/app/actions/quiz-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Props {
    quiz: {
        id: string
        title: string
        description: string | null
        slug: string
    }
}

export default function BasicSettings({ quiz }: Props) {
    const updateBasicWithId = updateBasic.bind(null, quiz.id)
    const [state, action, isPending] = useActionState(updateBasicWithId, { message: "", errors: {} })

    return (
        <form action={action} className="space-y-6">
            {state.message && (
                <Alert variant={Object.keys(state.errors).length > 0 ? "destructive" : "default"}>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={quiz.title}
                    required
                />
                {state.errors?.title && <p className="text-sm text-red-500">{state.errors.title}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">スラッグ (URLの一部になります)</Label>
                <Input
                    id="slug"
                    name="slug"
                    defaultValue={quiz.slug}
                    required
                />
                {state.errors?.slug && <p className="text-sm text-red-500">{state.errors.slug}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">説明文</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={quiz.description || ""}
                    rows={4}
                />
            </div>

            <div className="pt-4">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "保存中..." : "変更を保存"}
                </Button>
            </div>
        </form>
    )
}
