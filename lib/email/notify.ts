import "server-only"

import { randomBytes, createHash } from "node:crypto"

import { sendEmail } from "@/lib/email"
import { getSiteSettings } from "@/lib/data/queries"
import { SITE_URL } from "@/lib/seo"
import type { EmailFooterContext } from "@/lib/email/templates"

/**
 * Resolves the footer contact block from the CMS SiteSettings singleton so
 * every email shows the live company address / phone / inbox rather than
 * hardcoded values. Falls back silently when the DB is unreachable — a missing
 * footer must never prevent a transactional email from going out.
 */
export async function emailFooter(
  extra: Partial<EmailFooterContext> = {},
): Promise<EmailFooterContext> {
  const settings = await getSiteSettings().catch(() => null)
  return {
    companyName: settings?.companyName || "ViaRidez",
    email: settings?.email || process.env.CONTACT_INBOX || "",
    phone: settings?.phone || "",
    address: settings?.address || "",
    ...extra,
  }
}

/** The internal inbox that receives lead alerts. */
export async function teamInbox(): Promise<string | null> {
  const settings = await getSiteSettings().catch(() => null)
  return settings?.email || process.env.CONTACT_INBOX || null
}

export function newUnsubscribeToken(): string {
  return randomBytes(24).toString("hex")
}

/**
 * Deterministic fallback token for subscriber rows created before the
 * `unsubscribeToken` field existed, so historic subscribers still get a
 * working unsubscribe link instead of a dead one.
 */
export function legacyUnsubscribeToken(email: string): string {
  const secret = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "viaridez").trim()
  return createHash("sha256").update(`${email.toLowerCase()}:${secret}`).digest("hex").slice(0, 48)
}

export function unsubscribeUrl(email: string, token: string): string {
  const params = new URLSearchParams({ email, token })
  return `${SITE_URL}/unsubscribe?${params.toString()}`
}

/**
 * Fire-and-forget customer email. Transactional mail is a side effect of a
 * successful submission — if SMTP is down the user must still get their success
 * state, and the failure is already recorded in `deliveryevents` by sendEmail.
 */
export async function sendCustomerEmail(args: {
  to: string
  subject: string
  html: string
  replyTo?: string
}): Promise<void> {
  try {
    const result = await sendEmail(args)
    if (!result.sent) {
      console.log("[v0] customer email not sent:", args.subject, result.error)
    }
  } catch (error) {
    console.log(
      "[v0] customer email threw:",
      args.subject,
      error instanceof Error ? error.message : error,
    )
  }
}
