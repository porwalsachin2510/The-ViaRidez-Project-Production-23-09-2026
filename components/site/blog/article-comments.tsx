"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, MessageSquare } from "lucide-react"

interface Comment {
  id: string
  name: string
  body: string
  createdAt: string
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

function timeAgo(iso: string) {
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

/**
 * Public comments for an article. Loads APPROVED comments from the API and
 * lets visitors submit a new one. Comments are moderation-first: a submission
 * is stored as `pending` and only appears here once an admin approves it, so we
 * show a clear "awaiting review" confirmation instead of optimistically adding.
 */
export function ArticleComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch(`/api/blog/${slug}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (active && Array.isArray(data.comments)) setComments(data.comments)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      body: String(fd.get("body") || ""),
      website: String(fd.get("website") || ""),
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong.")
      setNotice(data.message || "Thanks — your comment is awaiting review.")
      form.reset()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20"

  return (
    <section aria-labelledby="comments-heading" className="mt-14 border-t border-border pt-10">
      <h2 id="comments-heading" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
        <MessageSquare className="h-5 w-5 text-accent" aria-hidden="true" />
        Responses
        {comments.length > 0 ? (
          <span className="text-sm font-medium text-muted-foreground">({comments.length})</span>
        ) : null}
      </h2>

      {/* Submission form */}
      <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-border bg-card p-5">
        {/* Honeypot — must stay empty (bots fill it). */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="comment-website">Leave blank</label>
          <input id="comment-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {notice ? (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{notice}</span>
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="comment-name" className="sr-only">
              Your name
            </label>
            <input id="comment-name" name="name" required placeholder="Your name" className={inputCls} />
          </div>
          <div>
            <label htmlFor="comment-email" className="sr-only">
              Your email (not published)
            </label>
            <input
              id="comment-email"
              name="email"
              type="email"
              required
              placeholder="Email (not published)"
              className={inputCls}
            />
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor="comment-body" className="sr-only">
            Your response
          </label>
          <textarea
            id="comment-body"
            name="body"
            required
            rows={4}
            placeholder="Share your thoughts…"
            className={`${inputCls} resize-y`}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Comments are reviewed before they appear. Your email is never published.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Submitting…" : "Post response"}
          </button>
        </div>
      </form>

      {/* Approved comments */}
      <div className="mt-8 space-y-6">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading responses…
          </p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No responses yet. Be the first to share your thoughts.</p>
        ) : (
          comments.map((c) => (
            <article key={c.id} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(c.name) || "?"}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground">· {timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{c.body}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
