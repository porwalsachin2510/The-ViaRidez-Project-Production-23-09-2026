import type { UserRole } from "@/models/User"
import { canAccessModule } from "@/lib/auth-helpers"

export interface AdminNavItem {
  key: string
  label: string
  href: string
  icon: string
  group: string
}

/** Full admin navigation. Filtered per-role at render time. */
export const ADMIN_NAV: AdminNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: "gauge", group: "Overview" },
  { key: "notifications", label: "Notifications", href: "/admin/notifications", icon: "message-square", group: "Overview" },

  { key: "enquiries", label: "Contact Enquiries", href: "/admin/enquiries", icon: "headset", group: "Inbox" },
  { key: "quotes", label: "Quote Requests", href: "/admin/quotes", icon: "calendar-check", group: "Inbox" },
  { key: "demos", label: "Demo Bookings", href: "/admin/demos", icon: "calendar-check", group: "Inbox" },
  { key: "applications", label: "Job Applications", href: "/admin/applications", icon: "briefcase", group: "Inbox" },
  { key: "partners", label: "Fleet Partners", href: "/admin/partners", icon: "truck", group: "Inbox" },
  { key: "subscribers", label: "Subscribers", href: "/admin/subscribers", icon: "mail", group: "Inbox" },
  { key: "comments", label: "Blog Comments", href: "/admin/comments", icon: "message-square", group: "Inbox" },

  { key: "services", label: "Services", href: "/admin/services", icon: "route", group: "Content" },
  { key: "fleet", label: "Fleet", href: "/admin/fleet", icon: "bus", group: "Content" },
  { key: "industries", label: "Industries", href: "/admin/industries", icon: "factory", group: "Content" },
  { key: "locations", label: "Locations", href: "/admin/locations", icon: "map-pin", group: "Content" },
  { key: "free-zones", label: "Free Zones", href: "/admin/free-zones", icon: "building-2", group: "Content" },
  { key: "blog", label: "Blog", href: "/admin/blog", icon: "file-text", group: "Content" },
  { key: "testimonials", label: "Testimonials", href: "/admin/testimonials", icon: "star", group: "Content" },
  { key: "clients", label: "Clients", href: "/admin/clients", icon: "users", group: "Content" },
  { key: "case-studies", label: "Case Studies", href: "/admin/case-studies", icon: "briefcase", group: "Content" },
  { key: "team", label: "Team", href: "/admin/team", icon: "users", group: "Content" },
  { key: "faqs", label: "FAQs", href: "/admin/faqs", icon: "circle-check", group: "Content" },
  { key: "careers", label: "Careers", href: "/admin/careers", icon: "briefcase", group: "Content" },
  { key: "resources", label: "Resources", href: "/admin/resources", icon: "file-down", group: "Content" },
  { key: "pages", label: "Site Pages", href: "/admin/pages", icon: "layout-template", group: "Content" },

  { key: "seo", label: "SEO", href: "/admin/seo", icon: "navigation", group: "System" },
  { key: "redirects", label: "Redirects", href: "/admin/redirects", icon: "navigation", group: "System" },
  { key: "users", label: "Users & Roles", href: "/admin/users", icon: "shield-check", group: "System" },
  { key: "settings", label: "Site Settings", href: "/admin/settings", icon: "gauge", group: "System" },
  { key: "audit", label: "Audit Log", href: "/admin/audit", icon: "scroll-text", group: "System" },
  { key: "delivery", label: "Delivery Outbox", href: "/admin/delivery", icon: "send", group: "System" },
]

export function navForRole(role: UserRole): AdminNavItem[] {
  return ADMIN_NAV.filter(
    (item) =>
      canAccessModule(role, item.key) ||
      (item.key === "users" && role === "admin") ||
      // Every signed-in admin user gets the notifications feed (gated on the
      // dashboard capability, which all roles hold).
      item.key === "notifications",
  )
}
