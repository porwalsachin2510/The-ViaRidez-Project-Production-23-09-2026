import type { Metadata } from 'next'
import type { SeoData } from '@/lib/data/queries'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.viaridez.com'

/** Returns an absolute URL for a site-relative path (used in JSON-LD, canonicals). */
export function absoluteUrl(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${clean}`
}

const DEFAULT_TITLE =
  'ViaRidez | Enterprise Employee Transportation & Corporate Mobility'
const DEFAULT_DESCRIPTION =
  'ViaRidez delivers reliable, technology-driven employee transportation, corporate shuttles, and managed mobility across Dubai, the UAE free zones, Kuwait, India and Nepal.'

/** Brand Twitter/X handle used for attribution on every page. */
export const DEFAULT_TWITTER = '@viaridez'
/** Default social share artwork, generated on demand by the OG image route. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`

interface BuildMetaArgs {
  seo?: SeoData
  /** Fallback title (page name) used when no SEO meta title is stored. */
  title?: string
  /** Fallback description. */
  description?: string
  /** Path relative to site root, e.g. "/services/employee-transportation". */
  path?: string
  /** Fallback OG image path. */
  image?: string | null
  /** Content type for Open Graph — "website" (default) or "article". */
  type?: 'website' | 'article'
  /** Optional extra keywords merged with the page's own. */
  keywords?: string[]
  /** Optional publish date for article-type pages. */
  publishedTime?: string
}

/**
 * Builds Next.js Metadata from a CMS `seo` sub-document with sensible
 * fallbacks. Every public page funnels through this for consistent SEO.
 *
 * Reads the real stored field names (`canonicalUrl`, `ogTitle`,
 * `ogDescription`) so per-page overrides actually take effect.
 */
export function buildMetadata({
  seo,
  title,
  description,
  path = '/',
  image,
  type = 'website',
  keywords,
  publishedTime,
}: BuildMetaArgs): Metadata {
  const metaTitle = seo?.metaTitle || (title ? `${title} | ViaRidez` : DEFAULT_TITLE)
  const metaDescription = seo?.metaDescription || description || DEFAULT_DESCRIPTION
  const canonical = seo?.canonicalUrl || `${SITE_URL}${path}`
  const ogImage = seo?.ogImage || image || DEFAULT_OG_IMAGE
  const ogTitle = seo?.ogTitle || metaTitle
  const ogDescription = seo?.ogDescription || metaDescription
  const mergedKeywords = [...(seo?.keywords ?? []), ...(keywords ?? [])]

  return {
    // Use absolute so the layout's "%s | ViaRidez" template never double-appends.
    title: { absolute: metaTitle },
    description: metaDescription,
    keywords: mergedKeywords.length ? mergedKeywords : undefined,
    alternates: {
      canonical,
      languages: {
        'en-AE': `${SITE_URL}${path}`,
        'ar-AE': `${SITE_URL}/ar${path === '/' ? '' : path}`,
        'x-default': `${SITE_URL}${path}`,
      },
    },
    robots: {
      index: !seo?.noindex,
      follow: !seo?.nofollow,
      googleBot: {
        index: !seo?.noindex,
        follow: !seo?.nofollow,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: 'ViaRidez',
      locale: 'en_AE',
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: DEFAULT_TWITTER,
      creator: DEFAULT_TWITTER,
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  }
}

/* ----------------------------- JSON-LD helpers ---------------------------- */

export interface OrgAddress {
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  addressCountry?: string
}

function buildPostalAddress(a?: OrgAddress) {
  if (!a) return undefined
  const has = a.streetAddress || a.addressLocality || a.addressRegion || a.postalCode
  if (!has) return undefined
  return {
    '@type': 'PostalAddress',
    ...(a.streetAddress && { streetAddress: a.streetAddress }),
    ...(a.addressLocality && { addressLocality: a.addressLocality }),
    ...(a.addressRegion && { addressRegion: a.addressRegion }),
    ...(a.postalCode && { postalCode: a.postalCode }),
    ...(a.addressCountry && { addressCountry: a.addressCountry }),
  }
}

/** Site-wide search action (sitelinks searchbox) for the WebSite entity. */
export function websiteJsonLd(opts: { name: string; searchPath?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: opts.name,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}${opts.searchPath || '/blog'}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationJsonLd(opts: {
  name: string
  legalName?: string
  url?: string
  logo?: string
  phone?: string
  email?: string
  foundingDate?: string
  address?: OrgAddress
  areaServed?: string[]
  sameAs?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: opts.name,
    ...(opts.legalName && { legalName: opts.legalName }),
    url: opts.url || SITE_URL,
    logo: opts.logo || `${SITE_URL}/brand/viaridez-logo.png`,
    ...(opts.foundingDate && { foundingDate: opts.foundingDate }),
    ...(buildPostalAddress(opts.address) ? { address: buildPostalAddress(opts.address) } : {}),
    ...(opts.phone && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: opts.phone,
        contactType: 'customer service',
        email: opts.email,
        areaServed: opts.areaServed || ['AE', 'KW', 'IN', 'NP'],
        availableLanguage: ['en', 'ar'],
      },
    }),
    ...(opts.areaServed?.length ? { areaServed: opts.areaServed } : {}),
    ...(opts.sameAs?.length ? { sameAs: opts.sameAs } : {}),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function serviceJsonLd(opts: {
  name: string
  description?: string
  path: string
  areaServed?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: opts.name,
    description: opts.description,
    provider: { '@type': 'Organization', name: 'ViaRidez', url: SITE_URL },
    areaServed: opts.areaServed || 'United Arab Emirates',
    url: `${SITE_URL}${opts.path}`,
  }
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function localBusinessJsonLd(opts: {
  name: string
  path: string
  /** Freeform single-line address (fallback when structured parts are absent). */
  address?: string
  structuredAddress?: OrgAddress
  phone?: string
  email?: string
  areaServed?: string
  logo?: string
  priceRange?: string
  openingHours?: string
  latitude?: string
  longitude?: string
}) {
  const structured = buildPostalAddress(opts.structuredAddress)
  const lat = opts.latitude ? Number(opts.latitude) : NaN
  const lng = opts.longitude ? Number(opts.longitude) : NaN
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: opts.name,
    url: `${SITE_URL}${opts.path}`,
    image: opts.logo || `${SITE_URL}/brand/viaridez-logo.png`,
    ...(structured
      ? { address: structured }
      : opts.address
        ? { address: { '@type': 'PostalAddress', streetAddress: opts.address } }
        : {}),
    ...(opts.phone && { telephone: opts.phone }),
    ...(opts.email && { email: opts.email }),
    ...(opts.priceRange && { priceRange: opts.priceRange }),
    ...(opts.openingHours && { openingHours: opts.openingHours }),
    ...(Number.isFinite(lat) && Number.isFinite(lng)
      ? { geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } }
      : {}),
    ...(opts.areaServed && { areaServed: opts.areaServed }),
  }
}

export function articleJsonLd(post: {
  title: string
  slug: string
  excerpt?: string
  coverImage?: string | null
  publishedAt?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/blog/${post.slug}`,
    ...(post.coverImage && { image: absoluteUrl(post.coverImage) }),
    ...(post.publishedAt && { datePublished: post.publishedAt }),
    author: { '@type': 'Organization', name: 'ViaRidez' },
    publisher: { '@type': 'Organization', name: 'ViaRidez' },
  }
}

/** Small component-free helper to render a JSON-LD <script> string. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
}
