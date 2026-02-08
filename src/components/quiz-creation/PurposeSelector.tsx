"use client"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

const PURPOSE_OPTIONS = [
    "拡散",
    "来店",
    "登録（LINE/メルマガ）",
    "販売",
    "問い合わせ",
    "採用/社内利用",
]

interface PurposeSelectorProps {
    selected: string[]
    note?: string
    onSelectedChange: (selected: string[]) => void
    onNoteChange: (note: string) => void
}

export function PurposeSelector({
    selected,
    note,
    onSelectedChange,
    onNoteChange,
}: PurposeSelectorProps) {
    const MAX_SELECTION = 2

    const handleToggle = (option: string) => {
        if (selected.includes(option)) {
            // Remove
            onSelectedChange(selected.filter((s) => s !== option))
        } else {
            // Add if under max
            if (selected.length < MAX_SELECTION) {
                onSelectedChange([...selected, option])
            }
        }
    }

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <Label className="text-sm font-medium">
                    目的・用途（最大{MAX_SELECTION}個）
                </Label>
                <div className="flex flex-wrap gap-2">
                    {PURPOSE_OPTIONS.map((option) => {
                        const isSelected = selected.includes(option)
                        const isDisabled = !isSelected && selected.length >= MAX_SELECTION

                        return (
                            <Badge
                                key={option}
                                variant={isSelected ? "default" : "outline"}
                                className={`cursor-pointer transition-colors px-3 py-1.5 ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"
                                    }`}
                                onClick={() => !isDisabled && handleToggle(option)}
                            >
                                {option}
                                {isSelected && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleToggle(option)
                                        }}
                                        className="ml-1.5 hover:bg-black/10 rounded-full p-0.5"
                                        aria-label={`${option}を削除`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </Badge>
                        )
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="purpose-note" className="text-sm text-muted-foreground">
                    補足（任意）
                </Label>
                <Input
                    id="purpose-note"
                    placeholder="例：EC誘導、予約導線"
                    value={note || ""}
                    onChange={(e) => onNoteChange(e.target.value)}
                />
            </div>
        </div>
    )
}
