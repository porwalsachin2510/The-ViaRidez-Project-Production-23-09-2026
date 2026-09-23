import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Quote, Star } from 'lucide-react'
import { Container, SectionHeading } from '@/components/site/primitives'
import { Reveal } from '@/components/site/reveal'
import { CountUp } from '@/components/site/count-up'
import { TestimonialAvatar } from '@/components/site/testimonial-avatar'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'
import type {
  ServiceData,
  IndustryData,
  FleetCategoryData,
  TestimonialData,
  LocationData,
  SiteSettingsData,
} from '@/lib/data/queries'

/* --------------------------------- Stats --------------------------------- */

export function StatsBar({ stats = [] }: { stats?: { value: string; label: string }[] }) {
  if (!stats.length) return null
  return (
    <section className="relative z-10 -mt-16">
      <Container>
        <div
          className={cn(
            'grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xl',
            stats.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
          )}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="group bg-card px-6 py-8 text-center transition-colors hover:bg-secondary"
            >
              <CountUp
                value={s.value}
                className="block font-display text-3xl font-bold text-primary tabular-nums sm:text-4xl"
              />
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------- Services -------------------------------- */

export function ServicesSection({ services }: { services: ServiceData[] }) {
  return (
    <section className="py-24">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="What we do"
            title="Mobility solutions built for enterprise operations"
            description="From daily staff shuttles to executive chauffeur programmes, every service is managed end-to-end with compliance, safety and reliability at its core."
          />
          <Link
            href="/services"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-accent"
          >
            View all services
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service, i) => (
            <Reveal key={service._id} delay={i * 0.05}>
              <Link
                href={`/services/${service.slug}`}
                className="group relative flex h-full min-h-[19rem] flex-col justify-end overflow-hidden rounded-2xl bg-primary shadow-sm ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                {service.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.heroImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-[oklch(0.30_0.07_245)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/10" />
                <div className="relative p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg">
                    <Icon name={service.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-primary-foreground">{service.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-primary-foreground/75">{service.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                    Learn more
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------ Industries ------------------------------- */

export function IndustriesSection({ industries }: { industries: IndustryData[] }) {
  return (
    <section className="bg-secondary py-24">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Industries we serve"
          title="Trusted across sectors that never stop moving"
          description="We tailor transport programmes to the operational realities of each industry — shift patterns, safety standards and scale."
        />
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {industries.map((ind, i) => (
            <Reveal key={ind._id} delay={i * 0.04}>
              <Link
                href={`/industries/${ind.slug}`}
                className="group flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-card px-4 py-7 text-center transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon name={ind.icon} className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium leading-snug text-foreground">{ind.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ----------------------------- How it works ------------------------------ */

const processSteps = [
  {
    icon: 'clipboard-list',
    title: 'Discovery & route mapping',
    description: 'We analyse your headcount, shift patterns, home clusters and site locations to understand exactly how your people move.',
  },
  {
    icon: 'route',
    title: 'Programme design',
    description: 'Our planners design optimised routes, pick-up points and vehicle mix — balancing commute time, comfort and cost.',
  },
  {
    icon: 'bus',
    title: 'Fleet deployment',
    description: 'Vetted drivers and RTA-compliant vehicles go live on schedule, with onboarding support for your teams and admins.',
  },
  {
    icon: 'navigation',
    title: 'Track & optimise',
    description: 'Live GPS tracking, ridership data and a dedicated desk keep every trip visible — and continuously improving.',
  },
]

export function ProcessSection() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title="From first call to fully managed programme"
          description="A structured onboarding that gets your workforce moving reliably — without the operational burden landing on your team."
        />
        <div className="relative mt-16">
          {/* Connecting line across the steps (desktop). */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
            aria-hidden="true"
          />
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <li className="relative flex flex-col">
                  <div className="flex items-center gap-4">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
                      <Icon name={step.icon} className="h-6 w-6" />
                    </div>
                    <span className="font-display text-5xl font-bold text-secondary" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}

/* -------------------------------- Fleet ---------------------------------- */

export function FleetSection({ fleet }: { fleet: FleetCategoryData[] }) {
  return (
    <section className="py-24">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Our fleet"
            title="The right vehicle for every journey"
            description="A modern, meticulously maintained fleet — from executive sedans to full-size coaches — matched to your route, headcount and comfort requirements."
          />
          <Link
            href="/fleet"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-accent"
          >
            Explore the fleet
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fleet.map((cat, i) => (
            <Reveal key={cat._id} delay={i * 0.05}>
              <Link
                href={`/fleet/${cat.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary to-[oklch(0.30_0.07_245)]">
                      <Icon name={cat.icon} className="h-10 w-10 text-primary-foreground/80" />
                    </div>
                  )}
                  {cat.capacityRange && (
                    <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
                      {cat.capacityRange}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">{cat.name}</h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">{cat.description}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* -------------------------------- Why us --------------------------------- */

const pillars = [
  {
    icon: 'shield-check',
    title: 'Safety-first operations',
    description: 'RTA-compliant vehicles, vetted professional drivers, and enforced night-shift safety protocols on every route.',
  },
  {
    icon: 'navigation',
    title: 'Live tracking & visibility',
    description: 'Real-time GPS tracking and route monitoring give your teams and admins full visibility, every trip.',
  },
  {
    icon: 'route',
    title: 'Optimised routing',
    description: 'Data-driven route planning that cuts commute times, controls cost and scales with your headcount.',
  },
  {
    icon: 'headset',
    title: 'Dedicated account support',
    description: 'A single point of contact and 24/7 operations desk keep your programme running without friction.',
  },
]

export function WhySection() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              invert
              eyebrow="Why ViaRidez"
              title="Reliability engineered into every trip"
              description="We treat corporate transport as critical infrastructure — because for your operations, it is."
            />
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {pillars.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <div className="flex h-full flex-col">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                      <Icon name={p.icon} className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold">{p.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-primary-foreground/70">{p.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-primary-foreground/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/media/sections/operations.png"
                alt="ViaRidez operations control room monitoring live fleet GPS tracking"
                className="aspect-[4/5] h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-medium backdrop-blur-sm ring-1 ring-primary-foreground/20">
                  <Icon name="navigation" className="h-4 w-4 text-accent" />
                  24/7 operations & live fleet visibility
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

/* ----------------------------- Testimonials ------------------------------ */

export function TestimonialsSection({ testimonials }: { testimonials: TestimonialData[] }) {
  if (!testimonials.length) return null
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Client voices"
          title="Operations leaders trust ViaRidez"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t._id} delay={i * 0.06}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-8">
                <Quote className="h-8 w-8 text-accent/40" aria-hidden="true" />
                <div className="mt-3 flex gap-0.5" aria-label={`${t.rating ?? 5} out of 5`}>
                  {Array.from({ length: t.rating ?? 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <TestimonialAvatar name={t.author} avatar={t.avatar} size="md" />
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">{t.author}</div>
                    {(t.role || t.company) && (
                      <div className="text-sm text-muted-foreground">
                        {[t.role, t.company].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------- Coverage -------------------------------- */

export function CoverageSection({ locations }: { locations: LocationData[] }) {
  if (!locations.length) return null
  return (
    <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
      {/* Subtle dotted grid evokes a coverage map without hand-drawing geography. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(var(--color-primary-foreground)_1px,transparent_1px)] [background-size:26px_26px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <SectionHeading
            invert
            eyebrow="Where we operate"
            title="Regional reach, local operations"
            description="Headquartered in Dubai with active operations across the UAE and key South Asian markets — one accountable partner across borders."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {locations.map((loc, i) => (
              <Reveal key={loc._id} delay={i * 0.06}>
                <Link
                  href={`/locations/${loc.slug}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-primary-foreground/12 bg-primary-foreground/5 p-5 transition-colors hover:border-accent/40 hover:bg-primary-foreground/10"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Icon name="map-pin" className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-semibold">{loc.name}</span>
                      {loc.isPrimary && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                          HQ
                        </span>
                      )}
                    </div>
                    {loc.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-primary-foreground/70">
                        {loc.excerpt}
                      </p>
                    )}
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                      View coverage
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------- CTA band -------------------------------- */

export function CtaBand({ settings }: { settings: SiteSettingsData }) {
  const { ctaPrimary, ctaSecondary } = settings
  return (
    <section className="pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center sm:px-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/sections/fleet-lineup.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/70" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
          <h2 className="relative font-display text-3xl font-bold tracking-tight text-balance text-primary-foreground sm:text-4xl">
            Ready to move your workforce with confidence?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/75">
            Tell us about your routes and headcount. We&apos;ll design a transport programme that fits your operation.
          </p>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
            {ctaPrimary?.href && (
              <Link
                href={ctaPrimary.href}
                target={ctaPrimary.external ? '_blank' : undefined}
                rel={ctaPrimary.external ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:brightness-110"
              >
                {ctaPrimary.label || 'Get a Quote'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
