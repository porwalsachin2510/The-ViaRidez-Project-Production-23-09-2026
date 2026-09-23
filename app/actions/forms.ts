"use server"

import { connectToDatabase } from "@/lib/db/mongoose"
import {
  ContactEnquiry,
  QuoteRequest,
  Application,
  Career,
  DemoBooking,
  Subscriber,
  PartnerApplication,
  IdempotencyKey,
  AdminNotification,
} from "@/models"
import { getSiteSettings } from "@/lib/data/queries"
import { fingerprint } from "@/lib/security/request"
import { sendEmail } from "@/lib/email"
import {
  teamNotificationEmail,
  contactConfirmationEmail,
  quoteConfirmationEmail,
  demoConfirmationEmail,
  newsletterWelcomeEmail,
  partnerConfirmationEmail,
  applicationConfirmationEmail,
  type DetailRow,
} from "@/lib/email/templates"
import {
  emailFooter,
  teamInbox,
  sendCustomerEmail,
  newUnsubscribeToken,
  unsubscribeUrl,
} from "@/lib/email/notify"
import { syncLeadToCrm } from "@/lib/crm"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { requestMetadata } from "@/lib/security/request"
import {
  contactSchema,
  quoteSchema,
  applicationSchema,
  demoSchema,
  newsletterSchema,
  partnerSchema,
  type FormState,
} from "@/lib/validation/forms"

function fieldErrors(error: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === "string" && !out[key]) out[key] = issue.message
  }
  return out
}

/**
 * Internal lead alert. `adminPath` deep-links the team straight to the record
 * in the CMS so triage is one click from the inbox.
 */
async function notifyTeam(
  subject: string,
  title: string,
  rows: DetailRow[],
  replyTo?: string,
  adminPath?: string,
) {
  const to = await teamInbox()
  if (!to) return
  const footer = await emailFooter()
  await sendEmail({
    to,
    subject,
    html: teamNotificationEmail({ title, rows, adminPath, footer }),
    replyTo,
  })
}

import { publishNotification, type NotificationKind } from "@/lib/notifications/bus"

/**
 * Persist AND live-broadcast an admin notification. Delegates to the shared
 * notification bus so every new lead pushes to open admin panels over SSE in
 * real time, while remaining durable in MongoDB.
 */
async function createAdminNotification(kind: NotificationKind, title: string, detail: string, href: string) {
  await publishNotification(kind, title, detail, href)
}

function leadAttribution(raw: Record<string, unknown>) {
  const get = (key: string) => String(raw[key] ?? '').slice(0, 300)
  return {
    leadSource: get('leadSource') || 'website',
    landingPage: get('landingPage'),
    referrer: get('referrer'),
    utmSource: get('utmSource'),
    utmMedium: get('utmMedium'),
    utmCampaign: get('utmCampaign'),
    utmContent: get('utmContent'),
    utmTerm: get('utmTerm'),
  }
}

const toNum = (v?: string) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

async function protectSubmission(scope: string, email: string, raw: Record<string, string>) {
  await connectToDatabase()
  const meta = await requestMetadata()
  const ipLimit = await enforceRateLimit(`form:${scope}:ip:${meta.ipHash}`, { limit: 8, windowMs: 60 * 60 * 1000 })
  const emailLimit = await enforceRateLimit(`form:${scope}:email:${email.toLowerCase()}`, { limit: 3, windowMs: 60 * 60 * 1000 })
  if (!ipLimit.allowed || !emailLimit.allowed) {
    return { ok: false as const, message: "Too many requests. Please try again later." }
  }
  const bounded = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, String(value).slice(0, 2000)]))
  const idempotency = bounded.idempotencyKey || fingerprint(scope, { email: email.toLowerCase(), ...bounded })
  let claimed: unknown = null
  try {
    claimed = await IdempotencyKey.findOneAndUpdate(
      { scope, key: idempotency },
      { $setOnInsert: { scope, key: idempotency, fingerprint: fingerprint(scope, bounded), status: "processing", expiresAt: new Date(Date.now() + 10 * 60 * 1000) } },
      { upsert: true, returnDocument: "before" },
    ).lean()
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return { ok: false as const, message: "This submission has already been received." }
    }
    return { ok: false as const, message: "Unable to process the submission right now. Please try again." }
  }
  if (claimed) return { ok: false as const, message: "This submission has already been received." }
  return { ok: true as const, raw: bounded }
}

