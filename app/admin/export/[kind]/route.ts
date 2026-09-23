import { NextResponse } from "next/server"
import { requireModule } from "@/lib/auth-helpers"
import {
  getEnquiries,
  getQuotes,
  getApplications,
  getDemoBookings,
  getSubscribers,
  getPartnerApplications,
} from "@/lib/data/admin-queries"

type Row = Record<string, unknown>

const loaders: Record<string, () => Promise<Row[]>> = {
  enquiries: getEnquiries,
  quotes: getQuotes,
  applications: getApplications,
  demos: getDemoBookings,
  partners: getPartnerApplications,
  subscribers: getSubscribers,
}

// Each export carries personal data, so it is gated by the same per-module
// permission used by the admin pages and server actions. Without this a role
// scoped to (say) only "careers" could still pull every applicant, subscriber
// or lead by hitting the export URL directly.
const moduleForKind: Record<string, string> = {
  enquiries: "enquiries",
  quotes: "quotes",
  applications: "applications",
  demos: "demos",
  partners: "partners",
  subscribers: "subscribers",
}

/** Flattens nested values (arrays / objects) into a readable single-cell string. */
function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        item && typeof item === "object" && "question" in item
          ? `${(item as { question?: string }).question ?? ""}: ${(item as { answer?: string }).answer ?? ""}`
          : stringifyValue(item),
      )
      .filter(Boolean)
      .join(" | ")
  }
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

/** RFC-4180 field escaping: wrap in quotes and double any embedded quotes. */
function escapeCsv(value: unknown): string {
  const str = stringifyValue(value).replace(/\r?\n/g, " ").trim()
  if (/[",]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function toCsv(rows: Row[]): string {
  if (rows.length === 0) return ""
  // Union of keys across rows keeps the header stable even if some are sparse.
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))))
  const lines = [headers.join(",")]
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(","))
  }
  return lines.join("\r\n")
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params
  const loader = loaders[kind]
  const moduleKey = moduleForKind[kind]
  if (!loader || !moduleKey) {
    return NextResponse.json({ error: "Unknown export type" }, { status: 404 })
  }

  // Gate the export behind the module that owns this dataset. requireModule
  // redirects unauthorised users to the dashboard.
  await requireModule(moduleKey)

  const rows = await loader()
  const csv = toCsv(rows)
  const stamp = new Date().toISOString().slice(0, 10)

  // Prepend a BOM so Excel opens UTF-8 correctly.
  return new NextResponse("\uFEFF" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="viaridez-${kind}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
