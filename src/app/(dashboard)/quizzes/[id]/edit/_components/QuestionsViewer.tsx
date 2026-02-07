"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Axis {
    id: string
    key: string
    leftLabel: string
    rightLabel: string
}

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
    axes: Axis[]
    questions: Question[]
}

export default function QuestionsViewer({ axes, questions }: Props) {
    if (!axes.length || !questions.length) {
        return <div className="text-gray-500">No questions generated yet.</div>
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {axes.map(axis => (
                    <Card key={axis.id} className="bg-slate-50 border-slate-200">
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm font-medium text-slate-700 flex justify-between">
                                <span>{axis.key} 軸</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 px-4 text-xs text-slate-600">
                            Left: {axis.leftLabel} <br />
                            Right: {axis.rightLabel}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">生成された質問</h3>
                {questions.map((q, i) => (
                    <Card key={q.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Q{i + 1}. {q.text}</CardTitle>
                            <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    Axis: {q.axisKey}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    Weight: {q.weight}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100">
                                <span className="text-blue-600 font-bold block mb-1">A (Left Side)</span>
                                {q.optionA}
                            </div>
                            <div className="p-3 bg-emerald-50/50 rounded-md border border-emerald-100">
                                <span className="text-emerald-600 font-bold block mb-1">B (Right Side)</span>
                                {q.optionB}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
