import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "./auth.config"
import { connectToDatabase } from "@/lib/db/mongoose"
import User from "@/models/User"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { requestMetadata } from "@/lib/security/request"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const normalizedEmail = email.toLowerCase()
        const metadata = await requestMetadata()
        const [ipLimit, emailLimit] = await Promise.all([
          enforceRateLimit(`auth:login:ip:${metadata.ipHash}`, { limit: 12, windowMs: 15 * 60 * 1000 }),
          enforceRateLimit(`auth:login:email:${normalizedEmail}`, { limit: 8, windowMs: 15 * 60 * 1000 }),
        ])
        if (!ipLimit.allowed || !emailLimit.allowed) return null

        await connectToDatabase()

        // passwordHash has select:false, so request it explicitly.
        const user = await User.findOne({ email: email.toLowerCase(), isActive: true })
          .select("+passwordHash")
          .lean<{
            _id: unknown
            name: string
            email: string
            role: string
            passwordHash: string
            avatar?: string | null
          }>()

        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        // Best-effort last-login stamp (don't block auth on failure).
        User.updateOne({ _id: user._id }, { lastLoginAt: new Date() }).catch(() => {})

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatar ?? null,
        }
      },
    }),
  ],
})
