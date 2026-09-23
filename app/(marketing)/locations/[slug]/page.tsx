import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Check, MapPin, Phone, Mail } from 'lucide-react'
import { Container } from '@/components/site/primitives'
import { PageHero, CtaSection, JsonLd } from '@/components/site/page-shell'
import {
  getLocations,
  getLocationBySlug,
  getSiteSettings,
} from '@/lib/data/queries'
import { buildMetadata, breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo'

export async function generateStaticParams() {
  const locations = await getLocations()
  return locations.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const loc = await getLocationBySlug(slug)
  if (!loc) return buildMetadata({ title: 'Location not found', path: `/locations/${slug}` })
  return buildMetadata({
    seo: loc.seo,
    title: loc.name,
    description: loc.excerpt,
    path: `/locations/${loc.slug}`,
    image: loc.heroImage,
  })
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [loc, allLocations, settings] = await Promise.all([
    getLocationBySlug(slug),
    getLocations(),
    getSiteSettings(),
  ])
  if (!loc) notFound()

  const others = allLocations.filter((l) => l._id !== loc._id)
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Locations', href: '/locations' },
    { name: loc.name },
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            breadcrumbs.map((b) => ({ name: b.name, path: b.href || `/locations/${loc.slug}` })),
          ),
          localBusinessJsonLd({
            name: `ViaRidez ${loc.name}`,
            path: `/locations/${loc.slug}`,
            address: loc.address,
            phone: loc.phone,
            areaServed: loc.name,
          }),
        ]}
      />
      <PageHero
        eyebrow={loc.type || 'Location'}
        title={loc.heroTitle || loc.name}
        description={loc.excerpt}
        breadcrumbs={breadcrumbs}
        image={loc.heroImage}
      />

      <div className="py-20">
        <Container>
          <div className="grid gap-14 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {loc.body && (
                <div className="text-lg leading-relaxed text-muted-foreground">
                  {loc.body.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-5">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {loc.highlights && loc.highlights.length > 0 && (
                <div className="mt-10 rounded-2xl border border-border bg-secondary/50 p-8">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    What we offer here
                  </h2>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {loc.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside>
              <div className="sticky top-28 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-7">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Contact this location
                  </h3>
                  <ul className="mt-5 space-y-4 text-sm">
                    {loc.address && (
                      <li className="flex items-start gap-3 text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        {loc.address}
                      </li>
                    )}
                    {loc.phone && (
                      <li className="flex items-start gap-3 text-muted-foreground">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <a href={`tel:${loc.phone}`} className="hover:text-accent">
                          {loc.phone}
                        </a>
                      </li>
                    )}
                    {loc.email && (
                      <li className="flex items-start gap-3 text-muted-foreground">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <a href={`mailto:${loc.email}`} className="hover:text-accent">
                          {loc.email}
                        </a>
                      </li>
                    )}
                  </ul>
                  <Link
                    href="/contact"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110"
                  >
                    {settings.ctaPrimary?.label || 'Get a Quote'}
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {others.length > 0 && (
            <div className="mt-20 border-t border-border pt-12">
              <h2 className="font-display text-xl font-bold text-foreground">Other locations</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {others.map((o) => (
                  <Link
                    key={o._id}
                    href={`/locations/${o.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:border-accent/40"
                  >
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <MapPin className="h-4 w-4 text-accent" />
                      {o.name}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-accent" />
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
