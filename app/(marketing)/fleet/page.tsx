import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Users } from 'lucide-react'
import { Container } from '@/components/site/primitives'
import { Reveal } from '@/components/site/reveal'
import { PageHero, CtaSection, JsonLd } from '@/components/site/page-shell'
import { Icon } from '@/lib/icons'
import { getFleetCategories, getSiteSettings, getCmsPageBySlug } from '@/lib/data/queries'
import { CmsPageContent } from '@/components/site/cms-section-renderer'
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug('fleet')
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || 'Our Fleet — Corporate Vehicles & Coaches',
    description:
      page?.heroSubtitle ||
      'A modern, RTA-compliant fleet from executive sedans and SUVs to 15-seater vans, minibuses and 50+ seater coaches for corporate transportation across Dubai and the UAE.',
    path: '/fleet',
    image: page?.heroImage,
  })
}

export default async function FleetPage() {
  const [fleet, settings, cmsPage] = await Promise.all([
    getFleetCategories(),
    getSiteSettings(),
    getCmsPageBySlug('fleet'),
  ])

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Fleet', path: '/fleet' },
        ])}
      />
      <PageHero
        image={cmsPage?.heroImage || '/media/sections/fleet-lineup.png'}
        eyebrow={cmsPage?.heroEyebrow || 'Our fleet'}
        title={cmsPage?.heroTitle || 'The right vehicle for every journey'}
        description={
          cmsPage?.heroSubtitle ||
          'Meticulously maintained, RTA-compliant vehicles matched to your route, headcount and comfort requirements — from executive sedans to full-size coaches.'
        }
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Fleet' }]}
      />

      {cmsPage && cmsPage.sections?.length ? <CmsPageContent page={cmsPage} /> : null}

      <div className="py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fleet.map((cat, i) => (
              <Reveal key={cat._id} delay={i * 0.05}>
                <Link
                  href={`/fleet/${cat.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
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
                        <Icon name={cat.icon} className="h-12 w-12 text-primary-foreground/80" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                    {cat.capacityRange && (
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
                        <Users className="h-3 w-3" />
                        {cat.capacityRange}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-display text-lg font-semibold text-foreground">{cat.name}</h2>
                    {cat.description && (
                      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {cat.description}
                      </p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors group-hover:text-accent">
                      View details
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
