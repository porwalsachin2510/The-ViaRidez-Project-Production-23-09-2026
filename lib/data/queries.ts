import 'server-only'
import { cache } from 'react'
import { connectToDatabase } from '@/lib/db/mongoose'
import {
  Service,
  FleetCategory,
  Industry,
  Location,
  FreeZone,
  Testimonial,
  Client,
  CaseStudy,
  TeamMember,
  Faq,
  Blog,
  BlogCategory,
  Career,
  Resource,
  Page,
  SiteSettings,
} from '@/models'

/**
 * Central data-access layer for the public site.
 * Every function connects to Mongo, runs a lean query, and returns plain
 * JSON-serializable objects safe to pass into Server/Client Components.
 * `cache()` dedupes identical calls within a single request/render pass.
 */

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T
}

const PUBLISHED = { isDeleted: false, status: 'published' } as const

/**
 * Canonical dropdown descriptions for the fixed system pages. Used in two
 * places so every sub-menu shows a title *and* a helpful description:
 *  - the admin menu builder's link palette (a page dragged into a dropdown
 *    arrives with this description pre-filled, editable before saving);
 *  - `ensureCoreNavigation`, which backfills the description on any saved
 *    dropdown child that doesn't already have one, so existing menus render
 *    consistently without the admin re-editing every item.
 */
const NAV_DESCRIPTIONS: Record<string, string> = {
  '/': 'Back to the ViaRidez home page',
  '/services': 'Explore our full transport service range',
  '/fleet': 'Vehicles for every journey and group size',
  '/industries': 'Sector-specific mobility programmes',
  '/locations': 'Where we operate across the UAE',
  '/free-zones': 'Free-zone employee transport coverage',
  '/technology': 'The platform powering your rides',
  '/case-studies': 'Results we have delivered for clients',
  '/blog': 'Guidance on corporate mobility',
  '/resources': 'Reports, guides & playbooks',
  '/faq': 'Answers to common questions',
  '/about': 'Our story, heritage and leadership',
  '/why-viaridez': 'What sets our mobility apart',
  '/sustainability': 'EV fleet & lower-carbon commuting',
  '/contact': 'Talk to our mobility team',
  '/careers': 'Join the team — explore open roles',
  '/partners': 'Grow with us as a fleet partner',
  '/get-quote': 'Get a tailored transport quote',
  '/book-demo': 'See the platform in action',
  '/legal/privacy-policy': 'How we handle your data',
  '/legal/cookie-policy': 'Our use of cookies',
  '/legal/terms-of-service': 'Terms governing our services',
}

/* -------------------------------------------------------------------------- */
/*  Site settings (singleton)                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Safe fallback used when the SiteSettings document is missing or the database
 * is unreachable. Keeps the public site rendering (header, footer, primary
 * navigation, CTAs) with sensible ViaRidez defaults. `ensureCoreNavigation`
 * still runs on top of this to guarantee Careers/Partners links exist.
 */
// const DEFAULT_SITE_SETTINGS: SiteSettingsData = ensureCoreNavigation({
//   key: 'global',
//   companyName: 'ViaRidez',
//   tagline: 'Enterprise Employee Transportation & Corporate Mobility',
//   email: 'hello@viaridez.com',
//   phone: '+971 4 000 0000',
//   navigation: [
//     { label: 'Services', href: '/services', children: [] },
//     { label: 'Fleet', href: '/fleet', children: [] },
//     { label: 'Industries', href: '/industries', children: [] },
//     { label: 'Locations', href: '/locations', children: [] },
//     { label: 'About', href: '/about', children: [] },
//     { label: 'Contact', href: '/contact', children: [] },
//   ],
//   footerColumns: [
//     {
//       title: 'Company',
//       links: [
//         { label: 'About', href: '/about' },
//         { label: 'Contact', href: '/contact' },
//       ],
//     },
//     {
//       title: 'Services',
//       links: [
//         { label: 'All Services', href: '/services' },
//         { label: 'Fleet', href: '/fleet' },
//       ],
//     },
//   ],
//   ctaPrimary: { label: 'Get a Quote', href: '/get-quote' },
//   ctaSecondary: { label: 'Book a Demo', href: '/book-demo' },
//   ctaClientLogin: { label: 'Client Login', href: '/sign-in' },
//   social: {},
//   seo: {
//     titleTemplate: '%s | ViaRidez',
//     defaultKeywords: [
//       'employee transportation',
//       'corporate mobility',
//       'staff transport Dubai',
//       'free zone shuttle',
//     ],
//     organization: {
//       legalName: 'ViaRidez',
//       addressCountry: 'AE',
//       addressLocality: 'Dubai',
//       priceRange: '$$',
//       openingHours: 'Mo-Su 00:00-23:59',
//     },
//     robots: { blockAiBots: false, extraDisallow: [] },
//   },
//   stats: [],
// })

