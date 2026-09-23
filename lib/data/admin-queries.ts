import { connectToDatabase } from "@/lib/db/mongoose"
import {
  Service,
  FleetCategory,
  Industry,
  Location,
  FreeZone,
  Blog,
  BlogComment,
  Career,
  ContactEnquiry,
  QuoteRequest,
  Application,
  DemoBooking,
  Subscriber,
  PartnerApplication,
  Testimonial,
  User,
  AuditLog,
  DeliveryEvent,
  AdminNotification,
} from "@/models"

export type DashboardStats = {
  services: number
  fleet: number
  industries: number
  locations: number
  freeZones: number
  blogs: number
  careers: number
  testimonials: number
  users: number
  newEnquiries: number
  newQuotes: number
  newApplications: number
  newDemos: number
  newPartners: number
  subscribers: number
}

/** Aggregate counts for the admin dashboard. All queries respect soft-delete. */
export async function getUnreadAdminNotificationCount(): Promise<number> {
  await connectToDatabase()
  return AdminNotification.countDocuments({ readAt: null })
}

export type AdminNotificationRecord = {
  id: string
  kind: string
  title: string
  detail: string
  href: string
  readAt: string | null
  createdAt: string
}

/** All admin notifications, newest first, plus the current unread count. */
export async function getAdminNotifications(): Promise<{
  notifications: AdminNotificationRecord[]
  unread: number
}> {
  await connectToDatabase()
  const [docs, unread] = await Promise.all([
    AdminNotification.find({}).sort({ createdAt: -1 }).limit(200).lean(),
    AdminNotification.countDocuments({ readAt: null }),
  ])
  const notifications = serialize(docs).map((d: Record<string, unknown>) => ({
    id: String(d._id),
    kind: (d.kind as string) ?? "quote",
    title: (d.title as string) ?? "",
    detail: (d.detail as string) ?? "",
    href: (d.href as string) ?? "/admin",
    readAt: (d.readAt as string) ?? null,
    createdAt: d.createdAt as string,
  }))
  return { notifications, unread }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase()
  // Canonical soft-delete filter used across the app.
  const notDeleted = { isDeleted: { $ne: true } }

  const [
    services,
    fleet,
    industries,
    locations,
    freeZones,
    blogs,
    careers,
    testimonials,
    users,
    newEnquiries,
    newQuotes,
    newApplications,
    newDemos,
    newPartners,
    subscribers,
  ] = await Promise.all([
    Service.countDocuments(notDeleted),
    FleetCategory.countDocuments(notDeleted),
    Industry.countDocuments(notDeleted),
    Location.countDocuments(notDeleted),
    FreeZone.countDocuments(notDeleted),
    Blog.countDocuments(notDeleted),
    Career.countDocuments(notDeleted),
    Testimonial.countDocuments(notDeleted),
    User.countDocuments({}),
    ContactEnquiry.countDocuments({ status: "new" }),
    QuoteRequest.countDocuments({ status: "new" }),
    // Applications track workflow on `stage`, not `status`.
    Application.countDocuments({ stage: "new" }),
    DemoBooking.countDocuments({ status: "new" }),
    PartnerApplication.countDocuments({ status: "new" }),
    Subscriber.countDocuments({ status: "subscribed" }),
  ])

  return {
    services,
    fleet,
    industries,
    locations,
    freeZones,
    blogs,
    careers,
    testimonials,
    users,
    newEnquiries,
    newQuotes,
    newApplications,
    newDemos,
    newPartners,
    subscribers,
  }
}

/* -------------------------------------------------------------------------- */
/*  Lead analytics — leads-over-time + quote conversion funnel                */
/* -------------------------------------------------------------------------- */

export type LeadAnalytics = {
  daily: { date: string; quotes: number; enquiries: number; demos: number; total: number }[]
  totals: { quotes: number; enquiries: number; demos: number; leads: number }
  quoteFunnel: { status: string; count: number }[]
  sourceBreakdown: { source: string; count: number }[]
  wonRate: number
}

