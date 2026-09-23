import type { Metadata } from "next"
import { ArrowUpRight, FileText, LockKeyhole } from "lucide-react"
import { getResources, getCmsPageBySlug } from "@/lib/data/queries"
import { CmsPageContent } from "@/components/site/cms-section-renderer"
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo"
import { Container, SectionHeading } from "@/components/site/primitives"
import { PageHero, JsonLd } from "@/components/site/page-shell"
import { ResourceDownloadForm } from "@/components/site/resource-download-form"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug("resources")
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || "Mobility Resources | ViaRidez",
    description: page?.heroSubtitle || "Practical guides, reports and playbooks for better corporate transportation across the UAE.",
    path: "/resources",
    image: page?.heroImage,
  })
}

const typeLabels: Record<string, string> = {
  guide: "Guide",
  report: "Report",
  playbook: "Playbook",
  checklist: "Checklist",
  "case-study": "Case study",
}

export default async function ResourcesPage() {
  const [resources, cmsPage] = await Promise.all([getResources(), getCmsPageBySlug("resources")])

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }])} />
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "Mobility resources"}
        title={cmsPage?.heroTitle || "Ideas and tools for moving people better"}
        description={cmsPage?.heroSubtitle || "Explore practical guides, benchmark reports and playbooks to help your organisation build safer, more efficient employee transportation."}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Resources" }]}
        image={cmsPage?.heroImage || "/media/sections/fleet-partners.png"}
      />

      {cmsPage?.sections?.length ? <section className="py-16 sm:py-24"><Container><CmsPageContent page={cmsPage} /></Container></section> : null}

      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="The resource library"
            title="Useful thinking, ready when you are"
            description="Download the resources that match your next mobility decision."
          />
          {resources.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              New resources are on the way. Check back soon.
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <article key={resource._id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="flex min-h-40 items-end bg-primary p-6 text-primary-foreground">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                        {typeLabels[resource.type ?? "guide"] ?? "Resource"}
                      </span>
                      <FileText className="mt-5 h-8 w-8 text-accent" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-3">
                      {resource.featured ? <span className="text-xs font-semibold text-accent">Featured</span> : <span />}
                      {resource.gated ? <LockKeyhole className="h-4 w-4 text-muted-foreground" aria-label="Email required" /> : null}
                    </div>
                    <h2 className="mt-3 font-display text-xl font-semibold text-foreground">{resource.title}</h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{resource.excerpt}</p>
                    {resource.tags?.length ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-6 border-t border-border pt-5">
                      {resource.gated ? (
                        <ResourceDownloadForm resourceId={resource._id} />
                      ) : (
                        <a
                          href={resource.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                        >
                          Download resource <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
