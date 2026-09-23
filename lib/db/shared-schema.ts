import { Schema } from 'mongoose'

/**
 * Reusable, embedded SEO metadata attached to every public-facing document.
 */
export const seoSchema = new Schema(
  {
    metaTitle: { type: String, trim: true, maxlength: 70 },
    metaDescription: { type: String, trim: true, maxlength: 180 },
    canonicalUrl: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    noindex: { type: Boolean, default: false },
    nofollow: { type: Boolean, default: false },
  },
  { _id: false },
)

/**
 * Fields mixed into every content model for auditing + soft deletion.
 * Use with `schema.add(auditFields)`.
 */
export const leadAttributionFields = {
  leadSource: { type: String, default: 'website', index: true },
  landingPage: { type: String, default: '' },
  referrer: { type: String, default: '' },
  utmSource: { type: String, default: '' },
  utmMedium: { type: String, default: '' },
  utmCampaign: { type: String, default: '' },
  utmContent: { type: String, default: '' },
  utmTerm: { type: String, default: '' },
}

export const auditFields = {
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}

export const STATUS_VALUES = ['draft', 'published', 'archived'] as const
export type ContentStatus = (typeof STATUS_VALUES)[number]

export const statusField = {
  status: {
    type: String,
    enum: STATUS_VALUES,
    default: 'draft',
    index: true,
  },
}

/** Simple slugify helper shared across models + actions. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
