"use client"

import { useActionState, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { saveGlobalSeo, type SeoState } from "@/app/actions/seo"
import type { SeoAuditResult, SeoAuditItem } from "@/lib/data/seo-audit"
import { ImageField, ImageUploader } from "@/components/admin/image-field"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface SeoSettingsInput {
  metaTitle: string
  metaDescription: string
  ogImage: string
  titleTemplate: string
  defaultKeywords: string
  defaultOgImage: string
  twitterSite: string
  twitterCreator: string
  gaId: string
  gtmId: string
  verifyGoogle: string
  verifyBing: string
  verifyYandex: string
  verifyPinterest: string
  orgLegalName: string
  orgFoundingDate: string
  orgStreetAddress: string
  orgLocality: string
  orgRegion: string
  orgPostalCode: string
  orgCountry: string
  orgLatitude: string
  orgLongitude: string
  orgPriceRange: string
  orgOpeningHours: string
  blockAiBots: boolean
  extraDisallow: string
}

/* Google's practical rendering limits (mirrors lib/data/seo-audit.ts). */
const TITLE_MIN = 30
const TITLE_MAX = 60
const DESC_MIN = 70
const DESC_MAX = 160
const DISPLAY_HOST = "www.viaridez.com"

type TabKey = "health" | "general" | "social" | "schema" | "verification" | "crawl"

const TABS: { key: TabKey; label: string }[] = [
  { key: "health", label: "Site Health" },
  { key: "general", label: "General" },
  { key: "social", label: "Social & OG" },
  { key: "schema", label: "Structured Data" },
  { key: "verification", label: "Verification & Analytics" },
  { key: "crawl", label: "Crawl & Robots" },
]

/* -------------------------------------------------------------------------- */
/*  Shared field primitives                                                   */
/* -------------------------------------------------------------------------- */

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  hint,
  type = "text",
}: {
  name: string
  label: string
  defaultValue?: string
  placeholder?: string
  hint?: string
  type?: "text" | "date"
}) {
  // The native date picker requires a YYYY-MM-DD value; normalise whatever the
  // settings store returned so an existing value pre-fills the calendar.
  const value =
    type === "date" && defaultValue
      ? (() => {
          const d = new Date(defaultValue)
          return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
        })()
      : defaultValue
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={type === "date" ? undefined : placeholder}
        className={inputCls}
      />
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      {description ? <p className="mt-1 mb-4 text-sm text-muted-foreground">{description}</p> : <div className="mb-4" />}
      {children}
    </section>
  )
}

/** Character-count meter with green/amber colouring against target ranges. */
function CharMeter({ value, min, max }: { value: number; min: number; max: number }) {
  const ok = value >= min && value <= max
  const over = value > max
  const cls = over
    ? "text-red-600"
    : ok
      ? "text-emerald-600"
      : "text-amber-600"
  return (
    <span className={`text-xs font-medium tabular-nums ${cls}`}>
      {value} / {max} chars {over ? "· too long" : value < min ? "· too short" : "· ideal"}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  Live previews                                                             */
/* -------------------------------------------------------------------------- */

function SerpPreview({ title, description }: { title: string; description: string }) {
  const shownTitle = (title || "ViaRidez | Enterprise Employee Transportation").slice(0, 65)
  const shownDesc =
    (description ||
      "ViaRidez delivers reliable, technology-driven employee transportation and corporate shuttles across the UAE, Kuwait, India and Nepal.").slice(
      0,
      170,
    )
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Google result preview</p>
      <div className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200">
            V
          </span>
          <div className="leading-tight">
            <div className="text-[13px] text-slate-800">ViaRidez</div>
            <div className="text-[12px] text-slate-500">
              {DISPLAY_HOST} <span className="text-slate-400">›</span> ...
            </div>
          </div>
        </div>
        <h3 className="mt-2 text-[18px] leading-6 text-[#1a0dab]">{shownTitle}</h3>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">{shownDesc}</p>
      </div>
    </div>
  )
}

function SocialPreview({
  title,
  description,
  image,
}: {
  title: string
  description: string
  image: string
}) {
  const shownImage = image?.trim()
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Social share preview</p>
      <div className="overflow-hidden rounded-lg ring-1 ring-slate-200">
        <div className="flex aspect-[1200/630] items-center justify-center bg-slate-100">
          {shownImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownImage || "/placeholder.svg"} alt="Open Graph preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#0F2E4D] text-sm font-semibold text-white">
              /opengraph-image (auto-generated)
            </div>
          )}
        </div>
        <div className="bg-white p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">{DISPLAY_HOST}</div>
          <div className="mt-0.5 truncate text-[14px] font-semibold text-slate-800">
            {title || "ViaRidez | Enterprise Employee Transportation"}
          </div>
          <div className="mt-0.5 line-clamp-2 text-[12px] text-slate-500">
            {description || "Reliable, technology-driven corporate mobility across the UAE and beyond."}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Site Health audit                                                         */
