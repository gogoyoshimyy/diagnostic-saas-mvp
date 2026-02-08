import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>クイック診断ログイン</CardTitle>
                    <CardDescription>メールアドレスを入力してログインしてください（認証なし・開発用）</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        action={async (formData) => {
                            "use server"
                            const email = formData.get("email")
                            // Login using the Credentials provider with explicit redirect
                            await signIn("credentials", {
                                email,
                                redirectTo: "/dashboard",
                            })
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue="demo@example.com"
                                placeholder="あなたのメールアドレス"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            ログイン
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            開発モード：メール認証なしで即座にログインできます
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