const DEFAULT_SITE_SETTINGS: SiteSettingsData = ensureCoreNavigation({
  key: "global",

  companyName: "ViaRidez",

  tagline: "Enterprise Employee Transportation & Corporate Mobility",

  email: "info@viaridez.ae",

  phone: "+971 4 000 0000",

  address:
    "Regal Tower, Office 2906, 29th Floor, Al Mustaqbal St, Business Bay, Dubai, UAE",

  whatsapp: "+971500000000",

  businessHours: "Sun–Fri, 8:00–18:00 GST",

  navigation: [
    {
      label: "Services",
      href: "/services",
      children: [
        {
          label: "Corporate & Institutional",
          href: "/services/corporate-institutional-transport",
          description: "Employee shuttles, free-zone & executive transport",
        },
        {
          label: "Tourism & Leisure",
          href: "/services/tourism-leisure",
          description: "Sightseeing, safari & hotel shuttles",
        },
        {
          label: "Individual & On-Demand",
          href: "/services/individual-on-demand-transport",
          description: "Airport transfers, car lift & rentals",
        },
        {
          label: "MICE & Events",
          href: "/services/mice-event-transportation",
          description: "Conference & event transport logistics",
        },
      ],
    },

    {
      label: "Industries",
      href: "/industries",
      children: [],
    },

    {
      label: "Fleet",
      href: "/fleet",
      children: [],
    },

    {
      label: "Technology",
      href: "/technology",
      children: [],
    },

    {
      label: "Company",
      href: "/about",
      children: [
        {
          label: "About Us",
          href: "/about",
          description: "Our story, heritage and leadership",
        },
        {
          label: "Why ViaRidez",
          href: "/why-viaridez",
          description: "What sets our mobility apart",
        },
        {
          label: "Sustainability",
          href: "/sustainability",
          description: "EV fleet & lower-carbon commuting",
        },
        {
          label: "Case Studies",
          href: "/case-studies",
          description: "Results we have delivered",
        },
        {
          label: "Locations",
          href: "/locations",
          description: "Where we operate",
        },
        {
          label: "Free Zones",
          href: "/free-zones",
          description: "Our Free Zones Available",
        },
      ],
    },

    {
      label: "Resources",
      href: "/blog",
      children: [
        {
          label: "Blog & Insights",
          href: "/blog",
          description: "Guidance on corporate mobility",
        },
        {
          label: "Resource Library",
          href: "/resources",
          description: "Reports, guides & playbooks",
        },
        {
          label: "FAQ",
          href: "/faq",
          description: "Answers to common questions",
        },
      ],
    },

    {
      label: "Contact",
      href: "/contact",
      children: [],
    },
  ],

  footerColumns: [
    {
      title: "Services",
      links: [
        {
          label: "Corporate & Institutional",
          href: "/services/corporate-institutional-transport",
        },
        {
          label: "Tourism & Leisure",
          href: "/services/tourism-leisure",
        },
        {
          label: "Individual & On-Demand",
          href: "/services/individual-on-demand-transport",
        },
        {
          label: "MICE & Events",
          href: "/services/mice-event-transportation",
        },
        {
          label: "Our Fleet",
          href: "/fleet",
        },
      ],
    },

    {
      title: "Company",
      links: [
        {
          label: "About Us",
          href: "/about",
        },
        {
          label: "Why ViaRidez",
          href: "/why-viaridez",
        },
        {
          label: "Technology",
          href: "/technology",
        },
        {
          label: "Sustainability",
          href: "/sustainability",
        },
        {
          label: "Case Studies",
          href: "/case-studies",
        },
        {
          label: "Careers",
          href: "/careers",
        },
        {
          label: "Free Zones",
          href: "/free-zones",
        },
        {
          label: "Become a Fleet Partner",
          href: "/partners",
        },
      ],
    },

    {
      title: "Resources",
      links: [
        {
          label: "Blog & Insights",
          href: "/blog",
        },
        {
          label: "Resource Library",
          href: "/resources",
        },
        {
          label: "FAQ",
          href: "/faq",
        },
        {
          label: "Get a Quote",
          href: "/get-quote",
        },
        {
          label: "Privacy Policy",
          href: "/legal/privacy-policy",
        },
        {
          label: "Cookie Policy",
          href: "/legal/cookie-policy",
        },
      ],
    },
  ],

  ctaPrimary: {
    label: "Get a Quote",
    href: "/get-quote",
    external: false,
  },

  ctaSecondary: {
    label: "Book Now",
    href: "/book-demo",
    external: false,
  },

  ctaClientLogin: {
    label: "Client Login",
    href: "/contact",
    external: false,
  },

  social: {
    linkedin: "",
    instagram: "",
    facebook: "",
  },

  logoDark: "/brand/viaridez-logo-light.png",

  logoLight: "/brand/viaridez-logo.png",

  analytics: {
    gaId: "",
    gtmId: "",
  },

  crm: {
    apiKey: "",
    provider: "",
    webhookUrl: "",
  },

  defaultSeo: {
    metaTitle:
      "ViaRidez | Enterprise Employee Transportation & Corporate Mobility",

    metaDescription:
      "ViaRidez delivers reliable, technology-driven employee transportation, corporate shuttles and managed mobility across Dubai, the UAE free zones, Kuwait, India and Nepal.",

    keywords: [],

    noindex: false,

    nofollow: false,
  },

  seo: {
    titleTemplate: "%s | ViaRidez",

    defaultKeywords: [],

    defaultOgImage: "",

    organization: {
      legalName: "",
      addressCountry: "AE",
      addressLocality: "",
      addressRegion: "",
      foundingDate: "",
      latitude: "",
      longitude: "",
      openingHours: "",
      postalCode: "",
      priceRange: "$$",
      streetAddress: "",
    },

    robots: {
      blockAiBots: false,
      extraDisallow: [],
    },

    twitterCreator: "",

    twitterSite: "",

    verification: {
      bing: "",
      google: "",
      pinterest: "",
      yandex: "",
    },
  },

  stats: [
    {
      value: "13+",
      label: "Years of operating heritage",
    },
    {
      value: "4",
      label: "Dubai free zones served",
    },
    {
      value: "50+",
      label: "Seat coaches in our fleet",
    },
    {
      value: "24/7",
      label: "Operations & support desk",
    },
  ],
});

