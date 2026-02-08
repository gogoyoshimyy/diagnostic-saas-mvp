"use client"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

const TARGET_SECTIONS = [
    {
        id: "age",
        name: "年代",
        options: ["10代", "20代", "30代", "40代", "50代+"],
    },
    {
        id: "gender",
        name: "性別寄り",
        options: ["女性向け", "男性向け", "どちらも"],
    },
    {
        id: "attribute",
        name: "属性",
        options: ["学生", "社会人", "主婦", "観光客", "オタク層", "カップル", "ファミリー"],
    },
]

interface TargetSelectorProps {
    tags: string[]
    note?: string
    onTagsChange: (tags: string[]) => void
    onNoteChange: (note: string) => void
}

export function TargetSelector({
    tags,
    note,
    onTagsChange,
    onNoteChange,
}: TargetSelectorProps) {
    const MAX_TAGS = 5

    const handleToggle = (tag: string) => {
        if (tags.includes(tag)) {
            // Remove
            onTagsChange(tags.filter((t) => t !== tag))
        } else {
            // Add if under max
            if (tags.length < MAX_TAGS) {
                onTagsChange([...tags, tag])
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-sm font-medium">
                    対象・ターゲット（最大{MAX_TAGS}個）
                </Label>

                {/* Selected Tags Display */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md border">
                        {tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="default"
                                className="px-3 py-1.5"
                            >
                                {tag}
                                <button
                                    onClick={() => handleToggle(tag)}
                                    className="ml-1.5 hover:bg-black/10 rounded-full p-0.5"
                                    aria-label={`${tag}を削除`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Grouped Options */}
                <div className="space-y-3">
                    {TARGET_SECTIONS.map((section) => (
                        <div key={section.id} className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                                {section.name}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {section.options.map((option) => {
                                    const isSelected = tags.includes(option)
                                    const isDisabled = !isSelected && tags.length >= MAX_TAGS

                                    return (
                                        <Badge
                                            key={option}
                                            variant={isSelected ? "default" : "outline"}
                                            className={`cursor-pointer transition-colors px-3 py-1.5 ${isDisabled
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : "hover:bg-accent"
                                                }`}
                                            onClick={() => !isDisabled && handleToggle(option)}
                                        >
                                            {option}
                                        </Badge>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Note Input */}
            <div className="space-y-2">
                <Label htmlFor="target-note" className="text-sm text-muted-foreground">
                    補足（任意）
                </Label>
                <Input
                    id="target-note"
                    placeholder="例：地方移住検討者、経営者層"
                    value={note || ""}
                    onChange={(e) => onNoteChange(e.target.value)}
                />
            </div>
        </div>
    )
}