/** Aggregates the last `days` of lead activity for the dashboard chart + funnel. */
export async function getLeadAnalytics(days = 30): Promise<LeadAnalytics> {
  await connectToDatabase()
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - (days - 1))

  const dayKey = (d: Date) => d.toISOString().slice(0, 10)

  // Build an ordered map of empty days so the chart never has gaps.
  const buckets = new Map<
    string,
    { date: string; quotes: number; enquiries: number; demos: number; total: number }
  >()
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    buckets.set(dayKey(d), { date: dayKey(d), quotes: 0, enquiries: 0, demos: 0, total: 0 })
  }

  const [quotes, enquiries, demos, quoteFunnelRaw, quoteSources, enquirySources, demoSources] = await Promise.all([
    QuoteRequest.find({ createdAt: { $gte: since } }, { createdAt: 1 }).lean(),
    ContactEnquiry.find({ createdAt: { $gte: since } }, { createdAt: 1 }).lean(),
    DemoBooking.find({ createdAt: { $gte: since } }, { createdAt: 1 }).lean(),
    QuoteRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    QuoteRequest.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: "$leadSource", count: { $sum: 1 } } }]),
    ContactEnquiry.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: "$leadSource", count: { $sum: 1 } } }]),
    DemoBooking.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: "$leadSource", count: { $sum: 1 } } }]),
  ])

  const add = (docs: { createdAt?: Date | string }[], key: "quotes" | "enquiries" | "demos") => {
    for (const doc of docs) {
      if (!doc.createdAt) continue
      const k = dayKey(new Date(doc.createdAt))
      const b = buckets.get(k)
      if (b) {
        b[key] += 1
        b.total += 1
      }
    }
  }
  add(quotes as { createdAt?: Date }[], "quotes")
  add(enquiries as { createdAt?: Date }[], "enquiries")
  add(demos as { createdAt?: Date }[], "demos")

  const daily = Array.from(buckets.values())
  const totals = daily.reduce(
    (acc, d) => ({
      quotes: acc.quotes + d.quotes,
      enquiries: acc.enquiries + d.enquiries,
      demos: acc.demos + d.demos,
      leads: acc.leads + d.total,
    }),
    { quotes: 0, enquiries: 0, demos: 0, leads: 0 },
  )

  const funnelOrder = ["new", "contacted", "quoted", "won", "lost"]
  const funnelMap = new Map<string, number>(
    (quoteFunnelRaw as { _id: string; count: number }[]).map((r) => [r._id, r.count]),
  )
  const quoteFunnel = funnelOrder.map((status) => ({ status, count: funnelMap.get(status) ?? 0 }))
  const totalQuotes = quoteFunnel.reduce((s, f) => s + f.count, 0)
  const won = funnelMap.get("won") ?? 0
  const sources = new Map<string, number>()
  for (const row of [...quoteSources, ...enquirySources, ...demoSources] as { _id?: string; count: number }[]) {
    const source = row._id || "website"
    sources.set(source, (sources.get(source) || 0) + row.count)
  }
  const sourceBreakdown = Array.from(sources.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const wonRate = totalQuotes ? Math.round((won / totalQuotes) * 100) : 0

  return { daily, totals, quoteFunnel, sourceBreakdown, wonRate }
}

/* -------------------------- Demo bookings & subscribers ------------------- */

/** Demo bookings, newest first — mapped into the shared inbox record shape. */
export async function getDemoBookings() {
  await connectToDatabase()
  const docs = await DemoBooking.find({}).sort({ createdAt: -1 }).limit(200).lean()
  return serialize(docs).map((d: Record<string, unknown>) => ({
    id: String(d._id),
    name: d.name as string,
    email: d.email as string,
    phone: (d.phone as string) ?? "",
    company: (d.company as string) ?? "",
    position: (d.jobTitle as string) ?? "",
    employeeCount: (d.employeeCount as string) ?? "",
    startDate: [d.preferredDate, d.preferredTime].filter(Boolean).join(" "),
    message: (d.goals as string) ?? "",
    notes: (d.notes as string) ?? "",
    status: (d.status as string) ?? "new",
    createdAt: d.createdAt as string,
  }))
}

