import 'server-only'
import { cache } from 'react'
import { connectToDatabase } from '@/lib/db/mongoose'
import {
  Service,
  FleetCategory,
  Industry,
  Location,
  FreeZone,
  Blog,
  Career,
  CaseStudy,
  Page,
} from '@/models'
import type { Model } from 'mongoose'

/* -------------------------------------------------------------------------- */
/*  SEO Health Audit                                                          */
/*  Scans every published, publicly-indexable content document and grades    */
/*  its on-page SEO against Google's practical title/description limits.      */
/* -------------------------------------------------------------------------- */

export const TITLE_MIN = 30
export const TITLE_MAX = 60
export const DESC_MIN = 70
export const DESC_MAX = 160

export type SeoIssueLevel = 'error' | 'warning'

export interface SeoAuditIssue {
  level: SeoIssueLevel
  code: string
  message: string
}

export interface SeoAuditItem {
  id: string
  collection: string
  title: string
  path: string
  metaTitle: string
  metaDescription: string
  titleLength: number
  descriptionLength: number
  keywordCount: number
  noindex: boolean
  hasOgImage: boolean
  hasCanonical: boolean
  usesFallbackTitle: boolean
  usesFallbackDescription: boolean
  issues: SeoAuditIssue[]
  score: number
  updatedAt?: string
}

export interface SeoAuditResult {
  items: SeoAuditItem[]
  summary: {
    total: number
    errors: number
    warnings: number
    healthy: number
    score: number
    indexable: number
    noindex: number
    missingMetaTitle: number
    missingMetaDescription: number
    missingOgImage: number
    duplicateTitles: number
  }
  byCollection: { collection: string; total: number; issues: number; score: number }[]
  generatedAt: string
}

interface CollectionConfig {
  key: string
  label: string
  model: Model<unknown>
  titleField: string
  descFields: string[]
  imageFields: string[]
  path: (slug: string) => string
}

const COLLECTIONS: CollectionConfig[] = [
  { key: 'services', label: 'Services', model: Service as unknown as Model<unknown>, titleField: 'title', descFields: ['excerpt'], imageFields: ['heroImage'], path: (s) => `/services/${s}` },
  { key: 'fleet', label: 'Fleet', model: FleetCategory as unknown as Model<unknown>, titleField: 'name', descFields: ['description'], imageFields: ['image'], path: (s) => `/fleet/${s}` },
  { key: 'industries', label: 'Industries', model: Industry as unknown as Model<unknown>, titleField: 'name', descFields: ['excerpt'], imageFields: ['heroImage'], path: (s) => `/industries/${s}` },
  { key: 'locations', label: 'Locations', model: Location as unknown as Model<unknown>, titleField: 'name', descFields: ['excerpt'], imageFields: ['heroImage'], path: (s) => `/locations/${s}` },
  { key: 'free-zones', label: 'Free Zones', model: FreeZone as unknown as Model<unknown>, titleField: 'name', descFields: ['excerpt'], imageFields: ['heroImage'], path: (s) => `/free-zones/${s}` },
  { key: 'blog', label: 'Blog', model: Blog as unknown as Model<unknown>, titleField: 'title', descFields: ['excerpt'], imageFields: ['coverImage'], path: (s) => `/blog/${s}` },
  { key: 'careers', label: 'Careers', model: Career as unknown as Model<unknown>, titleField: 'title', descFields: ['excerpt'], imageFields: [], path: (s) => `/careers/${s}` },
  { key: 'case-studies', label: 'Case Studies', model: CaseStudy as unknown as Model<unknown>, titleField: 'title', descFields: ['summary', 'excerpt'], imageFields: ['coverImage'], path: (s) => `/case-studies/${s}` },
  { key: 'pages', label: 'Landing Pages', model: Page as unknown as Model<unknown>, titleField: 'title', descFields: ['heroSubtitle'], imageFields: ['heroImage'], path: (s) => `/${s}` },
]

