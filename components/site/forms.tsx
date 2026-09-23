"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import {
  submitContact,
  submitQuote,
  submitApplication,
  submitDemo,
  submitNewsletter,
  submitPartner,
} from "@/app/actions/forms"
import type { FormState } from "@/lib/validation/forms"
import { Field, TextArea, SelectField, Honeypot } from "@/components/site/form-fields"
import { FileUploadField } from "@/components/site/file-upload-field"
import { LeadAttributionFields } from "@/components/site/lead-attribution-fields"

const initial: FormState = { ok: false }

// Shared native-validation presets that mirror the server-side Zod schema so
// the browser blocks obviously invalid input before the request is ever sent.
const PHONE_PATTERN = "[+()\\-\\s\\d]{6,30}"
const PHONE_TITLE = "Enter a valid phone number (digits, spaces, and + ( ) - only)"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {pending ? "Sending..." : label}
    </button>
  )
}

function SuccessCard({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-10 text-center">
      <CheckCircle2 className="h-12 w-12 text-accent" aria-hidden="true" />
      <h3 className="font-display text-xl font-semibold text-foreground">Message sent</h3>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{message}</p>
    </div>
  )
}

function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

/* -------------------------------- Contact -------------------------------- */
export function ContactForm() {
  const [state, action] = useActionState(submitContact, initial)
  if (state.ok) return <SuccessCard message={state.message} />
  return (
    <form action={action} className="relative flex flex-col gap-5">
      <Honeypot />
      <LeadAttributionFields />
      <ErrorBanner message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          name="name"
          required
          minLength={2}
          maxLength={120}
          error={state.errors?.name}
          autoComplete="name"
        />
        <Field label="Work email" name="email" type="email" required maxLength={160} error={state.errors?.email} autoComplete="email" />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          pattern={PHONE_PATTERN}
          title={PHONE_TITLE}
          error={state.errors?.phone}
          autoComplete="tel"
        />
        <Field label="Company" name="company" maxLength={160} error={state.errors?.company} autoComplete="organization" />
      </div>
      <Field label="Subject" name="subject" maxLength={160} error={state.errors?.subject} />
      <TextArea
        label="How can we help?"
        name="message"
        required
        minLength={10}
        maxLength={4000}
        title="Please add a few more details (at least 10 characters)"
        error={state.errors?.message}
      />
      <div>
        <SubmitButton label="Send message" />
      </div>
    </form>
  )
}

/* --------------------------------- Quote --------------------------------- */
export function QuoteForm({ services }: { services: string[] }) {
  const [state, action] = useActionState(submitQuote, initial)
  if (state.ok) return <SuccessCard message={state.message} />
  return (
    <form action={action} className="relative flex flex-col gap-5">
      <Honeypot />
      <LeadAttributionFields />
      <ErrorBanner message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" required minLength={2} maxLength={120} error={state.errors?.name} autoComplete="name" />
        <Field
          label="Company"
          name="company"
          required
          minLength={2}
          maxLength={160}
          error={state.errors?.company}
          autoComplete="organization"
        />
        <Field label="Work email" name="email" type="email" required maxLength={160} error={state.errors?.email} autoComplete="email" />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          required
          pattern={PHONE_PATTERN}
          title={PHONE_TITLE}
          error={state.errors?.phone}
          autoComplete="tel"
        />
        <SelectField label="Service needed" name="service" options={services} error={state.errors?.service} />
        <Field label="Pickup / city" name="pickupLocation" maxLength={200} error={state.errors?.pickupLocation} />
        <Field label="Drop-off / site" name="dropoffLocation" maxLength={200} error={state.errors?.dropoffLocation} />
        <Field label="Approx. passengers" name="passengers" placeholder="e.g. 120" maxLength={40} error={state.errors?.passengers} />
        <Field label="Frequency" name="frequency" placeholder="e.g. Daily, weekdays" maxLength={80} error={state.errors?.frequency} />
      </div>
      <TextArea label="Tell us about your requirement" name="message" rows={4} maxLength={4000} error={state.errors?.message} />
      <div>
        <SubmitButton label="Request a quote" />
      </div>
    </form>
  )
}

