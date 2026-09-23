import { Schema, model, models, type InferSchemaType } from 'mongoose'
import { seoSchema, auditFields, statusField } from '@/lib/db/shared-schema'

/* ----------------------------- Testimonial ----------------------------- */
const testimonialSchema = new Schema(
  {
    author: { type: String, required: true, trim: true },
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    avatar: { type: String, default: null },
    quote: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    ...statusField,
  },
  { timestamps: true },
)
testimonialSchema.add(auditFields)

/* -------------------------------- Client -------------------------------- */
const clientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: null },
    website: { type: String, default: '' },
    industry: { type: String, default: '' },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    ...statusField,
  },
  { timestamps: true },
)
clientSchema.add(auditFields)

/* ------------------------------ Case Study ------------------------------ */
const metricSchema = new Schema(
  { label: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false },
)
const caseStudySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    client: { type: String, default: '' },
    industry: { type: String, default: '' },
    /** Free-form service/programme type used for filtering, e.g. "Employee Shuttle". */
    serviceType: { type: String, default: '' },
    location: { type: String, default: '' },
    /** Optional short duration label, e.g. "6-month rollout". */
    duration: { type: String, default: '' },
    /** Optional headcount / fleet size figure shown in the summary. */
    fleetSize: { type: String, default: '' },
    excerpt: { type: String, default: '', maxlength: 400 },
    coverImage: { type: String, default: null },
    logo: { type: String, default: null },
    /** Structured narrative blocks. */
    challenge: { type: String, default: '' },
    solution: { type: String, default: '' },
    result: { type: String, default: '' },
    /** Optional long-form Markdown body rendered after the structured blocks. */
    body: { type: String, default: '' },
    /** Bullet lists shown in the challenge / solution sidebars. */
    services: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    metrics: { type: [metricSchema], default: [] },
    gallery: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    /** Inline client quote (kept on the document so it can differ per study). */
    testimonialQuote: { type: String, default: '' },
    testimonialAuthor: { type: String, default: '' },
    testimonialRole: { type: String, default: '' },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    seo: { type: seoSchema, default: () => ({}) },
    ...statusField,
  },
  { timestamps: true },
)
caseStudySchema.add(auditFields)

/* ------------------------------ Team Member ----------------------------- */
const teamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '' },
    bio: { type: String, default: '' },
    photo: { type: String, default: null },
    linkedin: { type: String, default: '' },
    order: { type: Number, default: 0 },
    ...statusField,
  },
  { timestamps: true },
)
teamMemberSchema.add(auditFields)

/* ------------------------------- Resource -------------------------------- */
const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: { type: String, default: 'guide', enum: ['guide', 'report', 'playbook', 'checklist', 'case-study'] },
    excerpt: { type: String, default: '', maxlength: 500 },
    coverImage: { type: String, default: null },
    downloadUrl: { type: String, required: true },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    gated: { type: Boolean, default: true },
    seo: { type: seoSchema, default: () => ({}) },
    ...statusField,
  },
  { timestamps: true },
)
resourceSchema.add(auditFields)

/* --------------------------------- FAQ ---------------------------------- */
const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'general', index: true },
    order: { type: Number, default: 0 },
    ...statusField,
  },
  { timestamps: true },
)
faqSchema.add(auditFields)

export type TestimonialDoc = InferSchemaType<typeof testimonialSchema>
export type ClientDoc = InferSchemaType<typeof clientSchema>
export type CaseStudyDoc = InferSchemaType<typeof caseStudySchema>
export type TeamMemberDoc = InferSchemaType<typeof teamMemberSchema>
export type FaqDoc = InferSchemaType<typeof faqSchema>
export type ResourceDoc = InferSchemaType<typeof resourceSchema>

export const Testimonial =
  models.Testimonial || model('Testimonial', testimonialSchema)
export const Client = models.Client || model('Client', clientSchema)
export const CaseStudy = models.CaseStudy || model('CaseStudy', caseStudySchema)
export const TeamMember = models.TeamMember || model('TeamMember', teamMemberSchema)
export const Faq = models.Faq || model('Faq', faqSchema)
export const Resource = models.Resource || model('Resource', resourceSchema)
