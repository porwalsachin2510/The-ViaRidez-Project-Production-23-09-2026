import { z } from "zod"

/** Shared field helpers */
const name = z.string().trim().min(2, "Please enter your full name").max(120)
const email = z.string().trim().toLowerCase().email("Enter a valid email address")
const phone = z
  .string()
  .trim()
  .min(6, "Enter a valid phone number")
  .max(30)
  .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number")

export const contactSchema = z.object({
  name,
  email,
  phone: phone.optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please add a few more details").max(4000),
  // Honeypot — must stay empty (bots fill it).
  website: z.string().max(0).optional(),
})

export const quoteSchema = z.object({
  name,
  email,
  phone,
  company: z.string().trim().min(2, "Enter your company name").max(160),
  service: z.string().trim().max(160).optional().or(z.literal("")),
  pickupLocation: z.string().trim().max(200).optional().or(z.literal("")),
  dropoffLocation: z.string().trim().max(200).optional().or(z.literal("")),
  passengers: z.string().trim().max(40).optional().or(z.literal("")),
  frequency: z.string().trim().max(80).optional().or(z.literal("")),
  tripType: z.string().trim().max(40).optional().or(z.literal("")),
  distanceKm: z.string().trim().max(12).optional().or(z.literal("")),
  startDate: z.string().trim().max(60).optional().or(z.literal("")),
  // Indicative estimate carried from the wizard (numbers as strings in FormData).
  estimateLow: z.string().trim().max(20).optional().or(z.literal("")),
  estimateHigh: z.string().trim().max(20).optional().or(z.literal("")),
  estimatedSavings: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  website: z.string().max(0).optional(),
})

export const demoSchema = z.object({
  name,
  email,
  phone,
  company: z.string().trim().min(2, "Enter your company name").max(160),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  employeeCount: z.string().trim().max(40).optional().or(z.literal("")),
  preferredDate: z.string().trim().max(40).optional().or(z.literal("")),
  preferredTime: z.string().trim().max(40).optional().or(z.literal("")),
  goals: z.string().trim().max(2000).optional().or(z.literal("")),
  website: z.string().max(0).optional(),
})

export const newsletterSchema = z.object({
  email,
  name: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.string().trim().max(60).optional().or(z.literal("")),
  website: z.string().max(0).optional(),
})

export const resourceLeadSchema = z.object({
  resourceId: z.string().min(1),
  email,
  name: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  consent: z.string().optional(),
})

export const partnerSchema = z.object({
  companyName: z.string().trim().min(2, "Enter your company name").max(160),
  contactName: name,
  email,
  phone,
  city: z.string().trim().max(120).optional().or(z.literal("")),
  fleetSize: z.string().trim().max(40).optional().or(z.literal("")),
  operatingSince: z.string().trim().max(40).optional().or(z.literal("")),
  hasPermits: z.string().trim().max(10).optional().or(z.literal("")),
  website: z.string().trim().url("Enter a valid link").max(500).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  // Company logo — uploaded to Cloudinary by <FileUploadField>, so this is the
  // hosted asset URL (not a pasted link). The sibling *FileName carries the
  // original file name.
  logoUrl: z.string().trim().url().max(600).optional().or(z.literal("")),
  logoUrlFileName: z.string().trim().max(300).optional().or(z.literal("")),
  website_hp: z.string().max(0).optional(),
})

const optionalUrl = z.string().trim().url("Enter a valid link").max(600).optional().or(z.literal(""))

export const applicationSchema = z.object({
  name,
  email,
  phone,
  position: z.string().trim().max(160).optional().or(z.literal("")),
  // Links the application to a specific vacancy (empty for general applications).
  careerSlug: z.string().trim().max(200).optional().or(z.literal("")),
  // Experience & current role
  totalExperience: z.string().trim().max(6).optional().or(z.literal("")),
  currentCompany: z.string().trim().max(160).optional().or(z.literal("")),
  currentDesignation: z.string().trim().max(160).optional().or(z.literal("")),
  // Compensation & availability
  currentCtc: z.string().trim().max(60).optional().or(z.literal("")),
  expectedCtc: z.string().trim().max(60).optional().or(z.literal("")),
  noticePeriod: z.string().trim().max(60).optional().or(z.literal("")),
  // Location & links
  currentLocation: z.string().trim().max(160).optional().or(z.literal("")),
  linkedin: optionalUrl,
  portfolio: optionalUrl,
  coverLetter: z.string().trim().max(4000).optional().or(z.literal("")),
  // Resume/CV — uploaded to Cloudinary by <FileUploadField> (raw resource), so
  // this is the hosted file URL. resumeUrlFileName carries the original name.
  resumeUrl: z.string().trim().url("Please attach your CV").max(600).optional().or(z.literal("")),
  resumeUrlFileName: z.string().trim().max(300).optional().or(z.literal("")),
  // Data-processing consent — must be "on" (validated in the action).
  consent: z.string().optional(),
  website: z.string().max(0).optional(),
})

export const blogCommentSchema = z.object({
  name,
  email,
  body: z.string().trim().min(2, "Please write a comment").max(4000),
  // Honeypot — must stay empty (bots fill it).
  website: z.string().max(0).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type QuoteInput = z.infer<typeof quoteSchema>
export type ApplicationInput = z.infer<typeof applicationSchema>
export type DemoInput = z.infer<typeof demoSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
export type PartnerInput = z.infer<typeof partnerSchema>

export type FormState = {
  ok: boolean
  message?: string
  errors?: Record<string, string>
}
