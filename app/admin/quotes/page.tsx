import { AdminPageHeader } from "@/components/admin/ui"
import { InboxList } from "@/components/admin/inbox"
import { ExportButton } from "@/components/admin/export-button"
import { getQuotes } from "@/lib/data/admin-queries"

export const dynamic = "force-dynamic"

export default async function QuotesPage() {
  const records = await getQuotes()
  const newCount = records.filter((r) => r.status === "new").length

  return (
    <div>
      <AdminPageHeader
        title="Quote Requests"
        description={`${records.length} total • ${newCount} awaiting response`}
        action={<ExportButton kind="quotes" />}
      />
      <InboxList kind="quote" records={records} />
    </div>
  )
}
