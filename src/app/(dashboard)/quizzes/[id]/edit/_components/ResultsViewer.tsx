"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResultType {
    id: string
    code: string
    name: string
    descriptionShort?: string
    descriptionLong?: string
}

interface Props {
    results: ResultType[]
}

export default function ResultsViewer({ results }: Props) {
    if (!results.length) {
        return <div className="text-gray-500">No results generated yet.</div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map(res => (
                <Card key={res.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-lg font-bold text-slate-800 flex justify-between items-center">
                            {res.name}
                            <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">{res.code}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm text-slate-600 leading-relaxed">
                        {res.descriptionShort || res.descriptionLong || "No description provided."}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