/* -------------------------------- Contact -------------------------------- */
export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) }
  if (parsed.data.website) return { ok: true, message: "Thank you." } // honeypot hit
  const protection = await protectSubmission("contact", parsed.data.email, raw)
  if (!protection.ok) return protection

  const d = parsed.data
  try {
    await connectToDatabase()
    const synced = await syncLeadToCrm({
      type: "contact",
      name: d.name,
      email: d.email,
      phone: d.phone,
      company: d.company,
      message: d.message,
      meta: { subject: d.subject },
    })
    await ContactEnquiry.create({
      ...leadAttribution(Object.fromEntries(formData.entries())),
      name: d.name,
      email: d.email,
      phone: d.phone || "",
      company: d.company || "",
      subject: d.subject || "General enquiry",
      message: d.message,
      source: "contact-form",
      syncedToCrm: synced,
    })
    await createAdminNotification("contact", "New contact enquiry", `${d.name} · ${d.company || d.email}`, "/admin/enquiries")
    await notifyTeam(
      `New enquiry from ${d.name}`,
      "New contact enquiry",
      [
        { label: "Name", value: d.name },
        { label: "Email", value: d.email },
        { label: "Phone", value: d.phone },
        { label: "Company", value: d.company },
        { label: "Subject", value: d.subject },
        { label: "Message", value: d.message, long: true },
      ],
      d.email,
      "/admin/enquiries",
    )

    // Customer-facing acknowledgement with a copy of what they sent.
    await sendCustomerEmail({
      to: d.email,
      subject: "We've received your enquiry — ViaRidez",
      html: contactConfirmationEmail({
        name: d.name,
        subject: d.subject,
        message: d.message,
        footer: await emailFooter(),
      }),
    })

    return { ok: true, message: "Thanks — we've emailed you a confirmation and our team will be in touch within one business day." }
  } catch (err) {
    console.log("[v0] submitContact error:", err instanceof Error ? err.message : err)
    return { ok: false, message: "Something went wrong. Please try again or email us directly." }
  }
}

/* --------------------------------- Quote --------------------------------- */
export async function submitQuote(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = quoteSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) }
  if (parsed.data.website) return { ok: true, message: "Thank you." }
  const protection = await protectSubmission("quote", parsed.data.email, raw)
  if (!protection.ok) return protection

  const d = parsed.data
  try {
    await connectToDatabase()
    const synced = await syncLeadToCrm({
      type: "quote",
      name: d.name,
      email: d.email,
      phone: d.phone,
      company: d.company,
      message: d.message,
      meta: {
        service: d.service,
        pickupLocation: d.pickupLocation,
        dropoffLocation: d.dropoffLocation,
        passengers: d.passengers,
        frequency: d.frequency,
        tripType: d.tripType,
        distanceKm: d.distanceKm,
        startDate: d.startDate,
        estimateLow: d.estimateLow,
        estimateHigh: d.estimateHigh,
        estimatedSavings: d.estimatedSavings,
      },
    })
    await QuoteRequest.create({
      ...leadAttribution(Object.fromEntries(formData.entries())),
      name: d.name,
      email: d.email,
      phone: d.phone,
      company: d.company,
      serviceType: d.service || "",
      employeeCount: d.passengers || "",
      pickupLocation: d.pickupLocation || "",
      dropoffLocation: d.dropoffLocation || "",
      startDate: d.startDate || "",
      frequency: d.frequency || "",
      tripType: d.tripType || "",
      distanceKm: toNum(d.distanceKm),
      estimateLow: toNum(d.estimateLow),
      estimateHigh: toNum(d.estimateHigh),
      estimatedSavings: toNum(d.estimatedSavings),
      details: d.message || "",
      syncedToCrm: synced,
    })
    await createAdminNotification("quote", "New quote request", `${d.company} · ${d.email}`, "/admin/quotes")
    await notifyTeam(
      `New quote request from ${d.company}`,
      "New quote request",
      [
        { label: "Name", value: d.name },
        { label: "Company", value: d.company },
        { label: "Email", value: d.email },
        { label: "Phone", value: d.phone },
        { label: "Service", value: d.service },
        { label: "Route", value: [d.pickupLocation, d.dropoffLocation].filter(Boolean).join(" → ") },
        { label: "Passengers", value: d.passengers },
        { label: "Frequency", value: d.frequency },
        { label: "Trip type", value: d.tripType },
        { label: "Distance (km)", value: d.distanceKm },
        { label: "Start date", value: d.startDate },
        {
          label: "Indicative estimate",
          value:
            d.estimateLow && d.estimateHigh
              ? `AED ${Number(d.estimateLow).toLocaleString()} – ${Number(d.estimateHigh).toLocaleString()} / month`
              : "",
        },
        { label: "Details", value: d.message, long: true },
      ],
      d.email,
      "/admin/quotes",
    )

    const estimate =
      d.estimateLow && d.estimateHigh
        ? `AED ${Number(d.estimateLow).toLocaleString()} – ${Number(d.estimateHigh).toLocaleString()} / month`
        : ""

    await sendCustomerEmail({
      to: d.email,
      subject: "Your ViaRidez quote request is confirmed",
      html: quoteConfirmationEmail({
        name: d.name,
        company: d.company,
        service: d.service,
        route: [d.pickupLocation, d.dropoffLocation].filter(Boolean).join(" → "),
        passengers: d.passengers,
        startDate: d.startDate,
        estimate,
        footer: await emailFooter(),
      }),
    })

    return { ok: true, message: "Your request is in — check your inbox for a confirmation. A mobility specialist will prepare a tailored proposal for you." }
  } catch (err) {
    console.log("[v0] submitQuote error:", err instanceof Error ? err.message : err)
    return { ok: false, message: "Something went wrong. Please try again or email us directly." }
  }
}

