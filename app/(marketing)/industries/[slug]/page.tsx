import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, AlertCircle, Check } from 'lucide-react'
import { Container } from '@/components/site/primitives'
import { Reveal } from '@/components/site/reveal'
import { PageHero, CtaSection, JsonLd } from '@/components/site/page-shell'
import { Icon } from '@/lib/icons'
import {
  getIndustries,
  getIndustryBySlug,
  getSiteSettings,
} from '@/lib/data/queries'
import { buildMetadata, breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo'

export async function generateStaticParams() {
  const industries = await getIndustries()
  return industries.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const industry = await getIndustryBySlug(slug)
  if (!industry) return buildMetadata({ title: 'Industry not found', path: `/industries/${slug}` })
  return buildMetadata({
    seo: industry.seo,
    title: industry.name,
    description: industry.excerpt,
    path: `/industries/${industry.slug}`,
    image: industry.heroImage,
  })
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [industry, allIndustries, settings] = await Promise.all([
    getIndustryBySlug(slug),
    getIndustries(),
    getSiteSettings(),
  ])
  if (!industry) notFound()

  const others = allIndustries.filter((i) => i._id !== industry._id).slice(0, 3)
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Industries', href: '/industries' },
    { name: industry.name },
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            breadcrumbs.map((b) => ({ name: b.name, path: b.href || `/industries/${industry.slug}` })),
          ),
          serviceJsonLd({
            name: `${industry.name} Transportation`,
            description: industry.excerpt,
            path: `/industries/${industry.slug}`,
          }),
        ]}
      />
      <PageHero
        eyebrow="Industry"
        title={industry.heroTitle || industry.name}
        description={industry.excerpt}
        breadcrumbs={breadcrumbs}
        image={industry.heroImage}
      />

      <div className="py-20">
        <Container>
          {industry.body && (
            <div className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {industry.body.split('\n\n').map((para, i) => (
                <p key={i} className="mb-5">
                  {para}
                </p>
              ))}
            </div>
          )}

          {(industry.challenges?.length || industry.solutions?.length) && (
            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {industry.challenges && industry.challenges.length > 0 && (
                <Reveal>
                  <div className="h-full rounded-2xl border border-border bg-card p-8">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      The challenges
                    </h2>
                    <ul className="mt-6 space-y-4">
                      {industry.challenges.map((c, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}
              {industry.solutions && industry.solutions.length > 0 && (
                <Reveal delay={0.08}>
                  <div className="h-full rounded-2xl border border-accent/30 bg-secondary/50 p-8">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      How ViaRidez helps
                    </h2>
                    <ul className="mt-6 space-y-4">
                      {industry.solutions.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <Check className="h-3 w-3" />
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}
            </div>
          )}

          {others.length > 0 && (
            <div className="mt-20 border-t border-border pt-12">
              <h2 className="font-display text-xl font-bold text-foreground">Other industries</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {others.map((o) => (
                  <Link
                    key={o._id}
                    href={`/industries/${o.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:border-accent/40"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon name={o.icon} className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{o.name}</span>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-accent" />
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
