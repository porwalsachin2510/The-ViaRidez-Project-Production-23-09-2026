"use client"

import { useMemo, useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  TrendingDown,
  Users,
  Bus,
} from "lucide-react"
import { submitQuote } from "@/app/actions/forms"
import type { FormState } from "@/lib/validation/forms"
import { estimate, formatAED, type TripType } from "@/lib/pricing"
import { Field, TextArea, SelectField, Honeypot } from "@/components/site/form-fields"
import { cn } from "@/lib/utils"
import { LeadAttributionFields } from "@/components/site/lead-attribution-fields"

const initial: FormState = { ok: false }

const STEPS = ["Your route", "Your estimate", "Your details"] as const

function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label="Progress">
      {STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo"
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                state === "done" && "bg-accent text-accent-foreground",
                state === "active" && "bg-primary text-primary-foreground",
                state === "todo" && "bg-muted text-muted-foreground",
              )}
            >
              {state === "done" ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-medium sm:block",
                state === "active" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="ml-1 h-px flex-1 bg-border" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {pending ? "Sending..." : "Get my tailored proposal"}
    </button>
  )
}

function SuccessCard({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-10 text-center">
      <CheckCircle2 className="h-12 w-12 text-accent" aria-hidden="true" />
      <h3 className="font-display text-xl font-semibold text-foreground">Request received</h3>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{message}</p>
    </div>
  )
}

const FREQUENCIES = [
  { label: "5 days / week (weekdays)", days: 5 },
  { label: "6 days / week", days: 6 },
  { label: "7 days / week", days: 7 },
  { label: "3 days / week", days: 3 },
  { label: "Ad-hoc / event", days: 2 },
]

export function QuoteWizard({ services }: { services: string[] }) {
  const [state, action] = useActionState(submitQuote, initial)
  const [step, setStep] = useState(0)

  // Today (YYYY-MM-DD) so the date picker cannot select a past start date.
  const today = new Date().toISOString().slice(0, 10)

  // Estimator inputs (drive the live preview on step 2).
  const [service, setService] = useState(services[0] ?? "")
  const [passengers, setPassengers] = useState("50")
  const [distanceKm, setDistanceKm] = useState("25")
  const [tripType, setTripType] = useState<TripType>("round-trip")
  const [frequency, setFrequency] = useState(FREQUENCIES[0].label)

  const daysPerWeek = FREQUENCIES.find((f) => f.label === frequency)?.days ?? 5

  const result = useMemo(
    () =>
      estimate({
        employees: Number(passengers) || 0,
        distanceKm: Number(distanceKm) || 0,
        daysPerWeek,
        tripType,
      }),
    [passengers, distanceKm, daysPerWeek, tripType],
  )

  if (state.ok) return <SuccessCard message={state.message} />

  return (
    <form action={action} className="relative flex flex-col">
      <Honeypot />
      <LeadAttributionFields />
      <Stepper current={step} />

      {state.message ? (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </div>
      ) : null}

      {/* Hidden inputs persist all values across steps into a single submission. */}
      <input type="hidden" name="service" value={service} />
      <input type="hidden" name="passengers" value={passengers} />
      <input type="hidden" name="distanceKm" value={distanceKm} />
      <input type="hidden" name="tripType" value={tripType} />
      <input type="hidden" name="frequency" value={frequency} />
      <input type="hidden" name="estimateLow" value={result.monthlyLow} />
      <input type="hidden" name="estimateHigh" value={result.monthlyHigh} />
      <input type="hidden" name="estimatedSavings" value={result.monthlySavings} />

      {/* ---------------------------- Step 1 --------------------------- */}
      <div className={cn("flex flex-col gap-5", step !== 0 && "hidden")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="wiz-service">
              Service needed
            </label>
            <select
              id="wiz-service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <Field label="Pickup / city" name="pickupLocation" placeholder="e.g. Al Barsha, Dubai" />
          <Field label="Drop-off / site" name="dropoffLocation" placeholder="e.g. JAFZA, Jebel Ali" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="wiz-passengers">
              Approx. passengers
            </label>
            <input
              id="wiz-passengers"
              type="number"
              min={1}
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="wiz-distance">
              One-way distance (km)
            </label>
            <input
              id="wiz-distance"
              type="number"
              min={1}
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="wiz-frequency">
              Frequency
            </label>
            <select
              id="wiz-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.label} value={f.label}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Trip type</span>
            <div className="flex gap-2">
              {(["round-trip", "one-way"] as TripType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTripType(t)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-colors",
                    tripType === t
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-accent/50",
                  )}
                >
                  {t.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            See my estimate
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ---------------------------- Step 2 --------------------------- */}
      <div className={cn("flex flex-col gap-6", step !== 1 && "hidden")}>
        <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-primary to-[oklch(0.30_0.07_245)] p-6 text-primary-foreground sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Indicative monthly cost
          </p>
          <p className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            {formatAED(result.monthlyLow)}
            <span className="mx-2 text-primary-foreground/50">–</span>
            {formatAED(result.monthlyHigh)}
          </p>
          <p className="mt-1 text-sm text-primary-foreground/70">
            ≈ {formatAED(result.perEmployeeMonthly)} per employee / month
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-primary-foreground/10 p-4">
              <Bus className="h-5 w-5 text-accent" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold">
                {result.plan.count}× {result.plan.label}
              </p>
              <p className="text-xs text-primary-foreground/60">{result.plan.seats} seats each</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 p-4">
              <Users className="h-5 w-5 text-accent" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold">{passengers} passengers</p>
              <p className="text-xs text-primary-foreground/60">
                {result.legsPerDay === 2 ? "Round trip" : "One-way"} · {result.daysPerMonth} days/mo
              </p>
            </div>
            <div className="rounded-xl bg-accent/15 p-4">
              <TrendingDown className="h-5 w-5 text-accent" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold">Save ~{result.savingsPct}%</p>
              <p className="text-xs text-primary-foreground/60">
                {formatAED(result.monthlySavings)}/mo vs ride-hailing
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          This is an indicative estimate for planning only, based on the details you entered and
          typical UAE operating costs. Your tailored proposal — with exact routing, vehicle mix and
          SLAs — is prepared by a ViaRidez mobility specialist.
        </p>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(0)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Adjust
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ---------------------------- Step 3 --------------------------- */}
      <div className={cn("flex flex-col gap-5", step !== 2 && "hidden")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="name" required error={state.errors?.name} autoComplete="name" />
          <Field label="Company" name="company" required error={state.errors?.company} autoComplete="organization" />
          <Field label="Work email" name="email" type="email" required error={state.errors?.email} autoComplete="email" />
          <Field label="Phone" name="phone" required error={state.errors?.phone} autoComplete="tel" />
          <Field label="Preferred start date" name="startDate" type="date" min={today} error={state.errors?.startDate} />
        </div>
        <TextArea label="Anything else we should know?" name="message" rows={3} error={state.errors?.message} />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
          <SubmitButton />
        </div>
      </div>
    </form>
  )
}
