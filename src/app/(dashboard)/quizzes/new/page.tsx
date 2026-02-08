"use client"

import { useReducer, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, Plus } from "lucide-react"

import { CategoryPickerDialog } from "@/components/quiz-creation/CategoryPickerDialog"
import { SelectedCategoryChips } from "@/components/quiz-creation/SelectedCategoryChips"
import { TitleSuggestions } from "@/components/quiz-creation/TitleSuggestions"
import { PurposeSelector } from "@/components/quiz-creation/PurposeSelector"
import { ToneSelector, DesignTone, WritingTone } from "@/components/quiz-creation/ToneSelector"
import { TargetSelector } from "@/components/quiz-creation/TargetSelector"
import { SettingsSummary } from "@/components/quiz-creation/SettingsSummary"
import { CategoryTag } from "@/types/quiz-creation"

// State Types
type QuizCreationState = {
    // Step 1: Category
    selectedTags: CategoryTag[]
    primaryTag: CategoryTag | null
    isDialogOpen: boolean

    // Step 2: Title
    title: string

    // Step 3: Advanced Settings (Structured)
    purpose: {
        selected: string[]
        note: string
    }
    tone: {
        design: DesignTone | undefined
        writing: WritingTone | undefined
    }
    target: {
        tags: string[]
        note: string
    }

    // Loading
    loadingStage: "axes" | "questions" | "results" | null
}

const initialState: QuizCreationState = {
    selectedTags: [],
    primaryTag: null,
    isDialogOpen: false,
    title: "",
    purpose: {
        selected: ["拡散"], // Default value
        note: "",
    },
    tone: {
        design: undefined,
        writing: undefined,
    },
    target: {
        tags: [],
        note: "",
    },
    loadingStage: null,
}

// Actions
type Action =
    | { type: "SET_CATEGORIES"; tags: CategoryTag[]; primary: CategoryTag | null }
    | { type: "REMOVE_CATEGORY"; tag: CategoryTag }
    | { type: "SET_DIALOG_OPEN"; open: boolean }
    | { type: "SET_TITLE"; title: string }
    | { type: "SET_PURPOSE_SELECTED"; selected: string[] }
    | { type: "SET_PURPOSE_NOTE"; note: string }
    | { type: "SET_TONE_DESIGN"; design: DesignTone | undefined }
    | { type: "SET_TONE_WRITING"; writing: WritingTone | undefined }
    | { type: "SET_TARGET_TAGS"; tags: string[] }
    | { type: "SET_TARGET_NOTE"; note: string }
    | { type: "SET_LOADING_STAGE"; stage: QuizCreationState["loadingStage"] }

// Reducer
function reducer(state: QuizCreationState, action: Action): QuizCreationState {
    switch (action.type) {
        case "SET_CATEGORIES":
            return { ...state, selectedTags: action.tags, primaryTag: action.primary }
        case "REMOVE_CATEGORY": {
            const newTags = state.selectedTags.filter((t) => t !== action.tag)
            const newPrimary =
                state.primaryTag === action.tag
                    ? newTags.length > 0
                        ? newTags[0]
                        : null
                    : state.primaryTag
            return { ...state, selectedTags: newTags, primaryTag: newPrimary }
        }
        case "SET_DIALOG_OPEN":
            return { ...state, isDialogOpen: action.open }
        case "SET_TITLE":
            return { ...state, title: action.title }
        case "SET_PURPOSE_SELECTED":
            return { ...state, purpose: { ...state.purpose, selected: action.selected } }
        case "SET_PURPOSE_NOTE":
            return { ...state, purpose: { ...state.purpose, note: action.note } }
        case "SET_TONE_DESIGN":
            return { ...state, tone: { ...state.tone, design: action.design } }
        case "SET_TONE_WRITING":
            return { ...state, tone: { ...state.tone, writing: action.writing } }
        case "SET_TARGET_TAGS":
            return { ...state, target: { ...state.target, tags: action.tags } }
        case "SET_TARGET_NOTE":
            return { ...state, target: { ...state.target, note: action.note } }
        case "SET_LOADING_STAGE":
            return { ...state, loadingStage: action.stage }
        default:
            return state
    }
}

