"use client"

import { useState, useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { updateSubscriberStatus, deleteSubscriber } from "@/app/actions/admin"

type Subscriber = {
  id: string
  email: string
  name: string
  source: string
  status: string
  createdAt: string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function Row({ sub }: { sub: Subscriber }) {
  const [status, setStatus] = useState(sub.status)
  const [pending, startTransition] = useTransition()
  const [removed, setRemoved] = useState(false)

  if (removed) return null

  return (
    <tr className="align-middle">
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">{sub.email}</div>
        {sub.name ? <div className="text-xs text-muted-foreground">{sub.name}</div> : null}
      </td>
      <td className="hidden px-4 py-3 text-sm capitalize text-muted-foreground sm:table-cell">
        {sub.source.replace(/[-_]/g, " ") || "—"}
      </td>
      <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
        {fmtDate(sub.createdAt)}
      </td>
      <td className="px-4 py-3">
        <select
          value={status}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value
            setStatus(next)
            startTransition(async () => {
              await updateSubscriberStatus(sub.id, next)
            })
          }}
          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium capitalize text-foreground disabled:opacity-50"
          aria-label="Subscription status"
        >
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Permanently delete ${sub.email}?`)) return
            startTransition(async () => {
              const res = await deleteSubscriber(sub.id)
              if (res?.ok) setRemoved(true)
            })
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          aria-label={`Delete ${sub.email}`}
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      </td>
    </tr>
  )
}

export function SubscribersTable({ subscribers }: { subscribers: Subscriber[] }) {
  if (subscribers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center text-sm text-muted-foreground">
        No subscribers yet. Newsletter sign-ups from the site will appear here.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Source</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Joined</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {subscribers.map((s) => (
            <Row key={s.id} sub={s} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
