import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { Container } from '@/components/site/primitives'
import { Reveal } from '@/components/site/reveal'
import { PageHero, CtaSection, JsonLd } from '@/components/site/page-shell'
import { getLocations, getSiteSettings, getCmsPageBySlug } from '@/lib/data/queries'
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Locations — Dubai, Kuwait, India & Nepal',
    description:
      'ViaRidez delivers corporate transportation across Dubai and the UAE, with operations and partnerships spanning Kuwait, India and Nepal.',
    path: '/locations',
  })
}

export default async function LocationsPage() {
  const [locations, settings, cmsPage] = await Promise.all([
    getLocations(),
    getSiteSettings(),
    getCmsPageBySlug('locations'),
  ])

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Locations', path: '/locations' },
        ])}
      />
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || 'Where we operate'}
        title={cmsPage?.heroTitle || 'Regional reach, local expertise'}
        description={
          cmsPage?.heroSubtitle ||
          'Headquartered in Dubai and serving the wider UAE, with an operational footprint that extends across Kuwait, India and Nepal.'
        }
        image={cmsPage?.heroImage}
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Locations' }]}
      />

      <div className="py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {locations.map((loc, i) => (
              <Reveal key={loc._id} delay={i * 0.05}>
                <Link
                  href={`/locations/${loc.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative flex items-end bg-gradient-to-br from-primary to-[oklch(0.30_0.07_245)] p-8 min-h-40">
                    <div
                      className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/15 blur-2xl"
                      aria-hidden="true"
                    />
                    <div className="relative">
                      <div className="flex items-center gap-2 text-accent">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-widest">
                          {loc.type || 'Location'}
                          {loc.isPrimary ? ' · HQ' : ''}
                        </span>
                      </div>
                      <h2 className="mt-2 font-display text-2xl font-bold text-primary-foreground">
                        {loc.name}
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    {loc.excerpt && (
                      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                        {loc.excerpt}
                      </p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      Explore {loc.name}
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </div>

      <CtaSection cta={settings.ctaPrimary} />
    </>
  )
}
