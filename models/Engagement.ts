import { Schema, model, models, type InferSchemaType } from 'mongoose'
import { seoSchema, auditFields, leadAttributionFields, statusField } from '@/lib/db/shared-schema'

/* -------------------------------- Career -------------------------------- */
const careerSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    department: { type: String, default: '' },
    category: { type: String, default: '' },
    location: { type: String, default: '' },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    workMode: {
      type: String,
      enum: ['on-site', 'hybrid', 'remote'],
      default: 'on-site',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      default: 'mid',
    },
    experienceMin: { type: Number, default: 0 },
    experienceMax: { type: Number, default: 0 },
    openings: { type: Number, default: 1 },
    // Salary — stored as a range with currency/period; hidden unless disclosed.
    salaryDisclosed: { type: Boolean, default: false },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    salaryCurrency: { type: String, default: 'AED' },
    salaryPeriod: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    skills: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    // Custom screening questions the applicant answers on the apply form.
    screeningQuestions: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    excerpt: { type: String, default: '', maxlength: 400 },
    description: { type: String, default: '' },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    closingDate: { type: Date, default: null },
    seo: { type: seoSchema, default: () => ({}) },
    ...statusField,
  },
  { timestamps: true },
)
careerSchema.add(auditFields)

/* ------------------------------ Application ----------------------------- */
const applicationSchema = new Schema(
  {
    career: { type: Schema.Types.ObjectId, ref: 'Career', default: null, index: true },
    careerSlug: { type: String, default: '', index: true },
    positionTitle: { type: String, default: '' },
    fullName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, default: '' },
    // Experience & current role
    totalExperience: { type: Number, default: 0 },
    currentCompany: { type: String, default: '' },
    currentDesignation: { type: String, default: '' },
    // Compensation & availability
    currentCtc: { type: String, default: '' },
    expectedCtc: { type: String, default: '' },
    noticePeriod: { type: String, default: '' },
    // Location & links
    currentLocation: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    resumeFileName: { type: String, default: '' },
    // Per-job screening answers captured at submission.
    screeningAnswers: {
      type: [{ question: { type: String, default: '' }, answer: { type: String, default: '' } }],
      default: [],
    },
    consent: { type: Boolean, default: false },
    source: { type: String, default: 'careers-site' },
    stage: {
      type: String,
      enum: ['new', 'reviewing', 'shortlisted', 'interview', 'offer', 'rejected', 'hired'],
      default: 'new',
      index: true,
    },
    rating: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
)
applicationSchema.add(auditFields)
// One application per candidate per role (enforced in the action; index speeds lookups).
applicationSchema.index({ careerSlug: 1, email: 1 })

/* --------------------------- Contact Enquiry ---------------------------- */
const contactEnquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    source: { type: String, default: 'contact-form' },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved', 'spam'],
      default: 'new',
      index: true,
    },
    notes: { type: String, default: '' },
    syncedToCrm: { type: Boolean, default: false },
  },
  { timestamps: true },
)
contactEnquirySchema.add(leadAttributionFields)
contactEnquirySchema.add(auditFields)

/* ---------------------------- Quote Request ----------------------------- */
const quoteRequestSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    serviceType: { type: String, default: '' },
    employeeCount: { type: String, default: '' },
    pickupLocation: { type: String, default: '' },
    dropoffLocation: { type: String, default: '' },
    startDate: { type: String, default: '' },
    details: { type: String, default: '' },
    // Structured inputs from the quote wizard / cost estimator.
    frequency: { type: String, default: '' },
    tripType: { type: String, default: '' },
    distanceKm: { type: Number, default: 0 },
    // Indicative estimate captured at submission time (marketing figure).
    estimateLow: { type: Number, default: 0 },
    estimateHigh: { type: Number, default: 0 },
    estimatedSavings: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['new', 'contacted', 'quoted', 'won', 'lost'],
      default: 'new',
      index: true,
    },
    notes: { type: String, default: '' },
    syncedToCrm: { type: Boolean, default: false },
  },
  { timestamps: true },
)
quoteRequestSchema.add(leadAttributionFields)
quoteRequestSchema.add(auditFields)

