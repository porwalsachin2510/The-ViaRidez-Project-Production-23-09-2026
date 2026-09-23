import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { ArticleMarkdown } from '@/components/site/blog/article-markdown'
import { Container, SectionHeading, Eyebrow } from '@/components/site/primitives'
import { Reveal } from '@/components/site/reveal'
import { CountUp } from '@/components/site/count-up'
import { Icon } from '@/lib/icons'
import { CmsTabs, type CmsTab } from '@/components/site/cms/cms-tabs'
import { cn } from '@/lib/utils'
import type { CmsPageData } from '@/lib/data/queries'

type Section = NonNullable<CmsPageData['sections']>[number]
type Row = Record<string, unknown>

/* ------------------------------- helpers -------------------------------- */

function rows(section: Section): Row[] {
  return Array.isArray(section.items) ? (section.items as Row[]) : []
}
function str(row: Row, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k]
    if (typeof v === 'string' && v.trim()) return v
    if (typeof v === 'number') return String(v)
  }
  return ''
}
function list(row: Row, ...keys: string[]): string[] {
  for (const k of keys) {
    const v = row[k]
    if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean)
    if (typeof v === 'string' && v.trim()) return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  }
  return []
}
function bgClass(section: Section): string {
  if (section.background === 'surface') return 'bg-surface'
  if (section.background === 'secondary') return 'bg-secondary'
  if (section.background === 'primary') return 'bg-primary text-primary-foreground'
  return ''
}
const align = (s: Section): 'left' | 'center' => (s.align === 'center' ? 'center' : 'left')

/* ------------------------------ block types ----------------------------- */

