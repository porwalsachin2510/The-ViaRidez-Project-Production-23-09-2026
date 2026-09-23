'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react'
import { Container } from '@/components/site/primitives'
import type { SiteSettingsData, CmsPageData } from '@/lib/data/queries'

const trustPoints = [
  { icon: ShieldCheck, label: 'RTA-compliant fleet' },
  { icon: Clock, label: '99.7% on-time record' },
  { icon: MapPin, label: 'Live GPS tracking' },
]

/**
 * Ambient animated "route lines" that flow across the hero — takes the glowing
 * telemetry-line visual language from the inspiration without copying it. Pure
 * SVG + framer-motion, disabled under prefers-reduced-motion.
 */
function RouteLines() {
  const reduce = useReducedMotion()
  const paths = [
    'M-50 220 C 300 120, 620 320, 1000 180 S 1550 120, 1550 240',
    'M-50 360 C 260 300, 560 460, 940 340 S 1500 300, 1550 380',
    'M-50 120 C 320 60, 700 200, 1080 80 S 1500 40, 1550 140',
  ]
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1500 500"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} stroke="var(--color-accent)" strokeOpacity={0.12} strokeWidth={1.5} />
          {!reduce && (
            <motion.path
              d={d}
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="6 340"
              initial={{ strokeDashoffset: 0, opacity: 0 }}
              animate={{ strokeDashoffset: -1400, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 5 + i * 1.4,
                delay: i * 1.1,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ filter: 'drop-shadow(0 0 6px var(--color-accent))' }}
            />
          )}
        </g>
      ))}
    </svg>
  )
}

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Hero({ settings, page }: { settings: SiteSettingsData; page?: CmsPageData | null }) {
  const { ctaPrimary, ctaSecondary } = settings

  const eyebrow = page?.heroEyebrow || 'Corporate Mobility · Dubai & UAE'
  const title = page?.heroTitle || 'Enterprise transportation that keeps your workforce moving.'
  const description =
    page?.heroSubtitle ||
    settings.tagline ||
    'Managed employee shuttles, free-zone staff transport and executive chauffeur programmes — engineered for reliability, safety and scale.'
  const heroImage = page?.heroImage || '/images/hero-fleet.png'

  return (
    <section className="relative isolate overflow-hidden bg-primary">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={heroImage}
          alt="ViaRidez corporate shuttle and executive sedan heading toward the Dubai skyline"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-primary/40" />
        <RouteLines />
      </div>

      <Container className="relative flex min-h-[92vh] flex-col justify-center pt-28 pb-20">
        <div className="max-w-3xl">
          <motion.div variants={fade} custom={0} initial="hidden" animate="show">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              {eyebrow}
            </span>
          </motion.div>

          <motion.h1
            variants={fade}
            custom={1}
            initial="hidden"
            animate="show"
            className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance text-primary-foreground sm:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>

          <motion.p
            variants={fade}
            custom={2}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-primary-foreground/80"
          >
            {description}
          </motion.p>

          <motion.div
            variants={fade}
            custom={3}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            {ctaPrimary?.href && (
              <Link
                href={ctaPrimary.href}
                target={ctaPrimary.external ? '_blank' : undefined}
                rel={ctaPrimary.external ? 'noopener noreferrer' : undefined}
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:brightness-110"
              >
                {ctaPrimary.label || 'Get a Quote'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            {ctaSecondary?.href && (
              <Link
                href={ctaSecondary.href}
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                {ctaSecondary.label || 'Explore Services'}
              </Link>
            )}
          </motion.div>

          {/* Trust points */}
          <motion.ul
            variants={fade}
            custom={4}
            initial="hidden"
            animate="show"
            className="mt-12 flex flex-wrap gap-x-8 gap-y-4"
          >
            {trustPoints.map((tp) => (
              <li key={tp.label} className="flex items-center gap-2.5 text-sm font-medium text-primary-foreground/85">
                <tp.icon className="h-5 w-5 text-accent" aria-hidden="true" />
                {tp.label}
              </li>
            ))}
          </motion.ul>
        </div>
      </Container>
    </section>
  )
}
