"use client"

import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { CategoryTag } from "@/types/quiz-creation"

interface SelectedCategoryChipsProps {
    selectedTags: CategoryTag[]
    primaryTag: CategoryTag | null
    onRemove: (tag: CategoryTag) => void
}

export function SelectedCategoryChips({
    selectedTags,
    primaryTag,
    onRemove,
}: SelectedCategoryChipsProps) {
    if (selectedTags.length === 0) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => {
                const isPrimary = tag === primaryTag
                return (
                    <Badge
                        key={tag}
                        variant={isPrimary ? "default" : "secondary"}
                        className="px-3 py-1.5 text-sm gap-1.5"
                    >
                        {tag}
                        {isPrimary && (
                            <span className="text-xs opacity-70">(メイン)</span>
                        )}
                        <button
                            onClick={() => onRemove(tag)}
                            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                            aria-label={`${tag}を削除`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                )
            })}
        </div>
    )
}
