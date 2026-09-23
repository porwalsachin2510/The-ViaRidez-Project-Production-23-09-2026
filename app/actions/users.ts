"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { requireRole } from "@/lib/auth-helpers"
import { connectToDatabase } from "@/lib/db/mongoose"
import { User } from "@/models"
import { recordAuditEvent } from "@/lib/audit"
import { adminWelcomeEmail } from "@/lib/email/templates"
import { emailFooter, sendCustomerEmail } from "@/lib/email/notify"

const ROLES = ["admin", "editor", "content_writer", "seo_manager"] as const

/** Human-readable role names for the welcome email. */
const ROLE_LABELS: Record<(typeof ROLES)[number], string> = {
  admin: "Administrator",
  editor: "Editor",
  content_writer: "Content Writer",
  seo_manager: "SEO Manager",
}

export type UserActionState = { error?: string; success?: string } | null

export async function createUser(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  // Only admins may manage users.
  const admin = await requireRole(["admin"])

  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const role = String(formData.get("role") ?? "")
  const password = String(formData.get("password") ?? "")

  if (!name || !email || !password) return { error: "Name, email and password are required." }
  if (password.length < 8) return { error: "Password must be at least 8 characters." }
  if (!ROLES.includes(role as (typeof ROLES)[number])) return { error: "Invalid role." }

  await connectToDatabase()

  const existing = await User.findOne({ email }).lean()
  if (existing) return { error: "A user with that email already exists." }

  const passwordHash = await bcrypt.hash(password, 12)
  const created = await User.create({ name, email, role, passwordHash, isActive: true })

  await recordAuditEvent({ user: admin, action: "create", entity: "users", entityId: String(created._id), meta: { email, role } })

  // Let the new teammate know their account exists. The password is never sent
  // by email — the admin shares it over a secure channel.
  await sendCustomerEmail({
    to: email,
    subject: "Your ViaRidez CMS account is ready",
    html: adminWelcomeEmail({
      name,
      email,
      role: ROLE_LABELS[role as (typeof ROLES)[number]] ?? role,
      footer: await emailFooter(),
    }),
  })

  revalidatePath("/admin/users")
  return { success: `Created ${email}. A welcome email has been sent.` }
}

export async function updateUserRole(userId: string, role: string): Promise<{ ok: boolean }> {
  const admin = await requireRole(["admin"])
  if (!ROLES.includes(role as (typeof ROLES)[number])) return { ok: false }
  await connectToDatabase()
  await User.updateOne({ _id: userId }, { $set: { role } })
  await recordAuditEvent({ user: admin, action: "update", entity: "users", entityId: userId, meta: { role } })
  revalidatePath("/admin/users")
  return { ok: true }
}

export async function toggleUserActive(userId: string, isActive: boolean): Promise<{ ok: boolean }> {
  const admin = await requireRole(["admin"])
  await connectToDatabase()
  // Guard: never let an admin deactivate their own account.
  if (userId === admin.id) return { ok: false }
  const result = await User.updateOne({ _id: userId }, { $set: { isActive } })
  if (!result.matchedCount) return { ok: false }
  await recordAuditEvent({ user: admin, action: "update", entity: "users", entityId: userId, meta: { isActive } })
  revalidatePath("/admin/users")
  return { ok: true }
}
