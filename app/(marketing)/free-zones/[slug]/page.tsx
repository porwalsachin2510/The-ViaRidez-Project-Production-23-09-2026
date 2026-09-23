import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Check, Route } from "lucide-react"
import { getFreeZones, getFreeZoneBySlug, getSiteSettings } from "@/lib/data/queries"
import { buildMetadata, absoluteUrl } from "@/lib/seo"
import { Container } from "@/components/site/primitives"
import { PageHero, CtaSection, JsonLd } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"

export async function generateStaticParams() {
  const zones = await getFreeZones()
  return zones.map((z) => ({ slug: z.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const zone = await getFreeZoneBySlug(slug)
  if (!zone) return buildMetadata({ title: "Free Zone Not Found", path: `/free-zones/${slug}` })
  return buildMetadata({
    title: zone.seo?.metaTitle || `${zone.name} Shuttle Services | VIARIDEZ`,
    description:
      zone.seo?.metaDescription ||
      zone.excerpt ||
      `Dedicated employee transport and shuttle services for ${zone.name}.`,
    path: `/free-zones/${slug}`,
    image: zone.heroImage || undefined,
  })
}

export default async function FreeZoneDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [zone, settings] = await Promise.all([getFreeZoneBySlug(slug), getSiteSettings()])
  if (!zone) notFound()

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${zone.name} Shuttle Services`,
          description: zone.excerpt,
          areaServed: zone.name,
          provider: { "@type": "Organization", name: settings.companyName },
          url: absoluteUrl(`/free-zones/${zone.slug}`),
        }}
      />

      <PageHero
        eyebrow={zone.abbreviation ? `${zone.abbreviation} • Dubai` : "Dubai Free Zone"}
        title={zone.heroTitle || `${zone.name} Shuttle Services`}
        description={zone.excerpt}
        image={zone.heroImage}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Free Zones", href: "/free-zones" },
          { name: zone.abbreviation || zone.name },
        ]}
      />

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              {zone.heroImage ? (
                <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
                  <Image
                    src={zone.heroImage || "/placeholder.svg"}
                    alt={`${zone.name} transport coverage`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>
              ) : null}
              {zone.body ? (
                <div className="space-y-4 leading-relaxed text-muted-foreground">
                  {zone.body.split("\n").filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : null}
            </div>

            <aside className="space-y-8">
              {zone.features && zone.features.length > 0 ? (
                <Reveal>
                  <div className="rounded-2xl border border-border bg-card p-8">
                    <h2 className="font-display text-lg font-semibold text-foreground">What&apos;s included</h2>
                    <ul className="mt-5 space-y-3">
                      {zone.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ) : null}

              {zone.routes && zone.routes.length > 0 ? (
                <Reveal delay={0.1}>
                  <div className="rounded-2xl border border-border bg-secondary/50 p-8">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                      <Route className="h-5 w-5 text-accent" aria-hidden="true" />
                      Key routes
                    </h2>
                    <ul className="mt-5 space-y-2">
                      {zone.routes.map((route) => (
                        <li key={route} className="text-sm font-medium text-foreground">
                          {route}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ) : null}
            </aside>
          </div>
        </Container>
      </section>

      <CtaSection
        cta={settings.ctaPrimary}
        title={`Set up a shuttle programme for ${zone.abbreviation || zone.name}`}
      />
    </>
  )
}
