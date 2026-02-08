"use client"

import { useState, useMemo } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X, Plus } from "lucide-react"
import { CATEGORY_DATA, CategoryTag, CategorySection } from "@/types/quiz-creation"

interface CategoryPickerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedTags: CategoryTag[]
    primaryTag: CategoryTag | null
    onConfirm: (selectedTags: CategoryTag[], primaryTag: CategoryTag | null) => void
}

export function CategoryPickerDialog({
    open,
    onOpenChange,
    selectedTags: initialSelectedTags,
    primaryTag: initialPrimaryTag,
    onConfirm,
}: CategoryPickerDialogProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTags, setSelectedTags] = useState<CategoryTag[]>(initialSelectedTags)
    const [primaryTag, setPrimaryTag] = useState<CategoryTag | null>(initialPrimaryTag)

    const MAX_TAGS = 5

    // Filter tags based on search query
    const filteredSections = useMemo(() => {
        if (!searchQuery) return CATEGORY_DATA

        const query = searchQuery.toLowerCase()
        return CATEGORY_DATA.map((section) => ({
            ...section,
            tags: section.tags.filter((tag) => tag.toLowerCase().includes(query)),
        })).filter((section) => section.tags.length > 0)
    }, [searchQuery])

    // Check if search query doesn't match any existing tag
    const showAddCustom = useMemo(() => {
        if (!searchQuery.trim()) return false
        const query = searchQuery.toLowerCase()
        const allTags = CATEGORY_DATA.flatMap((s) => s.tags)
        return !allTags.some((tag) => tag.toLowerCase() === query)
    }, [searchQuery])

    const handleToggleTag = (tag: CategoryTag) => {
        if (selectedTags.includes(tag)) {
            // Remove tag
            const newTags = selectedTags.filter((t) => t !== tag)
            setSelectedTags(newTags)
            // If removing primary tag, set new primary
            if (tag === primaryTag) {
                setPrimaryTag(newTags.length > 0 ? newTags[0] : null)
            }
        } else {
            // Add tag (max 5)
            if (selectedTags.length >= MAX_TAGS) return
            const newTags = [...selectedTags, tag]
            setSelectedTags(newTags)
            // First tag becomes primary
            if (!primaryTag) {
                setPrimaryTag(tag)
            }
        }
    }

    const handleAddCustomTag = () => {
        const customTag = searchQuery.trim()
        if (!customTag || selectedTags.includes(customTag) || selectedTags.length >= MAX_TAGS) return

        const newTags = [...selectedTags, customTag]
        setSelectedTags(newTags)
        if (!primaryTag) {
            setPrimaryTag(customTag)
        }
        setSearchQuery("")
    }

    const handleRemoveTag = (tag: CategoryTag) => {
        const newTags = selectedTags.filter((t) => t !== tag)
        setSelectedTags(newTags)
        if (tag === primaryTag) {
            setPrimaryTag(newTags.length > 0 ? newTags[0] : null)
        }
    }

    const handleClear = () => {
        setSelectedTags([])
        setPrimaryTag(null)
    }

    const handleConfirm = () => {
        onConfirm(selectedTags, primaryTag)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>カテゴリを選ぶ</DialogTitle>
                    <DialogDescription>
                        診断のカテゴリを選んでください（最大5つ）。最初に選んだカテゴリがメインカテゴリになります。
                    </DialogDescription>
                </DialogHeader>

                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="カテゴリを検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                    <div className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                                選択中 ({selectedTags.length}/{MAX_TAGS})
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                className="h-7 text-xs"
                            >
                                クリア
                            </Button>
                        </div>
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
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                                            aria-label={`${tag}を削除`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Add Custom Tag */}
                {showAddCustom && (
                    <Button
                        variant="outline"
                        onClick={handleAddCustomTag}
                        className="justify-start gap-2"
                        disabled={selectedTags.length >= MAX_TAGS}
                    >
                        <Plus className="h-4 w-4" />
                        「{searchQuery}」を追加する
                    </Button>
                )}

                {/* Tag Sections */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {filteredSections.map((section) => (
                        <div key={section.id} className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground sticky top-0 bg-background py-1">
                                {section.name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {section.tags.map((tag) => {
                                    const isSelected = selectedTags.includes(tag)
                                    const isPrimary = tag === primaryTag
                                    return (
                                        <Badge
                                            key={tag}
                                            variant={isSelected ? (isPrimary ? "default" : "secondary") : "outline"}
                                            className={`cursor-pointer transition-colors ${isSelected ? "" : "hover:bg-accent"
                                                } ${selectedTags.length >= MAX_TAGS && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                                            onClick={() => handleToggleTag(tag)}
                                        >
                                            {tag}
                                            {isPrimary && isSelected && (
                                                <span className="ml-1 text-xs opacity-70">(メイン)</span>
                                            )}
                                        </Badge>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                    {filteredSections.length === 0 && !showAddCustom && (
                        <p className="text-center text-muted-foreground py-8">
                            該当するカテゴリが見つかりません
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        キャンセル
                    </Button>
                    <Button onClick={handleConfirm} disabled={selectedTags.length === 0}>
                        決定
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
