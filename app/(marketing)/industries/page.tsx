import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/site/primitives'
import { Reveal } from '@/components/site/reveal'
import { PageHero, CtaSection, JsonLd } from '@/components/site/page-shell'
import { Icon } from '@/lib/icons'
import { getIndustries, getSiteSettings, getCmsPageBySlug } from '@/lib/data/queries'
import { CmsPageContent } from '@/components/site/cms-section-renderer'
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug('industries')
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || 'Industries We Serve',
    description:
      page?.heroSubtitle ||
      'Tailored corporate transportation for IT/ITES, free zones, hospitality, healthcare, banking and education — built around each sector’s shift patterns, safety needs and scale.',
    path: '/industries',
    image: page?.heroImage,
  })
}

export default async function IndustriesPage() {
  const [industries, settings, cmsPage] = await Promise.all([
    getIndustries(),
    getSiteSettings(),
    getCmsPageBySlug('industries'),
  ])

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Industries', path: '/industries' },
        ])}
      />
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || 'Industries we serve'}
        title={cmsPage?.heroTitle || 'Transport programmes built around your sector'}
        description={
          cmsPage?.heroSubtitle ||
          'We tailor mobility to the operational realities of each industry — from 24/7 IT shift shuttles to free zone employee transport and executive corporate travel.'
        }
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Industries' }]}
        image={cmsPage?.heroImage || '/media/industries/it-ites-bpo.png'}
      />

      {cmsPage && cmsPage.sections?.length ? <CmsPageContent page={cmsPage} /> : null}

      <div className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {industries.map((ind, i) => (
              <Reveal key={ind._id} delay={i * 0.05}>
                <Link
                  href={`/industries/${ind.slug}`}
                  className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl bg-primary shadow-sm ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  {ind.heroImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ind.heroImage}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-[oklch(0.30_0.07_245)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/65 to-primary/5" />
                  <div className="relative p-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/20 backdrop-blur-sm">
                      <Icon name={ind.icon} className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 font-display text-xl font-semibold text-primary-foreground text-balance">
                      {ind.name}
                    </h2>
                    {ind.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-primary-foreground/75">
                        {ind.excerpt}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      Learn more
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
