"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Building2, MapPin, Search, Layers, X, FileText } from "lucide-react"
import type { CaseStudyData } from "@/lib/data/queries"

type SortKey = "featured" | "impact" | "az"

const ALL = "all"

function uniqueSorted(values: (string | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v && v.trim())))).sort((a, b) =>
    a.localeCompare(b),
  )
}

/** Pull the leading number out of a metric value ("99.4%" -> 99.4) for sorting. */
function metricScore(cs: CaseStudyData): number {
  const first = cs.metrics?.[0]?.value ?? ""
  const num = Number.parseFloat(first.replace(/[^0-9.]/g, ""))
  return Number.isFinite(num) ? num : 0
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
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
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function CaseStudyCard({ cs }: { cs: CaseStudyData }) {
  const metrics = cs.metrics?.slice(0, 3) ?? []
  return (
    <Link
      href={`/case-studies/${cs.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] bg-secondary">
        {cs.coverImage ? (
          <Image
            src={cs.coverImage || "/placeholder.svg"}
            alt={cs.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/30">
            <Building2 className="h-12 w-12" aria-hidden="true" />
          </div>
        )}
        {cs.industry ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
            {cs.industry}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {cs.client ? <span className="font-medium text-foreground">{cs.client}</span> : null}
          {cs.location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {cs.location}
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-foreground text-balance">
          {cs.title}
        </h3>
        {cs.excerpt ? (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{cs.excerpt}</p>
        ) : (
          <div className="flex-1" />
        )}
        {metrics.length > 0 ? (
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5">
            {metrics.map((m) => (
              <div key={m.label}>
                <div className="font-display text-lg font-bold text-accent">{m.value}</div>
                <div className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>
        ) : null}
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
          Read case study
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}

export function CaseStudiesExplorer({ studies }: { studies: CaseStudyData[] }) {
  const [query, setQuery] = useState("")
  const [industry, setIndustry] = useState(ALL)
  const [service, setService] = useState(ALL)
  const [sort, setSort] = useState<SortKey>("featured")

  const industries = useMemo(() => uniqueSorted(studies.map((s) => s.industry)), [studies])
  const services = useMemo(() => uniqueSorted(studies.map((s) => s.serviceType)), [studies])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = studies.filter((s) => {
      if (industry !== ALL && s.industry !== industry) return false
      if (service !== ALL && s.serviceType !== service) return false
      if (q) {
        const haystack = [s.title, s.client, s.industry, s.serviceType, s.location, s.excerpt, ...(s.tags ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    const sorted = [...result]
    if (sort === "featured") {
      sorted.sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (a.order ?? 0) - (b.order ?? 0),
      )
    } else if (sort === "impact") {
      sorted.sort((a, b) => metricScore(b) - metricScore(a))
    } else if (sort === "az") {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    }
    return sorted
  }, [studies, query, industry, service, sort])

  const activeFilters = (industry !== ALL ? 1 : 0) + (service !== ALL ? 1 : 0) + (query.trim() ? 1 : 0)

  function clearAll() {
    setQuery("")
    setIndustry(ALL)
    setService(ALL)
  }

  return (
    <div>
      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by client, industry or keyword…"
            aria-label="Search case studies"
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
            <option value="featured">Featured</option>
            <option value="impact">Biggest impact</option>
            <option value="az">A–Z</option>
          </select>
        </label>
      </div>

      {/* Filters */}
      {(industries.length > 1 || services.length > 1) && (
        <div className="mt-3 flex flex-wrap gap-3">
          {industries.length > 1 ? (
            <FilterSelect label="Industry" value={industry} onChange={setIndustry} options={industries} />
          ) : null}
          {services.length > 1 ? (
            <FilterSelect label="Service" value={service} onChange={setService} options={services} />
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
      )}

      {/* Result count */}
      <p className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Layers className="h-4 w-4" aria-hidden="true" />
        {filtered.length} {filtered.length === 1 ? "case study" : "case studies"}{" "}
        {activeFilters > 0 ? "match your filters" : "published"}
      </p>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cs) => (
            <CaseStudyCard key={cs._id} cs={cs} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
          <p className="mt-3 text-muted-foreground">No case studies match your search. Try clearing some filters.</p>
        </div>
      )}
    </div>
  )
}