function firstString(doc: Record<string, unknown>, fields: string[]): string {
  for (const f of fields) {
    const v = doc[f]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

function gradeItem(item: Omit<SeoAuditItem, 'issues' | 'score'>): {
  issues: SeoAuditIssue[]
  score: number
} {
  const issues: SeoAuditIssue[] = []

  if (!item.metaTitle) {
    issues.push({ level: 'error', code: 'no-title', message: 'No title could be derived for this page.' })
  } else if (item.usesFallbackTitle) {
    issues.push({ level: 'warning', code: 'fallback-title', message: 'No custom meta title — relying on the page name fallback.' })
  }
  if (item.metaTitle) {
    if (item.titleLength > TITLE_MAX) {
      issues.push({ level: 'warning', code: 'title-long', message: `Meta title is ${item.titleLength} chars — Google truncates past ${TITLE_MAX}.` })
    } else if (item.titleLength < TITLE_MIN) {
      issues.push({ level: 'warning', code: 'title-short', message: `Meta title is only ${item.titleLength} chars — aim for ${TITLE_MIN}–${TITLE_MAX}.` })
    }
  }

  if (!item.metaDescription) {
    issues.push({ level: 'error', code: 'no-description', message: 'Missing meta description — search engines will invent one.' })
  } else {
    if (item.usesFallbackDescription) {
      issues.push({ level: 'warning', code: 'fallback-description', message: 'No custom meta description — relying on the excerpt fallback.' })
    }
    if (item.descriptionLength > DESC_MAX) {
      issues.push({ level: 'warning', code: 'desc-long', message: `Meta description is ${item.descriptionLength} chars — Google truncates past ${DESC_MAX}.` })
    } else if (item.descriptionLength < DESC_MIN) {
      issues.push({ level: 'warning', code: 'desc-short', message: `Meta description is only ${item.descriptionLength} chars — aim for ${DESC_MIN}–${DESC_MAX}.` })
    }
  }

  if (!item.hasOgImage) {
    issues.push({ level: 'warning', code: 'no-og-image', message: 'No social share image — links will preview without artwork.' })
  }
  if (item.noindex) {
    issues.push({ level: 'warning', code: 'noindex', message: 'Page is set to noindex — it will not appear in search results.' })
  }

  let score = 100
  for (const i of issues) score -= i.level === 'error' ? 25 : 8
  return { issues, score: Math.max(0, score) }
}

export const getSeoAudit = cache(async (): Promise<SeoAuditResult> => {
  const generatedAt = new Date().toISOString()
  try {
    await connectToDatabase()

    const perCollection = await Promise.all(
      COLLECTIONS.map(async (cfg) => {
        const docs = (await cfg.model
          .find({ isDeleted: false, status: 'published' })
          .lean()) as unknown as Record<string, unknown>[]
        return { cfg, docs }
      }),
    )

    const items: SeoAuditItem[] = []
    for (const { cfg, docs } of perCollection) {
      for (const doc of docs) {
        const seo = (doc.seo ?? {}) as Record<string, unknown>
        const baseTitle = firstString(doc, [cfg.titleField])
        const explicitTitle = typeof seo.metaTitle === 'string' ? seo.metaTitle.trim() : ''
        const metaTitle = explicitTitle || (baseTitle ? `${baseTitle} | ViaRidez` : '')

        const explicitDesc = typeof seo.metaDescription === 'string' ? seo.metaDescription.trim() : ''
        const fallbackDesc = firstString(doc, cfg.descFields)
        const metaDescription = explicitDesc || fallbackDesc

        const ogImage = typeof seo.ogImage === 'string' ? seo.ogImage.trim() : ''
        const docImage = firstString(doc, cfg.imageFields)
        const keywords = Array.isArray(seo.keywords) ? (seo.keywords as string[]) : []

        const partial: Omit<SeoAuditItem, 'issues' | 'score'> = {
          id: String(doc._id),
          collection: cfg.label,
          title: baseTitle || '(untitled)',
          path: cfg.path(String(doc.slug ?? '')),
          metaTitle,
          metaDescription,
          titleLength: metaTitle.length,
          descriptionLength: metaDescription.length,
          keywordCount: keywords.length,
          noindex: Boolean(seo.noindex),
          hasOgImage: Boolean(ogImage || docImage),
          hasCanonical: Boolean(typeof seo.canonicalUrl === 'string' && seo.canonicalUrl.trim()),
          usesFallbackTitle: !explicitTitle,
          usesFallbackDescription: Boolean(!explicitDesc && fallbackDesc),
          updatedAt: doc.updatedAt ? String(doc.updatedAt) : undefined,
        }
        const graded = gradeItem(partial)
        items.push({ ...partial, ...graded })
      }
    }

    // Cross-collection duplicate meta-title detection.
    const titleCounts = new Map<string, number>()
    for (const it of items) {
      if (!it.metaTitle) continue
      const key = it.metaTitle.toLowerCase()
      titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1)
    }
    let duplicateTitles = 0
    for (const it of items) {
      if (it.metaTitle && (titleCounts.get(it.metaTitle.toLowerCase()) ?? 0) > 1) {
        duplicateTitles++
        it.issues.push({ level: 'error', code: 'duplicate-title', message: 'Duplicate meta title — another page uses the exact same title.' })
        it.score = Math.max(0, it.score - 25)
      }
    }

    // Sort worst-first so the admin sees the highest-impact fixes at the top.
    items.sort((a, b) => a.score - b.score || a.collection.localeCompare(b.collection))

    const errors = items.reduce((n, i) => n + i.issues.filter((x) => x.level === 'error').length, 0)
    const warnings = items.reduce((n, i) => n + i.issues.filter((x) => x.level === 'warning').length, 0)
    const healthy = items.filter((i) => i.issues.length === 0).length
    const total = items.length
    const score = total ? Math.round(items.reduce((n, i) => n + i.score, 0) / total) : 100

    const byCollection = COLLECTIONS.map((cfg) => {
      const group = items.filter((i) => i.collection === cfg.label)
      return {
        collection: cfg.label,
        total: group.length,
        issues: group.reduce((n, i) => n + i.issues.length, 0),
        score: group.length ? Math.round(group.reduce((n, i) => n + i.score, 0) / group.length) : 100,
      }
    }).filter((c) => c.total > 0)

    return {
      items,
      summary: {
        total,
        errors,
        warnings,
        healthy,
        score,
        indexable: items.filter((i) => !i.noindex).length,
        noindex: items.filter((i) => i.noindex).length,
        missingMetaTitle: items.filter((i) => i.usesFallbackTitle).length,
        missingMetaDescription: items.filter((i) => !i.metaDescription || i.usesFallbackDescription).length,
        missingOgImage: items.filter((i) => !i.hasOgImage).length,
        duplicateTitles,
      },
      byCollection,
      generatedAt,
    }
  } catch (error) {
    console.error('[v0] getSeoAudit failed:', (error as Error).message)
    return {
      items: [],
      summary: {
        total: 0,
        errors: 0,
        warnings: 0,
        healthy: 0,
        score: 0,
        indexable: 0,
        noindex: 0,
        missingMetaTitle: 0,
        missingMetaDescription: 0,
        missingOgImage: 0,
        duplicateTitles: 0,
      },
      byCollection: [],
      generatedAt,
    }
  }
})
