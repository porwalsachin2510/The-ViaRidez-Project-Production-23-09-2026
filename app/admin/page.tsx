import type { Metadata } from "next"
import Link from "next/link"
import { getDashboardStats, getLeadAnalytics } from "@/lib/data/admin-queries"
import { requireUser } from "@/lib/auth-helpers"
import { LeadAnalytics } from "@/components/admin/lead-analytics"
import { Icon } from "@/lib/icons"

export const metadata: Metadata = { title: "Dashboard" }
export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const user = await requireUser()
  const [stats, analytics] = await Promise.all([getDashboardStats(), getLeadAnalytics(30)])

  const inbox = [
    { label: "New Quote Requests", value: stats.newQuotes, href: "/admin/quotes", icon: "file-text" },
    { label: "New Enquiries", value: stats.newEnquiries, href: "/admin/enquiries", icon: "mail" },
    { label: "New Demo Bookings", value: stats.newDemos, href: "/admin/demos", icon: "calendar-check" },
    { label: "New Applications", value: stats.newApplications, href: "/admin/applications", icon: "briefcase" },
    { label: "New Fleet Partners", value: stats.newPartners, href: "/admin/partners", icon: "truck" },
    { label: "Subscribers", value: stats.subscribers, href: "/admin/subscribers", icon: "mail" },
  ]

  const content = [
    { label: "Services", value: stats.services, href: "/admin/services", icon: "route" },
    { label: "Fleet Categories", value: stats.fleet, href: "/admin/fleet", icon: "bus" },
    { label: "Industries", value: stats.industries, href: "/admin/industries", icon: "factory" },
    { label: "Locations", value: stats.locations, href: "/admin/locations", icon: "map-pin" },
    { label: "Free Zones", value: stats.freeZones, href: "/admin/free-zones", icon: "building-2" },
    { label: "Blog Posts", value: stats.blogs, href: "/admin/blog", icon: "newspaper" },
    { label: "Careers", value: stats.careers, href: "/admin/careers", icon: "briefcase" },
    { label: "Testimonials", value: stats.testimonials, href: "/admin/testimonials", icon: "star" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome back, {user.name?.split(" ")[0] || "Admin"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is what is happening across the ViaRidez platform today.
        </p>
      </div>

      {/* Inbox — action-required items */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Requires attention
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {inbox.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-foreground">{item.value}</p>
              {item.value > 0 && (
                <span className="mt-1 inline-block text-xs font-medium text-accent">
                  {item.value} new — review now
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Lead analytics */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Lead analytics
        </h2>
        <LeadAnalytics data={analytics} />
      </section>

      {/* Content overview */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Content library
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-2xl font-bold text-foreground">{item.value}</p>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
