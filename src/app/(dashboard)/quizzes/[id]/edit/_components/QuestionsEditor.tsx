"use client"

import { useActionState, useState } from "react"
import { updateQuestion } from "@/app/actions/quiz-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pencil, Save, X } from "lucide-react"

interface Question {
    id: string
    text: string
    optionA: string
    optionB: string
    axisKey: string
    weight: number
    aSide: boolean
}

interface Props {
    quizId: string
    questions: Question[]
}

function QuestionItem({ question, quizId }: { question: Question, quizId: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const updateWithId = updateQuestion.bind(null, quizId)
    const [state, action, isPending] = useActionState(updateWithId, { message: "", errors: {} })

    if (!isEditing) {
        return (
            <Card className="hover:border-slate-300 transition-colors">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-medium flex-1">
                        Q. {question.text}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div className="p-2 bg-blue-50 text-blue-800 rounded">
                            <span className="font-bold mr-2">A:</span>{question.optionA}
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-800 rounded">
                            <span className="font-bold mr-2">B:</span>{question.optionB}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">Axis: {question.axisKey}</Badge>
                        <Badge variant="secondary" className="text-xs">Weight: {question.weight}</Badge>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-blue-200 shadow-sm">
            <form action={action} onSubmit={() => setTimeout(() => setIsEditing(false), 500)}>
                <input type="hidden" name="id" value={question.id} />
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <div className="w-full mr-4">
                        <Label htmlFor={`q-${question.id}`} className="sr-only">質問文</Label>
                        <Input
                            id={`q-${question.id}`}
                            name="text"
                            defaultValue={question.text}
                            placeholder="質問文を入力"
                            required
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={isPending}>
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`optA-${question.id}`} className="text-xs text-blue-600 font-bold mb-1 block">選択肢 A (Left)</Label>
                            <Input
                                id={`optA-${question.id}`}
                                name="optionA"
                                defaultValue={question.optionA}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor={`optB-${question.id}`} className="text-xs text-emerald-600 font-bold mb-1 block">選択肢 B (Right)</Label>
                            <Input
                                id={`optB-${question.id}`}
                                name="optionB"
                                defaultValue={question.optionB}
                                required
                            />
                        </div>
                    </div>
                    {state.message && (
                        <p className={`text-xs ${Object.keys(state.errors).length > 0 ? "text-red-500" : "text-green-600"}`}>
                            {state.message}
                        </p>
                    )}
                </CardContent>
            </form>
        </Card>
    )
}

export default function QuestionsEditor({ quizId, questions }: Props) {
    if (!questions.length) return <div className="text-gray-500">No questions found.</div>

    return (
        <div className="space-y-4">
            {questions.map((q) => (
                <QuestionItem key={q.id} question={q} quizId={quizId} />
            ))}
        </div>
    )
}
