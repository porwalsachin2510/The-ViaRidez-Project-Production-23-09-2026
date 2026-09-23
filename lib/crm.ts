import "server-only"
import { connectToDatabase } from "@/lib/db/mongoose"
import { DeliveryEvent, SiteSettings } from "@/models"
import { fingerprint } from "@/lib/security/request"

export type CrmLeadType =
  | "contact"
  | "quote"
  | "demo"
  | "application"
  | "newsletter"
  | "partner"
  | "resource"

export interface CrmLeadPayload {
  type: CrmLeadType
  name?: string
  email: string
  phone?: string
  company?: string
  message?: string
  /** Any extra structured fields (service, passengers, estimate, etc.). */
  meta?: Record<string, unknown>
}

/**
 * Best-effort push of a captured lead to the CRM webhook configured in
 * Site Settings. Returns true when the webhook accepted the payload.
 *
 * Failures never throw — a CRM outage must not break form submission. The
 * boolean result is used to set `syncedToCrm` on the stored lead so the
 * admin can see which leads still need manual export.
 */
export async function syncLeadToCrm(payload: CrmLeadPayload): Promise<boolean> {
  const dedupeKey = fingerprint(`crm:${payload.type}:${payload.email}`, payload)
  try {
    await connectToDatabase()
    const existing = await DeliveryEvent.findOne({ dedupeKey }).lean<{ status?: string }>()
    if (existing?.status === "sent") return true
    await DeliveryEvent.updateOne(
      { dedupeKey },
      { $setOnInsert: { kind: "crm", dedupeKey, provider: "webhook", payload, status: "pending", attempts: 0 } },
      { upsert: true },
    )
    // `crm.apiKey` has select:false. Re-including just that path returns the
    // full `crm` subdocument plus the otherwise-deselected key. Adding the
    // parent path `crm` alongside it causes a Mongoose "Path collision" error,
    // so we project the leaf path only.
    const settings = await SiteSettings.findOne({ key: "global" })
      .select("+crm.apiKey")
      .lean<{ crm?: { webhookUrl?: string; apiKey?: string; provider?: string } }>()

    const webhookUrl = settings?.crm?.webhookUrl
    if (!webhookUrl) {
      await DeliveryEvent.updateOne({ dedupeKey }, { $set: { status: "failed", error: "crm-not-configured", attempts: 1, nextRetryAt: new Date(Date.now() + 60 * 60 * 1000) } })
      return false
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (settings?.crm?.apiKey) headers.Authorization = `Bearer ${settings.crm.apiKey}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source: "viaridez-website",
        submittedAt: new Date().toISOString(),
        ...payload,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout))

    const responseText = (await res.text()).slice(0, 500)
    await DeliveryEvent.updateOne(
      { dedupeKey },
      { $set: { status: res.ok ? "sent" : "failed", response: responseText, error: res.ok ? "" : `crm-${res.status}`, attempts: 1, nextRetryAt: res.ok ? null : new Date(Date.now() + 15 * 60 * 1000) } },
    )
    return res.ok
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown"
    await DeliveryEvent.updateOne({ dedupeKey }, { $set: { status: "failed", error: message.slice(0, 500), attempts: 1, nextRetryAt: new Date(Date.now() + 15 * 60 * 1000) } }).catch(() => {})
    console.log("[v0] syncLeadToCrm error:", message)
    return false
  }
}
