import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [], // We list providers in auth.ts to avoid edge issues with some adapters if needed, but for v5 strictly: providers go here usually, but Prisma adapter can be tricky on edge. 
    // Actually, standard v5 pattern: auth.config.ts has pure logic, auth.ts has db adapter.
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        async session({ session, user, token }) {
            // For Credentials provider (JWT strategy), user.id might be in token.sub
            if (session.user) {
                if (token?.sub) {
                    session.user.id = token.sub;
                } else if (user?.id) {
                    session.user.id = user.id;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
} satisfies NextAuthConfig;
