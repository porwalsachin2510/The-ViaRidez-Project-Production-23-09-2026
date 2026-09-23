import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Building2 } from "lucide-react"
import { getSiteSettings, getCaseStudies, getClients, getCmsPageBySlug } from "@/lib/data/queries"
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo"
import { Container, SectionHeading } from "@/components/site/primitives"
import { PageHero, CtaSection, JsonLd } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { CaseStudySpotlight } from "@/components/site/case-study-spotlight"
import { CaseStudiesExplorer } from "@/components/site/case-studies-explorer"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug("case-studies")
  return buildMetadata({
    seo: page?.seo ?? {
      metaTitle: "Case Studies & Clients | ViaRidez Dubai",
      metaDescription:
        "See how ViaRidez delivers reliable corporate transport for enterprises, free zones and event organisers across Dubai and the UAE — with measurable outcomes.",
      keywords: ["corporate transport case studies Dubai", "ViaRidez clients", "employee transport results UAE"],
    },
    title: page?.title,
    description: page?.heroSubtitle,
    image: page?.heroImage,
    path: "/case-studies",
  })
}

/** Aggregate the strongest metric across all studies for the hero stats band. */
function heroStats(count: number) {
  return [
    { value: `${count}+`, label: "Programmes delivered" },
    { value: "99%", label: "Average on-time arrival" },
    { value: "24/7", label: "Live operations desk" },
    { value: "13+", label: "Years of heritage" },
  ]
}

export default async function CaseStudiesPage() {
  const [settings, caseStudies, clients, cmsPage] = await Promise.all([
    getSiteSettings(),
    getCaseStudies(),
    getClients(),
    getCmsPageBySlug("case-studies"),
  ])

  const featured = caseStudies.find((c) => c.featured) ?? caseStudies[0]
  const rest = featured ? caseStudies.filter((c) => c._id !== featured._id) : caseStudies
  const stats = heroStats(caseStudies.length)

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Case Studies", path: "/case-studies" },
        ])}
      />

      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "Case studies & clients"}
        title={cmsPage?.heroTitle || "Transport programmes that keep organisations moving"}
        description={
          cmsPage?.heroSubtitle ||
          "Real outcomes for enterprises, free-zone companies and event organisers who rely on ViaRidez to move their people safely and on time."
        }
        image={cmsPage?.heroImage}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Case Studies" }]}
      >
        {caseStudies.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl font-bold text-accent sm:text-4xl">{s.value}</dt>
                <dd className="mt-1 text-sm text-primary-foreground/70">{s.label}</dd>
              </div>
            ))}
          </dl>
        )}
      </PageHero>

      {/* Client wall */}
      {clients.length > 0 && (
        <section className="border-b border-border bg-surface py-14">
          <Container>
            <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Trusted by leading organisations
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {clients.map((client) =>
                client.logo ? (
                  <Image
                    key={client._id}
                    src={client.logo || "/placeholder.svg"}
                    alt={`${client.name} logo`}
                    width={130}
                    height={44}
                    className="h-9 w-auto opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
                  />
                ) : (
                  <span
                    key={client._id}
                    className="font-display text-lg font-semibold text-muted-foreground transition hover:text-foreground"
                  >
                    {client.name}
                  </span>
                ),
              )}
            </div>
          </Container>
        </section>
      )}

      {caseStudies.length > 0 ? (
        <>
          {/* Featured spotlight */}
          {featured && (
            <section className="py-16 sm:py-20">
              <Container>
                <Reveal>
                  <CaseStudySpotlight cs={featured} />
                </Reveal>
              </Container>
            </section>
          )}

          {/* All studies with search / filter / sort */}
          <section className="pb-20">
            <Container>
              <SectionHeading
                eyebrow="Selected work"
                title="Browse every case study"
                description="Filter by industry or service to find the programme closest to your operation."
              />
              <div className="mt-10">
                <CaseStudiesExplorer studies={rest} />
              </div>
            </Container>
          </section>
        </>
      ) : (
        <section className="py-16 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-border bg-card px-8 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Building2 className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-6 font-display text-2xl font-semibold text-foreground text-balance">
                Detailed case studies are on the way
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We&apos;re preparing published case studies with our clients&apos; permission. In the meantime,
                we&apos;d be glad to share relevant references and outcomes directly for your sector.
              </p>
              <Link
                href={settings.ctaPrimary?.href || "/contact"}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:brightness-110"
              >
                Request references
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Container>
        </section>
      )}

      <CtaSection cta={settings.ctaPrimary} />
    </>
  )
}
