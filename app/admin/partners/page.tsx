import { AdminPageHeader } from "@/components/admin/ui"
import { InboxList } from "@/components/admin/inbox"
import { ExportButton } from "@/components/admin/export-button"
import { requireModule } from "@/lib/auth-helpers"
import { getPartnerApplications } from "@/lib/data/admin-queries"

export const dynamic = "force-dynamic"

export default async function PartnersPage() {
  await requireModule("partners")
  const records = await getPartnerApplications()
  const newCount = records.filter((r) => r.status === "new").length

  return (
    <div>
      <AdminPageHeader
        title="Fleet Partner Applications"
        description={`${records.length} total • ${newCount} awaiting review`}
        action={<ExportButton kind="partners" />}
      />
      <InboxList kind="partner" records={records} />
    </div>
  )
}