export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  try {
    await connectToDatabase()
    const settings = await SiteSettings.findOne({ key: 'global' }).lean()
    // If the singleton document hasn't been seeded yet, fall back to defaults
    // so the public site still renders (header/footer/nav) instead of crashing
    // on `settings.social` / `settings.navigation` being undefined.
    if (!settings) return DEFAULT_SITE_SETTINGS
    return ensureCoreNavigation(serialize<SiteSettingsData>(settings))
  } catch (error) {
    // Database unreachable (bad URI, firewall, blocked port). Degrade to
    // defaults so the site loads rather than hanging or 500-ing on every page.
    console.error('[v0] getSiteSettings failed, using defaults:', (error as Error).message)
    return DEFAULT_SITE_SETTINGS
  }
})

/**
 * Admin-only, source-of-truth read of the SiteSettings singleton.
 *
 * Deliberately different from `getSiteSettings`:
 *  - It does NOT swallow connection errors — it rethrows so the admin editor
 *    can show an explicit "database unavailable" state instead of rendering the
 *    fallback defaults. (If the editor showed defaults and the admin hit Save,
 *    it would overwrite the real navigation/footer — permanent data loss.)
 *  - It does NOT apply `ensureCoreNavigation`, so the admin edits the exact
 *    stored document rather than the derived public-site view.
 *
 * Returns `null` only when the database is reachable but the document has not
 * been created yet (a fresh install), which the editor treats as an empty form.
 */
export const getRawSiteSettings = cache(async (): Promise<SiteSettingsData | null> => {
  await connectToDatabase()
  const settings = await SiteSettings.findOne({ key: 'global' }).lean()
  return settings
    ? serialize<SiteSettingsData>(settings)
    : DEFAULT_SITE_SETTINGS;
})

/**
 * Normalizes the public site chrome so it stays consistent regardless of what a
 * (possibly stale) seeded SiteSettings document contains:
 *
 *  - The admin-managed navigation is respected exactly as saved. Whatever the
 *    admin drops into the navbar (including Careers, Fleet Partners or any new
 *    page) is rendered — nothing is stripped.
 *  - Every dropdown child is guaranteed a description: if the admin left one
 *    blank, we backfill the canonical `NAV_DESCRIPTIONS` value for that href so
 *    each sub-menu shows a title *and* a description.
 *  - The "Client Login" utility-bar CTA is removed; users reach the client
 *    portal via the Contact page instead.
 *  - The footer still guarantees Careers + "Become a Fleet Partner" links so
 *    the Job Applications and Fleet Partner Applications inboxes stay reachable.
 */
