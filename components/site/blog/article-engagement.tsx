"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { Bookmark, Check, Eye, Hand, Link2, Loader2, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

const BOOKMARKS_KEY = "viaridez:bookmarks"

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return String(n)
}

interface EngagementState {
  slug: string
  title: string
  claps: number
  userClaps: number
  maxClaps: number
  views: number
  bookmarked: boolean
  copied: boolean
  busy: boolean
  clap: () => void
  toggleBookmark: () => void
  share: () => void
}

const EngagementContext = createContext<EngagementState | null>(null)

/**
 * Provides shared engagement state to every bar within a single article, so the
 * top and bottom clap/view controls stay in sync and the de-duplicated view is
 * recorded exactly once per page (not once per rendered bar). Wires the real
 * backend: GET/POST /clap (50-per-visitor cap) and POST /view. Bookmarks are a
 * client-only preference in localStorage; share uses the Web Share API with a
 * copy-link fallback.
 */
export function EngagementProvider({
  slug,
  title,
  initialClaps,
  initialViews,
  children,
}: {
  slug: string
  title: string
  initialClaps: number
  initialViews: number
  children: ReactNode
}) {
  const [claps, setClaps] = useState(initialClaps)
  const [userClaps, setUserClaps] = useState(0)
  const [maxClaps, setMaxClaps] = useState(50)
  const [views, setViews] = useState(initialViews)
  const [bookmarked, setBookmarked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const pendingRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Record the view + load this visitor's clap state once on mount.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [viewRes, clapRes] = await Promise.all([
          fetch(`/api/blog/${slug}/view`, { method: "POST" }).then((r) => r.json()).catch(() => null),
          fetch(`/api/blog/${slug}/clap`).then((r) => r.json()).catch(() => null),
        ])
        if (!active) return
        if (viewRes && typeof viewRes.views === "number") setViews(viewRes.views)
        if (clapRes) {
          if (typeof clapRes.claps === "number") setClaps(clapRes.claps)
          if (typeof clapRes.userClaps === "number") setUserClaps(clapRes.userClaps)
          if (typeof clapRes.max === "number") setMaxClaps(clapRes.max)
        }
      } catch {
        /* non-blocking — numbers stay at their server values */
      }
    })()
    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]") as string[]
      setBookmarked(Array.isArray(list) && list.includes(slug))
    } catch {
      setBookmarked(false)
    }
  }, [slug])

  const flushClaps = useCallback(() => {
    const add = pendingRef.current
    pendingRef.current = 0
    if (add <= 0) return
    fetch(`/api/blog/${slug}/clap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ add }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.claps === "number") setClaps(data.claps)
        if (data && typeof data.userClaps === "number") setUserClaps(data.userClaps)
      })
      .catch(() => {})
  }, [slug])

  const clap = useCallback(() => {
    setUserClaps((c) => {
      if (c >= maxClaps) return c
      pendingRef.current += 1
      setClaps((total) => total + 1)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flushClaps, 700)
      return c + 1
    })
  }, [maxClaps, flushClaps])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const toggleBookmark = useCallback(() => {
    try {
      const list = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]") as string[]
      const set = new Set(Array.isArray(list) ? list : [])
      if (set.has(slug)) set.delete(slug)
      else set.add(slug)
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(set)))
      setBookmarked(set.has(slug))
    } catch {
      /* localStorage unavailable — ignore */
    }
  }, [slug])

  const share = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        setBusy(true)
        await navigator.share({ title, url })
      } catch {
        /* user dismissed the share sheet */
      } finally {
        setBusy(false)
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked */
    }
  }, [title])

  return (
    <EngagementContext.Provider
      value={{ slug, title, claps, userClaps, maxClaps, views, bookmarked, copied, busy, clap, toggleBookmark, share }}
    >
      {children}
    </EngagementContext.Provider>
  )
}

/**
 * Presentational engagement bar. Must be rendered inside an
 * <EngagementProvider>. `variant="bar"` gives a rounded pill card; `inline`
 * is bare for use inside an existing bordered strip.
 */
export function EngagementBar({ variant = "bar" }: { variant?: "bar" | "inline" }) {
  const ctx = useContext(EngagementContext)
  if (!ctx) return null
  const { claps, userClaps, maxClaps, views, bookmarked, copied, busy, clap, toggleBookmark, share } = ctx
  const capped = userClaps >= maxClaps
  const canWebShare = typeof navigator !== "undefined" && "share" in navigator

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        variant === "bar"
          ? "flex-wrap rounded-full border border-border bg-card/80 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-card/60"
          : "flex-wrap",
      )}
    >
      <button
        type="button"
        onClick={clap}
        disabled={capped}
        aria-label={capped ? "You've given the maximum claps" : "Clap for this article"}
        title={capped ? "Max claps reached" : `Clap (${userClaps}/${maxClaps})`}
        className={cn(
          "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
          userClaps > 0 ? "bg-accent text-accent-foreground" : "bg-muted text-foreground hover:bg-accent/15 hover:text-accent",
          capped && "opacity-70",
        )}
      >
        <Hand
          className={cn("h-4 w-4 transition-transform group-active:scale-125", userClaps > 0 && !capped && "group-hover:-rotate-12")}
          aria-hidden="true"
        />
        {formatCount(claps)}
      </button>

      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground"
        title={`${views} unique views`}
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        {formatCount(views)}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={toggleBookmark}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark this article"}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
            bookmarked ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={share}
          aria-label="Share this article"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : copied ? (
            <Check className="h-4 w-4 text-accent" aria-hidden="true" />
          ) : canWebShare ? (
            <Share2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}