/** Newsletter subscribers, newest first. */
export async function getSubscribers() {
  await connectToDatabase()
  const docs = await Subscriber.find({}).sort({ createdAt: -1 }).limit(500).lean()
  return serialize(docs).map((d: Record<string, unknown>) => ({
    id: String(d._id),
    email: d.email as string,
    name: (d.name as string) ?? "",
    source: (d.source as string) ?? "",
    status: (d.status as string) ?? "subscribed",
    createdAt: d.createdAt as string,
  }))
}

/** Fleet-partner applications, newest first — mapped to the inbox record shape. */
export async function getPartnerApplications() {
  await connectToDatabase()
  const docs = await PartnerApplication.find({}).sort({ createdAt: -1 }).limit(300).lean()
  return serialize(docs).map((d: Record<string, unknown>) => ({
    id: String(d._id),
    name: (d.contactName as string) ?? "",
    email: d.email as string,
    phone: (d.phone as string) ?? "",
    company: (d.companyName as string) ?? "",
    city: (d.city as string) ?? "",
    fleetSize: (d.fleetSize as string) ?? "",
    vehicleTypes: Array.isArray(d.vehicleTypes) ? (d.vehicleTypes as string[]).join(", ") : "",
    website: (d.website as string) ?? "",
    logoUrl: (d.logoUrl as string) ?? "",
    message: (d.message as string) ?? "",
    notes: (d.notes as string) ?? "",
    status: (d.status as string) ?? "new",
    createdAt: d.createdAt as string,
  }))
}

export async function getDeliveryEvents(page = 1) {
  await connectToDatabase()
  const safePage = Math.max(1, page)
  const [rows, total] = await Promise.all([
    DeliveryEvent.find({}).sort({ createdAt: -1 }).skip((safePage - 1) * 50).limit(50).select("kind provider status attempts nextRetryAt response error createdAt").lean(),
    DeliveryEvent.countDocuments({}),
  ])
  return { rows: serialize(rows), total, page: safePage, pageSize: 50 }
}

export async function getAuditEvents(filters: { action?: string; entity?: string; actor?: string; from?: string; to?: string; page?: number } = {}) {
  await connectToDatabase()
  const page = Math.max(1, filters.page || 1)
  const query: Record<string, unknown> = {}
  if (filters.action) query.action = filters.action.slice(0, 80)
  if (filters.entity) query.entity = filters.entity.slice(0, 80)
  if (filters.actor) query.userName = { $regex: filters.actor.slice(0, 80), $options: "i" }
  if (filters.from || filters.to) query.createdAt = { ...(filters.from ? { $gte: new Date(filters.from) } : {}), ...(filters.to ? { $lte: new Date(`${filters.to}T23:59:59.999Z`) } : {}) }
  const [docs, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * 50).limit(50).select("userName action entity entityId meta createdAt").lean(),
    AuditLog.countDocuments(query),
  ])
  return { rows: serialize(docs), total, page, pageSize: 50 }
}

function serialize<T>(docs: T[]): T[] {
  return JSON.parse(JSON.stringify(docs))
}

/** Contact enquiries, newest first. */
export async function getEnquiries() {
  await connectToDatabase()
  const docs = await ContactEnquiry.find({}).sort({ createdAt: -1 }).limit(200).lean()
  return serialize(docs).map((d: Record<string, unknown>) => ({
    id: String(d._id),
    name: d.name as string,
    email: d.email as string,
    phone: (d.phone as string) ?? "",
    company: (d.company as string) ?? "",
    subject: (d.subject as string) ?? "",
    message: (d.message as string) ?? "",
    notes: (d.notes as string) ?? "",
    status: (d.status as string) ?? "new",
    createdAt: d.createdAt as string,
  }))
}

/** Quote requests, newest first. */
export async function getQuotes() {
  await connectToDatabase()
  const docs = await QuoteRequest.find({}).sort({ createdAt: -1 }).limit(200).lean()
  return serialize(docs).map((d: Record<string, unknown>) => ({
    id: String(d._id),
    name: d.name as string,
    email: d.email as string,
    phone: (d.phone as string) ?? "",
    company: (d.company as string) ?? "",
    serviceType: (d.serviceType as string) ?? "",
    pickupLocation: (d.pickupLocation as string) ?? "",
    dropoffLocation: (d.dropoffLocation as string) ?? "",
    // Schema stores employeeCount/startDate as strings and the message body
    // in `details` — read from the actual fields so the inbox shows real data.
    employeeCount: (d.employeeCount as string) ?? "",
    startDate: (d.startDate as string) ?? "",
    message: (d.details as string) ?? "",
    notes: (d.notes as string) ?? "",
    status: (d.status as string) ?? "new",
    createdAt: d.createdAt as string,
  }))
}