function ensureCoreNavigation(settings: SiteSettingsData): SiteSettingsData {
  if (!settings) return settings

  const hasHref = (items: { href: string }[] | undefined, href: string) =>
    Array.isArray(items) && items.some((i) => i.href === href)

  // --- Primary navigation ---------------------------------------------------
  // Respect the saved navigation as-is; only normalise the shape and backfill a
  // description on any dropdown child that doesn't already have one so every
  // sub-menu renders a title + description on the public site.
  const navigation: NavItem[] = (Array.isArray(settings.navigation) ? settings.navigation : []).map(
    (n) => ({
      ...n,
      children: (Array.isArray(n.children) ? n.children : []).map((c) => ({
        ...c,
        description: c.description?.trim() ? c.description : NAV_DESCRIPTIONS[c.href] ?? '',
      })),
    }),
  )

  // --- Footer ---------------------------------------------------------------
  const footerColumns: FooterColumn[] = Array.isArray(settings.footerColumns)
    ? settings.footerColumns.map((c) => ({ ...c, links: [...(c.links ?? [])] }))
    : []
  const companyCol =
    footerColumns.find((c) => c.title?.toLowerCase() === 'company') ?? footerColumns[0]
  if (companyCol) {
    if (!hasHref(companyCol.links, '/careers')) {
      companyCol.links.push({ label: 'Careers', href: '/careers' })
    }
    if (!hasHref(companyCol.links, '/partners')) {
      companyCol.links.push({ label: 'Become a Fleet Partner', href: '/partners' })
    }
  }

  // Remove the "Client Login" CTA from the utility bar (kept reachable via Contact).
  return { ...settings, navigation, footerColumns, ctaClientLogin: undefined }
}

/* -------------------------------- CMS pages ------------------------------ */
export const getCmsPageBySlug = cache(async (slug: string): Promise<CmsPageData | null> => {
  await connectToDatabase()
  const page = await Page.findOne({ slug, ...PUBLISHED }).lean()
  return page ? serialize<CmsPageData>(page) : null
})

export const getCmsPages = cache(async (): Promise<CmsPageData[]> => {
  await connectToDatabase()
  const pages = await Page.find(PUBLISHED).sort({ updatedAt: -1 }).lean()
  return serialize<CmsPageData[]>(pages)
})

/* --------------------------- Linkable destinations ------------------------ */

export interface LinkOption {
  label: string
  href: string
  /** Suggested dropdown description, pre-filled when dropped into a sub-menu. */
  description?: string
}
export interface LinkGroup {
  group: string
  items: LinkOption[]
}

/**
 * Every place the site can link to, grouped for the admin menu builder. Combines
 * the fixed system pages with live CMS content (services, industries, custom
 * pages, …) so a newly created page or service is immediately available to drop
 * into the navbar or footer — no JSON editing required.
 */
