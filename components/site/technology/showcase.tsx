'use client'

import { useState } from 'react'
import {
  CalendarClock,
  MapPinned,
  Video,
  LineChart,
  Building2,
  UserRound,
  Bus,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Platform modules — image-backed tabbed feature showcase                   */
/* -------------------------------------------------------------------------- */

type Module = {
  id: string
  icon: LucideIcon
  tab: string
  title: string
  description: string
  features: string[]
  image: string
  imageAlt: string
}

const MODULES: Module[] = [
  {
    id: 'trips',
    icon: CalendarClock,
    tab: 'Trip management',
    title: 'Plan, schedule and run every trip from one place',
    description:
      'Build shift-based rosters, assign routes and vehicles, and manage day-to-day execution without spreadsheets or phone calls.',
    features: [
      'Route, roster and pickup-point management',
      'Shift-aware scheduling for round-the-clock operations',
      'Live trip manifests with headcount and boarding status',
      'Automated no-show and exception flagging',
    ],
    image: '/media/technology/platform-dashboard.png',
    imageAlt: 'ViaRidez fleet operations dashboard showing live trips and KPIs',
  },
  {
    id: 'tracking',
    icon: MapPinned,
    tab: 'Live tracking',
    title: 'See every vehicle, every route, in real time',
    description:
      'A live operational map gives transport teams and employees complete visibility of where each trip is and when it will arrive.',
    features: [
      'Real-time GPS tracking with accurate ETAs',
      'Geofenced pickup and drop-off zones',
      'Instant route-deviation and delay alerts',
      'Shareable live trip links for riders and admins',
    ],
    image: '/media/technology/live-tracking.png',
    imageAlt: 'Live GPS tracking map with vehicles following highlighted routes',
  },
  {
    id: 'cameras',
    icon: Video,
    tab: 'Cameras & safety',
    title: 'Safety you can actually see',
    description:
      'Onboard cameras and driver-behaviour monitoring build accountability into every journey, with playback for any incident.',
    features: [
      'Live in-vehicle and road-facing camera feeds',
      'Driver-behaviour, speed and harsh-driving alerts',
      'In-app SOS and panic workflows for riders',
      'Incident capture and timeline playback for audits',
    ],
    image: '/media/technology/onboard-cameras.png',
    imageAlt: 'Onboard camera safety monitoring with multiple live vehicle feeds',
  },
  {
    id: 'analytics',
    icon: LineChart,
    tab: 'Analytics & reporting',
    title: 'Decisions backed by operational data',
    description:
      'Turn utilisation, punctuality and cost data into clear reporting your leadership and finance teams can act on every month.',
    features: [
      'Utilisation, punctuality and cost-per-trip reporting',
      'Programme-level dashboards and trend analysis',
      'CO₂ and sustainability reporting for ESG goals',
      'Scheduled and on-demand exports (CSV / PDF)',
    ],
    image: '/media/technology/analytics.png',
    imageAlt: 'Analytics dashboard with performance, utilisation and cost charts',
  },
]

export function PlatformModules() {
  const [active, setActive] = useState(MODULES[0].id)
  const current = MODULES.find((m) => m.id === active) ?? MODULES[0]

  return (
    <div>
      {/* Tab rail */}
      <div
        role="tablist"
        aria-label="Platform modules"
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
      >
        {MODULES.map((m) => {
          const selected = m.id === active
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(m.id)}
              className={cn(
                'inline-flex shrink-0 snap-start items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors',
                selected
                  ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground',
              )}
            >
              <m.icon className={cn('h-4 w-4', selected ? 'text-accent' : '')} aria-hidden="true" />
              {m.tab}
            </button>
          )
        })}
      </div>

      {/* Active panel */}
      <div
        role="tabpanel"
        className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
      >
        <div className="order-2 lg:order-1">
          <h3 className="font-display text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
            {current.title}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
            {current.description}
          </p>
          <ul className="mt-7 space-y-3.5">
            {current.features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed text-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-primary shadow-xl ring-1 ring-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.image}
              src={current.image || '/placeholder.svg'}
              alt={current.imageAlt}
              className="aspect-[16/11] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Persona tabs — who the platform is built for                              */
/* -------------------------------------------------------------------------- */

type Persona = {
  id: string
  icon: LucideIcon
  label: string
  headline: string
  points: { title: string; body: string }[]
}

const PERSONAS: Persona[] = [
  {
    id: 'admins',
    icon: Building2,
    label: 'Transport admins',
    headline: 'Full control and visibility, without the operational burden',
    points: [
      {
        title: 'One live view of everything',
        body: 'Monitor every route, vehicle and trip in real time from a single operations dashboard.',
      },
      {
        title: 'Automated rosters & routing',
        body: 'Let the platform handle shift-based scheduling and pickup planning instead of manual coordination.',
      },
      {
        title: 'Reporting leadership trusts',
        body: 'Export utilisation, punctuality and cost reports for finance, HR and ESG stakeholders.',
      },
      {
        title: 'A single point of accountability',
        body: 'Vetted operators, audit trails and SLAs keep the whole programme accountable to you.',
      },
    ],
  },
  {
    id: 'riders',
    icon: UserRound,
    label: 'Riders & employees',
    headline: 'A calmer, more dependable daily commute',
    points: [
      {
        title: 'Know exactly when your ride arrives',
        body: 'Live ETAs and trip notifications remove the guesswork from every pickup.',
      },
      {
        title: 'Book and manage trips in-app',
        body: 'Reserve seats, view schedules and manage your commute from a simple mobile app.',
      },
      {
        title: 'Safety in your pocket',
        body: 'In-app SOS, verified drivers and monitored vehicles mean help is always one tap away.',
      },
      {
        title: 'Share feedback that matters',
        body: 'Rate trips and flag issues so service quality keeps improving on your route.',
      },
    ],
  },
  {
    id: 'operators',
    icon: Bus,
    label: 'Fleet operators',
    headline: 'Clear instructions and higher vehicle utilisation',
    points: [
      {
        title: 'Digital manifests & navigation',
        body: 'Drivers get optimised routes, stops and passenger lists directly in the driver app.',
      },
      {
        title: 'Instant dispatch updates',
        body: 'Real-time notifications for new bookings, changes and cancellations keep every trip on track.',
      },
      {
        title: 'Better utilisation',
        body: 'Smart routing keeps vehicles fuller and trips efficient, reducing empty running.',
      },
      {
        title: 'Accountable operations',
        body: 'Camera and behaviour monitoring support safer driving and cleaner compliance records.',
      },
    ],
  },
]

export function PersonaTabs() {
  const [active, setActive] = useState(PERSONAS[0].id)
  const current = PERSONAS.find((p) => p.id === active) ?? PERSONAS[0]

  return (
    <div className="mt-12">
      <div
        role="tablist"
        aria-label="Who the platform is for"
        className="mx-auto flex max-w-xl gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 p-1.5"
      >
        {PERSONAS.map((p) => {
          const selected = p.id === active
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(p.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs font-semibold transition-colors sm:text-sm',
                selected
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-primary-foreground/70 hover:text-primary-foreground',
              )}
            >
              <p.icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.label.split(' ')[0]}</span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel" className="mt-10">
        <h3 className="text-center font-display text-2xl font-bold tracking-tight text-primary-foreground text-balance sm:text-3xl">
          {current.headline}
        </h3>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {current.points.map((pt) => (
            <div
              key={pt.title}
              className="rounded-2xl border border-primary-foreground/12 bg-primary-foreground/5 p-6"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h4 className="font-display text-base font-semibold text-primary-foreground">
                    {pt.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-primary-foreground/70">
                    {pt.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
