import { AdminPageHeader } from "@/components/admin/ui"
import { ApplicationsATS } from "@/components/admin/applications-ats"
import { ExportButton } from "@/components/admin/export-button"
import { getApplications } from "@/lib/data/admin-queries"

export const dynamic = "force-dynamic"

export default async function ApplicationsPage() {
  const records = await getApplications()
  const newCount = records.filter((r) => r.status === "new").length

  return (
    <div>
      <AdminPageHeader
        title="Job Applications"
        description={`${records.length} total • ${newCount} new`}
        action={<ExportButton kind="applications" />}
      />
      <ApplicationsATS records={records} />
    </div>
  )
}