export default function CreateQuizPage() {
    const router = useRouter()
    const [state, dispatch] = useReducer(reducer, initialState)

    const isLoading = state.loadingStage !== null
    const canSubmit = state.selectedTags.length > 0 && state.title.trim().length > 0

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + Enter to submit
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isLoading && canSubmit) {
                handleCreate()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isLoading, canSubmit]) // Dependency mostly on submit state

    const handleCreate = async () => {
        if (!canSubmit) return

        dispatch({ type: "SET_LOADING_STAGE", stage: "axes" })

        try {
            // Simulated loading stages
            setTimeout(() => dispatch({ type: "SET_LOADING_STAGE", stage: "questions" }), 1000)
            setTimeout(() => dispatch({ type: "SET_LOADING_STAGE", stage: "results" }), 2000)

            const res = await fetch("/api/quizzes/create", {
                method: "POST",
                body: JSON.stringify({
                    // Categories
                    selectedTags: state.selectedTags,
                    primaryTag: state.primaryTag,

                    // Title
                    title: state.title,

                    // Legacy string fields (backward compatibility if needed, otherwise send structured)
                    // For now, we update the API to accept current structure, OR we flatten it here?
                    // The previous plan said "Update API route to handle new payload format"
                    // So we send structured data.

                    purpose: {
                        selected: state.purpose.selected,
                        note: state.purpose.note
                    },
                    tone: {
                        design: state.tone.design,
                        writing: state.tone.writing
                    },
                    target: {
                        tags: state.target.tags,
                        note: state.target.note
                    }
                }),
                headers: { "Content-Type": "application/json" },
            })

            if (!res.ok) throw new Error("Failed to create")

            const { id } = await res.json()
            router.push(`/quizzes/${id}/edit`)
        } catch (error) {
            console.error(error)
            alert("Failed to create quiz. Please try again.")
            dispatch({ type: "SET_LOADING_STAGE", stage: null })
        }
    }

    const getLoadingText = () => {
        switch (state.loadingStage) {
            case "axes":
                return "軸作成中..."
            case "questions":
                return "設問作成中..."
            case "results":
                return "結果作成中..."
            default:
                return ""
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>新規診断作成</CardTitle>
                    <CardDescription>
                        カテゴリとタイトルを設定して、AIで診断を自動生成します
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Step 1: Category Selection */}
                    <div className="space-y-3">
                        <Label>Step 1: 何を診断する？</Label>
                        <Button
                            variant="outline"
                            onClick={() => dispatch({ type: "SET_DIALOG_OPEN", open: true })}
                            className="w-full justify-start gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {state.selectedTags.length === 0
                                ? "カテゴリを選ぶ"
                                : `カテゴリを編集（${state.selectedTags.length}個選択中）`}
                        </Button>
                        <SelectedCategoryChips
                            selectedTags={state.selectedTags}
                            primaryTag={state.primaryTag}
                            onRemove={(tag) => dispatch({ type: "REMOVE_CATEGORY", tag })}
                        />
                    </div>

                    {/* Step 2: Title */}
                    <div className="space-y-3">
                        <Label htmlFor="title">Step 2: 診断のタイトル</Label>
                        <Input
                            id="title"
                            placeholder="例: 酒タイプ診断 / 恋愛相性診断 / 今日のおすすめメニュー診断"
                            value={state.title}
                            onChange={(e) => dispatch({ type: "SET_TITLE", title: e.target.value })}
                            disabled={isLoading}
                        />
                        <TitleSuggestions
                            primaryTag={state.primaryTag}
                            onSelect={(title) => dispatch({ type: "SET_TITLE", title })}
                        />
                    </div>

                    {/* Step 3: Advanced Settings */}
                    <div>
                        <Accordion type="single" collapsible className="border-t pt-2">
                            <AccordionItem value="advanced" className="border-0">
                                <AccordionTrigger className="text-sm text-muted-foreground hover:no-underline py-2">
                                    詳細設定（任意）
                                </AccordionTrigger>
                                <AccordionContent className="space-y-8 pt-4 pb-2 px-1">

                                    {/* Purpose */}
                                    <PurposeSelector
                                        selected={state.purpose.selected}
                                        note={state.purpose.note}
                                        onSelectedChange={(selected) => dispatch({ type: "SET_PURPOSE_SELECTED", selected })}
                                        onNoteChange={(note) => dispatch({ type: "SET_PURPOSE_NOTE", note })}
                                    />

                                    {/* Tone */}
                                    <ToneSelector
                                        design={state.tone.design}
                                        writing={state.tone.writing}
                                        onDesignChange={(design) => dispatch({ type: "SET_TONE_DESIGN", design })}
                                        onWritingChange={(writing) => dispatch({ type: "SET_TONE_WRITING", writing })}
                                    />

                                    {/* Target */}
                                    <TargetSelector
                                        tags={state.target.tags}
                                        note={state.target.note}
                                        onTagsChange={(tags) => dispatch({ type: "SET_TARGET_TAGS", tags })}
                                        onNoteChange={(note) => dispatch({ type: "SET_TARGET_NOTE", note })}
                                    />

                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* Setting Summary (Visible even when collapsed) */}
                        <SettingsSummary
                            purpose={state.purpose.selected}
                            design={state.tone.design}
                            writing={state.tone.writing}
                            target={state.target.tags}
                        />
                    </div>

                    {/* CTA */}
                    <div className="pt-2 space-y-3">
                        <Button
                            onClick={handleCreate}
                            disabled={isLoading || !canSubmit}
                            className="w-full"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {getLoadingText()}
                                </>
                            ) : (
                                "AIで診断を作る（4軸/16問/16タイプ）"
                            )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            生成には10〜20秒ほどかかります
                            {!isLoading && canSubmit && (
                                <span className="block mt-1">
                                    ショートカット: Cmd/Ctrl + Enter
                                </span>
                            )}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Category Picker Dialog */}
            <CategoryPickerDialog
                open={state.isDialogOpen}
                onOpenChange={(open) => dispatch({ type: "SET_DIALOG_OPEN", open })}
                selectedTags={state.selectedTags}
                primaryTag={state.primaryTag}
                onConfirm={(tags, primary) =>
                    dispatch({ type: "SET_CATEGORIES", tags, primary })
                }
            />
        </div>
    )
}
