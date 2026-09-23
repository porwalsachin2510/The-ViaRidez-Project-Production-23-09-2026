import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Check } from 'lucide-react'
import { Container } from '@/components/site/primitives'
import { Reveal } from '@/components/site/reveal'
import { PageHero, CtaSection, JsonLd } from '@/components/site/page-shell'
import { Icon } from '@/lib/icons'
import {
  getServices,
  getServiceBySlug,
  getSiteSettings,
} from '@/lib/data/queries'
import { buildMetadata, breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo'

export async function generateStaticParams() {
  const services = await getServices()
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return buildMetadata({ title: 'Service not found', path: `/services/${slug}` })
  return buildMetadata({
    seo: service.seo,
    title: service.title,
    description: service.excerpt,
    path: `/services/${service.slug}`,
    image: service.heroImage,
  })
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [service, allServices, settings] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
    getSiteSettings(),
  ])
  if (!service) notFound()

  const children = allServices.filter((s) => s.parent === service._id)
  const parent = service.parent
    ? allServices.find((s) => s._id === service.parent)
    : null
  const related = allServices
    .filter((s) => s._id !== service._id && s.parent && s.parent === service.parent)
    .slice(0, 3)

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    ...(parent ? [{ name: parent.title, href: `/services/${parent.slug}` }] : []),
    { name: service.title },
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            breadcrumbs.map((b) => ({
              name: b.name,
              path: b.href || `/services/${service.slug}`,
            })),
          ),
          serviceJsonLd({
            name: service.title,
            description: service.excerpt,
            path: `/services/${service.slug}`,
          }),
        ]}
      />

      <PageHero
        eyebrow={parent ? parent.title : 'Service'}
        title={service.heroTitle || service.title}
        description={service.heroSubtitle || service.excerpt}
        breadcrumbs={breadcrumbs}
        image={service.heroImage}
      >
        <Link
          href={settings.ctaPrimary?.href || '/contact'}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:brightness-110"
        >
          {settings.ctaPrimary?.label || 'Get a Quote'}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </PageHero>

      <div className="py-20">
        <Container>
          <div className="grid gap-14 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2">
              {service.body && (
                <div className="prose-viaridez max-w-none text-lg leading-relaxed text-muted-foreground">
                  {service.body.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-5">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {service.features && service.features.length > 0 && (
                <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                  {service.features.map((f, i) => (
                    <Reveal key={i} delay={i * 0.05}>
                      <div className="flex h-full flex-col border-t border-border pt-5">
                        <div className="flex items-center gap-3">
                          <Icon name={f.icon} className="h-6 w-6 text-accent" />
                          <h3 className="font-display text-base font-semibold text-foreground">
                            {f.title}
                          </h3>
                        </div>
                        {f.description && (
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {f.description}
                          </p>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}

              {/* Sub-services for a parent */}
              {children.length > 0 && (
                <div className="mt-14">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    Explore {service.title}
                  </h2>
                  <ul className="mt-6 border-t border-border">
                    {children.map((child) => (
                      <li key={child._id}>
                        <Link
                          href={`/services/${child.slug}`}
                          className="group flex items-start gap-4 border-b border-border py-5 transition-colors hover:bg-secondary/40"
                        >
                          <Icon name={child.icon} className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground transition-colors group-hover:text-accent">
                              {child.title}
                            </h3>
                            {child.excerpt && (
                              <p className="mt-1 text-sm text-muted-foreground">{child.excerpt}</p>
                            )}
                          </div>
                          <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/50 transition-all group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-8">
                {service.benefits && service.benefits.length > 0 && (
                  <div className="rounded-2xl border border-border bg-secondary/50 p-7">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Key benefits
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {service.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <Check className="h-3 w-3" />
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-2xl bg-primary p-7 text-primary-foreground">
                  <h3 className="font-display text-lg font-semibold">Talk to our team</h3>
                  <p className="mt-2 text-sm text-primary-foreground/75">
                    Get a tailored transport plan for your organisation.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110"
                  >
                    {settings.ctaPrimary?.label || 'Get a Quote'}
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* Related services */}
          {related.length > 0 && (
            <div className="mt-20 border-t border-border pt-12">
              <h2 className="font-display text-xl font-bold text-foreground">Related services</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r._id}
                    href={`/services/${r.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:border-accent/40"
                  >
                    <span className="font-medium text-foreground">{r.title}</span>
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
