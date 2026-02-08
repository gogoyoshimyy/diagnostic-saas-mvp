"use client"

import { DesignTone, WritingTone } from "./ToneSelector"

interface SettingsSummaryProps {
    purpose: string[]
    design?: DesignTone
    writing?: WritingTone
    target: string[]
}

const DESIGN_LABELS: Record<DesignTone, string> = {
    simple: "シンプル",
    cute: "かわいい",
    luxury: "高級感",
}

const WRITING_LABELS: Record<WritingTone, string> = {
    casual: "ゆるい",
    serious: "まじめ",
    roast: "毒舌",
}

export function SettingsSummary({
    purpose,
    design,
    writing,
    target,
}: SettingsSummaryProps) {
    const parts: string[] = []

    // Purpose
    if (purpose.length > 0) {
        parts.push(purpose.join("・"))
    }

    // Design
    if (design) {
        parts.push(`${DESIGN_LABELS[design]}（デザイン）`)
    }

    // Writing
    if (writing) {
        parts.push(`${WRITING_LABELS[writing]}（文章）`)
    }

    // Target
    if (target.length > 0) {
        parts.push(target.join("・"))
    }

    if (parts.length === 0) {
        return null
    }

    return (
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3 mt-3">
            <span className="font-medium">生成設定：</span>
            {parts.join(" / ")}
        </div>
    )
}
