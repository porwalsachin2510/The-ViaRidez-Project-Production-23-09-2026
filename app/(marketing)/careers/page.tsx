import type { Metadata } from "next"
import { getCareers, getSiteSettings, getCmsPageBySlug } from "@/lib/data/queries"
import { CmsPageContent } from "@/components/site/cms-section-renderer"
import { buildMetadata } from "@/lib/seo"
import { Container, SectionHeading } from "@/components/site/primitives"
import { PageHero, CtaSection } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { CareersExplorer } from "@/components/site/careers-explorer"
import type { JobRole } from "@/lib/careers"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug("careers")
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || "Careers at VIARIDEZ | Join Our Corporate Mobility Team in Dubai",
    description:
      page?.heroSubtitle ||
      "Build your career with VIARIDEZ. Explore open roles in operations, driving, technology and customer success across our corporate transportation network.",
    path: "/careers",
    image: page?.heroImage,
  })
}

const perks = [
  { title: "Purpose-driven work", description: "Keep thousands of professionals moving safely every day." },
  { title: "Growth & training", description: "Structured development paths and continuous upskilling." },
  { title: "Stable & compliant", description: "Salaried roles with full compliance and welfare standards." },
  { title: "Modern fleet & tools", description: "Work with a well-maintained fleet and smart dispatch technology." },
]

export default async function CareersPage() {
  const [careers, settings, cmsPage] = await Promise.all([getCareers(), getSiteSettings(), getCmsPageBySlug("careers")])

  return (
    <>
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "Careers"}
        title={cmsPage?.heroTitle || "Move your career forward with VIARIDEZ"}
        description={
          cmsPage?.heroSubtitle ||
          "We're building the most reliable corporate mobility network in the region — and we're looking for people who take pride in service, safety and precision."
        }
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Careers" }]}
        image={cmsPage?.heroImage || undefined}
      />

      {cmsPage?.sections?.length ? (
        <section className="py-16 sm:py-24">
          <Container>
            <CmsPageContent page={cmsPage} />
          </Container>
        </section>
      ) : null}

      {/* Perks */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Why join us"
            title="A place to do your best work"
            description="We invest in our people because they are the reason our clients trust us."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk, i) => (
              <Reveal key={perk.title} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <div className="mb-4 h-1 w-10 rounded-full bg-accent" />
                  <h3 className="font-display text-lg font-semibold text-foreground">{perk.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{perk.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Open roles */}
      <section className="border-t border-border bg-surface py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Open positions" title="Current opportunities" />
          {careers.length > 0 ? (
            <CareersExplorer roles={careers as JobRole[]} />
          ) : (
            <div className="mt-12 rounded-2xl border border-dashed border-border bg-background p-12 text-center">
              <p className="text-muted-foreground">
                There are no open positions right now. Send your CV to{" "}
                <a href={`mailto:${settings.email}`} className="font-semibold text-accent hover:underline">
                  {settings.email}
                </a>{" "}
                and we&apos;ll keep you in mind.
              </p>
            </div>
          )}
        </Container>
      </section>

      <CtaSection
        cta={{ label: "Contact our team", href: "/contact" }}
        title="Don't see the right role?"
        description="We're always keen to meet talented people. Reach out and tell us how you can contribute."
      />
    </>
  )
}
