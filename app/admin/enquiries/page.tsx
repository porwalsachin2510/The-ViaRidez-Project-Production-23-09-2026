import { AdminPageHeader } from "@/components/admin/ui"
import { InboxList } from "@/components/admin/inbox"
import { ExportButton } from "@/components/admin/export-button"
import { getEnquiries } from "@/lib/data/admin-queries"

export const dynamic = "force-dynamic"

export default async function EnquiriesPage() {
  const records = await getEnquiries()
  const newCount = records.filter((r) => r.status === "new").length

  return (
    <div>
      <AdminPageHeader
        title="Contact Enquiries"
        description={`${records.length} total • ${newCount} new`}
        action={<ExportButton kind="enquiries" />}
      />
      <InboxList kind="enquiry" records={records} />
    </div>
  )
}