/**
 * Blog comments for the moderation inbox. Returns records (optionally filtered
 * by status) plus counts per status so the admin UI can badge the queue.
 */
export type CommentStatusFilter = "all" | "pending" | "approved" | "rejected"

export async function getBlogComments(filter: CommentStatusFilter = "pending") {
  await connectToDatabase()
  const query = filter === "all" ? {} : { status: filter }
  const [docs, counts] = await Promise.all([
    BlogComment.find(query).sort({ createdAt: -1 }).limit(300).lean(),
    BlogComment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ])

  const countMap = new Map<string, number>(
    (counts as { _id: string; count: number }[]).map((c) => [c._id, c.count]),
  )
  const byStatus = {
    pending: countMap.get("pending") ?? 0,
    approved: countMap.get("approved") ?? 0,
    rejected: countMap.get("rejected") ?? 0,
  }

  const comments = serialize(docs).map((d: Record<string, unknown>) => ({
    id: String(d._id),
    name: (d.name as string) ?? "",
    email: (d.email as string) ?? "",
    body: (d.body as string) ?? "",
    blogSlug: (d.blogSlug as string) ?? "",
    status: (d.status as string) ?? "pending",
    createdAt: d.createdAt as string,
  }))

  return { comments, byStatus, total: byStatus.pending + byStatus.approved + byStatus.rejected }
}

/** Shape of an application record used by the admin ATS + CSV export. */
export type ApplicationRecord = {
  id: string
  name: string
  email: string
  phone: string
  position: string
  careerSlug: string
  totalExperience: number
  currentCompany: string
  currentDesignation: string
  currentCtc: string
  expectedCtc: string
  noticePeriod: string
  currentLocation: string
  linkedin: string
  portfolio: string
  coverLetter: string
  resumeUrl: string
  resumeFileName: string
  screeningAnswers: { question: string; answer: string }[]
  rating: number
  source: string
  notes: string
  status: string
  createdAt: string
}

/** Job applications, newest first, with the full candidate profile. */
export async function getApplications(): Promise<ApplicationRecord[]> {
  await connectToDatabase()
  const docs = await Application.find({}).sort({ createdAt: -1 }).limit(500).lean()
  return serialize(docs).map((d: Record<string, unknown>) => ({
    id: String(d._id),
    // Application schema uses fullName / positionTitle / stage — map from the
    // real field names so names, positions and workflow stage display.
    name: (d.fullName as string) ?? "",
    email: d.email as string,
    phone: (d.phone as string) ?? "",
    position: (d.positionTitle as string) ?? "",
    careerSlug: (d.careerSlug as string) ?? "",
    totalExperience: Number(d.totalExperience) || 0,
    currentCompany: (d.currentCompany as string) ?? "",
    currentDesignation: (d.currentDesignation as string) ?? "",
    currentCtc: (d.currentCtc as string) ?? "",
    expectedCtc: (d.expectedCtc as string) ?? "",
    noticePeriod: (d.noticePeriod as string) ?? "",
    currentLocation: (d.currentLocation as string) ?? "",
    linkedin: (d.linkedin as string) ?? "",
    portfolio: (d.portfolio as string) ?? "",
    coverLetter: (d.coverLetter as string) ?? "",
    resumeUrl: (d.resumeUrl as string) ?? "",
    resumeFileName: (d.resumeFileName as string) ?? "",
    screeningAnswers: Array.isArray(d.screeningAnswers)
      ? (d.screeningAnswers as { question?: string; answer?: string }[]).map((s) => ({
          question: s?.question ?? "",
          answer: s?.answer ?? "",
        }))
      : [],
    rating: Number(d.rating) || 0,
    source: (d.source as string) ?? "",
    notes: (d.notes as string) ?? "",
    status: (d.stage as string) ?? "new",
    createdAt: d.createdAt as string,
  }))
}