/* ---------------------------- Demo Booking ------------------------------ */
const demoBookingSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, default: '' },
    company: { type: String, required: true },
    jobTitle: { type: String, default: '' },
    employeeCount: { type: String, default: '' },
    preferredDate: { type: String, default: '' },
    preferredTime: { type: String, default: '' },
    timezone: { type: String, default: 'Asia/Dubai' },
    goals: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'scheduled', 'completed', 'no-show', 'cancelled'],
      default: 'new',
      index: true,
    },
    notes: { type: String, default: '' },
    syncedToCrm: { type: Boolean, default: false },
  },
  { timestamps: true },
)
demoBookingSchema.add(leadAttributionFields)
demoBookingSchema.add(auditFields)

/* ---------------------------- Newsletter -------------------------------- */
const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, default: '' },
    source: { type: String, default: 'footer' },
    status: {
      type: String,
      enum: ['subscribed', 'unsubscribed'],
      default: 'subscribed',
      index: true,
    },
    syncedToCrm: { type: Boolean, default: false },
    // Random, per-subscriber secret used to build one-click unsubscribe links.
    // Stored (not derived from the email) so a leaked link can be rotated and
    // so the token can't be forged from a known address.
    unsubscribeToken: { type: String, default: '', index: true },
    confirmationSentAt: { type: Date, default: null },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

/* ------------------------------ Resource lead --------------------------- */
const resourceLeadSchema = new Schema(
  {
    resourceId: { type: Schema.Types.ObjectId, ref: 'Resource', required: true, index: true },
    resourceTitle: { type: String, required: true },
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    name: { type: String, default: '' },
    company: { type: String, default: '' },
    consent: { type: Boolean, default: true },
    syncedToCrm: { type: Boolean, default: false },
  },
  { timestamps: true },
)
resourceLeadSchema.add(auditFields)

/* --------------------------- Partner Application ------------------------ */
const partnerApplicationSchema = new Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    fleetSize: { type: String, default: '' },
    vehicleTypes: { type: [String], default: [] },
    operatingSince: { type: String, default: '' },
    hasPermits: { type: Boolean, default: false },
    website: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'approved', 'rejected', 'onboarded'],
      default: 'new',
      index: true,
    },
    notes: { type: String, default: '' },
    syncedToCrm: { type: Boolean, default: false },
  },
  { timestamps: true },
)
partnerApplicationSchema.add(leadAttributionFields)
partnerApplicationSchema.add(auditFields)

/* -------------------------------- Media --------------------------------- */
const mediaSchema = new Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    secureUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    format: { type: String, default: '' },
    resourceType: { type: String, default: 'image' },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    bytes: { type: Number, default: 0 },
    alt: { type: String, default: '' },
    folder: { type: String, default: 'viaridez' },
  },
  { timestamps: true },
)
mediaSchema.add(auditFields)

export type CareerDoc = InferSchemaType<typeof careerSchema>
export type ApplicationDoc = InferSchemaType<typeof applicationSchema>
export type ContactEnquiryDoc = InferSchemaType<typeof contactEnquirySchema>
export type QuoteRequestDoc = InferSchemaType<typeof quoteRequestSchema>
export type DemoBookingDoc = InferSchemaType<typeof demoBookingSchema>
export type SubscriberDoc = InferSchemaType<typeof subscriberSchema>
export type PartnerApplicationDoc = InferSchemaType<typeof partnerApplicationSchema>
export type ResourceLeadDoc = InferSchemaType<typeof resourceLeadSchema>
export type MediaDoc = InferSchemaType<typeof mediaSchema>

export const Career = models.Career || model('Career', careerSchema)
export const Application =
  models.Application || model('Application', applicationSchema)
export const ContactEnquiry =
  models.ContactEnquiry || model('ContactEnquiry', contactEnquirySchema)
export const QuoteRequest =
  models.QuoteRequest || model('QuoteRequest', quoteRequestSchema)
export const DemoBooking =
  models.DemoBooking || model('DemoBooking', demoBookingSchema)
export const Subscriber =
  models.Subscriber || model('Subscriber', subscriberSchema)
export const PartnerApplication =
  models.PartnerApplication ||
  model('PartnerApplication', partnerApplicationSchema)
export const ResourceLead =
  models.ResourceLead || model('ResourceLead', resourceLeadSchema)
export const Media = models.Media || model('Media', mediaSchema)