export const getLinkableDestinations = cache(async (): Promise<LinkGroup[]> => {
  const sys = (label: string, href: string): LinkOption => ({
    label,
    href,
    description: NAV_DESCRIPTIONS[href],
  })
  const systemPages: LinkOption[] = [
    sys('Home', '/'),
    sys('Services', '/services'),
    sys('Fleet', '/fleet'),
    sys('Industries', '/industries'),
    sys('Locations', '/locations'),
    sys('Free Zones', '/free-zones'),
    sys('Technology', '/technology'),
    sys('Case Studies', '/case-studies'),
    sys('Blog & Insights', '/blog'),
    sys('Resource Library', '/resources'),
    sys('FAQ', '/faq'),
    sys('About Us', '/about'),
    sys('Why ViaRidez', '/why-viaridez'),
    sys('Sustainability', '/sustainability'),
    sys('Contact', '/contact'),
    sys('Careers', '/careers'),
    sys('Become a Fleet Partner', '/partners'),
    sys('Get a Quote', '/get-quote'),
    sys('Book a Demo', '/book-demo'),
    sys('Privacy Policy', '/legal/privacy-policy'),
    sys('Cookie Policy', '/legal/cookie-policy'),
    sys('Terms of Service', '/legal/terms-of-service'),
  ]

  try {
    await connectToDatabase()
    const [services, industries, locations, freeZones, fleet, caseStudies, blog, pages] =
      await Promise.all([
        Service.find(PUBLISHED).select('title slug excerpt description').sort({ order: 1 }).lean(),
        Industry.find(PUBLISHED).select('name slug excerpt').sort({ order: 1 }).lean(),
        Location.find(PUBLISHED).select('name slug excerpt').sort({ order: 1 }).lean(),
        FreeZone.find(PUBLISHED).select('name slug excerpt').sort({ order: 1 }).lean(),
        FleetCategory.find(PUBLISHED).select('name slug description').sort({ order: 1 }).lean(),
        CaseStudy.find(PUBLISHED).select('title slug excerpt').sort({ order: 1 }).lean(),
        Blog.find(PUBLISHED).select('title slug excerpt').sort({ publishedAt: -1 }).lean(),
        Page.find(PUBLISHED).select('title slug').sort({ updatedAt: -1 }).lean(),
      ])

    // Trim any excerpt/description into a compact one-line dropdown hint.
    const hint = (d: Record<string, unknown>): string | undefined => {
      const raw = String(d.excerpt ?? d.description ?? '').trim()
      if (!raw) return undefined
      return raw.length > 90 ? `${raw.slice(0, 87).trimEnd()}…` : raw
    }

    const map = (
      docs: Record<string, unknown>[],
      labelKey: string,
      prefix: string,
    ): LinkOption[] =>
      docs
        .filter((d) => d.slug)
        .map((d) => ({
          label: String(d[labelKey] ?? d.slug),
          href: `${prefix}/${String(d.slug)}`,
          description: hint(d),
        }))

    const groups: LinkGroup[] = [
      { group: 'System pages', items: systemPages },
      { group: 'Services', items: map(services, 'title', '/services') },
      { group: 'Industries', items: map(industries, 'name', '/industries') },
      { group: 'Locations', items: map(locations, 'name', '/locations') },
      { group: 'Free Zones', items: map(freeZones, 'name', '/free-zones') },
      { group: 'Fleet', items: map(fleet, 'name', '/fleet') },
      { group: 'Case Studies', items: map(caseStudies, 'title', '/case-studies') },
      { group: 'Blog Articles', items: map(blog, 'title', '/blog') },
      // Custom CMS pages resolve through the catch-all route at /<slug>.
      { group: 'Custom Pages', items: map(pages, 'title', '') },
    ]

    return groups.filter((g) => g.items.length > 0)
  } catch (error) {
    console.error('[v0] getLinkableDestinations failed:', (error as Error).message)
    return [{ group: 'System pages', items: systemPages }]
  }
})

/* ------------------------------- Services --------------------------------- */

export const getServices = cache(async (): Promise<ServiceData[]> => {
  try {
    await connectToDatabase()
    const services = await Service.find(PUBLISHED).sort({ order: 1 }).lean()
    return serialize<ServiceData[]>(services)
  } catch (error) {
    console.error('[v0] getServices failed:', (error as Error).message)
    return []
  }
})

export const getParentServices = cache(async (): Promise<ServiceData[]> => {
  const all = await getServices()
  return all.filter((s) => !s.parent)
})

export const getServiceBySlug = cache(
  async (slug: string): Promise<ServiceData | null> => {
    await connectToDatabase()
    const service = await Service.findOne({ slug, ...PUBLISHED }).lean()
    return service ? serialize<ServiceData>(service) : null
  },
)

export const getChildServices = cache(
  async (parentId: string): Promise<ServiceData[]> => {
    const all = await getServices()
    return all.filter((s) => s.parent === parentId)
  },
)

/* -------------------------------- Fleet ----------------------------------- */

export const getFleetCategories = cache(async (): Promise<FleetCategoryData[]> => {
  try {
    await connectToDatabase()
    const cats = await FleetCategory.find(PUBLISHED).sort({ order: 1 }).lean()
    return serialize<FleetCategoryData[]>(cats)
  } catch (error) {
    console.error('[v0] getFleetCategories failed:', (error as Error).message)
    return []
  }
})

export const getFleetCategoryBySlug = cache(
  async (slug: string): Promise<FleetCategoryData | null> => {
    await connectToDatabase()
    const cat = await FleetCategory.findOne({ slug, ...PUBLISHED }).lean()
    return cat ? serialize<FleetCategoryData>(cat) : null
  },
)

/* ------------------------------ Industries -------------------------------- */

