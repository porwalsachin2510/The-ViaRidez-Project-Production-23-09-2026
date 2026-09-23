import type { LeadAnalytics } from "@/lib/data/admin-queries"

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

const funnelLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
}

/**
 * Dashboard lead analytics: a 30-day stacked-bar activity chart plus a quote
 * conversion funnel. Rendered from real aggregated DB data (getLeadAnalytics),
 * dependency-free so it stays light and matches the admin's flat aesthetic.
 */
export function LeadAnalytics({ data }: { data: LeadAnalytics }) {
  const max = Math.max(1, ...data.daily.map((d) => d.total))
  const maxFunnel = Math.max(1, ...data.quoteFunnel.map((f) => f.count))
  const maxSource = Math.max(1, ...data.sourceBreakdown.map((s) => s.count))

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Activity chart */}
      <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">Leads — last 30 days</h3>
            <p className="text-xs text-muted-foreground">
              {data.totals.leads} total · {data.totals.quotes} quotes · {data.totals.enquiries} enquiries ·{" "}
              {data.totals.demos} demos
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Quotes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Enquiries
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" /> Demos
            </span>
          </div>
        </div>

        <div className="flex h-40 items-end gap-0.5">
          {data.daily.map((d) => (
            <div
              key={d.date}
              className="group relative flex flex-1 flex-col justify-end"
              style={{ height: "100%" }}
              title={`${fmtDay(d.date)}: ${d.total} lead${d.total === 1 ? "" : "s"}`}
            >
              <div className="flex flex-col justify-end" style={{ height: `${(d.total / max) * 100}%` }}>
                {d.quotes > 0 && (
                  <div className="w-full bg-accent" style={{ flexGrow: d.quotes }} />
                )}
                {d.enquiries > 0 && (
                  <div className="w-full bg-primary" style={{ flexGrow: d.enquiries }} />
                )}
                {d.demos > 0 && (
                  <div className="w-full bg-sky-400" style={{ flexGrow: d.demos }} />
                )}
                {d.total === 0 && <div className="h-px w-full bg-border" />}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>{data.daily.length ? fmtDay(data.daily[0].date) : ""}</span>
          <span>{data.daily.length ? fmtDay(data.daily[data.daily.length - 1].date) : ""}</span>
        </div>
      </div>

      {/* Acquisition sources */}
      <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">Acquisition sources</h3>
            <p className="text-xs text-muted-foreground">Where the last 30 days of leads came from</p>
          </div>
          <span className="text-xs text-muted-foreground">UTM attribution</span>
        </div>
        {data.sourceBreakdown.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.sourceBreakdown.map((item) => (
              <div key={item.source} className="flex items-center gap-3">
                <span className="w-28 truncate text-xs font-medium text-foreground">{item.source}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(item.count / maxSource) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-xs text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">Attribution data will appear as new leads arrive.</p>}
      </div>

      {/* Quote conversion funnel */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">Quote conversion</h3>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {data.wonRate}% won
          </span>
        </div>
        <ul className="space-y-3">
          {data.quoteFunnel.map((f) => (
            <li key={f.status}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{funnelLabels[f.status] ?? f.status}</span>
                <span className="text-muted-foreground">{f.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={
                    f.status === "won"
                      ? "h-full rounded-full bg-emerald-500"
                      : f.status === "lost"
                        ? "h-full rounded-full bg-red-400"
                        : "h-full rounded-full bg-accent"
                  }
                  style={{ width: `${(f.count / maxFunnel) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