/* ------------------------------ Book a demo ------------------------------ */
export function DemoForm() {
  const [state, action] = useActionState(submitDemo, initial)
  if (state.ok) return <SuccessCard message={state.message} />
  return (
    <form action={action} className="relative flex flex-col gap-5">
      <Honeypot />
      <LeadAttributionFields />
      <ErrorBanner message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" required minLength={2} maxLength={120} error={state.errors?.name} autoComplete="name" />
        <Field
          label="Company"
          name="company"
          required
          minLength={2}
          maxLength={160}
          error={state.errors?.company}
          autoComplete="organization"
        />
        <Field label="Work email" name="email" type="email" required maxLength={160} error={state.errors?.email} autoComplete="email" />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          required
          pattern={PHONE_PATTERN}
          title={PHONE_TITLE}
          error={state.errors?.phone}
          autoComplete="tel"
        />
        <Field label="Job title" name="jobTitle" maxLength={120} error={state.errors?.jobTitle} autoComplete="organization-title" />
        <Field label="Employees to transport" name="employeeCount" placeholder="e.g. 250" maxLength={40} error={state.errors?.employeeCount} />
        <Field label="Preferred date" name="preferredDate" type="date" error={state.errors?.preferredDate} />
        <SelectField
          label="Preferred time (GST)"
          name="preferredTime"
          options={["09:00 – 10:00", "10:00 – 11:00", "11:00 – 12:00", "13:00 – 14:00", "14:00 – 15:00", "15:00 – 16:00"]}
          error={state.errors?.preferredTime}
        />
      </div>
      <TextArea label="What would you like to see?" name="goals" rows={3} maxLength={2000} error={state.errors?.goals} />
      <div>
        <SubmitButton label="Book my demo" />
      </div>
    </form>
  )
}

/* ----------------------------- Newsletter ------------------------------- */
export function NewsletterForm({ source = "footer", compact = false }: { source?: string; compact?: boolean }) {
  const [state, action] = useActionState(submitNewsletter, initial)
  if (state.ok) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-accent">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {state.message}
      </p>
    )
  }
  return (
    <form action={action} className="relative flex flex-col gap-2">
      <Honeypot />
      <input type="hidden" name="source" value={source} />
      <div className={compact ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-2"}>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          maxLength={160}
          placeholder="Your work email"
          autoComplete="email"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 invalid:border-destructive/60"
        />
        <SubmitButton label="Subscribe" />
      </div>
      {state.message ? <p className="text-xs font-medium text-destructive">{state.message}</p> : null}
    </form>
  )
}

/* ---------------------------- Fleet Partner ------------------------------ */
const VEHICLE_TYPES = [
  "Buses (30+ seats)",
  "Minibuses / Coasters",
  "Vans",
  "SUVs",
  "Sedans",
  "Luxury / Executive",
]

export function PartnerForm() {
  const [state, action] = useActionState(submitPartner, initial)
  if (state.ok) return <SuccessCard message={state.message} />
  return (
    <form action={action} className="relative flex flex-col gap-5">
      {/* Partner-specific honeypot (this form has a real "website" field). */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website_hp">Leave blank</label>
        <input id="website_hp" name="website_hp" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <LeadAttributionFields />
      <ErrorBanner message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Company name"
          name="companyName"
          required
          minLength={2}
          maxLength={160}
          error={state.errors?.companyName}
          autoComplete="organization"
        />
        <Field
          label="Contact name"
          name="contactName"
          required
          minLength={2}
          maxLength={120}
          error={state.errors?.contactName}
          autoComplete="name"
        />
        <Field label="Work email" name="email" type="email" required maxLength={160} error={state.errors?.email} autoComplete="email" />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          required
          pattern={PHONE_PATTERN}
          title={PHONE_TITLE}
          error={state.errors?.phone}
          autoComplete="tel"
        />
        <Field label="Base city / emirate" name="city" placeholder="e.g. Dubai" maxLength={120} error={state.errors?.city} />
        <Field label="Fleet size" name="fleetSize" placeholder="e.g. 25 vehicles" maxLength={40} error={state.errors?.fleetSize} />
        <Field label="Operating since" name="operatingSince" placeholder="e.g. 2016" maxLength={40} error={state.errors?.operatingSince} />
        <SelectField
          label="Valid transport permits / licence?"
          name="hasPermits"
          options={["yes", "no"]}
          error={state.errors?.hasPermits}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Vehicle types in your fleet</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {VEHICLE_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:border-accent/50"
            >
              <input
                type="checkbox"
                name="vehicleTypes"
                value={type}
                className="h-4 w-4 rounded border-border text-accent accent-accent focus:ring-accent"
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Company website (optional)"
        name="website"
        type="url"
        maxLength={500}
        placeholder="https://..."
        title="Enter a valid link starting with http:// or https://"
        error={state.errors?.website}
      />
      <FileUploadField
        label="Company logo (optional)"
        name="logoUrl"
        kind="logo"
        error={state.errors?.logoUrl}
        help="Upload your logo as PNG, JPG, WEBP or SVG (max 4MB)."
      />
      <TextArea label="Anything else we should know?" name="message" rows={3} maxLength={2000} error={state.errors?.message} />
      <div>
        <SubmitButton label="Submit partner application" />
      </div>
    </form>
  )
}

/* ------------------------------ Application ------------------------------ */
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-border pt-5 first:border-0 first:pt-0">
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</legend>
      {children}
    </fieldset>
  )
}

