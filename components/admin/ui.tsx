"use client"

import Link from "next/link"
import type { ReactNode } from "react"

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-accent/15 text-accent-foreground ring-accent/30",
    "in-progress": "bg-amber-100 text-amber-800 ring-amber-200",
    contacted: "bg-amber-100 text-amber-800 ring-amber-200",
    quoted: "bg-sky-100 text-sky-800 ring-sky-200",
    reviewing: "bg-amber-100 text-amber-800 ring-amber-200",
    shortlisted: "bg-sky-100 text-sky-800 ring-sky-200",
    interview: "bg-violet-100 text-violet-800 ring-violet-200",
    offer: "bg-indigo-100 text-indigo-800 ring-indigo-200",
    won: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    hired: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    resolved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    lost: "bg-red-100 text-red-700 ring-red-200",
    rejected: "bg-red-100 text-red-700 ring-red-200",
    spam: "bg-slate-100 text-slate-600 ring-slate-200",
    published: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    draft: "bg-slate-100 text-slate-600 ring-slate-200",
  }
  const cls = map[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${cls}`}
    >
      {status.replace(/[-_]/g, " ")}
    </span>
  )
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>{children}</div>
  )
}

export function EmptyState({ message, cta }: { message: string; cta?: { label: string; href: string } }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {cta ? (
        <Link
          href={cta.href}
          className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  )
}
