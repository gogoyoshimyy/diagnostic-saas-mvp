"use client"

import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AlertCircle } from "lucide-react"

export type DesignTone = "simple" | "cute" | "luxury"
export type WritingTone = "casual" | "serious" | "roast"

interface ToneSelectorProps {
    design?: DesignTone
    writing?: WritingTone
    onDesignChange: (design: DesignTone | undefined) => void
    onWritingChange: (writing: WritingTone | undefined) => void
}

const DESIGN_OPTIONS: { value: DesignTone; label: string }[] = [
    { value: "simple", label: "シンプル" },
    { value: "cute", label: "かわいい" },
    { value: "luxury", label: "高級感" },
]

const WRITING_OPTIONS: { value: WritingTone; label: string }[] = [
    { value: "casual", label: "ゆるい" },
    { value: "serious", label: "まじめ" },
    { value: "roast", label: "毒舌" },
]

export function ToneSelector({
    design,
    writing,
    onDesignChange,
    onWritingChange,
}: ToneSelectorProps) {
    return (
        <div className="space-y-4">
            {/* Design Tone */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">デザイン（カード）</Label>
                <ToggleGroup
                    type="single"
                    value={design}
                    onValueChange={(value) => onDesignChange(value as DesignTone | undefined)}
                >
                    {DESIGN_OPTIONS.map((option) => (
                        <ToggleGroupItem
                            key={option.value}
                            value={option.value}
                            aria-label={option.label}
                        >
                            {option.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            {/* Writing Tone */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">文章トーン</Label>
                <ToggleGroup
                    type="single"
                    value={writing}
                    onValueChange={(value) => onWritingChange(value as WritingTone | undefined)}
                >
                    {WRITING_OPTIONS.map((option) => (
                        <ToggleGroupItem
                            key={option.value}
                            value={option.value}
                            aria-label={option.label}
                        >
                            {option.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>

                {/* Warning for "roast" */}
                {writing === "roast" && (
                    <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>過激表現にならないよう自動で調整します</p>
                    </div>
                )}
            </div>
        </div>
    )
}
