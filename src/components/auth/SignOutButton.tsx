"use client"
import { Button } from "@/components/ui/button"
import { handleSignOut } from "@/app/actions/authActions"

export function SignOutButton() {
    return (
        <Button variant="outline" onClick={() => handleSignOut()}>
            ログアウト
        </Button>
    )
}
