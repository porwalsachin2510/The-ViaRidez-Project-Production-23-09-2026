import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"
import {
  getServices,
  getFleetCategories,
  getIndustries,
  getLocations,
  getFreeZones,
  getBlogPosts,
  getCareers,
  getCaseStudies,
  getCmsPages,
} from "@/lib/data/queries"
import { legalSlugs } from "@/lib/legal-content"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static, always-present routes.
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/services",
    "/fleet",
    "/industries",
    "/locations",
    "/free-zones",
    "/about",
    "/why-viaridez",
    "/case-studies",
    "/blog",
    "/careers",
    "/contact",
    "/technology",
    "/sustainability",
    "/partners",
    "/get-quote",
    "/book-demo",
    "/faq",
    "/resources",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }))

  // Dynamic, DB-driven routes.
  const [services, fleet, industries, locations, freeZones, posts, careers, caseStudies, cmsPages] =
    await Promise.all([
      getServices(),
      getFleetCategories(),
      getIndustries(),
      getLocations(),
      getFreeZones(),
      getBlogPosts(),
      getCareers(),
      getCaseStudies(),
      getCmsPages(),
    ])

  // Prefer each document's real `updatedAt` so search engines see accurate
  // last-modified dates (and only re-crawl what actually changed).
  const lastMod = (doc: { updatedAt?: string | Date }): Date =>
    doc.updatedAt ? new Date(doc.updatedAt) : now

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...services.map((s) => ({ path: `/services/${s.slug}`, priority: 0.7, lastModified: lastMod(s) })),
    ...fleet.map((f) => ({ path: `/fleet/${f.slug}`, priority: 0.6, lastModified: lastMod(f) })),
    ...industries.map((i) => ({ path: `/industries/${i.slug}`, priority: 0.6, lastModified: lastMod(i) })),
    ...locations.map((l) => ({ path: `/locations/${l.slug}`, priority: 0.7, lastModified: lastMod(l) })),
    ...freeZones.map((z) => ({ path: `/free-zones/${z.slug}`, priority: 0.7, lastModified: lastMod(z) })),
    ...posts.map((p) => ({ path: `/blog/${p.slug}`, priority: 0.5, lastModified: lastMod(p) })),
    ...careers.map((c) => ({ path: `/careers/${c.slug}`, priority: 0.5, lastModified: lastMod(c) })),
    ...caseStudies.map((cs) => ({ path: `/case-studies/${cs.slug}`, priority: 0.6, lastModified: lastMod(cs) })),
    ...cmsPages
      .filter((page) => !["home", "technology", "sustainability", "about", "why-viaridez", "partners", "get-quote", "book-demo", "faq", "resources", "contact"].includes(page.slug))
      .map((page) => ({ path: `/${page.slug}`, priority: 0.7, lastModified: lastMod(page) })),
    ...legalSlugs.map((slug) => ({ path: `/legal/${slug}`, priority: 0.3, lastModified: now })),
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: r.lastModified,
    changeFrequency: "monthly" as const,
    priority: r.priority,
  }))

  return [...staticRoutes, ...dynamicRoutes]
}
