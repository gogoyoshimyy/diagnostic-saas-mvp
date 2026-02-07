import { auth } from "@/auth"
import { SignOutButton } from "@/components/auth/SignOutButton"
import Link from "next/link"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                        診断SaaS
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            {session?.user?.email}
                        </span>
                        <SignOutButton />
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