export const getIndustries = cache(async (): Promise<IndustryData[]> => {
  try {
    await connectToDatabase()
    const industries = await Industry.find(PUBLISHED).sort({ order: 1 }).lean()
    return serialize<IndustryData[]>(industries)
  } catch (error) {
    console.error('[v0] getIndustries failed:', (error as Error).message)
    return []
  }
})

export const getIndustryBySlug = cache(
  async (slug: string): Promise<IndustryData | null> => {
    await connectToDatabase()
    const industry = await Industry.findOne({ slug, ...PUBLISHED }).lean()
    return industry ? serialize<IndustryData>(industry) : null
  },
)

/* ------------------------------- Locations -------------------------------- */

export const getLocations = cache(async (): Promise<LocationData[]> => {
  try {
    await connectToDatabase()
    const locations = await Location.find(PUBLISHED).sort({ order: 1 }).lean()
    return serialize<LocationData[]>(locations)
  } catch (error) {
    console.error('[v0] getLocations failed:', (error as Error).message)
    return []
  }
})

export const getLocationBySlug = cache(
  async (slug: string): Promise<LocationData | null> => {
    await connectToDatabase()
    const location = await Location.findOne({ slug, ...PUBLISHED }).lean()
    return location ? serialize<LocationData>(location) : null
  },
)

/* ------------------------------- Free zones ------------------------------- */

export const getFreeZones = cache(async (): Promise<FreeZoneData[]> => {
  await connectToDatabase()
  const zones = await FreeZone.find(PUBLISHED).sort({ order: 1 }).lean()
  return serialize<FreeZoneData[]>(zones)
})

export const getFreeZoneBySlug = cache(
  async (slug: string): Promise<FreeZoneData | null> => {
    await connectToDatabase()
    const zone = await FreeZone.findOne({ slug, ...PUBLISHED }).lean()
    return zone ? serialize<FreeZoneData>(zone) : null
  },
)

/* ------------------------------ Testimonials ------------------------------ */

export const getTestimonials = cache(async (): Promise<TestimonialData[]> => {
  try {
    await connectToDatabase()
    const items = await Testimonial.find({ isDeleted: false, status: 'published' })
      .sort({ order: 1 })
      .lean()
    return serialize<TestimonialData[]>(items)
  } catch (error) {
    console.error('[v0] getTestimonials failed:', (error as Error).message)
    return []
  }
})

/* -------------------------------- Clients --------------------------------- */

export const getClients = cache(async (): Promise<ClientData[]> => {
  try {
    await connectToDatabase()
    const items = await Client.find({ isDeleted: false, status: 'published' })
      .sort({ order: 1 })
      .lean()
    return serialize<ClientData[]>(items)
  } catch (error) {
    console.error('[v0] getClients failed:', (error as Error).message)
    return []
  }
})

/* ------------------------------ Case studies ------------------------------ */

export const getCaseStudies = cache(async (): Promise<CaseStudyData[]> => {
  try {
    await connectToDatabase()
    const items = await CaseStudy.find(PUBLISHED)
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .lean()
    return serialize<CaseStudyData[]>(items)
  } catch (error) {
    console.error('[v0] getCaseStudies failed:', (error as Error).message)
    return []
  }
})

export const getCaseStudyBySlug = cache(
  async (slug: string): Promise<CaseStudyData | null> => {
    try {
      await connectToDatabase()
      const item = await CaseStudy.findOne({ slug, ...PUBLISHED }).lean()
      return item ? serialize<CaseStudyData>(item) : null
    } catch (error) {
      console.error('[v0] getCaseStudyBySlug failed:', (error as Error).message)
      return null
    }
  },
)

/**
 * Related case studies for the detail page. Prefers studies in the same
 * industry, then the same service type, then fills the remaining slots with any
 * other published study — always excluding the current one.
 */
export const getRelatedCaseStudies = cache(
  async (slug: string, limit = 3): Promise<CaseStudyData[]> => {
    const all = await getCaseStudies()
    const current = all.find((c) => c.slug === slug)
    if (!current) return all.filter((c) => c.slug !== slug).slice(0, limit)
    const others = all.filter((c) => c.slug !== slug)
    const scored = others
      .map((c) => {
        let score = 0
        if (current.industry && c.industry === current.industry) score += 2
        if (current.serviceType && c.serviceType === current.serviceType) score += 1
        return { c, score }
      })
      .sort((a, b) => b.score - a.score)
    return scored.slice(0, limit).map((s) => s.c)
  },
)

/* ------------------------------ Team members ------------------------------ */

