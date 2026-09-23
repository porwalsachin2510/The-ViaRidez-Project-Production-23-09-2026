import { AdminPageHeader } from "@/components/admin/ui"
import { SubscribersTable } from "@/components/admin/subscribers-table"
import { ExportButton } from "@/components/admin/export-button"
import { getSubscribers } from "@/lib/data/admin-queries"
import { requireModule } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function SubscribersPage() {
  await requireModule("subscribers")
  const subscribers = await getSubscribers()
  const active = subscribers.filter((s) => s.status === "subscribed").length

  return (
    <div>
      <AdminPageHeader
        title="Newsletter Subscribers"
        description={`${subscribers.length} total • ${active} active`}
        action={<ExportButton kind="subscribers" />}
      />
      <SubscribersTable subscribers={subscribers} />
    </div>
  )
}
