"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Briefcase, Clock, Search, Wallet, TrendingUp, Users, X, CalendarClock } from "lucide-react"
import {
  type JobRole,
  employmentTypeLabel,
  workModeLabel,
  experienceLevelLabel,
  experienceLabel,
  salaryLabel,
  deadlineInfo,
  postedLabel,
} from "@/lib/careers"

type SortKey = "newest" | "closing" | "salary"

const ALL = "all"

function uniqueSorted(values: (string | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v && v.trim())))).sort((a, b) =>
    a.localeCompare(b),
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  format,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  format?: (v: string) => string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        <option value={ALL}>{label}: All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {format ? format(o) : o}
          </option>
        ))}
      </select>
    </label>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  )
}

function JobCard({ role }: { role: JobRole }) {
  const deadline = deadlineInfo(role.closingDate)
  const exp = experienceLabel(role)
  const posted = postedLabel(role.createdAt)
  const skills = (role.skills ?? []).slice(0, 5)

  return (
    <Link
      href={`/careers/${role.slug}`}
      className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-background p-6 transition-all hover:border-accent/50 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {role.featured ? (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Featured</span>
            ) : null}
            {role.department ? <Chip>{role.department}</Chip> : null}
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold text-foreground group-hover:text-accent">
            {role.title}
          </h3>
        </div>
        {role.openings && role.openings > 1 ? (
          <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {role.openings} openings
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        {role.location ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            {role.location}
          </span>
        ) : null}
        {role.workMode ? (
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-accent" aria-hidden="true" />
            {workModeLabel(role.workMode)}
          </span>
        ) : null}
        {role.employmentType ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
            {employmentTypeLabel(role.employmentType)}
          </span>
        ) : null}
        {exp ? (
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" />
            {exp}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <Wallet className="h-4 w-4 text-accent" aria-hidden="true" />
          {salaryLabel(role)}
        </span>
      </div>

      {role.excerpt ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{role.excerpt}</p>
      ) : null}

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {posted ? <span>{posted}</span> : null}
          {deadline.hasDeadline ? (
            <span
              className={`inline-flex items-center gap-1 font-medium ${
                deadline.closed ? "text-destructive" : deadline.urgent ? "text-amber-600" : "text-muted-foreground"
              }`}
            >
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              {deadline.label}
            </span>
          ) : null}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent">
          View &amp; apply
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}

export function CareersExplorer({ roles }: { roles: JobRole[] }) {
  const [query, setQuery] = useState("")
  const [department, setDepartment] = useState(ALL)
  const [location, setLocation] = useState(ALL)
  const [workMode, setWorkMode] = useState(ALL)
  const [employmentType, setEmploymentType] = useState(ALL)
  const [experienceLvl, setExperienceLvl] = useState(ALL)
  const [category, setCategory] = useState(ALL)
  const [sort, setSort] = useState<SortKey>("newest")

  const departments = useMemo(() => uniqueSorted(roles.map((r) => r.department)), [roles])
  const locations = useMemo(() => uniqueSorted(roles.map((r) => r.location)), [roles])
  const categories = useMemo(() => uniqueSorted(roles.map((r) => r.category)), [roles])
  const workModes = useMemo(() => uniqueSorted(roles.map((r) => r.workMode)), [roles])
  const employmentTypes = useMemo(() => uniqueSorted(roles.map((r) => r.employmentType)), [roles])
  const experienceLevels = useMemo(() => uniqueSorted(roles.map((r) => r.experienceLevel)), [roles])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = roles.filter((r) => {
      if (department !== ALL && r.department !== department) return false
      if (location !== ALL && r.location !== location) return false
      if (category !== ALL && r.category !== category) return false
      if (workMode !== ALL && r.workMode !== workMode) return false
      if (employmentType !== ALL && r.employmentType !== employmentType) return false
      if (experienceLvl !== ALL && r.experienceLevel !== experienceLvl) return false
      if (q) {
        const haystack = [r.title, r.department, r.location, r.excerpt, ...(r.skills ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    const sorted = [...result]
    if (sort === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    } else if (sort === "closing") {
      sorted.sort((a, b) => deadlineInfo(a.closingDate).daysLeft - deadlineInfo(b.closingDate).daysLeft)
    } else if (sort === "salary") {
      const val = (r: JobRole) => (r.salaryDisclosed ? Number(r.salaryMax) || Number(r.salaryMin) || 0 : 0)
      sorted.sort((a, b) => val(b) - val(a))
    }
    return sorted
  }, [roles, query, department, location, category, workMode, employmentType, experienceLvl, sort])

  const activeFilters =
    (department !== ALL ? 1 : 0) +
    (location !== ALL ? 1 : 0) +
    (category !== ALL ? 1 : 0) +
    (workMode !== ALL ? 1 : 0) +
    (employmentType !== ALL ? 1 : 0) +
    (experienceLvl !== ALL ? 1 : 0) +
    (query.trim() ? 1 : 0)

  function clearAll() {
    setQuery("")
    setDepartment(ALL)
    setLocation(ALL)
    setCategory(ALL)
    setWorkMode(ALL)
    setEmploymentType(ALL)
    setExperienceLvl(ALL)
  }

  return (
    <div className="mt-12">
      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, skill or keyword…"
            aria-label="Search open positions"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="shrink-0">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="newest">Newest</option>
            <option value="closing">Closing soon</option>
            <option value="salary">Highest salary</option>
          </select>
        </label>
      </div>

      {/* Filters */}
      <div className="mt-3 flex flex-wrap gap-3">
        {departments.length > 1 ? (
          <FilterSelect label="Department" value={department} onChange={setDepartment} options={departments} />
        ) : null}
        {locations.length > 1 ? (
          <FilterSelect label="Location" value={location} onChange={setLocation} options={locations} />
        ) : null}
        {workModes.length > 1 ? (
          <FilterSelect label="Work mode" value={workMode} onChange={setWorkMode} options={workModes} format={workModeLabel} />
        ) : null}
        {employmentTypes.length > 1 ? (
          <FilterSelect
            label="Type"
            value={employmentType}
            onChange={setEmploymentType}
            options={employmentTypes}
            format={employmentTypeLabel}
          />
        ) : null}
        {experienceLevels.length > 1 ? (
          <FilterSelect
            label="Experience"
            value={experienceLvl}
            onChange={setExperienceLvl}
            options={experienceLevels}
            format={experienceLevelLabel}
          />
        ) : null}
        {categories.length > 1 ? (
          <FilterSelect label="Category" value={category} onChange={setCategory} options={categories} />
        ) : null}
        {activeFilters > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      {/* Result count */}
      <p className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Users className="h-4 w-4" aria-hidden="true" />
        {filtered.length} {filtered.length === 1 ? "role" : "roles"} {activeFilters > 0 ? "match your filters" : "open"}
      </p>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {filtered.map((role) => (
            <JobCard key={role._id} role={role} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-background p-12 text-center">
          <p className="text-muted-foreground">No roles match your search. Try clearing some filters.</p>
        </div>
      )}
    </div>
  )
}
