import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe Auth.js configuration (no database / Node-only imports).
 * Used by middleware for route protection and shared by the full config.
 */
export const authConfig = {
  // Trust the deployment/preview host. Required because the v0 preview and
  // Vercel deployments serve the app from a host Auth.js can't infer, which
  // otherwise triggers an UntrustedHost "server configuration" error.
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },
  callbacks: {
    // Attach role + id onto the token, then expose on the session.
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.id = (user as { id?: string }).id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin")
      if (isOnAdmin) return isLoggedIn
      return true
    },
  },
  providers: [], // real providers are added in auth.ts (Node runtime)
} satisfies NextAuthConfig
