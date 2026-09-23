"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth-helpers"
import { connectToDatabase } from "@/lib/db/mongoose"
import { SiteSettings } from "@/models"
import { recordAuditEvent } from "@/lib/audit"

export type SettingsState = { success?: string; error?: string } | null

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  // Company/contact settings are sensitive; restrict to admins.
  const admin = await requireRole(["admin"])

  const get = (k: string) => String(formData.get(k) ?? "").trim()

  // Parse a JSON-bearing field, returning the offending key on failure so the
  // caller can surface a friendly inline error instead of throwing and hitting
  // the error boundary (the stats box is free-form text an admin can mistype).
  const parseJson = (key: string, fallback: unknown): { value: unknown } | { error: string } => {
    const raw = get(key)
    if (!raw) return { value: fallback }
    try {
      return { value: JSON.parse(raw) }
    } catch {
      return { error: `Invalid JSON in "${key}". Please check the formatting and try again.` }
    }
  }

  const stats = parseJson("stats", [])
  if ("error" in stats) return { error: stats.error }
  const navigation = parseJson("navigation", [])
  if ("error" in navigation) return { error: navigation.error }
  const footerColumns = parseJson("footerColumns", [])
  if ("error" in footerColumns) return { error: footerColumns.error }

  const update = {
    companyName: get("companyName"),
    tagline: get("tagline"),
    email: get("email"),
    phone: get("phone"),
    whatsapp: get("whatsapp"),
    address: get("address"),
    businessHours: get("businessHours"),
    "social.linkedin": get("social.linkedin"),
    "social.instagram": get("social.instagram"),
    "social.facebook": get("social.facebook"),
    "social.youtube": get("social.youtube"),
    "ctaPrimary.label": get("ctaPrimary.label"),
    "ctaPrimary.href": get("ctaPrimary.href"),
    "ctaPrimary.external": get("ctaPrimary.external") === "true",
    "ctaSecondary.label": get("ctaSecondary.label"),
    "ctaSecondary.href": get("ctaSecondary.href"),
    "ctaSecondary.external": get("ctaSecondary.external") === "true",
    logoLight: get("logo"),
    logoDark: get("logoMark"),
    "social.twitter": get("social.twitter"),
    "stats": stats.value,
    "navigation": navigation.value,
    "footerColumns": footerColumns.value,
    "chat.enabled": get("chat.enabled") === "true",
    "chat.provider": get("chat.provider") || "whatsapp",
    "chat.number": get("chat.number"),
    "chat.message": get("chat.message"),
    "chat.consentRequired": get("chat.consentRequired") === "true",
  }

  try {
    await connectToDatabase()
    await SiteSettings.updateOne({ key: "global" }, { $set: update }, { upsert: true })
    await recordAuditEvent({ user: admin, action: "update", entity: "settings", entityId: "global" })
  } catch (error) {
    console.log("[v0] saveSettings error:", error instanceof Error ? error.message : error)
    return { error: "Could not save settings. Please try again." }
  }

  revalidatePath("/", "layout")
  return { success: "Settings saved." }
}
