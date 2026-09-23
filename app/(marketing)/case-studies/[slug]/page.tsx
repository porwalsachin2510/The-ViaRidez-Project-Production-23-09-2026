import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Building2, CalendarClock, Check, MapPin, Quote, Target, Truck, Wrench } from "lucide-react"
import {
  getSiteSettings,
  getCaseStudies,
  getCaseStudyBySlug,
  getRelatedCaseStudies,
} from "@/lib/data/queries"
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo"
import { Container, SectionHeading } from "@/components/site/primitives"
import { PageHero, CtaSection, JsonLd } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { ArticleMarkdown } from "@/components/site/blog/article-markdown"

export async function generateStaticParams() {
  const studies = await getCaseStudies()
  return studies.map((cs) => ({ slug: cs.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cs = await getCaseStudyBySlug(slug)
  if (!cs) return { title: "Case study not found" }
  return buildMetadata({
    seo: cs.seo,
    title: cs.title,
    description: cs.excerpt,
    path: `/case-studies/${slug}`,
    image: cs.coverImage,
  })
}

function AtAGlance({
  items,
}: {
  items: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }[]
}) {
  if (items.length === 0) return null
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="rounded-2xl border border-border bg-card p-5">
          <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
          <dt className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="mt-1 font-display text-base font-semibold text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [settings, cs, related] = await Promise.all([
    getSiteSettings(),
    getCaseStudyBySlug(slug),
    getRelatedCaseStudies(slug, 3),
  ])
  if (!cs) notFound()

  const glance = [
    cs.client ? { icon: Building2, label: "Client", value: cs.client } : null,
    cs.location ? { icon: MapPin, label: "Location", value: cs.location } : null,
    cs.fleetSize ? { icon: Truck, label: "Scale", value: cs.fleetSize } : null,
    cs.duration ? { icon: CalendarClock, label: "Programme", value: cs.duration } : null,
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; value: string }[]

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Case Studies", path: "/case-studies" },
          { name: cs.title, path: `/case-studies/${slug}` },
        ])}
      />

      <PageHero
        eyebrow={cs.industry || "Case study"}
        title={cs.title}
        description={cs.excerpt}
        image={cs.coverImage}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Case Studies", href: "/case-studies" },
          { name: cs.title },
        ]}
      />

      {/* At-a-glance */}
      {glance.length > 0 && (
        <section className="border-b border-border bg-surface py-10">
          <Container className="max-w-5xl">
            <AtAGlance items={glance} />
          </Container>
        </section>
      )}

      {/* Headline metrics */}
      {cs.metrics && cs.metrics.length > 0 && (
        <section className="py-12 sm:py-16">
          <Container className="max-w-5xl">
            <SectionHeading eyebrow="The outcome" title="Results that moved the needle" align="center" className="mx-auto" />
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {cs.metrics.map((m) => (
                <div key={m.label} className="rounded-2xl border border-border bg-card p-6 text-center">
                  <div className="font-display text-3xl font-bold text-accent sm:text-4xl">{m.value}</div>
                  <div className="mt-2 text-sm leading-tight text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Challenge / Solution / Result */}
      <section className="pb-4">
        <Container className="max-w-5xl space-y-10">
          {cs.challenge && (
            <NarrativeBlock
              icon={Target}
              heading="The challenge"
              body={cs.challenge}
              asideTitle={cs.services && cs.services.length ? "Services delivered" : undefined}
              asideItems={cs.services}
            />
          )}
          {cs.solution && (
            <NarrativeBlock
              icon={Wrench}
              heading="Our solution"
              body={cs.solution}
              asideTitle={cs.highlights && cs.highlights.length ? "Solution highlights" : undefined}
              asideItems={cs.highlights}
            />
          )}
          {cs.result && <NarrativeBlock icon={Check} heading="The result" body={cs.result} />}
        </Container>
      </section>

      {/* Optional long-form body */}
      {cs.body && (
        <section className="py-8">
          <Container className="max-w-3xl">
            <ArticleMarkdown content={cs.body} />
          </Container>
        </section>
      )}

      {/* Testimonial */}
      {cs.testimonialQuote && (
        <section className="py-12">
          <Container className="max-w-4xl">
            <figure className="relative overflow-hidden rounded-3xl bg-primary px-8 py-12 text-center text-primary-foreground sm:px-16">
              <Quote className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
              <blockquote className="mx-auto mt-5 max-w-2xl font-display text-xl font-medium leading-relaxed text-balance sm:text-2xl">
                {cs.testimonialQuote}
              </blockquote>
              {cs.testimonialAuthor && (
                <figcaption className="mt-6 text-sm text-primary-foreground/70">
                  <span className="font-semibold text-primary-foreground">{cs.testimonialAuthor}</span>
                  {cs.testimonialRole ? ` — ${cs.testimonialRole}` : ""}
                </figcaption>
              )}
            </figure>
          </Container>
        </section>
      )}

      {/* Gallery */}
      {cs.gallery && cs.gallery.length > 0 && (
        <section className="py-8">
          <Container className="max-w-5xl">
            <SectionHeading eyebrow="On the ground" title="From the programme" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cs.gallery.map((src, i) => (
                <div key={src + i} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
                  <Image
                    src={src || "/placeholder.svg"}
                    alt={`${cs.title} — photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Related studies */}
      {related.length > 0 && (
        <section className="py-16">
          <Container className="max-w-6xl">
            <SectionHeading eyebrow="Keep exploring" title="Related case studies" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <Reveal key={r._id} delay={i * 0.06}>
                  <Link
                    href={`/case-studies/${r.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/9] bg-secondary">
                      {r.coverImage ? (
                        <Image
                          src={r.coverImage || "/placeholder.svg"}
                          alt={r.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-primary/30">
                          <Building2 className="h-10 w-10" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      {r.industry ? (
                        <span className="text-xs font-medium uppercase tracking-wide text-accent">{r.industry}</span>
                      ) : null}
                      <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-foreground">
                        {r.title}
                      </h3>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                        Read case study
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaSection cta={settings.ctaPrimary} />
    </>
  )
}

function NarrativeBlock({
  icon: Icon,
  heading,
  body,
  asideTitle,
  asideItems,
}: {
  icon: React.ComponentType<{ className?: string }>
  heading: string
  body: string
  asideTitle?: string
  asideItems?: string[]
}) {
  const hasAside = Boolean(asideTitle && asideItems && asideItems.length)
  return (
    <div className={hasAside ? "grid gap-8 lg:grid-cols-[1fr_20rem]" : ""}>
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="font-display text-2xl font-semibold text-foreground">{heading}</h2>
        </div>
        <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">{body}</p>
      </div>
      {hasAside && (
        <aside className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{asideTitle}</h3>
          <ul className="mt-4 space-y-3">
            {asideItems!.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  )
}
