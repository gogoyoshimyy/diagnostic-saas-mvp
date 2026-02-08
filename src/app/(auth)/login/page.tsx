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
                    <CardTitle>ログイン</CardTitle>
                    <CardDescription>メールアドレスを入力してログインリンクを受け取ってください。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form
                        action={async (formData) => {
                            "use server"
                            await signIn("resend", formData)
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <Input name="email" type="email" placeholder="hello@example.com" required />
                        </div>
                        <Button type="submit" className="w-full">
                            ログインリンクを送信
                        </Button>
                    </form>

                    {/* Debug Login Section */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">または (デバッグ用)</span>
                        </div>
                    </div>

                    <form
                        action={async (formData) => {
                            "use server"
                            // Login using the Credentials provider
                            await signIn("credentials", formData)
                        }}
                        className="space-y-4 p-4 bg-yellow-50 rounded border border-yellow-200"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="debug-email" className="text-yellow-800">デバッグ用メールアドレス (認証なし)</Label>
                            <Input
                                id="debug-email"
                                name="email"
                                type="email"
                                defaultValue="debug@example.com"
                                className="bg-white"
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="w-full">
                            メール認証なしでログイン
                        </Button>
                        <p className="text-xs text-yellow-600 text-center">
                            Resend API Keyが設定されていない場合に使用します。
                        </p>
                    </form>

                </CardContent>
            </Card>
        </div>
    )
}
