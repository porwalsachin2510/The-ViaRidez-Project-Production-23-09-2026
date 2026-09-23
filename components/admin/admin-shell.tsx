"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from "@/lib/icons"
import { signOutAction } from "@/app/actions/auth"
import type { AdminNavItem } from "@/lib/admin-nav"
import { cn } from "@/lib/utils"
import { AdminSearch } from "@/components/admin/admin-search"
import { NotificationBell } from "@/components/admin/notification-bell"

interface AdminShellProps {
  nav: AdminNavItem[]
  unreadNotifications: number
  user: { name: string; email: string; role: string }
  children: React.ReactNode
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  editor: "Editor",
  content_writer: "Content Writer",
  seo_manager: "SEO Manager",
}

export function AdminShell({ nav, unreadNotifications, user, children }: AdminShellProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Group nav items preserving declaration order.
  const groups: { name: string; items: AdminNavItem[] }[] = []
  for (const item of nav) {
    let g = groups.find((x) => x.name === item.group)
    if (!g) {
      g = { name: item.group, items: [] }
      groups.push(g)
    }
    g.items.push(item)
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-border bg-card transition-transform lg:translate-x-0",
          open && "translate-x-0",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="font-display text-sm font-bold text-primary-foreground">V</span>
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-foreground">ViaRidez</p>
            <p className="text-[11px] text-muted-foreground">Control Centre</p>
          </div>
        </div>

        <nav className="flex h-[calc(100vh-4rem)] flex-col gap-5 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.name}>
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.name}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Backdrop for mobile */}
      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="route" className="h-5 w-5" />
          </button>

          <div className="ml-auto flex min-w-0 items-center gap-4">
            <AdminSearch />
            <NotificationBell initialUnread={unreadNotifications} />
            <Link
              href="/"
              target="_blank"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
            >
              View site
            </Link>
            <div className="flex items-center gap-3 sm:border-l sm:border-border sm:pl-4">
              <div className="hidden text-right leading-tight sm:block">
                <p className="max-w-[10rem] truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {ROLE_LABELS[user.role] ?? user.role}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <Icon name="navigation" className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
