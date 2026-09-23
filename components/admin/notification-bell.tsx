"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Icon } from "@/lib/icons"
import { cn } from "@/lib/utils"

type LiveNotification = {
  id: string
  kind: string
  title: string
  detail: string
  href: string
  createdAt: string
}

const KIND_ICON: Record<string, string> = {
  contact: "headset",
  quote: "calendar-check",
  demo: "calendar-days",
  application: "briefcase",
  partner: "truck",
  subscriber: "users",
  comment: "message-square",
}

const TOAST_TIMEOUT = 6500

/**
 * Live notification bell for the admin header. Subscribes to the SSE stream at
 * /api/admin/notifications/stream and updates the unread badge in real time,
 * surfacing a toast for every new notification as it arrives. The count is
 * driven by the stream's `unread` events (the database is the source of truth),
 * so it stays accurate across tabs, instances and reconnects.
 */
export function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const router = useRouter()
  const [unread, setUnread] = useState(initialUnread)
  const [connected, setConnected] = useState(false)
  const [toasts, setToasts] = useState<LiveNotification[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  useEffect(() => {
    const source = new EventSource("/api/admin/notifications/stream")

    source.addEventListener("open", () => setConnected(true))

    source.addEventListener("unread", (event) => {
      try {
        const { count } = JSON.parse((event as MessageEvent).data)
        if (typeof count === "number") setUnread(count)
      } catch {
        // ignore malformed frame
      }
    })

    source.addEventListener("notification", (event) => {
      try {
        const n = JSON.parse((event as MessageEvent).data) as LiveNotification
        setToasts((prev) => (prev.some((t) => t.id === n.id) ? prev : [n, ...prev].slice(0, 4)))
        const timer = setTimeout(() => dismiss(n.id), TOAST_TIMEOUT)
        timers.current.set(n.id, timer)
        // Refresh server components (notification list, inbox pages) in the background.
        router.refresh()
      } catch {
        // ignore malformed frame
      }
    })

    source.onerror = () => {
      // EventSource reconnects automatically; just reflect the transient state.
      setConnected(false)
    }

    const active = timers.current
    return () => {
      source.close()
      active.forEach((t) => clearTimeout(t))
      active.clear()
    }
  }, [dismiss, router])

  return (
    <>
      <Link
        href="/admin/notifications"
        className="relative inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
        title={connected ? "Notifications — live" : "Notifications"}
      >
        <span className="relative inline-flex">
          <Icon name="message-square" className="h-4 w-4" />
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-card transition-colors",
              connected ? "bg-emerald-500" : "bg-muted-foreground/40",
            )}
            aria-hidden="true"
          />
        </span>
        <span className="hidden sm:inline">Notifications</span>
        <span className="sr-only">{connected ? "Live updates connected" : "Connecting to live updates"}</span>
        {unread > 0 ? (
          <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </Link>

      {/* Live toast stack */}
      <div
        className="pointer-events-none fixed right-4 top-20 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            onClick={() => dismiss(n.id)}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-accent/30 bg-card p-3.5 shadow-lg ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 motion-safe:animate-in motion-safe:slide-in-from-right-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
              <Icon name={KIND_ICON[n.kind] ?? "message-square"} className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{n.title}</span>
              {n.detail ? (
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{n.detail}</span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                dismiss(n.id)
              }}
              className="pointer-events-auto -mr-1 -mt-1 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <Icon name="circle-check" className="h-3.5 w-3.5" />
            </button>
          </Link>
        ))}
      </div>
    </>
  )
}