/* ---------------------------- Demo Booking ------------------------------- */
export async function submitDemo(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = demoSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) }
  if (parsed.data.website) return { ok: true, message: "Thank you." }
  const protection = await protectSubmission("demo", parsed.data.email, raw)
  if (!protection.ok) return protection

  const d = parsed.data
  try {
    await connectToDatabase()
    const synced = await syncLeadToCrm({
      type: "demo",
      name: d.name,
      email: d.email,
      phone: d.phone,
      company: d.company,
      message: d.goals,
      meta: {
        jobTitle: d.jobTitle,
        employeeCount: d.employeeCount,
        preferredDate: d.preferredDate,
        preferredTime: d.preferredTime,
      },
    })
    await DemoBooking.create({
      ...leadAttribution(Object.fromEntries(formData.entries())),
      name: d.name,
      email: d.email,
      phone: d.phone,
      company: d.company,
      jobTitle: d.jobTitle || "",
      employeeCount: d.employeeCount || "",
      preferredDate: d.preferredDate || "",
      preferredTime: d.preferredTime || "",
      goals: d.goals || "",
      syncedToCrm: synced,
    })
    await createAdminNotification("demo", "New demo booking", `${d.company} · ${d.email}`, "/admin/demos")
    await notifyTeam(
      `New demo request from ${d.company}`,
      "New demo booking",
      [
        { label: "Name", value: d.name },
        { label: "Company", value: d.company },
        { label: "Job title", value: d.jobTitle },
        { label: "Email", value: d.email },
        { label: "Phone", value: d.phone },
        { label: "Employees", value: d.employeeCount },
        { label: "Preferred date", value: d.preferredDate },
        { label: "Preferred time", value: d.preferredTime },
        { label: "Goals", value: d.goals, long: true },
      ],
      d.email,
      "/admin/demos",
    )

    await sendCustomerEmail({
      to: d.email,
      subject: "Your ViaRidez platform demo — request received",
      html: demoConfirmationEmail({
        name: d.name,
        company: d.company,
        preferredDate: d.preferredDate,
        preferredTime: d.preferredTime,
        footer: await emailFooter(),
      }),
    })

    return { ok: true, message: "Thanks — we've emailed you a confirmation and will confirm your demo slot shortly." }
  } catch (err) {
    console.log("[v0] submitDemo error:", err instanceof Error ? err.message : err)
    return { ok: false, message: "Something went wrong. Please try again or email us directly." }
  }
}

