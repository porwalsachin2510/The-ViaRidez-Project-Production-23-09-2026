import { Schema, model, models, type InferSchemaType } from 'mongoose'
import { seoSchema, auditFields, statusField } from '@/lib/db/shared-schema'

const blogCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    ...statusField,
  },
  { timestamps: true },
)
blogCategorySchema.add(auditFields)

const blogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: '', maxlength: 400 },
    coverImage: { type: String, default: null },
    body: { type: String, default: '' },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
      default: null,
      index: true,
    },
    tags: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    // Public byline (independent of the CMS user who authored the record).
    authorName: { type: String, default: '' },
    authorRole: { type: String, default: '' },
    authorAvatar: { type: String, default: null },
    readingTime: { type: Number, default: 3 },
    publishedAt: { type: Date, default: null, index: true },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    // Total "claps" (Medium-style appreciation) across all readers.
    claps: { type: Number, default: 0 },
    seo: { type: seoSchema, default: () => ({}) },
    ...statusField,
  },
  { timestamps: true },
)
blogSchema.add(auditFields)

/* ----------------------------- Blog comments ---------------------------- */
/**
 * Reader comments on articles. Public visitors submit name/email/body; nothing
 * is shown on the site until an admin approves it (moderation-first), which
 * keeps a no-account marketing blog safe from spam and abuse.
 */
const blogCommentSchema = new Schema(
  {
    blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    blogSlug: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    // Hashed IP for abuse tracing without storing raw PII.
    ipHash: { type: String, default: '' },
  },
  { timestamps: true },
)

/* ------------------------------ Blog claps ----------------------------- */
/**
 * Per-visitor clap ledger (Medium-style appreciation). We cap each anonymous
 * visitor at 50 claps per article and keep the running total on the Blog doc
 * (`claps`). The unique {blogSlug, ipHash} index makes the upsert idempotent so
 * a visitor's count can only ever move up to the cap — never double-counted.
 */
const blogClapSchema = new Schema(
  {
    blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    blogSlug: { type: String, required: true },
    ipHash: { type: String, required: true },
    count: { type: Number, default: 0, min: 0, max: 50 },
  },
  { timestamps: true },
)
blogClapSchema.index({ blogSlug: 1, ipHash: 1 }, { unique: true })

/* ------------------------------ Blog views ----------------------------- */
/**
 * De-duplicated view ledger. One document per {blogSlug, ipHash, day} means a
 * refresh or repeat visit within the same day counts once, so the `views`
 * counter on the Blog doc reflects real unique daily reads rather than raw hits.
 */
const blogViewSchema = new Schema(
  {
    blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    blogSlug: { type: String, required: true },
    ipHash: { type: String, required: true },
    day: { type: String, required: true },
  },
  { timestamps: true },
)
blogViewSchema.index({ blogSlug: 1, ipHash: 1, day: 1 }, { unique: true })

export type BlogCategoryDoc = InferSchemaType<typeof blogCategorySchema>
export type BlogDoc = InferSchemaType<typeof blogSchema>
export type BlogCommentDoc = InferSchemaType<typeof blogCommentSchema>
export type BlogClapDoc = InferSchemaType<typeof blogClapSchema>
export type BlogViewDoc = InferSchemaType<typeof blogViewSchema>

export const BlogCategory =
  models.BlogCategory || model('BlogCategory', blogCategorySchema)
export const Blog = models.Blog || model('Blog', blogSchema)
export const BlogComment =
  models.BlogComment || model('BlogComment', blogCommentSchema)
export const BlogClap = models.BlogClap || model('BlogClap', blogClapSchema)
export const BlogView = models.BlogView || model('BlogView', blogViewSchema)
