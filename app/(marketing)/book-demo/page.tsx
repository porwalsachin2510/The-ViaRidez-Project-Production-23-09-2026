import type { Metadata } from "next"
import { getCmsPageBySlug } from "@/lib/data/queries"
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo"
import { CmsPageContent, CmsIconList, CmsNoteCard, splitSections } from "@/components/site/cms-section-renderer"
import { Container } from "@/components/site/primitives"
import { PageHero, JsonLd } from "@/components/site/page-shell"
import { DemoForm } from "@/components/site/forms"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug("book-demo")
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || "Book a Demo | See ViaRidez Corporate Mobility in Action",
    description: page?.heroSubtitle || "Book a personalised demo of the ViaRidez managed mobility platform — route planning, live tracking, reporting and employee experience for your organisation.",
    path: "/book-demo",
    image: page?.heroImage,
  })
}

export default async function BookDemoPage() {
  const cmsPage = await getCmsPageBySlug("book-demo")
  const { picked, rest } = splitSections(cmsPage, ["icon-list", "note-card"])

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Book a demo", path: "/book-demo" },
        ])}
      />
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "See it in action"}
        title={cmsPage?.heroTitle || "Book a personalised demo"}
        description={cmsPage?.heroSubtitle || "Pick a time that works for you. We'll walk your team through a live demo tailored to your routes, headcount and goals — no slideware, just the platform."}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Book a demo" }]}
        image={cmsPage?.heroImage || "/media/services/technology-platform.png"}
      />

      {cmsPage && rest.length ? <CmsPageContent page={cmsPage} sections={rest} /> : null}

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <aside className="space-y-6">
              {/* Authored in Admin → Content → Site Pages → Book a Demo. */}
              <CmsIconList section={picked["icon-list"]} />
              <CmsNoteCard section={picked["note-card"]} />
            </aside>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-foreground">Request your demo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us your preferred slot and we&apos;ll confirm by email.
              </p>
              <div className="mt-6">
                <DemoForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
