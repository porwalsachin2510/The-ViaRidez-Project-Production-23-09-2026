import { Download } from "lucide-react"

/**
 * Links to the CSV export route handler. Rendered as an anchor (not fetch) so
 * the browser handles the file download natively with the right filename.
 */
export function ExportButton({ kind, label = "Export CSV" }: { kind: string; label?: string }) {
  return (
    <a
      href={`/admin/export/${kind}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  )
}
