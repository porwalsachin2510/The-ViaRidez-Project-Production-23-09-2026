import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { getFreeZones, getSiteSettings, getCmsPageBySlug } from "@/lib/data/queries"
import { buildMetadata } from "@/lib/seo"
import { Container, SectionHeading } from "@/components/site/primitives"
import { PageHero, CtaSection } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Free Zone Shuttle Services in Dubai | JAFZA, DIFC, DMCC & Dubai South",
    description:
      "Dedicated employee shuttle and staff transport solutions for Dubai's leading free zones — JAFZA, DIFC, DMCC and Dubai South. Reliable, compliant and scalable corporate mobility.",
    path: "/free-zones",
  })
}

export default async function FreeZonesPage() {
  const [zones, settings, cmsPage] = await Promise.all([
    getFreeZones(),
    getSiteSettings(),
    getCmsPageBySlug("free-zones"),
  ])

  return (
    <>
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "Free Zone Mobility"}
        title={cmsPage?.heroTitle || "Free Zone Shuttle Services Across Dubai"}
        description={
          cmsPage?.heroSubtitle ||
          "Purpose-built staff transport for Dubai's most important economic zones — engineered for compliance, punctuality and scale."
        }
        image={cmsPage?.heroImage}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Free Zones" }]}
      />

      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Where we operate"
            title="Dedicated coverage for every major free zone"
            description="Each zone has its own routes, timing patterns and access protocols. We tailor operations to fit."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {zones.map((zone, i) => (
              <Reveal key={zone._id} delay={i * 0.06}>
                <Link
                  href={`/free-zones/${zone.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-8 transition-all hover:border-accent/50 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <MapPin className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">{zone.name}</h3>
                      {zone.abbreviation ? (
                        <p className="text-sm font-medium text-accent">{zone.abbreviation}</p>
                      ) : null}
                    </div>
                  </div>
                  {zone.excerpt ? (
                    <p className="mt-4 flex-1 leading-relaxed text-muted-foreground">{zone.excerpt}</p>
                  ) : null}
                  {zone.routes && zone.routes.length > 0 ? (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {zone.routes.slice(0, 4).map((route) => (
                        <li
                          key={route}
                          className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                        >
                          {route}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                    Explore {zone.abbreviation || zone.name}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaSection cta={settings.ctaPrimary} />
    </>
  )
}
