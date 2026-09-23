"use client"

import { Fragment, useMemo, useState, useTransition } from "react"
import {
  ChevronDown,
  Search,
  Star,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Clock,
  Wallet,
  TrendingUp,
  FileText,
  Linkedin,
  Globe,
  Loader2,
  Check,
  X,
  List,
  Columns3,
  GripVertical,
  CheckSquare,
} from "lucide-react"
import { APPLICATION_STAGES, STAGE_LABELS } from "@/lib/careers"
import type { ApplicationRecord } from "@/lib/data/admin-queries"
import { updateInboxStatus, updateInboxNotes, updateApplicationRating } from "@/app/actions/admin"
import { StatusBadge } from "./ui"

type SortKey = "newest" | "rating" | "experience" | "name"
type ViewMode = "list" | "board"

const ALL = "all"

function fmtDate(iso: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function expLabel(years: number) {
  if (!years) return "Fresher"
  return `${years} yr${years > 1 ? "s" : ""} exp`
}

/* ------------------------------ Star rating ------------------------------ */
function RatingControl({ id, rating }: { id: string; rating: number }) {
  const [value, setValue] = useState(rating)
  const [hover, setHover] = useState(0)
  const [pending, startTransition] = useTransition()

  function set(next: number) {
    const target = next === value ? 0 : next // click the current rating to clear
    setValue(target)
    startTransition(async () => {
      await updateApplicationRating(id, target)
    })
  }

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Rating: ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || value) >= n
        return (
          <button
            key={n}
            type="button"
            disabled={pending}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => set(n)}
            className="p-0.5 text-muted-foreground transition-colors disabled:opacity-50"
            aria-label={`Set rating to ${n}`}
          >
            <Star
              className={`h-4 w-4 ${active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------ Stage select ----------------------------- */
function StageControl({
  stage,
  onChange,
}: {
  stage: string
  onChange: (next: string) => void
}) {
  return (
    <select
      value={stage}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium capitalize text-foreground"
      aria-label="Update application stage"
    >
      {APPLICATION_STAGES.map((s) => (
        <option key={s} value={s}>
          {STAGE_LABELS[s]}
        </option>
      ))}
    </select>
  )
}

/* ------------------------------ Notes editor ----------------------------- */
function NotesEditor({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = useState(initial)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()
  const dirty = value !== initial

  return (
    <div className="mt-4 rounded-lg border border-border bg-background p-3">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Internal notes</label>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setSaved(false)
        }}
        rows={3}
        placeholder="Interview feedback, next steps, context for the hiring team…"
        className="mt-1.5 w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={() =>
            startTransition(async () => {
              const res = await updateInboxNotes("application", id, value)
              if (res?.ok) setSaved(true)
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Save note
        </button>
        {saved && !dirty ? <span className="text-xs text-emerald-600">Saved</span> : null}
      </div>
    </div>
  )
}

/* ------------------------------ Detail item ------------------------------ */
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="break-words text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}

/* --------------------------- Candidate detail ---------------------------- */
function CandidateDetail({ record }: { record: ApplicationRecord }) {
  const link = (href: string, label: string) =>
    href ? (
      <a href={href} target="_blank" rel="noreferrer" className="text-accent underline">
        {label}
      </a>
    ) : (
      "—"
    )

  return (
    <div className="border-t border-border bg-muted/20 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={<a href={`mailto:${record.email}`} className="text-accent underline">{record.email}</a>}
        />
        {record.phone ? (
          <DetailItem
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={<a href={`tel:${record.phone}`} className="text-accent underline">{record.phone}</a>}
          />
        ) : null}
        {record.currentCompany ? (
          <DetailItem icon={<Building2 className="h-4 w-4" />} label="Current company" value={record.currentCompany} />
        ) : null}
        {record.currentDesignation ? (
          <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Designation" value={record.currentDesignation} />
        ) : null}
        {record.currentCtc ? (
          <DetailItem icon={<Wallet className="h-4 w-4" />} label="Current CTC" value={record.currentCtc} />
        ) : null}
        {record.expectedCtc ? (
          <DetailItem icon={<Wallet className="h-4 w-4" />} label="Expected CTC" value={record.expectedCtc} />
        ) : null}
        <DetailItem
          icon={<FileText className="h-4 w-4" />}
          label="Resume / CV"
          value={link(record.resumeUrl, record.resumeFileName || "Download CV")}
        />
        {record.linkedin ? (
          <DetailItem icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" value={link(record.linkedin, "Open profile")} />
        ) : null}
        {record.portfolio ? (
          <DetailItem icon={<Globe className="h-4 w-4" />} label="Portfolio" value={link(record.portfolio, "Open link")} />
        ) : null}
        {record.source ? (
          <DetailItem icon={<Briefcase className="h-4 w-4" />} label="Source" value={record.source.replace(/[-_]/g, " ")} />
        ) : null}
      </div>

      {record.coverLetter ? (
        <div className="mt-4 rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cover note</p>
          <p className="mt-1 whitespace-pre-line text-sm text-foreground">{record.coverLetter}</p>
        </div>
      ) : null}

      {record.screeningAnswers.length > 0 ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Screening answers</p>
          {record.screeningAnswers.map((qa, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3">
              <p className="text-sm font-medium text-foreground">{qa.question}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{qa.answer || "—"}</p>
            </div>
          ))}
        </div>
      ) : null}

      <NotesEditor id={record.id} initial={record.notes} />
    </div>
  )
}

/* ----------------------------- Candidate row ----------------------------- */
function CandidateRow({
  record,
  selected,
  onSelect,
  onStage,
}: {
  record: ApplicationRecord
  selected: boolean
  onSelect: (id: string, checked: boolean) => void
  onStage: (id: string, next: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`rounded-xl border bg-card shadow-sm ${selected ? "border-accent ring-1 ring-accent/30" : "border-border"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(record.id, e.target.checked)}
            aria-label={`Select ${record.name}`}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-semibold text-foreground">{record.name}</h3>
              <StatusBadge status={record.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{record.position || "General application"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                {expLabel(record.totalExperience)}
              </span>
              {record.currentLocation ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {record.currentLocation}
                </span>
              ) : null}
              {record.noticePeriod ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {record.noticePeriod}
                </span>
              ) : null}
              {record.expectedCtc ? (
                <span className="inline-flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                  Exp. {record.expectedCtc}
                </span>
              ) : null}
              <span>Applied {fmtDate(record.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <RatingControl id={record.id} rating={record.rating} />
          <div className="flex items-center gap-2">
            <StageControl stage={record.status} onChange={(next) => onStage(record.id, next)} />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              aria-expanded={open}
            >
              {open ? "Hide" : "View"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {open ? <CandidateDetail record={record} /> : null}
    </div>
  )
}

/* ------------------------------ Kanban card ------------------------------ */
function BoardCard({
  record,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  record: ApplicationRecord
  dragging: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", record.id)
        onDragStart(record.id)
      }}
      onDragEnd={onDragEnd}
      className={`group cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-opacity active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{record.name}</p>
          <p className="truncate text-xs text-muted-foreground">{record.position || "General application"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              {expLabel(record.totalExperience)}
            </span>
            {record.rating > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-amber-500">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                {record.rating}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ Kanban board ----------------------------- */
function BoardView({
  rows,
  onStage,
}: {
  rows: ApplicationRecord[]
  onStage: (id: string, next: string) => void
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)

  const byStage = useMemo(() => {
    const map: Record<string, ApplicationRecord[]> = {}
    for (const s of APPLICATION_STAGES) map[s] = []
    for (const r of rows) (map[r.status] ??= []).push(r)
    return map
  }, [rows])

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {APPLICATION_STAGES.map((s) => {
        const items = byStage[s] ?? []
        const isOver = overStage === s
        return (
          <div
            key={s}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
              if (overStage !== s) setOverStage(s)
            }}
            onDragLeave={(e) => {
              // Only clear when leaving the column, not when moving over children.
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStage((c) => (c === s ? null : c))
            }}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData("text/plain")
              if (id) onStage(id, s)
              setDraggingId(null)
              setOverStage(null)
            }}
            className={`flex w-72 shrink-0 flex-col rounded-xl border bg-muted/20 transition-colors ${
              isOver ? "border-accent bg-accent/10" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
              <div className="flex items-center gap-2">
                <StatusBadge status={s} />
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex min-h-24 flex-1 flex-col gap-2 p-2">
              {items.length > 0 ? (
                items.map((r) => (
                  <BoardCard
                    key={r.id}
                    record={r}
                    dragging={draggingId === r.id}
                    onDragStart={setDraggingId}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setOverStage(null)
                    }}
                  />
                ))
              ) : (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground/60">Drop candidates here</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------- Main ATS ------------------------------- */
export function ApplicationsATS({ records }: { records: ApplicationRecord[] }) {
  // Local copy so stage changes update the pipeline counts live.
  const [rows, setRows] = useState(records)
  const [query, setQuery] = useState("")
  const [stage, setStage] = useState<string>(ALL)
  const [role, setRole] = useState<string>(ALL)
  const [sort, setSort] = useState<SortKey>("newest")
  const [view, setView] = useState<ViewMode>("list")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkStage, setBulkStage] = useState<string>(APPLICATION_STAGES[0])
  const [bulkPending, startBulk] = useTransition()

  // Single source of truth for stage changes: update UI immediately, persist to DB.
  function commitStage(id: string, next: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)))
    void updateInboxStatus("application", id, next)
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const nextSet = new Set(prev)
      if (checked) nextSet.add(id)
      else nextSet.delete(id)
      return nextSet
    })
  }

  const roles = useMemo(
    () => Array.from(new Set(rows.map((r) => r.position).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [rows],
  )

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of APPLICATION_STAGES) counts[s] = 0
    for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1
    return counts
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = rows.filter((r) => {
      if (stage !== ALL && r.status !== stage) return false
      if (role !== ALL && r.position !== role) return false
      if (q) {
        const haystack = [r.name, r.email, r.position, r.currentCompany, r.currentDesignation, r.currentLocation]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    const sorted = [...result]
    if (sort === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sort === "rating") {
      sorted.sort((a, b) => b.rating - a.rating)
    } else if (sort === "experience") {
      sorted.sort((a, b) => b.totalExperience - a.totalExperience)
    } else if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    return sorted
  }, [rows, query, stage, role, sort])

  // Only act on selections that are currently visible under the active filters.
  const visibleIds = useMemo(() => new Set(filtered.map((r) => r.id)), [filtered])
  const selectedVisible = useMemo(() => [...selected].filter((id) => visibleIds.has(id)), [selected, visibleIds])
  const allVisibleSelected = filtered.length > 0 && selectedVisible.length === filtered.length

  function toggleSelectAll() {
    setSelected((prev) => {
      const nextSet = new Set(prev)
      if (allVisibleSelected) filtered.forEach((r) => nextSet.delete(r.id))
      else filtered.forEach((r) => nextSet.add(r.id))
      return nextSet
    })
  }

  function applyBulkStage() {
    const ids = selectedVisible
    if (ids.length === 0) return
    setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status: bulkStage } : r)))
    startBulk(async () => {
      await Promise.all(ids.map((id) => updateInboxStatus("application", id, bulkStage)))
      setSelected(new Set())
    })
  }

  const activeFilters = (stage !== ALL ? 1 : 0) + (role !== ALL ? 1 : 0) + (query.trim() ? 1 : 0)

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center text-sm text-muted-foreground">
        No applications yet. Submissions from the careers site will appear here.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Pipeline summary */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStage(ALL)}
          className={`rounded-lg border px-3 py-2 text-left transition-colors ${
            stage === ALL ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent/50"
          }`}
        >
          <span className="block text-lg font-bold text-foreground">{rows.length}</span>
          <span className="text-xs text-muted-foreground">All</span>
        </button>
        {APPLICATION_STAGES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStage(s === stage ? ALL : s)}
            className={`rounded-lg border px-3 py-2 text-left transition-colors ${
              stage === s ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent/50"
            }`}
          >
            <span className="block text-lg font-bold text-foreground">{stageCounts[s] ?? 0}</span>
            <span className="text-xs text-muted-foreground">{STAGE_LABELS[s]}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, company or role…"
            aria-label="Search applications"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        {roles.length > 1 ? (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Filter by role"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value={ALL}>All roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        ) : null}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort applications"
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="newest">Newest</option>
          <option value="rating">Top rated</option>
          <option value="experience">Most experience</option>
          <option value="name">Name (A–Z)</option>
        </select>
        {activeFilters > 0 ? (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setStage(ALL)
              setRole(ALL)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        ) : null}

        {/* View toggle */}
        <div className="inline-flex overflow-hidden rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
              view === "list" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" aria-hidden="true" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView("board")}
            aria-pressed={view === "board"}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
              view === "board" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <Columns3 className="h-4 w-4" aria-hidden="true" />
            Board
          </button>
        </div>
      </div>

      {view === "list" ? (
        <>
          {/* Selection + bulk actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <CheckSquare className={`h-4 w-4 ${allVisibleSelected ? "text-accent" : ""}`} aria-hidden="true" />
              {allVisibleSelected ? "Deselect all" : "Select all"}
            </button>
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "candidate" : "candidates"}
              {activeFilters > 0 ? " match your filters" : ""}
            </p>
          </div>

          {selectedVisible.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
              <span className="text-sm font-semibold text-foreground">
                {selectedVisible.length} selected
              </span>
              <span className="text-sm text-muted-foreground">Move to</span>
              <select
                value={bulkStage}
                onChange={(e) => setBulkStage(e.target.value)}
                aria-label="Bulk stage"
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium capitalize text-foreground"
              >
                {APPLICATION_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyBulkStage}
                disabled={bulkPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground disabled:opacity-50"
              >
                {bulkPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Apply
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear selection
              </button>
            </div>
          ) : null}

          {/* Candidate list */}
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((r) => (
                <Fragment key={r.id}>
                  <CandidateRow
                    record={r}
                    selected={selected.has(r.id)}
                    onSelect={toggleSelect}
                    onStage={commitStage}
                  />
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
              No candidates match your filters.
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Drag candidates between columns to update their stage.
            {activeFilters > 0 ? " Filters are applied to the board." : ""}
          </p>
          <BoardView rows={filtered} onStage={commitStage} />
        </>
      )}
    </div>
  )
}
