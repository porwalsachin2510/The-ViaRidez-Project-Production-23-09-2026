import { requireModule } from "@/lib/auth-helpers"
import { AdminPageHeader } from "@/components/admin/ui"
import { NotificationsList } from "@/components/admin/notifications-list"
import { getAdminNotifications } from "@/lib/data/admin-queries"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  await requireModule("dashboard")
  const { notifications, unread } = await getAdminNotifications()

  return (
    <div>
      <AdminPageHeader
        title="Notifications"
        description={
          unread > 0
            ? `${notifications.length} total • ${unread} unread`
            : `${notifications.length} total • all caught up`
        }
      />
      <NotificationsList notifications={notifications} unread={unread} />
    </div>
  )
}
