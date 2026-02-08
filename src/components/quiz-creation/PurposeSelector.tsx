"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Data Definitions
const INTENTS = [
    { id: "hype", label: "盛り上げたい", emoji: "🚀", hasAction: false },
    { id: "accuracy", label: "当てたい", emoji: "🔮", hasAction: false },
    { id: "match", label: "相性を見たい", emoji: "💞", hasAction: false },
    { id: "self_analysis", label: "自分を知りたい", emoji: "🧠", hasAction: false },
    { id: "recommend", label: "おすすめを出したい", emoji: "🎁", hasAction: false },
    { id: "survey", label: "みんなの好みを知りたい", emoji: "📊", hasAction: false },
    { id: "next_step", label: "次の一歩を決めたい", emoji: "🎯", hasAction: true },
    { id: "participate", label: "参加してほしい", emoji: "🎪", hasAction: true },
] as const

const ACTIONS = [
    { id: "visit", label: "行ってみる", emoji: "📍" }, // （お店/場所）
    { id: "register", label: "登録する", emoji: "📨" }, // （LINE/メルマガ）
    { id: "buy", label: "買う", emoji: "🛒" }, // （商品/メニュー）
    { id: "consult", label: "相談する", emoji: "💬" }, // （問い合わせ）
    { id: "apply", label: "応募する", emoji: "📝" }, // （採用/募集）
] as const

// Helper to get full string "🚀 盛り上げたい"
const getFullLabel = (item: { emoji: string; label: string }) => `${item.emoji} ${item.label}`

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
    const MAX_INTENT_SELECTION = 2

    // Derived state
    const selectedIntents = INTENTS.filter(i => selected.includes(getFullLabel(i)))

    // Check if any intent that triggers action is selected
    const showActions = selectedIntents.some(i => i.hasAction)

    const handleIntentToggle = (intent: typeof INTENTS[number]) => {
        const fullLabel = getFullLabel(intent)
        const isSelected = selected.includes(fullLabel)

        if (isSelected) {
            // Remove
            let newSelected = selected.filter(s => s !== fullLabel)

            // If removing a trigger intent, check if we need to remove actions too
            // If NO other trigger intent remains actions should be cleared
            const remainingTriggers = newSelected.some(s => {
                const i = INTENTS.find(item => getFullLabel(item) === s)
                return i?.hasAction
            })

            if (!remainingTriggers) {
                // Remove all actions from selection
                const actionLabels = ACTIONS.map(getFullLabel)
                // Type assertion as string[] includes check
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                newSelected = newSelected.filter(s => !actionLabels.includes(s as any))
            }

            onSelectedChange(newSelected)
        } else {
            // Add
            if (selectedIntents.length < MAX_INTENT_SELECTION) {
                onSelectedChange([...selected, fullLabel])
            }
        }
    }

    const handleActionToggle = (action: typeof ACTIONS[number]) => {
        const fullLabel = getFullLabel(action)
        const isSelected = selected.includes(fullLabel)

        if (isSelected) {
            onSelectedChange(selected.filter(s => s !== fullLabel))
        } else {
            // Remove other actions first (single select behavior for MVP)
            const otherActions = ACTIONS.map(getFullLabel)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const setWithoutActions = selected.filter(s => !otherActions.includes(s as any))
            onSelectedChange([...setWithoutActions, fullLabel])
        }
    }

    return (
        <div className="space-y-6">
            {/* Step 1: Intents */}
            <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <Label className="text-base font-bold">
                        この診断で叶えたいこと（最大{MAX_INTENT_SELECTION}つ）✨
                    </Label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                    選ぶと、結果画面の導線やシェア文が最適化されます
                </p>
                <div className="flex flex-wrap gap-2">
                    {INTENTS.map((intent) => {
                        const fullLabel = getFullLabel(intent)
                        const isSelected = selected.includes(fullLabel)
                        const isMaxReached = !isSelected && selectedIntents.length >= MAX_INTENT_SELECTION

                        return (
                            <button
                                type="button"
                                key={intent.id}
                                onClick={() => !isMaxReached && handleIntentToggle(intent)}
                                disabled={isMaxReached}
                                className={cn(
                                    "px-3 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-1.5",
                                    isSelected
                                        ? "bg-black text-white border-black shadow-sm"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                                    isMaxReached && "opacity-40 cursor-not-allowed hover:bg-white hover:border-gray-200"
                                )}
                            >
                                <span className="text-base">{intent.emoji}</span>
                                {intent.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Step 2: Actions (Conditional) */}
            {showActions && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-sm font-bold block text-blue-800">
                        次にしてほしいこと（任意）👇
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-blue-50/50 rounded-lg border border-dashed border-blue-200">
                        {ACTIONS.map((action) => {
                            const fullLabel = getFullLabel(action)
                            const isSelected = selected.includes(fullLabel)

                            return (
                                <button
                                    type="button"
                                    key={action.id}
                                    onClick={() => handleActionToggle(action)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full border text-sm transition-all flex items-center gap-1.5",
                                        isSelected
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                                    )}
                                >
                                    <span className="text-base">{action.emoji}</span>
                                    {action.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

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
