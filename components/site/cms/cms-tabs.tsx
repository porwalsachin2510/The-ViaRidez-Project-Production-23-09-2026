'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Icon } from '@/lib/icons'
import { cn } from '@/lib/utils'

export type CmsTab = {
  icon?: string
  label?: string
  heading?: string
  body?: string
  image?: string
  imageAlt?: string
  bullets?: string[]
  points?: { title?: string; body?: string }[]
}

/**
 * Data-driven tabbed showcase used by the `tabs` CMS block. Reproduces the two
 * bespoke Technology-page designs so admins can edit every tab's content:
 *  - variant "light":  platform-module layout (checklist + screenshot)
 *  - variant "dark":   persona layout on navy (point cards)
 */
export function CmsTabs({
  tabs,
  variant = 'light',
}: {
  tabs: CmsTab[]
  variant?: 'light' | 'dark'
}) {
  const [active, setActive] = useState(0)
  if (!tabs.length) return null
  const current = tabs[Math.min(active, tabs.length - 1)]

  if (variant === 'dark') {
    return (
      <div className="mt-12">
        <div
          role="tablist"
          aria-label="Tabs"
          className="mx-auto flex max-w-xl gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 p-1.5"
        >
          {tabs.map((t, i) => {
            const selected = i === active
            const label = t.label ?? ''
            return (
              <button
                key={`${label}-${i}`}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(i)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs font-semibold transition-colors sm:text-sm',
                  selected
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-primary-foreground/70 hover:text-primary-foreground',
                )}
              >
                {t.icon ? <Icon name={t.icon} className="h-4 w-4" /> : null}
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>

        <div role="tabpanel" className="mt-10">
          {current.heading ? (
            <h3 className="text-center font-display text-2xl font-bold tracking-tight text-primary-foreground text-balance sm:text-3xl">
              {current.heading}
            </h3>
          ) : null}
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {(current.points ?? []).map((pt, i) => (
              <div
                key={`${pt.title}-${i}`}
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

  // Light variant — platform modules
  return (
    <div>
      <div
        role="tablist"
        aria-label="Tabs"
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
      >
        {tabs.map((t, i) => {
          const selected = i === active
          return (
            <button
              key={`${t.label}-${i}`}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className={cn(
                'inline-flex shrink-0 snap-start items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors',
                selected
                  ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground',
              )}
            >
              {t.icon ? (
                <Icon name={t.icon} className={cn('h-4 w-4', selected ? 'text-accent' : '')} />
              ) : null}
              {t.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="order-2 lg:order-1">
          {current.heading ? (
            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
              {current.heading}
            </h3>
          ) : null}
          {current.body ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              {current.body}
            </p>
          ) : null}
          <ul className="mt-7 space-y-3.5">
            {(current.bullets ?? []).map((f, i) => (
              <li key={`${f}-${i}`} className="flex items-start gap-3">
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
              alt={current.imageAlt || current.heading || ''}
              className="aspect-[16/11] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
