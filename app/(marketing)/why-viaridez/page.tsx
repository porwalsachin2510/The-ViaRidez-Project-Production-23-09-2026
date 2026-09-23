import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Quote, Star } from "lucide-react"
import {
  getSiteSettings,
  getFAQs,
  getTestimonials,
  getCmsPageBySlug,
} from "@/lib/data/queries"
import { CmsPageContent } from "@/components/site/cms-section-renderer"
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo"
import { Container, SectionHeading } from "@/components/site/primitives"
import { PageHero, CtaSection, JsonLd } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { TestimonialAvatar } from "@/components/site/testimonial-avatar"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug("why-viaridez")
  return buildMetadata({
    seo: page?.seo || {
      metaTitle: "Why ViaRidez | Trusted Corporate Transport in Dubai",
      metaDescription: "Why enterprises choose ViaRidez: RTA-compliant fleet, vetted drivers, live tracking, transparent reporting and a 24/7 operations desk across Dubai and the UAE.",
      keywords: ["reliable corporate transport Dubai", "RTA compliant staff transport", "safe employee transportation Dubai"],
    },
    title: page?.title,
    description: page?.heroSubtitle,
    path: "/why-viaridez",
    image: page?.heroImage,
  })
}

export default async function WhyViaRidezPage() {
  const [settings, faqs, testimonials, cmsPage] = await Promise.all([
    getSiteSettings(),
    getFAQs(),
    getTestimonials(),
    getCmsPageBySlug("why-viaridez"),
  ])

  const stats = settings.stats ?? []
  const featured = testimonials.slice(0, 2)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Why ViaRidez", path: "/why-viaridez" },
          ]),
          ...(faqs.length ? [faqJsonLd(faqs.map((f) => ({ question: f.question, answer: f.answer })))] : []),
        ]}
      />

      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "Why ViaRidez"}
        title={cmsPage?.heroTitle || "Reliability engineered into every trip"}
        description={cmsPage?.heroSubtitle || "For your operations, corporate transport is critical infrastructure. We build, run and report on it that way — safe, compliant and accountable, every single day."}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Why ViaRidez" }]}
        image={cmsPage?.heroImage || undefined}
      >
        <div className="flex flex-wrap gap-4">
          <Link
            href={settings.ctaPrimary?.href || "/contact"}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:brightness-110"
          >
            {settings.ctaPrimary?.label || "Get a Quote"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-7 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            See client outcomes
          </Link>
        </div>
      </PageHero>

      {/* Stats, pillars and differentiators are editable in Admin → Content → Site Pages → Why ViaRidez. */}
      {cmsPage ? <CmsPageContent page={cmsPage} stats={stats} /> : null}

      {/* Testimonials */}
      {featured.length > 0 && (
        <section className="py-16 sm:py-24">
          <Container>
            <SectionHeading align="center" eyebrow="Client voices" title="What our clients say" />
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
              {featured.map((t, i) => (
                <Reveal key={t._id} delay={i * 0.06}>
                  <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-8">
                    <Quote className="h-8 w-8 text-accent/40" aria-hidden="true" />
                    <div className="mt-3 flex gap-0.5" aria-label={`${t.rating ?? 5} out of 5`}>
                      {Array.from({ length: t.rating ?? 5 }).map((_, idx) => (
                        <Star key={idx} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                      <TestimonialAvatar name={t.author} avatar={t.avatar} size="md" />
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground">{t.author}</div>
                        {(t.role || t.company) && (
                          <div className="text-sm text-muted-foreground">
                            {[t.role, t.company].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="border-t border-border bg-surface py-16 sm:py-24">
          <Container className="max-w-3xl">
            <SectionHeading align="center" eyebrow="Good to know" title="Frequently asked questions" />
            <dl className="mt-12 divide-y divide-border">
              {faqs.map((f) => (
                <div key={f._id} className="py-6">
                  <dt className="font-display text-lg font-semibold text-foreground">{f.question}</dt>
                  <dd className="mt-2 leading-relaxed text-muted-foreground">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      <CtaSection cta={settings.ctaPrimary} />
    </>
  )
}