export const getTeamMembers = cache(async (): Promise<TeamMemberData[]> => {
  await connectToDatabase()
  const items = await TeamMember.find({ isDeleted: false, status: 'published' })
    .sort({ order: 1 })
    .lean()
  return serialize<TeamMemberData[]>(items)
})

/* ---------------------------------- FAQs ---------------------------------- */

export const getFAQs = cache(async (category?: string): Promise<FAQData[]> => {
  await connectToDatabase()
  const filter: Record<string, unknown> = { isDeleted: false, status: 'published' }
  if (category) filter.category = category
  const faqs = await Faq.find(filter).sort({ order: 1 }).lean()
  return serialize<FAQData[]>(faqs)
})

/* ---------------------------------- Blog ---------------------------------- */

export const getBlogPosts = cache(async (): Promise<BlogData[]> => {
  await connectToDatabase()
  const posts = await Blog.find(PUBLISHED).sort({ publishedAt: -1 }).lean()
  return serialize<BlogData[]>(posts)
})

export const getBlogPostBySlug = cache(
  async (slug: string): Promise<BlogData | null> => {
    await connectToDatabase()
    const post = await Blog.findOne({ slug, ...PUBLISHED }).lean()
    return post ? serialize<BlogData>(post) : null
  },
)

export const getBlogCategories = cache(async (): Promise<BlogCategoryData[]> => {
  await connectToDatabase()
  const cats = await BlogCategory.find({ isDeleted: false }).sort({ order: 1 }).lean()
  return serialize<BlogCategoryData[]>(cats)
})

/* ------------------------------ Resources -------------------------------- */
export const getResources = cache(async (): Promise<ResourceData[]> => {
  await connectToDatabase()
  const items = await Resource.find(PUBLISHED).sort({ featured: -1, order: 1, createdAt: -1 }).lean()
  return serialize<ResourceData[]>(items)
})

/* -------------------------------- Careers --------------------------------- */

export const getCareers = cache(async (): Promise<CareerData[]> => {
  await connectToDatabase()
  const jobs = await Career.find(PUBLISHED).sort({ createdAt: -1 }).lean()
  return serialize<CareerData[]>(jobs)
})

export const getCareerBySlug = cache(
  async (slug: string): Promise<CareerData | null> => {
    await connectToDatabase()
    const job = await Career.findOne({ slug, ...PUBLISHED }).lean()
    return job ? serialize<CareerData>(job) : null
  },
)

/* -------------------------------------------------------------------------- */
/*  Types — mirror the Mongoose schemas exactly                               */
/* -------------------------------------------------------------------------- */

export interface SeoData {
  metaTitle?: string
  metaDescription?: string
  /** Stored on content docs as `canonicalUrl`. */
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  keywords?: string[]
  noindex?: boolean
  nofollow?: boolean
}

export interface SeoConfigData {
  titleTemplate?: string
  defaultKeywords?: string[]
  defaultOgImage?: string
  twitterSite?: string
  twitterCreator?: string
  verification?: {
    google?: string
    bing?: string
    yandex?: string
    pinterest?: string
  }
  organization?: {
    legalName?: string
    foundingDate?: string
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
    latitude?: string
    longitude?: string
    priceRange?: string
    openingHours?: string
  }
  robots?: {
    blockAiBots?: boolean
    extraDisallow?: string[]
  }
}

export interface CtaData {
  label: string
  href: string
  external?: boolean
}

export interface NavItem {
  label: string
  href: string
  children?: { label: string; href: string; description?: string; icon?: string }[]
}

export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

export interface SiteSettingsData {
  key: string
  companyName: string
  tagline?: string
  logoLight?: string
  logoDark?: string
  email?: string
  phone?: string
  whatsapp?: string
  address?: string
  businessHours?: string
  navigation: NavItem[]
  footerColumns: FooterColumn[]
  ctaPrimary: CtaData
  ctaSecondary: CtaData
  ctaClientLogin?: CtaData
  social: {
    linkedin?: string
    twitter?: string
    instagram?: string
    facebook?: string
    youtube?: string
  }
  analytics?: { gaId?: string; gtmId?: string }
  crm?: { apiKey?: string; provider?: string; webhookUrl?: string }
  chat?: { enabled?: boolean; provider?: string; number?: string; message?: string; consentRequired?: boolean }
  defaultSeo?: SeoData
  seo?: SeoConfigData
  stats?: { label: string; value: string }[]
}

export interface ServiceFeature {
  icon?: string
  title: string
  description?: string
}

