import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container } from "@/components/site/primitives"
import { PageHero } from "@/components/site/page-shell"
import { CmsSectionRenderer } from "@/components/site/cms-section-renderer"
import { buildMetadata } from "@/lib/seo"
import { getCmsPageBySlug } from "@/lib/data/queries"
import { legalDocs, legalSlugs } from "@/lib/legal-content"

// Allow CMS-authored legal slugs beyond the built-in three to render on demand.
export const dynamicParams = true

export function generateStaticParams() {
  return legalSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getCmsPageBySlug(`legal-${slug}`)
  const doc = legalDocs[slug]
  if (!page && !doc) return { title: "Not found" }
  return buildMetadata({
    seo:
      page?.seo ??
      (doc ? { metaTitle: `${doc.title} | ViaRidez`, metaDescription: doc.metaDescription } : undefined),
    title: page?.title ?? doc?.title,
    path: `/legal/${slug}`,
  })
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // CMS content is authoritative when present; the static library is a fallback
  // so the pages keep working even before the content seed has run.
  const page = await getCmsPageBySlug(`legal-${slug}`)
  const doc = legalDocs[slug]
  if (!page && !doc) notFound()

  if (page?.sections?.length) {
    return (
      <>
        <PageHero
          eyebrow="Legal"
          title={page.heroTitle || page.title}
          description={page.heroSubtitle || doc?.intro}
          breadcrumbs={[{ name: "Home", href: "/" }, { name: page.title }]}
        />
        <CmsSectionRenderer sections={page.sections} />
      </>
    )
  }

  // Fallback: render from the static legal library.
  if (!doc) notFound()
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={doc.title}
        description={doc.intro}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: doc.title },
        ]}
      />
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-12">
            {doc.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((p, i) => (
                    <p key={i} className="leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-16 border-t border-border pt-8 text-sm text-muted-foreground">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </Container>
      </section>
    </>
  )
}
