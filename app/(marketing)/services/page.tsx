import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/site/primitives'
import { Reveal } from '@/components/site/reveal'
import { PageHero, CtaSection, JsonLd } from '@/components/site/page-shell'
import { Icon } from '@/lib/icons'
import {
  getServices,
  getSiteSettings,
  getCmsPageBySlug,
  type ServiceData,
} from '@/lib/data/queries'
import { CmsPageContent } from '@/components/site/cms-section-renderer'
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug('services')
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || 'Corporate Transportation Services',
    description:
      page?.heroSubtitle ||
      'Explore ViaRidez enterprise mobility services: employee transportation, corporate shuttles, free zone transport, executive chauffeur, MICE and event mobility across Dubai and the UAE.',
    path: '/services',
    image: page?.heroImage,
  })
}

export default async function ServicesPage() {
  const [services, settings, cmsPage] = await Promise.all([
    getServices(),
    getSiteSettings(),
    getCmsPageBySlug('services'),
  ])
  const parents = services.filter((s) => !s.parent)
  const childrenOf = (id: string) => services.filter((s) => s.parent === id)

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ])}
      />
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || 'What we do'}
        title={cmsPage?.heroTitle || 'Enterprise mobility, engineered end to end'}
        description={
          cmsPage?.heroSubtitle ||
          'From daily employee transportation to executive chauffeur and large-scale event mobility — every ViaRidez programme is managed with compliance, safety and reliability at its core.'
        }
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Services' }]}
        image={cmsPage?.heroImage || '/media/services/corporate-shuttle.png'}
      />

      {cmsPage && cmsPage.sections?.length ? <CmsPageContent page={cmsPage} /> : null}

      <div className="py-20 sm:py-28">
        <Container className="space-y-24 sm:space-y-32">
          {parents.map((parent: ServiceData, idx) => {
            const children = childrenOf(parent._id)
            return (
              <Reveal key={parent._id}>
                <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
                  {/* Sticky editorial heading */}
                  <div className="lg:sticky lg:top-28 lg:self-start">
                    <div className="flex items-center gap-4">
                      <span className="font-display text-sm font-semibold tabular-nums text-accent">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    {parent.heroImage && (
                      <Link
                        href={`/services/${parent.slug}`}
                        className="group mt-6 block overflow-hidden rounded-2xl"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={parent.heroImage}
                          alt={parent.title}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                    )}
                    <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground text-balance">
                      <Link href={`/services/${parent.slug}`} className="transition-colors hover:text-accent">
                        {parent.title}
                      </Link>
                    </h2>
                    {parent.excerpt && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                        {parent.excerpt}
                      </p>
                    )}
                    <Link
                      href={`/services/${parent.slug}`}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
                    >
                      Explore category
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Child services as clean divider-separated rows */}
                  {children.length > 0 && (
                    <ul className="border-t border-border">
                      {children.map((child) => (
                        <li key={child._id}>
                          <Link
                            href={`/services/${child.slug}`}
                            className="group flex items-start gap-5 border-b border-border py-6 transition-colors hover:bg-secondary/40"
                          >
                            <span className="mt-0.5 text-accent transition-transform duration-300 group-hover:scale-110">
                              <Icon name={child.icon} hint={child.title} className="h-6 w-6" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-base font-semibold text-foreground transition-colors group-hover:text-accent">
                                {child.title}
                              </h3>
                              {child.excerpt && (
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                  {child.excerpt}
                                </p>
                              )}
                            </div>
                            <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/50 transition-all group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            )
          })}
        </Container>
      </div>

      <CtaSection cta={settings.ctaPrimary} />
    </>
  )
}
