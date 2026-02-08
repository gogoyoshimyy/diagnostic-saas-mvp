"use client"

import { Button } from "@/components/ui/button"
import { CategoryTag, getTitleSuggestions } from "@/types/quiz-creation"

interface TitleSuggestionsProps {
    primaryTag: CategoryTag | null
    onSelect: (title: string) => void
}

export function TitleSuggestions({
    primaryTag,
    onSelect,
}: TitleSuggestionsProps) {
    if (!primaryTag) {
        return null
    }

    const suggestions = getTitleSuggestions(primaryTag)

    return (
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">おすすめのタイトル</p>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                    <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => onSelect(suggestion)}
                        className="h-8 text-sm"
                    >
                        {suggestion}
                    </Button>
                ))}
            </div>
        </div>
    )
}
