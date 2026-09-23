import { connectToDatabase } from "@/lib/db/mongoose"
import { AdminNotification } from "@/models"
import { getActiveSessionUser, canAccessModule } from "@/lib/auth-helpers"
import { subscribeToNotifications, type LiveNotification } from "@/lib/notifications/bus"

// SSE is a live, per-request stream — never cache or statically render it.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// How often we reconcile against MongoDB (the durable source of truth). The
// in-process bus pushes instantly on the same instance; polling guarantees
// delivery across Vercel's serverless invocations where the emitter can't reach.
const POLL_MS = 4000
// Keep-alive comment cadence so proxies don't drop an idle connection.
const HEARTBEAT_MS = 15000
// Recycle the stream well within serverless limits; EventSource auto-reconnects
// and resumes from Last-Event-ID, so no notification is ever missed.
const MAX_STREAM_MS = 50000

function sse(event: string, data: unknown, id?: string): string {
  const lines = [`event: ${event}`, `data: ${JSON.stringify(data)}`]
  if (id) lines.unshift(`id: ${id}`)
  return lines.join("\n") + "\n\n"
}

async function getUnreadCount(): Promise<number> {
  return AdminNotification.countDocuments({ readAt: null })
}

async function getSince(cursor: Date): Promise<LiveNotification[]> {
  const docs = await AdminNotification.find({ createdAt: { $gt: cursor } })
    .sort({ createdAt: 1 })
    .limit(50)
    .lean()
  return docs.map((d) => ({
    id: String(d._id),
    kind: d.kind as LiveNotification["kind"],
    title: d.title ?? "",
    detail: d.detail ?? "",
    href: d.href ?? "/admin",
    readAt: d.readAt ? new Date(d.readAt as Date).toISOString() : null,
    createdAt: new Date(d.createdAt as Date).toISOString(),
  }))
}

export async function GET(request: Request) {
  // Only authenticated admins with dashboard access may open the stream.
  const user = await getActiveSessionUser()
  if (!user || !canAccessModule(user.role, "dashboard")) {
    return new Response("Unauthorized", { status: 401 })
  }

  await connectToDatabase()

  // Resume point: SSE clients send Last-Event-ID (ms epoch) on reconnect so we
  // only replay notifications created after the last one they received.
  const lastEventId = request.headers.get("last-event-id")
  const resumeMs = lastEventId ? Number(lastEventId) : NaN
  let cursor = Number.isFinite(resumeMs) ? new Date(resumeMs) : new Date()

  const encoder = new TextEncoder()
  const sentIds = new Set<string>()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false
      const safeEnqueue = (chunk: string) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          closed = true
        }
      }

      // Advise the client to reconnect quickly, then send the current unread count.
      safeEnqueue("retry: 3000\n\n")
      try {
        safeEnqueue(sse("unread", { count: await getUnreadCount() }))
      } catch (error) {
        console.log("[v0] notification stream init error:", (error as Error)?.message)
      }

      // Push a single notification exactly once, advancing the cursor.
      const push = (n: LiveNotification) => {
        if (sentIds.has(n.id)) return
        sentIds.add(n.id)
        const ms = new Date(n.createdAt).getTime()
        if (Number.isFinite(ms) && ms > cursor.getTime()) cursor = new Date(ms)
        safeEnqueue(sse("notification", n, String(ms)))
      }

      // Instant delivery for notifications created on this same instance.
      const unsubscribe = subscribeToNotifications((n) => {
        if (new Date(n.createdAt).getTime() > cursor.getTime() || !sentIds.has(n.id)) {
          push(n)
          getUnreadCount()
            .then((count) => safeEnqueue(sse("unread", { count })))
            .catch(() => {})
        }
      })

      // Durable reconciliation loop — catches anything the bus couldn't reach.
      const poll = setInterval(async () => {
        if (closed) return
        try {
          const items = await getSince(cursor)
          for (const n of items) push(n)
          safeEnqueue(sse("unread", { count: await getUnreadCount() }))
        } catch (error) {
          console.log("[v0] notification stream poll error:", (error as Error)?.message)
        }
      }, POLL_MS)

      const heartbeat = setInterval(() => safeEnqueue(`: ping ${Date.now()}\n\n`), HEARTBEAT_MS)

      const cleanup = () => {
        if (closed) return
        closed = true
        clearInterval(poll)
        clearInterval(heartbeat)
        clearTimeout(lifetime)
        unsubscribe()
        try {
          controller.close()
        } catch {
          // already closed
        }
      }

      // Recycle before hitting the serverless timeout; the client reconnects.
      const lifetime = setTimeout(cleanup, MAX_STREAM_MS)

      request.signal.addEventListener("abort", cleanup)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