export function ApplicationForm({
  position,
  careerSlug,
  screeningQuestions = [],
}: {
  position?: string
  careerSlug?: string
  screeningQuestions?: string[]
}) {
  const [state, action] = useActionState(submitApplication, initial)
  if (state.ok) return <SuccessCard message={state.message} />
  return (
    <form action={action} className="relative flex flex-col gap-6">
      <Honeypot />
      <LeadAttributionFields />
      <ErrorBanner message={state.message} />
      {position ? <input type="hidden" name="position" value={position} /> : null}
      {careerSlug ? <input type="hidden" name="careerSlug" value={careerSlug} /> : null}

      <FormSection title="About you">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="name" required minLength={2} maxLength={120} error={state.errors?.name} autoComplete="name" />
          <Field label="Email" name="email" type="email" required maxLength={160} error={state.errors?.email} autoComplete="email" />
          <Field
            label="Phone"
            name="phone"
            type="tel"
            required
            pattern={PHONE_PATTERN}
            title={PHONE_TITLE}
            error={state.errors?.phone}
            autoComplete="tel"
          />
          <Field
            label="Current location"
            name="currentLocation"
            placeholder="e.g. Dubai, UAE"
            maxLength={160}
            error={state.errors?.currentLocation}
            autoComplete="address-level2"
          />
          {!position ? <Field label="Position" name="position" maxLength={160} error={state.errors?.position} /> : null}
        </div>
      </FormSection>

      <FormSection title="Experience & current role">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Total experience (years)"
            name="totalExperience"
            type="number"
            min="0"
            max="60"
            placeholder="e.g. 4"
            error={state.errors?.totalExperience}
          />
          <Field label="Current / last company" name="currentCompany" maxLength={160} error={state.errors?.currentCompany} autoComplete="organization" />
          <Field
            label="Current designation"
            name="currentDesignation"
            maxLength={160}
            error={state.errors?.currentDesignation}
            autoComplete="organization-title"
          />
          <Field label="Notice period" name="noticePeriod" placeholder="e.g. Immediate, 30 days" maxLength={60} error={state.errors?.noticePeriod} />
          <Field label="Current CTC (optional)" name="currentCtc" placeholder="e.g. AED 8,000 / mo" maxLength={60} error={state.errors?.currentCtc} />
          <Field label="Expected CTC (optional)" name="expectedCtc" placeholder="e.g. AED 10,000 / mo" maxLength={60} error={state.errors?.expectedCtc} />
        </div>
      </FormSection>

      <FormSection title="Documents & links">
        <FileUploadField
          label="Resume / CV"
          name="resumeUrl"
          kind="resume"
          required
          error={state.errors?.resumeUrl}
          help="Upload your CV as a PDF, DOC or DOCX (max 10MB)."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="LinkedIn (optional)"
            name="linkedin"
            type="url"
            maxLength={600}
            placeholder="https://linkedin.com/in/…"
            title="Enter a valid link starting with http:// or https://"
            error={state.errors?.linkedin}
          />
          <Field
            label="Portfolio / website (optional)"
            name="portfolio"
            type="url"
            maxLength={600}
            placeholder="https://…"
            title="Enter a valid link starting with http:// or https://"
            error={state.errors?.portfolio}
          />
        </div>
        <TextArea label="Cover note (optional)" name="coverLetter" rows={4} maxLength={4000} error={state.errors?.coverLetter} />
      </FormSection>

      {screeningQuestions.length > 0 ? (
        <FormSection title="A few questions from the hiring team">
          {screeningQuestions.map((q, i) => (
            <TextArea
              key={i}
              label={q}
              name={`screening_${i}`}
              rows={3}
              required
              maxLength={2000}
              error={state.errors?.[`screening_${i}`]}
            />
          ))}
        </FormSection>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-0.5 h-4 w-4 rounded border-border text-accent accent-accent focus:ring-accent"
          />
          <span>
            I consent to VIARIDEZ storing and processing my personal data for recruitment purposes, in line with the{" "}
            <a href="/privacy" className="text-accent underline" target="_blank" rel="noreferrer">
              privacy policy
            </a>
            .
          </span>
        </label>
        {state.errors?.consent ? (
          <p className="text-xs font-medium text-destructive">{state.errors.consent}</p>
        ) : null}
      </div>

      <div>
        <SubmitButton label="Submit application" />
      </div>
    </form>
  )
}
