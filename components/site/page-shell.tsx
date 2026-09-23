import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { Container, Eyebrow } from '@/components/site/primitives'
import { cn } from '@/lib/utils'

/* -------------------------------- JSON-LD --------------------------------- */

export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  )
}

/* ------------------------------ Breadcrumbs ------------------------------- */

export function Breadcrumbs({
  items,
  invert = false,
}: {
  items: { name: string; href?: string }[]
  invert?: boolean
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={cn(
          'flex flex-wrap items-center gap-1.5 text-sm',
          invert ? 'text-primary-foreground/70' : 'text-muted-foreground',
        )}
      >
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={item.name} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-accent',
                    invert && 'hover:text-accent',
                  )}
                >
                  {item.name}
                </Link>
              ) : (
                <span className={last ? (invert ? 'text-primary-foreground' : 'text-foreground') : ''} aria-current={last ? 'page' : undefined}>
                  {item.name}
                </span>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ------------------------------- Page hero -------------------------------- */

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  image,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  breadcrumbs?: { name: string; href?: string }[]
  image?: string | null
  children?: ReactNode
}) {
  const hasImage = Boolean(image)

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* Full-bleed image layer: on small screens it sits behind a strong
          scrim; on large screens it occupies the right ~48% as an editorial
          panel so there is never a dead navy void. */}
      {hasImage && (
        <div className="absolute inset-0" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image as string}
            alt=""
            className="h-full w-full object-cover object-center lg:object-right"
          />
          {/* Mobile: even dark scrim for legibility. */}
          <div className="absolute inset-0 bg-primary/70 lg:hidden" />
          {/* Desktop: solid on the left fading to reveal the photo on the right. */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-primary via-primary/90 to-primary/10 lg:block" />
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-primary/60 to-transparent lg:block" />
        </div>
      )}

      {/* Subtle accent glow + hairline grid keep the plain (no-image) variant
          from reading as an empty box. */}
      <div
        className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
        aria-hidden="true"
      />
      {!hasImage && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(var(--color-primary-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-primary-foreground)_1px,transparent_1px)] [background-size:56px_56px]"
          aria-hidden="true"
        />
      )}

      <Container className="relative py-16 sm:py-20 lg:py-28">
        <div className="max-w-2xl">
          {breadcrumbs && (
            <div className="mb-6">
              <Breadcrumbs items={breadcrumbs} invert />
            </div>
          )}
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-primary-foreground/80 text-pretty">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------- CTA section ------------------------------ */

export function CtaSection({
  cta,
  title = 'Ready to move your workforce with confidence?',
  description = "Tell us about your routes and headcount. We'll design a transport programme that fits your operation.",
}: {
  cta?: { label: string; href: string; external?: boolean }
  title?: string
  description?: string
}) {
  return (
    <section className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.30_0.07_245)] px-8 py-16 text-center sm:px-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
            aria-hidden="true"
          />
          <h2 className="relative font-display text-3xl font-bold tracking-tight text-balance text-primary-foreground sm:text-4xl">
            {title}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/75">
            {description}
          </p>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={cta?.href || '/contact'}
              target={cta?.external ? '_blank' : undefined}
              rel={cta?.external ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:brightness-110"
            >
              {cta?.label || 'Get a Quote'}
              <ArrowRight className="h-4 w-4" />
            </Link>
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