/* ---------------------------- Newsletter --------------------------------- */
export async function submitNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = newsletterSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) }
  if (parsed.data.website) return { ok: true, message: "Thank you." }
  const protection = await protectSubmission("newsletter", parsed.data.email, raw)
  if (!protection.ok) return protection

  const d = parsed.data
  try {
    await connectToDatabase()
    const existing = await Subscriber.findOne({ email: d.email })
    if (existing) {
      const wasUnsubscribed = existing.status === "unsubscribed"
      // Backfill the token for rows created before one-click unsubscribe existed,
      // otherwise their welcome email would carry a dead link.
      if (!existing.unsubscribeToken) existing.unsubscribeToken = newUnsubscribeToken()
      if (wasUnsubscribed) {
        existing.status = "subscribed"
        existing.unsubscribedAt = null
      }

      // Only re-send the welcome when they are genuinely rejoining; a duplicate
      // submit by an active subscriber should stay silent.
      if (wasUnsubscribed) {
        existing.confirmationSentAt = new Date()
        await existing.save()
        await sendCustomerEmail({
          to: d.email,
          subject: "Welcome back to ViaRidez Insights",
          html: newsletterWelcomeEmail({
            name: existing.name || d.name,
            footer: await emailFooter({
              unsubscribeUrl: unsubscribeUrl(d.email, existing.unsubscribeToken),
            }),
          }),
        })
      } else {
        await existing.save()
      }
      return { ok: true, message: "You're on the list — thanks for subscribing." }
    }

    const synced = await syncLeadToCrm({
      type: "newsletter",
      email: d.email,
      name: d.name,
      meta: { source: d.source || "footer" },
    })
    const token = newUnsubscribeToken()
    await Subscriber.create({
      email: d.email,
      name: d.name || "",
      source: d.source || "footer",
      syncedToCrm: synced,
      unsubscribeToken: token,
      confirmationSentAt: new Date(),
    })
    await createAdminNotification(
      "subscriber",
      "New newsletter subscriber",
      `${d.name ? `${d.name} · ` : ""}${d.email}`,
      "/admin/subscribers",
    )

    await sendCustomerEmail({
      to: d.email,
      subject: "Welcome to ViaRidez Insights",
      html: newsletterWelcomeEmail({
        name: d.name,
        footer: await emailFooter({
          unsubscribeUrl: unsubscribeUrl(d.email, token),
        }),
      }),
    })

    return { ok: true, message: "You're on the list — check your inbox for a welcome email." }
  } catch (err) {
    console.log("[v0] submitNewsletter error:", err instanceof Error ? err.message : err)
    return { ok: false, message: "Something went wrong. Please try again." }
  }
}

/* ------------------------------ Application ------------------------------ */
export async function submitApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = applicationSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) }
  if (parsed.data.website) return { ok: true, message: "Thank you." }

  const d = parsed.data
  try {
    await connectToDatabase()

    // Resolve the vacancy (if this is a role-specific application) so we can
    // link the record, enforce the closing date and pull screening questions.
    const role = d.careerSlug
      ? await Career.findOne({ slug: d.careerSlug, isDeleted: false, status: "published" }).lean<{
          _id: unknown
          title?: string
          closingDate?: Date | null
          screeningQuestions?: string[]
        }>()
      : null

    if (d.careerSlug && !role) {
      return { ok: false, message: "This role is no longer accepting applications." }
    }
    if (role?.closingDate && new Date(role.closingDate).getTime() < Date.now()) {
      return { ok: false, message: "Applications for this role have closed." }
    }

    // Validate + collect answers to any per-job screening questions.
    const questions = Array.isArray(role?.screeningQuestions) ? role!.screeningQuestions : []
    const screeningAnswers: { question: string; answer: string }[] = []
    const errors: Record<string, string> = {}
    questions.forEach((question, i) => {
      const answer = String(formData.get(`screening_${i}`) || "").trim().slice(0, 2000)
      if (!answer) errors[`screening_${i}`] = "Please answer this question"
      screeningAnswers.push({ question, answer })
    })
    if (Object.keys(errors).length) return { ok: false, errors }

    if (d.consent !== "on") {
      return { ok: false, errors: { consent: "Please agree to the processing of your data to continue." } }
    }

    const protection = await protectSubmission("application", d.email, raw)
    if (!protection.ok) return protection

    // One application per candidate per role.
    if (d.careerSlug) {
      const existing = await Application.findOne({ careerSlug: d.careerSlug, email: d.email }).lean()
      if (existing) {
        return { ok: false, message: "You've already applied for this role. We have your application on file." }
      }
    }

    const position = role?.title || d.position || "General application"
    await Application.create({
      career: role?._id ?? null,
      careerSlug: d.careerSlug || "",
      positionTitle: position,
      fullName: d.name,
      email: d.email,
      phone: d.phone,
      totalExperience: Number(d.totalExperience) || 0,
      currentCompany: d.currentCompany || "",
      currentDesignation: d.currentDesignation || "",
      currentCtc: d.currentCtc || "",
      expectedCtc: d.expectedCtc || "",
      noticePeriod: d.noticePeriod || "",
      currentLocation: d.currentLocation || "",
      linkedin: d.linkedin || "",
      portfolio: d.portfolio || "",
      coverLetter: d.coverLetter || "",
      resumeUrl: d.resumeUrl || "",
      resumeFileName: d.resumeUrlFileName || "",
      screeningAnswers,
      consent: true,
      source: d.careerSlug ? "careers-role" : "careers-general",
    })
    await createAdminNotification("application", "New job application", `${d.name} · ${position}`, "/admin/applications")

    await notifyTeam(
      `New application: ${position}`,
      "New job application",
      [
        { label: "Name", value: d.name },
        { label: "Email", value: d.email },
        { label: "Phone", value: d.phone },
        { label: "Position", value: position },
        { label: "Experience", value: d.totalExperience ? `${d.totalExperience} yrs` : "" },
        { label: "Current company", value: d.currentCompany },
        { label: "Current designation", value: d.currentDesignation },
        { label: "Current CTC", value: d.currentCtc },
        { label: "Expected CTC", value: d.expectedCtc },
        { label: "Notice period", value: d.noticePeriod },
        { label: "Location", value: d.currentLocation },
        { label: "LinkedIn", value: d.linkedin },
        { label: "Portfolio", value: d.portfolio },
        { label: "Resume", value: d.resumeUrl },
        ...screeningAnswers.map((s) => ({ label: s.question, value: s.answer, long: true })),
        { label: "Cover letter", value: d.coverLetter, long: true },
      ],
      d.email,
      "/admin/applications",
    )

    // Auto confirmation email to the applicant.
    await sendCustomerEmail({
      to: d.email,
      subject: `We've received your application — ${position}`,
      html: applicationConfirmationEmail({
        name: d.name,
        position,
        footer: await emailFooter(),
      }),
    })

    return { ok: true, message: "Application received. We've emailed you a confirmation — our talent team will review and reach out if there's a match." }
  } catch (err) {
    console.log("[v0] submitApplication error:", err instanceof Error ? err.message : err)
    return { ok: false, message: "Something went wrong. Please try again." }
  }
}

