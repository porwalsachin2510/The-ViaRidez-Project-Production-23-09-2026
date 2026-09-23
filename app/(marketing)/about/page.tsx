import type { Metadata } from "next"
import Image from "next/image"
import { getSiteSettings, getTeamMembers, getClients, getTestimonials, getCmsPageBySlug } from "@/lib/data/queries"
import { CmsPageContent } from "@/components/site/cms-section-renderer"
import { buildMetadata } from "@/lib/seo"
import { Container, SectionHeading } from "@/components/site/primitives"
import { PageHero, CtaSection } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { TestimonialAvatar } from "@/components/site/testimonial-avatar"
import { ClientWall } from "@/components/site/client-wall"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug("about")
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || "About VIARIDEZ | Corporate Transportation Partner in the UAE",
    description: page?.heroSubtitle || "VIARIDEZ delivers reliable, compliant and technology-driven corporate transportation across the UAE and wider region. Learn about our mission, values and team.",
    path: "/about",
    image: page?.heroImage,
  })
}

export default async function AboutPage() {
  const [settings, team, clients, testimonials, cmsPage] = await Promise.all([
    getSiteSettings(),
    getTeamMembers(),
    getClients(),
    getTestimonials(),
    getCmsPageBySlug("about"),
  ])

  const stats = settings.stats ?? []
  const featured = testimonials[0]

  return (
    <>
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "About us"}
        title={cmsPage?.heroTitle || "Moving people with precision, care and accountability"}
        description={
          cmsPage?.heroSubtitle ||
          settings.tagline ||
          "VIARIDEZ is a corporate transportation partner built for organisations that can't afford to compromise on safety, punctuality or professionalism."
        }
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "About" }]}
        image={cmsPage?.heroImage || "/media/sections/operations.png"}
      />

      {/* Mission, stats and values are all editable in Admin → Content → Site Pages → About. */}
      {cmsPage ? <CmsPageContent page={cmsPage} stats={stats} /> : null}

      {/* Featured testimonial */}
      {featured && (
        <section className="py-16 sm:py-24">
          <Container>
            <figure className="mx-auto max-w-3xl text-center">
              <blockquote className="font-display text-2xl font-medium leading-relaxed text-foreground text-balance sm:text-3xl">
                &ldquo;{featured.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex flex-col items-center gap-3">
                <TestimonialAvatar name={featured.author} avatar={featured.avatar} size="lg" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{featured.author}</span>
                  {featured.role ? `, ${featured.role}` : ""}
                  {featured.company ? ` — ${featured.company}` : ""}
                </span>
              </figcaption>
            </figure>
          </Container>
        </section>
      )}

      {/* Team */}
      {team.length > 0 && (
        <section className="border-t border-border bg-surface py-16 sm:py-24">
          <Container>
            <SectionHeading eyebrow="Leadership" title="The people behind VIARIDEZ" />
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member, i) => (
                <Reveal key={member._id} delay={i * 0.05}>
                  <div className="text-center">
                    <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl bg-primary/5">
                      {member.photo ? (
                        <Image
                          src={member.photo || "/placeholder.svg"}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 220px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-display text-2xl font-bold text-primary/40">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-foreground">{member.name}</h3>
                    {member.role && <p className="text-sm text-accent">{member.role}</p>}
                    {member.bio && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Clients — shared with the home page so names, sectors and outbound
          links stay consistent everywhere clients are shown. */}
      <ClientWall clients={clients} eyebrow="Trusted by" title="Trusted by leading organisations" />

      <CtaSection cta={settings.ctaPrimary} />
    </>
  )
}