export interface ServiceData {
  updatedAt?: string
  _id: string
  title: string
  slug: string
  parent?: string | null
  category?: string
  icon?: string
  excerpt?: string
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string | null
  body?: string
  features?: ServiceFeature[]
  benefits?: string[]
  order?: number
  featured?: boolean
  seo?: SeoData
}

export interface FleetCategoryData {
  updatedAt?: string
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  image?: string | null
  capacityRange?: string
  order?: number
  seo?: SeoData
}

export interface IndustryData {
  updatedAt?: string
  _id: string
  name: string
  slug: string
  icon?: string
  excerpt?: string
  heroTitle?: string
  heroImage?: string | null
  body?: string
  challenges?: string[]
  solutions?: string[]
  order?: number
  seo?: SeoData
}

export interface LocationData {
  updatedAt?: string
  _id: string
  name: string
  slug: string
  type?: string
  countryCode?: string
  excerpt?: string
  heroTitle?: string
  heroImage?: string | null
  body?: string
  address?: string
  phone?: string
  email?: string
  highlights?: string[]
  order?: number
  isPrimary?: boolean
  seo?: SeoData
}

export interface FreeZoneData {
  updatedAt?: string
  _id: string
  name: string
  abbreviation?: string
  slug: string
  excerpt?: string
  heroTitle?: string
  heroImage?: string | null
  body?: string
  features?: string[]
  routes?: string[]
  order?: number
  seo?: SeoData
}

export interface TestimonialData {
  _id: string
  author: string
  role?: string
  company?: string
  avatar?: string | null
  quote: string
  rating?: number
}

export interface ClientData {
  _id: string
  name: string
  logo?: string | null
  website?: string
  industry?: string
}

export interface CaseStudyData {
  updatedAt?: string
  _id: string
  title: string
  slug: string
  client?: string
  industry?: string
  serviceType?: string
  location?: string
  duration?: string
  fleetSize?: string
  excerpt?: string
  coverImage?: string | null
  logo?: string | null
  challenge?: string
  solution?: string
  result?: string
  body?: string
  services?: string[]
  highlights?: string[]
  metrics?: { label: string; value: string }[]
  gallery?: string[]
  tags?: string[]
  testimonialQuote?: string
  testimonialAuthor?: string
  testimonialRole?: string
  featured?: boolean
  order?: number
  seo?: SeoData
}

export interface TeamMemberData {
  _id: string
  name: string
  role?: string
  bio?: string
  photo?: string | null
  linkedin?: string
}

export interface FAQData {
  _id: string
  question: string
  answer: string
  category?: string
}

export interface BlogData {
  updatedAt?: string
  _id: string
  title: string
  slug: string
  excerpt?: string
  coverImage?: string | null
  body?: string
  tags?: string[]
  authorName?: string
  authorRole?: string
  authorAvatar?: string | null
  readingTime?: number
  publishedAt?: string
  featured?: boolean
  views?: number
  claps?: number
  seo?: SeoData
}

export interface BlogCommentData {
  id: string
  name: string
  body: string
  createdAt: string
}

export interface BlogCategoryData {
  _id: string
  name: string
  slug: string
}

export interface CmsPageData {
  updatedAt?: string
  _id: string
  title: string
  slug: string
  heroEyebrow?: string
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string | null
  body?: string
  sections?: {
    type: string
    eyebrow?: string
    heading?: string
    subheading?: string
    body?: string
    image?: string | null
    imageAlt?: string
    align?: string
    background?: string
    variant?: string
    ctaLabel?: string
    ctaHref?: string
    items?: unknown[]
  }[]
  seo?: SeoData
}

export interface ResourceData {
  _id: string
  title: string
  slug: string
  type?: string
  excerpt?: string
  coverImage?: string | null
  downloadUrl: string
  tags?: string[]
  featured?: boolean
  gated?: boolean
  seo?: SeoData
}

export interface CareerData {
  updatedAt?: string
  _id: string
  title: string
  slug: string
  department?: string
  category?: string
  location?: string
  employmentType?: string
  workMode?: string
  experienceLevel?: string
  experienceMin?: number
  experienceMax?: number
  openings?: number
  salaryDisclosed?: boolean
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  salaryPeriod?: string
  skills?: string[]
  benefits?: string[]
  screeningQuestions?: string[]
  featured?: boolean
  excerpt?: string
  description?: string
  responsibilities?: string[]
  requirements?: string[]
  closingDate?: string | null
  createdAt?: string
  seo?: SeoData
}
