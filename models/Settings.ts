import { Schema, model, models, type InferSchemaType } from 'mongoose'
import { seoSchema, auditFields, statusField } from '@/lib/db/shared-schema'

/* --------------------------------- Page --------------------------------- */
const pageSectionSchema = new Schema(
  {
    type: { type: String, required: true },
    /** Small uppercase kicker shown above the heading. */
    eyebrow: { type: String, default: '' },
    heading: { type: String, default: '' },
    subheading: { type: String, default: '' },
    body: { type: String, default: '' },
    image: { type: String, default: null },
    imageAlt: { type: String, default: '' },
    /** Heading alignment: 'left' | 'center'. */
    align: { type: String, default: '' },
    /** Section background: 'default' | 'secondary' | 'primary'. */
    background: { type: String, default: '' },
    /** Free-form layout variant hint used by some block renderers. */
    variant: { type: String, default: '' },
    /** Optional inline CTA rendered by supporting blocks. */
    ctaLabel: { type: String, default: '' },
    ctaHref: { type: String, default: '' },
    /** Repeatable rows — shape depends on the block `type`. */
    items: { type: Schema.Types.Mixed, default: [] },
  },
  { _id: false },
)

const pageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    heroEyebrow: { type: String, default: '' },
    heroTitle: { type: String, default: '' },
    heroSubtitle: { type: String, default: '' },
    heroImage: { type: String, default: null },
    body: { type: String, default: '' },
    sections: { type: [pageSectionSchema], default: [] },
    seo: { type: seoSchema, default: () => ({}) },
    ...statusField,
  },
  { timestamps: true },
)
pageSchema.add(auditFields)

/* ------------------------------- Redirect ------------------------------- */
const redirectSchema = new Schema(
  {
    source: { type: String, required: true, unique: true, index: true },
    destination: { type: String, required: true },
    permanent: { type: Boolean, default: true },
  },
  { timestamps: true },
)
redirectSchema.add(auditFields)

/* ------------------------------ Audit Log ------------------------------- */
const auditLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: '' },
    action: { type: String, required: true },
    entity: { type: String, default: '' },
    entityId: { type: String, default: '' },
    meta: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
  },
  { timestamps: true },
)

/* ----------------------------- Site Settings ---------------------------- */
const navItemSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    children: {
      type: [{ label: String, href: String, description: String, icon: String }],
      default: [],
    },
  },
  { _id: false },
)

const ctaSchema = new Schema(
  {
    label: { type: String, default: '' },
    href: { type: String, default: '#' },
    external: { type: Boolean, default: true },
  },
  { _id: false },
)

const siteSettingsSchema = new Schema(
  {
    key: { type: String, default: 'global', unique: true, index: true },
    // Company info
    companyName: { type: String, default: 'ViaRidez' },
    tagline: { type: String, default: '' },
    logoLight: { type: String, default: '/brand/viaridez-logo.png' },
    logoDark: { type: String, default: '/brand/viaridez-logo-light.png' },
    // Contact
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    address: { type: String, default: '' },
    // Public-facing office hours shown on the Contact page (free text so admins
    // can phrase it however they like, e.g. "Sun–Fri, 8:00–18:00 GST").
    businessHours: { type: String, default: 'Sun–Fri, 8:00–18:00 GST' },
    // Navigation & footer
    navigation: { type: [navItemSchema], default: [] },
    footerColumns: { type: Schema.Types.Mixed, default: [] },
    // Trust stats (CMS-editable; swap in independently verified figures)
    stats: {
      type: [{ value: { type: String, default: '' }, label: { type: String, default: '' } }],
      default: [],
    },
    // CTAs (repointable to future booking app without rebuild)
    ctaPrimary: { type: ctaSchema, default: () => ({}) },
    ctaSecondary: { type: ctaSchema, default: () => ({}) },
    ctaClientLogin: { type: ctaSchema, default: () => ({}) },
    // Social
    social: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    // Integrations
    analytics: {
      gaId: { type: String, default: '' },
      gtmId: { type: String, default: '' },
    },
    // Advanced SEO configuration (site-wide, CMS-managed)
    seo: {
      // Title template used for the browser tab, e.g. "%s | ViaRidez".
      titleTemplate: { type: String, default: '%s | ViaRidez' },
      // Default keywords merged into every page.
      defaultKeywords: { type: [String], default: [] },
      // Default social share image used when a page has none.
      defaultOgImage: { type: String, default: '' },
      // Twitter / X attribution handles (include the leading @).
      twitterSite: { type: String, default: '' },
      twitterCreator: { type: String, default: '' },
      // Search-engine ownership verification tokens.
      verification: {
        google: { type: String, default: '' },
        bing: { type: String, default: '' },
        yandex: { type: String, default: '' },
        pinterest: { type: String, default: '' },
      },
      // Organization / LocalBusiness structured-data source of truth.
      organization: {
        legalName: { type: String, default: '' },
        foundingDate: { type: String, default: '' },
        streetAddress: { type: String, default: '' },
        addressLocality: { type: String, default: '' },
        addressRegion: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        addressCountry: { type: String, default: 'AE' },
        latitude: { type: String, default: '' },
        longitude: { type: String, default: '' },
        priceRange: { type: String, default: '$$' },
        openingHours: { type: String, default: 'Mo-Su 00:00-23:59' },
      },
      // Crawl directives surfaced through robots.txt.
      robots: {
        blockAiBots: { type: Boolean, default: false },
        extraDisallow: { type: [String], default: [] },
      },
    },
    chat: {
      enabled: { type: Boolean, default: true },
      provider: { type: String, default: 'whatsapp' },
      number: { type: String, default: '' },
      message: { type: String, default: 'Hello ViaRidez, I would like to learn more.' },
      consentRequired: { type: Boolean, default: true },
    },
    crm: {
      provider: { type: String, default: '' },
      webhookUrl: { type: String, default: '' },
      apiKey: { type: String, default: '', select: false },
    },
    // Default SEO
    defaultSeo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
)

export type PageDoc = InferSchemaType<typeof pageSchema>
export type RedirectDoc = InferSchemaType<typeof redirectSchema>
export type AuditLogDoc = InferSchemaType<typeof auditLogSchema>
export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>

export const Page = models.Page || model('Page', pageSchema)
export const Redirect = models.Redirect || model('Redirect', redirectSchema)
export const AuditLog = models.AuditLog || model('AuditLog', auditLogSchema)
export const SiteSettings =
  models.SiteSettings || model('SiteSettings', siteSettingsSchema)
