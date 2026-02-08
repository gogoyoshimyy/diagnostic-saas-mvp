import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Resend from "next-auth/providers/resend"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers: [
        // Debug Provider for Development (always available)
        Credentials({
            name: "Debug Login",
            credentials: {
                email: { label: "Email", type: "email" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email) return null;
                const email = credentials.email as string;

                // Find or create user for debug
                let user = await prisma.user.findUnique({ where: { email } });
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: email.split("@")[0],
                            emailVerified: new Date(),
                        }
                    });
                }
                return user;
            }
        }),
        // Only include Resend if EMAIL_FROM is configured
        ...(process.env.EMAIL_FROM ? [
            Resend({
                from: process.env.EMAIL_FROM,
            })
        ] : [])
    ],
    session: { strategy: "jwt" }, // Switch to JWT to support Credentials
})
