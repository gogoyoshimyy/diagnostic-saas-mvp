"use client"

import { useActionState, useState } from "react"
import { updateResultType } from "@/app/actions/quiz-editor"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Pencil, Check, X } from "lucide-react"

interface ResultType {
    id: string
    code: string
    name: string
    descriptionShort?: string
    descriptionLong?: string
}

interface Props {
    quizId: string
    results: ResultType[]
}

function ResultItem({ result, quizId }: { result: ResultType, quizId: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const updateWithId = updateResultType.bind(null, quizId)
    const [state, action, isPending] = useActionState(updateWithId, { message: "", errors: {} })

    if (!isEditing) {
        return (
            <Card className="hover:border-slate-300 transition-colors">
                <CardHeader className="py-3 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-mono bg-slate-100 text-xs px-2 py-1 rounded">{result.code}</span>
                        <h3 className="font-bold text-sm">{result.name}</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="py-2 text-sm text-gray-600">
                    {result.descriptionShort || "No description"}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-blue-200 shadow-sm transition-all">
            <form action={action} onSubmit={() => setTimeout(() => setIsEditing(false), 500)} className="p-4 space-y-4">
                <input type="hidden" name="id" value={result.id} />

                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-400">{result.code}</span>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" variant="default" disabled={isPending}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">診断名</label>
                    <Input
                        name="name"
                        defaultValue={result.name}
                        placeholder="診断結果の名前 (例: コマンダータイプ)"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">説明文</label>
                    <Textarea
                        name="description"
                        defaultValue={result.descriptionShort || ""}
                        placeholder="短い説明文を入力してください"
                        rows={3}
                    />
                </div>

                {state.message && (
                    <p className={`text-xs ${Object.keys(state.errors).length > 0 ? "text-red-500" : "text-green-600"}`}>
                        {state.message}
                    </p>
                )}
            </form>
        </Card>
    )
}

export default function ResultsEditor({ quizId, results }: Props) {
    if (!results.length) return <div className="text-gray-500">No results found.</div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r) => (
                <ResultItem key={r.id} result={r} quizId={quizId} />
            ))}
        </div>
    )
}
