export default function EditorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-full bg-slate-50">
            {children}
        </div>
    )
}
