import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Users, ShieldCheck, Navigation, Wind } from 'lucide-react'
import { Container } from '@/components/site/primitives'
import { PageHero, CtaSection, JsonLd } from '@/components/site/page-shell'
import { Icon } from '@/lib/icons'
import {
  getFleetCategories,
  getFleetCategoryBySlug,
  getSiteSettings,
} from '@/lib/data/queries'
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo'

export async function generateStaticParams() {
  const fleet = await getFleetCategories()
  return fleet.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cat = await getFleetCategoryBySlug(slug)
  if (!cat) return buildMetadata({ title: 'Vehicle not found', path: `/fleet/${slug}` })
  return buildMetadata({
    seo: cat.seo,
    title: cat.name,
    description: cat.description,
    path: `/fleet/${cat.slug}`,
    image: cat.image,
  })
}

const standardFeatures = [
  { icon: ShieldCheck, title: 'RTA-compliant & insured', desc: 'Every vehicle meets UAE safety and licensing standards.' },
  { icon: Navigation, title: 'Live GPS tracking', desc: 'Real-time location and route monitoring on every trip.' },
  { icon: Wind, title: 'Climate controlled', desc: 'Clean, comfortable cabins maintained to a high standard.' },
  { icon: Users, title: 'Professional drivers', desc: 'Vetted, trained and uniformed chauffeurs.' },
]

export default async function FleetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [cat, allFleet, settings] = await Promise.all([
    getFleetCategoryBySlug(slug),
    getFleetCategories(),
    getSiteSettings(),
  ])
  if (!cat) notFound()

  const others = allFleet.filter((c) => c._id !== cat._id)
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Fleet', href: '/fleet' },
    { name: cat.name },
  ]

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs.map((b) => ({ name: b.name, path: b.href || `/fleet/${cat.slug}` })),
        )}
      />
      <PageHero
        image={cat.image}
        eyebrow="Fleet"
        title={cat.name}
        description={cat.description}
        breadcrumbs={breadcrumbs}
      >
        {cat.capacityRange && (
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent">
            <Users className="h-4 w-4" />
            Capacity: {cat.capacityRange}
          </span>
        )}
      </PageHero>

      <div className="py-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-lg ring-1 ring-border">
              {cat.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary to-[oklch(0.30_0.07_245)]">
                  <Icon name={cat.icon} className="h-20 w-20 text-primary-foreground/80" />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Built for comfort, safety and reliability
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {cat.description} Our {cat.name.toLowerCase()} are ideal for corporate
                contracts that demand punctuality and a premium passenger experience,
                every single day.
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {standardFeatures.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                      <f.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:brightness-110"
              >
                {settings.ctaPrimary?.label || 'Get a Quote'}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {others.length > 0 && (
            <div className="mt-20 border-t border-border pt-12">
              <h2 className="font-display text-xl font-bold text-foreground">Other vehicle types</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {others.map((o) => (
                  <Link
                    key={o._id}
                    href={`/fleet/${o.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:border-accent/40"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon name={o.icon} className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{o.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>

      <CtaSection cta={settings.ctaPrimary} />
    </>
  )
}
