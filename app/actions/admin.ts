"use server"

import { revalidatePath } from "next/cache"
import { requireModule } from "@/lib/auth-helpers"
import { connectToDatabase } from "@/lib/db/mongoose"
import { isValidObjectId } from "mongoose"
import { recordAuditEvent } from "@/lib/audit"
import { newUnsubscribeToken } from "@/lib/email/notify"
import {
  ContactEnquiry,
  QuoteRequest,
  Application,
  DemoBooking,
  Subscriber,
  PartnerApplication,
  DeliveryEvent,
  AdminNotification,
} from "@/models"

const models = {
  enquiry: ContactEnquiry,
  quote: QuoteRequest,
  application: Application,
  demo: DemoBooking,
  partner: PartnerApplication,
} as const

type InboxKind = keyof typeof models
const moduleForKind: Record<InboxKind, string> = {
  enquiry: "enquiries",
  quote: "quotes",
  application: "applications",
  demo: "demos",
  partner: "partners",
}

// Values MUST match the Mongoose schema enums exactly, otherwise the write is
// rejected (or a phantom field is written). Applications track workflow on a
// `stage` field; enquiries, quotes, demos and partners use `status`.
const allowedStatuses: Record<InboxKind, string[]> = {
  enquiry: ["new", "in-progress", "resolved", "spam"],
  quote: ["new", "contacted", "quoted", "won", "lost"],
  application: ["new", "reviewing", "shortlisted", "interview", "offer", "rejected", "hired"],
  demo: ["new", "scheduled", "completed", "no-show", "cancelled"],
  partner: ["new", "reviewing", "approved", "rejected", "onboarded"],
}

export async function markAdminNotificationsRead() {
  const user = await requireModule("dashboard")
  await connectToDatabase()
  await AdminNotification.updateMany({ readAt: null }, { $set: { readAt: new Date() } })
  await recordAuditEvent({ user, action: "mark_notifications_read", entity: "admin_notification" })
  revalidatePath("/admin")
  revalidatePath("/admin/notifications")
}

/** Mark a single notification as read (e.g. when the admin opens it). */
export async function markAdminNotificationRead(id: string) {
  await requireModule("dashboard")
  if (!isValidObjectId(id)) return { ok: false, error: "Invalid id" }
  await connectToDatabase()
  await AdminNotification.updateOne({ _id: id, readAt: null }, { $set: { readAt: new Date() } })
  revalidatePath("/admin")
  revalidatePath("/admin/notifications")
  return { ok: true }
}

const statusField: Record<InboxKind, "status" | "stage"> = {
  enquiry: "status",
  quote: "status",
  application: "stage",
  demo: "status",
  partner: "status",
}

/** Update the workflow status of an inbox record (enquiry / quote / application). */
export async function updateInboxStatus(kind: InboxKind, id: string, status: string) {
  const user = await requireModule(moduleForKind[kind])
  if (!models[kind] || !isValidObjectId(id) || !allowedStatuses[kind]?.includes(status)) {
    return { ok: false, error: "Invalid status" }
  }

  await connectToDatabase()
  const Model = models[kind]
  const field = statusField[kind]
  const result = await Model.updateOne({ _id: id }, { $set: { [field]: status } }, { runValidators: true })
  if (!result.matchedCount) return { ok: false, error: "Record not found" }

  await recordAuditEvent({ user, action: "update_status", entity: kind, entityId: id, meta: { status } })

  revalidatePath("/admin")
  return { ok: true }
}

/** Save an internal note against an inbox record. */
export async function updateInboxNotes(kind: InboxKind, id: string, notes: string) {
  const user = await requireModule(moduleForKind[kind])
  if (!models[kind] || !isValidObjectId(id)) return { ok: false, error: "Invalid record type or id" }

  await connectToDatabase()
  const result = await models[kind].updateOne(
    { _id: id },
    { $set: { notes: String(notes).slice(0, 5000) } },
    { runValidators: true },
  )
  if (!result.matchedCount) return { ok: false, error: "Record not found" }

  await recordAuditEvent({ user, action: "update_notes", entity: kind, entityId: id })

  revalidatePath("/admin")
  return { ok: true }
}

/** Set a 0–5 star rating on a job application (recruiter shortlisting aid). */
export async function updateApplicationRating(id: string, rating: number) {
  const user = await requireModule("applications")
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)))
  if (!isValidObjectId(id)) return { ok: false, error: "Invalid id" }

  await connectToDatabase()
  const result = await Application.updateOne({ _id: id }, { $set: { rating: value } }, { runValidators: true })
  if (!result.matchedCount) return { ok: false, error: "Record not found" }

  await recordAuditEvent({ user, action: "update_rating", entity: "application", entityId: id, meta: { rating: value } })

  revalidatePath("/admin/applications")
  return { ok: true }
}

/** Toggle a subscriber between subscribed / unsubscribed. */
export async function updateSubscriberStatus(id: string, status: string) {
  const user = await requireModule("subscribers")
  if (!isValidObjectId(id) || !["subscribed", "unsubscribed"].includes(status)) {
    return { ok: false, error: "Invalid status" }
  }

  await connectToDatabase()
  // Load the document so we can keep `unsubscribedAt` in sync with `status` and
  // backfill an unsubscribe token — matching the public token flow. A raw
  // `$set: { status }` would leave a stale/absent `unsubscribedAt` and could
  // resubscribe a legacy row that then emails a dead unsubscribe link.
  const subscriber = await Subscriber.findById(id)
  if (!subscriber) return { ok: false, error: "Record not found" }

  subscriber.status = status
  if (status === "unsubscribed") {
    subscriber.unsubscribedAt = new Date()
  } else {
    subscriber.unsubscribedAt = null
    if (!subscriber.unsubscribeToken) subscriber.unsubscribeToken = newUnsubscribeToken()
  }
  await subscriber.save()

  await recordAuditEvent({ user, action: "update_status", entity: "subscriber", entityId: id, meta: { status } })

  revalidatePath("/admin/subscribers")
  return { ok: true }
}

/** Re-queue a failed delivery event so it can be attempted again. */
export async function retryDelivery(formData: FormData) {
  const user = await requireModule("delivery")
  const id = String(formData.get("id") || "")
  if (!isValidObjectId(id)) return { ok: false, error: "Invalid id" }
  await connectToDatabase()
  const result = await DeliveryEvent.updateOne(
    { _id: id, status: "failed" },
    { $set: { status: "pending", nextRetryAt: new Date(), error: "", response: "" }, $inc: { attempts: 1 } },
  )
  if (!result.matchedCount) return { ok: false, error: "Delivery is not retryable" }
  await recordAuditEvent({ user, action: "retry", entity: "delivery", entityId: id })
  revalidatePath("/admin/delivery")
  return { ok: true }
}

export async function deleteSubscriber(id: string) {
  const user = await requireModule("subscribers")
  if (!isValidObjectId(id)) return { ok: false, error: "Invalid id" }
  await connectToDatabase()
  const result = await Subscriber.deleteOne({ _id: id })
  if (!result.deletedCount) return { ok: false, error: "Record not found" }

  await recordAuditEvent({ user, action: "delete", entity: "subscriber", entityId: id })

  revalidatePath("/admin/subscribers")
  return { ok: true }
}