/* -------------------------------------------------------------------------- */

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-600"
  if (score >= 70) return "text-amber-600"
  return "text-red-600"
}
function scoreRing(score: number) {
  if (score >= 90) return "#059669"
  if (score >= 70) return "#d97706"
  return "#dc2626"
}

function ScoreDial({ score }: { score: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  const dash = (score / 100) * c
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={scoreRing(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <span className={`absolute text-xl font-bold ${scoreColor(score)}`}>{score}</span>
    </div>
  )
}

function StatCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "warn" | "bad" | "good" }) {
  const toneCls =
    tone === "bad"
      ? "text-red-600"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "good"
          ? "text-emerald-600"
          : "text-foreground"
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className={`font-display text-2xl font-bold ${toneCls}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function IssueBadge({ item }: { item: SeoAuditItem }) {
  const errors = item.issues.filter((i) => i.level === "error").length
  const warnings = item.issues.filter((i) => i.level === "warning").length
  if (!errors && !warnings) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200">
        Healthy
      </span>
    )
  }
  return (
    <span className="flex flex-wrap gap-1">
      {errors > 0 ? (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
          {errors} error{errors > 1 ? "s" : ""}
        </span>
      ) : null}
      {warnings > 0 ? (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
          {warnings} warning{warnings > 1 ? "s" : ""}
        </span>
      ) : null}
    </span>
  )
}

function AuditRow({ item }: { item: SeoAuditItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className={`w-8 shrink-0 text-sm font-bold tabular-nums ${scoreColor(item.score)}`}>{item.score}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {item.collection} · {item.path}
          </span>
        </span>
        <IssueBadge item={item} />
        <span className="ml-1 shrink-0 text-muted-foreground">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="border-t border-border px-4 py-3">
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <div className="text-xs text-muted-foreground">
              Title{" "}
              <span className={item.titleLength > TITLE_MAX || item.titleLength < TITLE_MIN ? "text-amber-600" : "text-emerald-600"}>
                ({item.titleLength} chars)
              </span>
              <div className="mt-0.5 text-foreground">{item.metaTitle || "—"}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Description{" "}
              <span className={item.descriptionLength > DESC_MAX || item.descriptionLength < DESC_MIN ? "text-amber-600" : "text-emerald-600"}>
                ({item.descriptionLength} chars)
              </span>
              <div className="mt-0.5 text-foreground">{item.metaDescription || "—"}</div>
            </div>
          </div>
          {item.issues.length ? (
            <ul className="space-y-1.5">
              {item.issues.map((iss, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs">
                  <span
                    className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${iss.level === "error" ? "bg-red-500" : "bg-amber-500"}`}
                  />
                  <span className="text-foreground">{iss.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-600">No issues — this page is fully optimised.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

function HealthTab({ audit }: { audit: SeoAuditResult }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  const { summary } = audit
  const [filter, setFilter] = useState<"all" | "issues">("issues")

  const items = filter === "issues" ? audit.items.filter((i) => i.issues.length > 0) : audit.items

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <ScoreDial score={summary.score} />
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Overall SEO health</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Scanned {summary.total} published page{summary.total === 1 ? "" : "s"} ·{" "}
                <span className="text-emerald-600">{summary.healthy} healthy</span> ·{" "}
                <span className="text-red-600">{summary.errors} errors</span> ·{" "}
                <span className="text-amber-600">{summary.warnings} warnings</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Generated {new Date(audit.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => start(() => router.refresh())}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
            disabled={pending}
          >
            {pending ? "Re-scanning…" : "Re-run audit"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Indexable" value={summary.indexable} tone="good" />
          <StatCard label="Noindex" value={summary.noindex} tone={summary.noindex ? "warn" : "default"} />
          <StatCard label="Missing title" value={summary.missingMetaTitle} tone={summary.missingMetaTitle ? "warn" : "good"} />
          <StatCard label="Missing description" value={summary.missingMetaDescription} tone={summary.missingMetaDescription ? "warn" : "good"} />
          <StatCard label="No share image" value={summary.missingOgImage} tone={summary.missingOgImage ? "warn" : "good"} />
          <StatCard label="Duplicate titles" value={summary.duplicateTitles} tone={summary.duplicateTitles ? "bad" : "good"} />
        </div>
      </div>

      {audit.byCollection.length ? (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-display text-base font-semibold text-foreground">Health by content type</h3>
          <div className="space-y-3">
            {audit.byCollection.map((c) => (
              <div key={c.collection} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-foreground">{c.collection}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${c.score}%`, background: scoreRing(c.score) }} />
                </div>
                <span className={`w-10 shrink-0 text-right text-sm font-semibold tabular-nums ${scoreColor(c.score)}`}>{c.score}</span>
                <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                  {c.total} page{c.total === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-foreground">Page-by-page audit</h3>
          <div className="flex rounded-lg border border-border p-0.5 text-sm">
            <button
              type="button"
              onClick={() => setFilter("issues")}
              className={`rounded-md px-3 py-1 font-medium ${filter === "issues" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
            >
              Needs attention
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1 font-medium ${filter === "all" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
            >
              All pages
            </button>
          </div>
        </div>
        {items.length ? (
          <div className="space-y-2">
            {items.map((item) => (
              <AuditRow key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-background px-6 py-12 text-center text-sm text-muted-foreground">
            {audit.summary.total === 0
              ? "No published content found to audit yet."
              : "Every published page passed — no issues to fix."}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function SeoCommandCenter({
  settings,
  audit,
  companyName,
}: {
  settings: SeoSettingsInput
  audit: SeoAuditResult
  companyName: string
}) {
  const [state, action, isSaving] = useActionState<SeoState, FormData>(saveGlobalSeo, null)
  const [tab, setTab] = useState<TabKey>("health")

  // Live-preview state (drives the SERP + social cards as you type).
  const [metaTitle, setMetaTitle] = useState(settings.metaTitle)
  const [metaDescription, setMetaDescription] = useState(settings.metaDescription)
  const [ogImage, setOgImage] = useState(settings.ogImage || settings.defaultOgImage)

  const showPreviews = tab !== "health"

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">SEO Command Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Site-wide metadata, structured data, crawl controls and a live health audit for {companyName}. Per-page
            overrides live on each content item.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => {
          const active = tab === t.key
          const errorCount = t.key === "health" ? audit.summary.errors : 0
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {errorCount > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-semibold text-red-700">
                  {errorCount}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Health tab is display-only, full width. */}
      <div className={tab === "health" ? "block" : "hidden"}>
        <HealthTab audit={audit} />
      </div>

      {/* Settings form — all panels stay mounted so every field submits. */}
      <form action={action} className={tab === "health" ? "hidden" : "block"}>
        <div className={`grid gap-6 ${showPreviews ? "lg:grid-cols-[1fr_380px]" : ""}`}>
          <div className="space-y-6">
            {/* General */}
            <div className={tab === "general" ? "space-y-6" : "hidden"}>
              <Panel
                title="Default metadata"
                description="Used as the fallback title and description for any page without its own SEO overrides."
              >
                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="metaTitle" className="block text-sm font-medium text-foreground">
                        Default meta title
                      </label>
                      <CharMeter value={metaTitle.length} min={TITLE_MIN} max={TITLE_MAX} />
                    </div>
                    <input
                      id="metaTitle"
                      name="metaTitle"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="metaDescription" className="block text-sm font-medium text-foreground">
                        Default meta description
                      </label>
                      <CharMeter value={metaDescription.length} min={DESC_MIN} max={DESC_MAX} />
                    </div>
                    <textarea
                      id="metaDescription"
                      name="metaDescription"
                      rows={3}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <Field
                    name="titleTemplate"
                    label="Title template"
                    defaultValue={settings.titleTemplate}
                    placeholder="%s | ViaRidez"
                    hint="Applied to page titles in the browser tab. Use %s where the page name should appear."
                  />
                  <Field
                    name="defaultKeywords"
                    label="Default keywords"
                    defaultValue={settings.defaultKeywords}
                    placeholder="employee transportation, corporate mobility, staff transport Dubai"
                    hint="Comma-separated. Merged into every page's keyword set."
                  />
                </div>
              </Panel>
            </div>

            {/* Social & OG */}
            <div className={tab === "social" ? "space-y-6" : "hidden"}>
              <Panel
                title="Open Graph & social sharing"
                description="Controls how links to your site preview on LinkedIn, WhatsApp, X and other platforms."
              >
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Default social share image
                    </label>
                    {/* Submitted value; the uploader drives the live preview too. */}
                    <input type="hidden" name="ogImage" value={ogImage} />
                    <ImageUploader value={ogImage} onChange={setOgImage} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Recommended 1200×630px. If empty, ViaRidez generates a branded card automatically.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Advanced OG image override
                    </label>
                    <ImageField name="defaultOgImage" defaultValue={settings.defaultOgImage} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Takes precedence over the default image above when set (used by the site-wide layout).
                    </p>
                  </div>                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="twitterSite" label="X / Twitter site handle" defaultValue={settings.twitterSite} placeholder="@viaridez" />
                    <Field name="twitterCreator" label="X / Twitter creator handle" defaultValue={settings.twitterCreator} placeholder="@viaridez" />
                  </div>
                </div>
              </Panel>
            </div>

            {/* Structured Data */}
            <div className={tab === "schema" ? "space-y-6" : "hidden"}>
              <Panel
                title="Organization & Local Business"
                description="Feeds the Organization + LocalBusiness JSON-LD injected site-wide, powering rich results and knowledge-panel data."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="orgLegalName" label="Legal name" defaultValue={settings.orgLegalName} placeholder="ViaRidez Transport LLC" />
                  <Field name="orgFoundingDate" label="Founding date" type="date" defaultValue={settings.orgFoundingDate} hint="When the company was founded. Feeds the Organization schema." />
                  <Field name="orgStreetAddress" label="Street address" defaultValue={settings.orgStreetAddress} />
                  <Field name="orgLocality" label="City / locality" defaultValue={settings.orgLocality} placeholder="Dubai" />
                  <Field name="orgRegion" label="Region / emirate" defaultValue={settings.orgRegion} placeholder="Dubai" />
                  <Field name="orgPostalCode" label="Postal code" defaultValue={settings.orgPostalCode} />
                  <Field name="orgCountry" label="Country code" defaultValue={settings.orgCountry} placeholder="AE" />
                  <Field name="orgPriceRange" label="Price range" defaultValue={settings.orgPriceRange} placeholder="$$" />
                  <Field name="orgLatitude" label="Latitude" defaultValue={settings.orgLatitude} placeholder="25.2048" />
                  <Field name="orgLongitude" label="Longitude" defaultValue={settings.orgLongitude} placeholder="55.2708" />
                  <div className="sm:col-span-2">
                    <Field
                      name="orgOpeningHours"
                      label="Opening hours"
                      defaultValue={settings.orgOpeningHours}
                      placeholder="Mo-Su 00:00-23:59"
                      hint="Schema.org opening-hours format, e.g. Mo-Fr 08:00-18:00."
                    />
                  </div>
                </div>
              </Panel>
            </div>

            {/* Verification & Analytics */}
            <div className={tab === "verification" ? "space-y-6" : "hidden"}>
              <Panel
                title="Search engine verification"
                description="Ownership tokens rendered into the site <head> so you can verify the domain in each search console."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="verifyGoogle" label="Google Search Console" defaultValue={settings.verifyGoogle} placeholder="google-site-verification token" />
                  <Field name="verifyBing" label="Bing Webmaster Tools" defaultValue={settings.verifyBing} placeholder="msvalidate.01 token" />
                  <Field name="verifyYandex" label="Yandex Webmaster" defaultValue={settings.verifyYandex} />
                  <Field name="verifyPinterest" label="Pinterest" defaultValue={settings.verifyPinterest} />
                </div>
              </Panel>
              <Panel title="Analytics" description="Injected on the public site after visitor consent.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="gaId" label="Google Analytics ID" defaultValue={settings.gaId} placeholder="G-XXXXXXX" />
                  <Field name="gtmId" label="Google Tag Manager ID" defaultValue={settings.gtmId} placeholder="GTM-XXXXXX" />
                </div>
              </Panel>
            </div>

            {/* Crawl & Robots */}
            <div className={tab === "crawl" ? "space-y-6" : "hidden"}>
              <Panel
                title="Crawl directives"
                description="Controls robots.txt. Admin, API and sign-in paths are always protected automatically."
              >
                <div className="space-y-4">
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      name="blockAiBots"
                      defaultChecked={settings.blockAiBots}
                      className="mt-0.5 h-4 w-4"
                    />
                    <span>
                      <span className="font-medium">Block AI / LLM training crawlers</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Emits Disallow rules for GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Bytespider and more.
                      </span>
                    </span>
                  </label>
                  <div>
                    <label htmlFor="extraDisallow" className="mb-1.5 block text-sm font-medium text-foreground">
                      Additional disallowed paths
                    </label>
                    <textarea
                      id="extraDisallow"
                      name="extraDisallow"
                      rows={4}
                      defaultValue={settings.extraDisallow}
                      placeholder={"/private\n/staging"}
                      className={inputCls}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">One path per line (or comma-separated).</p>
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          {/* Live preview rail */}
          {showPreviews ? (
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <SerpPreview title={metaTitle} description={metaDescription} />
              <SocialPreview title={metaTitle} description={metaDescription} image={ogImage} />
            </div>
          ) : null}
        </div>

        {/* Sticky save bar */}
        <div className="sticky bottom-0 mt-6 flex items-center gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save SEO settings"}
          </button>
          {state?.success ? <span className="text-sm text-emerald-600">{state.success}</span> : null}
          {state?.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
          <span className="ml-auto text-xs text-muted-foreground">Changes apply site-wide after saving.</span>
        </div>
      </form>
    </div>
  )
}