function StatBar({ section }: { section: Section }) {
  const items = rows(section)
  return (
    <section className="relative z-10 -mt-12 sm:-mt-16">
      <Container>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xl lg:grid-cols-4">
          {items.slice(0, 4).map((row, i) => (
            <div key={i} className="bg-card px-6 py-8 text-center">
              <CountUp
                value={str(row, 'value')}
                className="block font-display text-3xl font-bold text-primary tabular-nums sm:text-4xl"
              />
              <div className="mt-2 text-sm text-muted-foreground">{str(row, 'label')}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

function SplitChecklist({ section }: { section: Section }) {
  const bullets = rows(section).map((r) => str(r, 'body', 'title', 'label')).filter(Boolean)
  const imageLeft = section.variant === 'image-left'
  const text = (
    <Reveal key="text">
      <div>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.heading}
          description={section.subheading || section.body}
        />
        {bullets.length ? (
          <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {section.ctaLabel ? (
          <Link
            href={section.ctaHref || '/contact'}
            className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:brightness-110"
          >
            {section.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </Reveal>
  )
  const image = section.image ? (
    <Reveal key="image" delay={0.1}>
      <div className="relative overflow-hidden rounded-3xl border border-border shadow-2xl ring-1 ring-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={section.image} alt={section.imageAlt || section.heading || ''} className="aspect-[16/12] w-full object-cover" />
      </div>
    </Reveal>
  ) : null

  return (
    <section className={cn('py-20 sm:py-28', bgClass(section))}>
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {imageLeft ? [image, text] : [text, image]}
        </div>
      </Container>
    </section>
  )
}

function CardGrid({ section }: { section: Section }) {
  const items = rows(section)
  const invert = section.background === 'primary'
  const cols = section.variant === 'cols-4' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'
  const primaryIcon = section.variant === 'cols-4' || section.variant === 'icon-primary'
  return (
    <section className={cn('py-20 sm:py-28', bgClass(section))}>
      <Container>
        <SectionHeading
          align="center"
          invert={invert}
          eyebrow={section.eyebrow}
          title={section.heading}
          description={section.subheading}
        />
        <div className={cn('mt-14 grid gap-5', cols)}>
          {items.map((row, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl',
                    primaryIcon ? 'bg-primary text-primary-foreground' : 'bg-accent/12 text-accent',
                  )}
                >
                  <Icon name={str(row, 'icon')} hint={str(row, 'title')} className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{str(row, 'title')}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{str(row, 'body', 'description')}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Steps({ section }: { section: Section }) {
  const items = rows(section)
  return (
    <section className={cn('py-20 sm:py-28', bgClass(section))}>
      <Container>
        <SectionHeading
          align="center"
          eyebrow={section.eyebrow}
          title={section.heading}
          description={section.subheading}
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-7">
                <span className="absolute right-6 top-6 font-display text-4xl font-bold text-secondary" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Icon name={str(row, 'icon')} hint={str(row, 'title')} className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-foreground">{str(row, 'title')}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{str(row, 'body', 'description')}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function FeatureSplit({ section }: { section: Section }) {
  const items = rows(section)
  const imageLeft = section.variant !== 'image-right'
  const image = section.image ? (
    <Reveal key="image">
      <div className="relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-border bg-secondary shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={section.image} alt={section.imageAlt || section.heading || ''} className="w-full object-cover" />
      </div>
    </Reveal>
  ) : null
  const text = (
    <Reveal key="text" delay={0.1}>
      <div>
        <SectionHeading eyebrow={section.eyebrow} title={section.heading} description={section.subheading} />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {items.map((row, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/12 text-accent">
                <Icon name={str(row, 'icon')} hint={str(row, 'title')} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">{str(row, 'title')}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{str(row, 'body', 'description')}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  )
  return (
    <section className={cn('py-20 sm:py-28', bgClass(section))}>
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {imageLeft ? [image, text] : [text, image]}
        </div>
      </Container>
    </section>
  )
}

function TabsBlock({ section }: { section: Section }) {
  const tabs: CmsTab[] = rows(section).map((row) => ({
    icon: str(row, 'icon') || undefined,
    label: str(row, 'label', 'tab'),
    heading: str(row, 'heading', 'title'),
    body: str(row, 'body', 'description'),
    image: str(row, 'image') || undefined,
    imageAlt: str(row, 'imageAlt'),
    bullets: list(row, 'bullets', 'features'),
    points: Array.isArray(row.points)
      ? (row.points as Row[]).map((p) => ({ title: str(p, 'title'), body: str(p, 'body', 'description') }))
      : undefined,
  }))

  if (section.variant === 'dark') {
    return (
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-28">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(var(--color-primary-foreground)_1px,transparent_1px)] [background-size:26px_26px]"
          aria-hidden="true"
        />
        <Container className="relative">
          <SectionHeading invert align="center" eyebrow={section.eyebrow} title={section.heading} description={section.subheading} />
          <CmsTabs variant="dark" tabs={tabs} />
        </Container>
      </section>
    )
  }

  return (
    <section className={cn('py-20 sm:py-28', bgClass(section))}>
      <Container>
        <SectionHeading align="center" eyebrow={section.eyebrow} title={section.heading} description={section.subheading} />
        <div className="mt-14">
          <CmsTabs variant="light" tabs={tabs} />
        </div>
      </Container>
    </section>
  )
}

function LegalBlock({ section }: { section: Section }) {
  const items = rows(section)
  return (
    <section className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <div className="space-y-12">
          {items.map((row, i) => {
            const paras = list(row, 'body', 'paragraphs')
            return (
              <div key={i}>
                <h2 className="font-display text-2xl font-semibold text-foreground">{str(row, 'heading', 'title')}</h2>
                <div className="mt-4 space-y-4">
                  {paras.map((p, j) => (
                    <p key={j} className="leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {section.body ? (
          <p className="mt-16 border-t border-border pt-8 text-sm text-muted-foreground">{section.body}</p>
        ) : null}
      </Container>
    </section>
  )
}

function RichText({ section }: { section: Section }) {
  return (
    <section className={cn('py-16 sm:py-20', bgClass(section))}>
      <Container className="max-w-3xl">
        {section.heading ? (
          <SectionHeading
            align={align(section)}
            eyebrow={section.eyebrow}
            title={section.heading}
            description={section.subheading}
            className="mb-8"
          />
        ) : null}
        {section.body ? <ArticleMarkdown content={section.body} /> : null}
      </Container>
    </section>
  )
}

function CtaBlock({ section }: { section: Section }) {
  return (
    <section className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.30_0.07_245)] px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
          <h2 className="relative font-display text-3xl font-bold tracking-tight text-balance text-primary-foreground sm:text-4xl">
            {section.heading}
          </h2>
          {section.subheading ? (
            <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/75">{section.subheading}</p>
          ) : null}
          {section.ctaLabel ? (
            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={section.ctaHref || '/contact'}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:brightness-110"
              >
                {section.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}

/* --------------------------- prose + image split ------------------------- */

function ProseSplit({ section }: { section: Section }) {
  const itemParas = rows(section).map((r) => str(r, 'body', 'title')).filter(Boolean)
  const paras = itemParas.length
    ? itemParas
    : section.body
      ? section.body.split(/\n{2,}|\r?\n/).map((s) => s.trim()).filter(Boolean)
      : []
  const imageLeft = section.variant === 'image-left'

  const text = (
    <Reveal key="text">
      <div>
        {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
        <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-balance text-foreground">
          {section.heading}
        </h2>
        {paras.length ? (
          <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
            {paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}
      </div>
    </Reveal>
  )
  const image = section.image ? (
    <Reveal key="image" delay={0.1}>
      <div className="relative overflow-hidden rounded-3xl shadow-lg ring-1 ring-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={section.image}
          alt={section.imageAlt || ''}
          className="aspect-[4/3] h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" aria-hidden="true" />
      </div>
    </Reveal>
  ) : null

  return (
    <section className={cn('py-16 sm:py-24', bgClass(section))}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {imageLeft ? [image, text] : [text, image]}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------- stat band ------------------------------- */

function StatBand({ section, stats }: { section: Section; stats?: { value: string; label: string }[] }) {
  const own = rows(section).map((r) => ({ value: str(r, 'value'), label: str(r, 'label') })).filter((s) => s.value)
  const items = own.length ? own : (stats ?? [])
  if (!items.length) return null
  return (
    <section className="border-y border-border bg-surface">
      <Container>
        <dl className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0 [&>div]:py-10">
          {items.map((s) => (
            <div key={s.label} className="px-6 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <CountUp
                  value={s.value}
                  className="block font-display text-4xl font-bold text-primary tabular-nums"
                />
                <span className="mt-2 block text-sm text-muted-foreground">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}

/* ------------------------------- value list ------------------------------ */

function ValueList({ section }: { section: Section }) {
  const items = rows(section)
  return (
    <section className={cn('border-t border-border py-16 sm:py-24', bgClass(section) || 'bg-surface')}>
      <Container>
        <SectionHeading eyebrow={section.eyebrow} title={section.heading} description={section.subheading} />
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="h-full border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <Icon name={str(row, 'icon')} hint={str(row, 'title')} className="h-6 w-6 text-accent" />
                  <h3 className="font-display text-lg font-semibold text-foreground">{str(row, 'title')}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{str(row, 'body', 'description')}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------- icon cards ------------------------------ */

function IconCards({ section }: { section: Section }) {
  const items = rows(section)
  const plain = section.variant === 'plain'
  const cols = section.variant === 'cols-3' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'
  return (
    <section className={cn('py-16 sm:py-24', bgClass(section))}>
      <Container>
        <SectionHeading eyebrow={section.eyebrow} title={section.heading} description={section.subheading} />
        <div className={cn('mt-14 grid gap-6', cols)}>
          {items.map((row, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                {plain ? (
                  <Icon name={str(row, 'icon')} hint={str(row, 'title')} className="h-7 w-7 text-accent" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon name={str(row, 'icon')} hint={str(row, 'title')} className="h-6 w-6" />
                  </span>
                )}
                <h3
                  className={cn(
                    'font-display font-semibold text-foreground',
                    plain ? 'mt-6 text-xl' : 'mt-5 text-lg',
                  )}
                >
                  {str(row, 'title')}
                </h3>
                <p className={cn('text-sm leading-relaxed text-muted-foreground', plain ? 'mt-3' : 'mt-2.5')}>
                  {str(row, 'body', 'description')}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ----------------------------- prose columns ----------------------------- */

function ProseColumns({ section }: { section: Section }) {
  const items = rows(section)
  const invert = section.background !== 'surface' && section.background !== 'secondary'
  return (
    <section className={cn('py-16 sm:py-24', invert ? 'bg-primary text-primary-foreground' : bgClass(section))}>
      <Container>
        <SectionHeading
          invert={invert}
          eyebrow={section.eyebrow}
          title={section.heading}
          description={section.subheading}
        />
        <div className="mt-14 grid gap-10 lg:grid-cols-3">
          {items.map((row, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className={cn('border-t pt-6', invert ? 'border-primary-foreground/20' : 'border-border')}>
                <h3 className="font-display text-xl font-semibold">{str(row, 'heading', 'title')}</h3>
                <p
                  className={cn(
                    'mt-3 text-sm leading-relaxed',
                    invert ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {str(row, 'body', 'description')}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ---------------------------- split highlights --------------------------- */

function SplitHighlights({ section }: { section: Section }) {
  const items = rows(section)
  return (
    <section className={cn('py-20 sm:py-28', bgClass(section))}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.heading}
            description={section.subheading || section.body}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {items.slice(0, 2).map((row, i) =>
              i === 0 ? (
                <div key={i} className="rounded-2xl bg-primary p-6 text-primary-foreground">
                  <Icon name={str(row, 'icon')} hint={str(row, 'title')} className="h-7 w-7 text-accent" />
                  <p className="mt-5 font-display text-xl font-semibold">{str(row, 'title')}</p>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">{str(row, 'body')}</p>
                </div>
              ) : (
                <div key={i} className="rounded-2xl border border-border bg-card p-6">
                  <Icon name={str(row, 'icon')} hint={str(row, 'title')} className="h-7 w-7 text-accent" />
                  <p className="mt-5 font-display text-xl font-semibold text-foreground">{str(row, 'title')}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{str(row, 'body')}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ------------------- aside blocks (extractable by pages) ----------------- */

/** Icon + title + text list. Used inside form-page sidebars. */
export function CmsIconList({ section }: { section?: Section | null }) {
  if (!section) return null
  const items = rows(section)
  if (!items.length && !section.heading) return null
  return (
    <div>
      {section.heading ? (
        <h2 className="font-display text-xl font-semibold text-foreground">{section.heading}</h2>
      ) : null}
      <ul className="mt-6 space-y-5">
        {items.map((row, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Icon name={str(row, 'icon')} hint={str(row, 'title')} className="h-5 w-5 text-accent" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{str(row, 'title')}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{str(row, 'body', 'text')}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Navy note card. Used inside form-page sidebars. */
export function CmsNoteCard({
  section,
  children,
}: {
  section?: Section | null
  children?: ReactNode
}) {
  if (!section) return null
  return (
    <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
      {section.heading ? <p className="font-display text-lg font-semibold">{section.heading}</p> : null}
      {section.body ? (
        <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">{section.body}</p>
      ) : null}
      {children}
    </div>
  )
}

/**
 * Pulls the first section of each requested type out of a page so the page can
 * place it in a bespoke slot (e.g. a form sidebar), returning the remainder for
 * normal top-to-bottom rendering.
 */
export function splitSections(
  page: CmsPageData | null | undefined,
  types: string[],
): { picked: Record<string, Section | undefined>; rest: Section[] } {
  const picked: Record<string, Section | undefined> = {}
  const rest: Section[] = []
  for (const section of page?.sections ?? []) {
    if (types.includes(section.type) && !picked[section.type]) picked[section.type] = section
    else rest.push(section)
  }
  return { picked, rest }
}

/* ------------------------------- renderer ------------------------------- */

export function CmsSectionRenderer({
  sections,
  stats,
}: {
  sections?: Section[]
  stats?: { value: string; label: string }[]
}) {
  if (!sections?.length) return null
  return (
    <>
      {sections.map((section, index) => {
        const key = `${section.type}-${index}`
        switch (section.type) {
          case 'stat-bar':
          case 'stats':
            return <StatBar key={key} section={section} />
          case 'stat-band':
            return <StatBand key={key} section={section} stats={stats} />
          case 'prose-split':
            return <ProseSplit key={key} section={section} />
          case 'value-list':
            return <ValueList key={key} section={section} />
          case 'icon-cards':
            return <IconCards key={key} section={section} />
          case 'prose-columns':
            return <ProseColumns key={key} section={section} />
          case 'split-highlights':
            return <SplitHighlights key={key} section={section} />
          case 'icon-list':
            return (
              <section key={key} className={cn('py-16 sm:py-24', bgClass(section))}>
                <Container className="max-w-3xl">
                  <CmsIconList section={section} />
                </Container>
              </section>
            )
          case 'note-card':
            return (
              <section key={key} className={cn('py-16 sm:py-24', bgClass(section))}>
                <Container className="max-w-3xl">
                  <CmsNoteCard section={section} />
                </Container>
              </section>
            )
          case 'split-checklist':
          case 'split-image':
            return <SplitChecklist key={key} section={section} />
          case 'card-grid':
          case 'feature-grid':
          case 'pillars':
            return <CardGrid key={key} section={section} />
          case 'steps':
            return <Steps key={key} section={section} />
          case 'feature-split':
            return <FeatureSplit key={key} section={section} />
          case 'tabs':
            return <TabsBlock key={key} section={section} />
          case 'legal':
            return <LegalBlock key={key} section={section} />
          case 'cta':
            return <CtaBlock key={key} section={section} />
          case 'richtext':
            return <RichText key={key} section={section} />
          default:
            return null
        }
      })}
    </>
  )
}

export function CmsPageContent({
  page,
  sections,
  stats,
}: {
  page: CmsPageData
  /** Overrides `page.sections` — used with `splitSections`. */
  sections?: Section[]
  stats?: { value: string; label: string }[]
}) {
  return (
    <>
      <CmsSectionRenderer sections={sections ?? page.sections} stats={stats} />
      {page.body ? (
        <section className="py-16 sm:py-20">
          <Container className="max-w-3xl">
            <ArticleMarkdown content={page.body} />
          </Container>
        </section>
      ) : null}
    </>
  )
}

export type { Section as CmsSection }
