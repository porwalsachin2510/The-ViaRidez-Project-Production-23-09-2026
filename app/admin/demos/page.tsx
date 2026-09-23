import { AdminPageHeader } from "@/components/admin/ui"
import { InboxList } from "@/components/admin/inbox"
import { ExportButton } from "@/components/admin/export-button"
import { getDemoBookings } from "@/lib/data/admin-queries"
import { requireModule } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function DemosPage() {
  await requireModule("demos")
  const records = await getDemoBookings()
  const newCount = records.filter((r) => r.status === "new").length

  return (
    <div>
      <AdminPageHeader
        title="Demo Bookings"
        description={`${records.length} total • ${newCount} new`}
        action={<ExportButton kind="demos" />}
      />
      <InboxList kind="demo" records={records} />
    </div>
  )
}