/* --------------------------- Fleet Partner ------------------------------- */
export async function submitPartner(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = partnerSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) }
  if (parsed.data.website_hp) return { ok: true, message: "Thank you." } // honeypot hit
  const protection = await protectSubmission("partner", parsed.data.email, raw)
  if (!protection.ok) return protection

  const d = parsed.data
  // Vehicle types is a multi-value checkbox group — read every selected value.
  const vehicleTypes = formData.getAll("vehicleTypes").map((v) => String(v)).filter(Boolean)
  const hasPermits = d.hasPermits === "yes" || d.hasPermits === "true"

  try {
    await connectToDatabase()
    const synced = await syncLeadToCrm({
      type: "partner",
      name: d.contactName,
      email: d.email,
      phone: d.phone,
      company: d.companyName,
      message: d.message,
      meta: {
        city: d.city,
        fleetSize: d.fleetSize,
        vehicleTypes,
        operatingSince: d.operatingSince,
        hasPermits,
        website: d.website,
      },
    })
    await PartnerApplication.create({
      ...leadAttribution(Object.fromEntries(formData.entries())),
      companyName: d.companyName,
      contactName: d.contactName,
      email: d.email,
      phone: d.phone || "",
      city: d.city || "",
      fleetSize: d.fleetSize || "",
      vehicleTypes,
      operatingSince: d.operatingSince || "",
      hasPermits,
      website: d.website || "",
      logoUrl: d.logoUrl || "",
      message: d.message || "",
      syncedToCrm: synced,
    })
    await createAdminNotification("partner", "New fleet partner application", `${d.companyName} · ${d.contactName}`, "/admin/partners")
    await notifyTeam(
      `New fleet partner enquiry from ${d.companyName}`,
      "New fleet partner application",
      [
        { label: "Company", value: d.companyName },
        { label: "Contact", value: d.contactName },
        { label: "Email", value: d.email },
        { label: "Phone", value: d.phone },
        { label: "City", value: d.city },
        { label: "Fleet size", value: d.fleetSize },
        { label: "Vehicle types", value: vehicleTypes.join(", ") },
        { label: "Operating since", value: d.operatingSince },
        { label: "Permits/licence", value: hasPermits ? "Yes" : "Not confirmed" },
        { label: "Website", value: d.website },
        { label: "Logo", value: d.logoUrl },
        { label: "Message", value: d.message, long: true },
      ],
      d.email,
      "/admin/partners",
    )

    await sendCustomerEmail({
      to: d.email,
      subject: "Your ViaRidez fleet partner application",
      html: partnerConfirmationEmail({
        contactName: d.contactName,
        companyName: d.companyName,
        city: d.city,
        fleetSize: d.fleetSize,
        vehicleTypes: vehicleTypes.join(", "),
        footer: await emailFooter(),
      }),
    })

    return {
      ok: true,
      message: "Thanks for your interest in partnering with ViaRidez. We've emailed you a confirmation and our fleet team will be in touch.",
    }
  } catch (err) {
    console.log("[v0] submitPartner error:", err instanceof Error ? err.message : err)
    return { ok: false, message: "Something went wrong. Please try again or email us directly." }
  }
}
