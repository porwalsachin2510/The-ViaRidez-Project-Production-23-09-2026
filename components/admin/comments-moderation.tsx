"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Check, ExternalLink, Loader2, Trash2, X } from "lucide-react"
import { setCommentStatus, deleteComment } from "@/app/actions/comments"
import { StatusBadge } from "@/components/admin/ui"

interface CommentRecord {
  id: string
  name: string
  email: string
  body: string
  blogSlug: string
  status: string
  createdAt: string
}

type Filter = "all" | "pending" | "approved" | "rejected"

const FILTERS: { key: Filter; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Blog comment moderation queue. Every reader comment is stored as `pending`;
 * approving one makes it public on the article, rejecting hides it, and delete
 * removes it permanently (spam/abuse). Actions call the existing server actions
 * which revalidate both this page and the public article.
 */
export function CommentsModeration({
  comments,
  byStatus,
  filter,
}: {
  comments: CommentRecord[]
  byStatus: { pending: number; approved: number; rejected: number }
  filter: Filter
}) {
  return (
    <div>
      {/* Filter tabs with live counts */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? byStatus.pending + byStatus.approved + byStatus.rejected
              : byStatus[f.key]
          const active = f.key === filter
          return (
            <Link
              key={f.key}
              href={`/admin/comments?status=${f.key}`}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-accent hover:text-accent"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? "bg-primary-foreground/20" : "bg-muted"
                }`}
              >
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center text-sm text-muted-foreground">
          No {filter === "all" ? "" : filter} comments to show.
        </div>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <CommentCard key={c.id} comment={c} />
          ))}
        </ul>
      )}
    </div>
  )
}

function CommentCard({ comment }: { comment: CommentRecord }) {
  const [status, setStatus] = useState(comment.status)
  const [removed, setRemoved] = useState(false)
  const [pending, startTransition] = useTransition()

  if (removed) return null

  const run = (fn: () => Promise<{ ok: boolean }>, nextStatus?: string) =>
    startTransition(async () => {
      const res = await fn()
      if (res?.ok && nextStatus) setStatus(nextStatus)
      if (res?.ok && nextStatus === undefined) setRemoved(true)
    })

  return (
    <li className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{comment.name}</span>
            <StatusBadge status={status} />
          </div>
          <a href={`mailto:${comment.email}`} className="text-xs text-muted-foreground hover:text-accent">
            {comment.email}
          </a>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>{fmtDate(comment.createdAt)}</div>
          <Link
            href={`/blog/${comment.blogSlug}`}
            target="_blank"
            className="mt-1 inline-flex items-center gap-1 text-accent hover:underline"
          >
            {comment.blogSlug}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{comment.body}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {status !== "approved" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setCommentStatus(comment.id, "approved"), "approved")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Approve
          </button>
        ) : null}
        {status !== "rejected" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setCommentStatus(comment.id, "rejected"), "rejected")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
        ) : null}
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => deleteComment(comment.id))}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </li>
  )
}
