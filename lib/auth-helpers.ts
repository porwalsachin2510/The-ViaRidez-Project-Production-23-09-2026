import { redirect } from "next/navigation"
import mongoose from "mongoose"
import { auth } from "@/auth"
import type { UserRole } from "@/models/User"
import { connectToDatabase } from "@/lib/db/mongoose"
import { User } from "@/models"

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string | null
}

/**
 * Resolves the current session against the database and returns the active
 * user, or `null` when there is no session / the account can no longer be
 * found or is deactivated.
 *
 * The lookup matches by `_id` OR `email` on purpose: a session's `email` is
 * always present and unique, so a stale JWT whose `_id` drifted (e.g. after a
 * database reseed or environment switch) still resolves correctly instead of
 * triggering an /admin <-> /sign-in redirect loop.
 */
export async function getActiveSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  const sessionUser = session?.user as unknown as SessionUser | undefined
  if (!sessionUser?.id && !sessionUser?.email) return null

  await connectToDatabase()

  const or: Record<string, unknown>[] = []
  if (sessionUser.id && mongoose.isValidObjectId(sessionUser.id)) {
    or.push({ _id: sessionUser.id })
  }
  if (sessionUser.email) {
    or.push({ email: sessionUser.email.toLowerCase() })
  }
  if (or.length === 0) return null

  const activeUser = await User.findOne({ $or: or, isActive: true })
    .select("_id name email role avatar")
    .lean<{
      _id: unknown
      name: string
      email: string
      role: string
      avatar?: string | null
    }>()

  if (!activeUser) return null

  return {
    id: String(activeUser._id),
    name: activeUser.name,
    email: activeUser.email,
    role: activeUser.role as UserRole,
    image: activeUser.avatar ?? null,
  }
}

/** Returns the signed-in admin user or redirects to sign-in. */
export async function requireUser(): Promise<SessionUser> {
  const activeUser = await getActiveSessionUser()
  if (!activeUser) redirect("/sign-in?inactive=1")
  return activeUser
}

/** Requires one of the given roles; redirects to the dashboard if not allowed. */
export async function requireRole(roles: UserRole[]): Promise<SessionUser> {
  const user = await requireUser()
  if (!roles.includes(user.role)) redirect("/admin?denied=1")
  return user
}

/**
 * Capability map. Admin can do everything. Other roles are scoped to the
 * modules relevant to their job, per the brief's RBAC requirement.
 */
export const PERMISSIONS: Record<UserRole, { modules: string[]; canManageUsers: boolean }> = {
  admin: { modules: ["*"], canManageUsers: true },
  editor: {
    modules: [
      "dashboard", "services", "fleet", "industries", "locations", "free-zones",
      "blog", "comments", "testimonials", "clients", "case-studies", "team", "faqs",
      "careers", "media", "enquiries", "quotes", "applications",
      "demos", "partners", "subscribers", "resources", "pages", "audit", "delivery",
    ],
    canManageUsers: false,
  },
  content_writer: {
    modules: ["dashboard", "blog", "comments", "faqs", "testimonials", "media", "careers"],
    canManageUsers: false,
  },
  seo_manager: {
    modules: ["dashboard", "seo", "redirects", "blog", "services", "industries", "locations", "free-zones"],
    canManageUsers: false,
  },
}

export function canAccessModule(role: UserRole, moduleKey: string): boolean {
  const perms = PERMISSIONS[role]
  if (!perms) return false
  return perms.modules.includes("*") || perms.modules.includes(moduleKey)
}

/**
 * Requires the signed-in user to have access to a module (used by admin pages
 * and server actions). Redirects to the dashboard with a denied flag otherwise.
 */
export async function requireModule(moduleKey: string): Promise<SessionUser> {
  const user = await requireUser()
  if (!canAccessModule(user.role, moduleKey)) redirect("/admin?denied=1")
  return user
}
