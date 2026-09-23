import { EventEmitter } from "node:events"
import { connectToDatabase } from "@/lib/db/mongoose"
import { AdminNotification } from "@/models"

export type NotificationKind =
  | "contact"
  | "quote"
  | "demo"
  | "application"
  | "partner"
  | "subscriber"
  | "comment"

export type LiveNotification = {
  id: string
  kind: NotificationKind
  title: string
  detail: string
  href: string
  readAt: string | null
  createdAt: string
}

/**
 * In-process pub/sub for admin notifications.
 *
 * Real-time delivery uses Server-Sent Events (see /api/admin/notifications/stream).
 * Each Node instance keeps a single EventEmitter that stream routes subscribe to,
 * and `publishNotification` fans a freshly-created notification out to every
 * open SSE connection on that instance. The notification itself is persisted to
 * MongoDB first, so it is durable and survives reconnects/cold starts — the bus
 * only handles the "live push" layer on top of the database of record.
 *
 * The emitter is stashed on globalThis so Next.js dev HMR / module reloads reuse
 * the same instance instead of spawning orphaned emitters.
 */
const globalForBus = globalThis as unknown as { __viaridezNotificationBus?: EventEmitter }

function getEmitter(): EventEmitter {
  if (!globalForBus.__viaridezNotificationBus) {
    const emitter = new EventEmitter()
    // Admin panels can hold several tabs/streams open at once.
    emitter.setMaxListeners(0)
    globalForBus.__viaridezNotificationBus = emitter
  }
  return globalForBus.__viaridezNotificationBus
}

const CHANNEL = "notification"

export function subscribeToNotifications(listener: (n: LiveNotification) => void): () => void {
  const emitter = getEmitter()
  emitter.on(CHANNEL, listener)
  return () => emitter.off(CHANNEL, listener)
}

/**
 * Persist an admin notification and broadcast it live to connected admins.
 * This is the single entry point used by every public form submission.
 */
export async function publishNotification(
  kind: NotificationKind,
  title: string,
  detail: string,
  href: string,
): Promise<void> {
  await connectToDatabase()
  const doc = await AdminNotification.create({ kind, title, detail, href })
  const payload: LiveNotification = {
    id: String(doc._id),
    kind,
    title,
    detail,
    href,
    readAt: null,
    createdAt: (doc.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
  }
  try {
    getEmitter().emit(CHANNEL, payload)
  } catch (error) {
    // Broadcasting must never break the form submission itself.
    console.log("[v0] notification broadcast error:", (error as Error)?.message)
  }
}
