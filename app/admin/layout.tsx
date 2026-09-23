import type { ReactNode } from "react"
import type { Metadata } from "next"
import { requireUser } from "@/lib/auth-helpers"
import { navForRole } from "@/lib/admin-nav"
import { getUnreadAdminNotificationCount } from "@/lib/data/admin-queries"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata: Metadata = {
  title: { absolute: "ViaRidez Admin" },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireUser()
  const nav = navForRole(user.role)
  const unreadNotifications = await getUnreadAdminNotificationCount()

  return (
    <AdminShell
      nav={nav}
      unreadNotifications={unreadNotifications}
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </AdminShell>
  )
}
