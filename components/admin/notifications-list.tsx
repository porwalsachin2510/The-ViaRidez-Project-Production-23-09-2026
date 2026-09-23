"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/lib/icons"
import { markAdminNotificationsRead, markAdminNotificationRead } from "@/app/actions/admin"
import { EmptyState } from "@/components/admin/ui"
import { cn } from "@/lib/utils"
import type { AdminNotificationRecord } from "@/lib/data/admin-queries"

const KIND_ICON: Record<string, string> = {
  contact: "headset",
  quote: "calendar-check",
  demo: "calendar-days",
  application: "briefcase",
  partner: "truck",
  subscriber: "users",
  comment: "message-square",
}

const KIND_LABEL: Record<string, string> = {
  contact: "Contact enquiry",
  quote: "Quote request",
  demo: "Demo booking",
  application: "Job application",
  partner: "Fleet partner",
  subscriber: "Newsletter subscriber",
  comment: "Blog comment",
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

type Filter = "all" | "unread"

export function NotificationsList({
  notifications,
  unread,
}: {
  notifications: AdminNotificationRecord[]
  unread: number
}) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>("all")
  const [isPending, startTransition] = useTransition()

  const visible = filter === "unread" ? notifications.filter((n) => !n.readAt) : notifications

  function open(n: AdminNotificationRecord) {
    startTransition(async () => {
      if (!n.readAt) await markAdminNotificationRead(n.id)
      router.push(n.href)
    })
  }

  function markAll() {
    startTransition(async () => {
      await markAdminNotificationsRead()
    })
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          {(["all", "unread"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
              {f === "unread" && unread > 0 ? (
                <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
                  {unread}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={markAll}
          disabled={isPending || unread === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="circle-check" className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState message={filter === "unread" ? "You're all caught up — no unread notifications." : "No notifications yet."} />
      ) : (
        <ul className="space-y-2">
          {visible.map((n) => {
            const unreadItem = !n.readAt
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  disabled={isPending}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors",
                    unreadItem
                      ? "border-accent/30 bg-accent/5 hover:bg-accent/10"
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      unreadItem ? "bg-accent/15 text-accent-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon name={KIND_ICON[n.kind] ?? "message-square"} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{n.title}</p>
                      {unreadItem ? <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : null}
                    </div>
                    {n.detail ? <p className="mt-0.5 truncate text-sm text-muted-foreground">{n.detail}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {KIND_LABEL[n.kind] ?? n.kind} • {relativeTime(n.createdAt)}
                    </p>
                  </div>
                  <Icon name="navigation" className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
