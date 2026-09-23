import "server-only"

import { connectToDatabase } from "@/lib/db/mongoose"
import { DeliveryEvent } from "@/models"
import { fingerprint } from "@/lib/security/request"
import { getSmtpConfig, getTransporter, htmlToText } from "@/lib/mailer"

interface SendArgs {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char)
}

export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<{ sent: boolean; error?: string }> {
  const recipients = Array.isArray(to) ? to : [to]
  const dedupeKey = fingerprint("email", { recipients, subject, replyTo: replyTo || "", html })

  try {
    await connectToDatabase()
    const existing = await DeliveryEvent.findOne({ dedupeKey }).lean<{ status?: string }>()
    if (existing?.status === "sent") return { sent: true }
    await DeliveryEvent.updateOne(
      { dedupeKey },
      { $setOnInsert: { kind: "email", dedupeKey, provider: "smtp", status: "pending", attempts: 0, payload: { subject, recipientCount: recipients.length } } },
      { upsert: true },
    )

    const config = getSmtpConfig()
    const transporter = await getTransporter()
    if (!config || !transporter) {
      await DeliveryEvent.updateOne({ dedupeKey }, { $set: { status: "failed", error: "email-not-configured", attempts: 1, nextRetryAt: new Date(Date.now() + 60 * 60 * 1000) } })
      return { sent: false, error: "email-not-configured" }
    }

    const info = await transporter.sendMail({
      from: config.from,
      to: recipients,
      subject,
      html,
      text: htmlToText(html),
      ...(replyTo ? { replyTo } : {}),
    })

    // A recipient can be accepted by us but rejected by the relay; treat an
    // all-rejected send as a failure so it shows up in the delivery log.
    const rejected = info.rejected ?? []
    const ok = rejected.length < recipients.length
    const detail = JSON.stringify({
      messageId: info.messageId,
      accepted: info.accepted,
      rejected,
      response: info.response,
    }).slice(0, 500)

    await DeliveryEvent.updateOne(
      { dedupeKey },
      { $set: { status: ok ? "sent" : "failed", response: detail, error: ok ? "" : "smtp-all-recipients-rejected", attempts: 1, nextRetryAt: ok ? null : new Date(Date.now() + 15 * 60 * 1000) } },
    )
    return ok ? { sent: true } : { sent: false, error: "smtp-all-recipients-rejected" }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown"
    await DeliveryEvent.updateOne({ dedupeKey }, { $set: { status: "failed", error: message.slice(0, 500), attempts: 1, nextRetryAt: new Date(Date.now() + 15 * 60 * 1000) } }).catch(() => {})
    return { sent: false, error: message }
  }
}

// Email bodies now live in `lib/email/templates.ts` — a single branded shell
// shared by every customer-facing and internal message.
