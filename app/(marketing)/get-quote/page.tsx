import type { Metadata } from "next"
import { getServices, getSiteSettings, getCmsPageBySlug } from "@/lib/data/queries"
import { CmsPageContent, CmsIconList, CmsNoteCard, splitSections } from "@/components/site/cms-section-renderer"
import { buildMetadata, breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo"
import { Container } from "@/components/site/primitives"
import { PageHero, JsonLd } from "@/components/site/page-shell"
import { QuoteWizard } from "@/components/site/quote-wizard"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug("get-quote")
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || "Get an Instant Transport Quote & Cost Estimate | ViaRidez",
    description: page?.heroSubtitle || "Use the ViaRidez quote wizard to get an indicative monthly cost and savings estimate for your employee transportation programme in minutes — then receive a tailored proposal.",
    path: "/get-quote",
    image: page?.heroImage,
  })
}

export default async function GetQuotePage() {
  const [services, settings, cmsPage] = await Promise.all([getServices(), getSiteSettings(), getCmsPageBySlug("get-quote")])
  const serviceOptions = services.filter((s) => !s.parent).map((s) => s.title)
  const { picked, rest } = splitSections(cmsPage, ["icon-list", "note-card"])

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Get a quote", path: "/get-quote" },
          ]),
          serviceJsonLd({
            name: "Employee Transportation Quote",
            description: "Instant indicative cost estimate for corporate employee transportation.",
            path: "/get-quote",
          }),
        ]}
      />
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "Instant estimate"}
        title={cmsPage?.heroTitle || "Get your transport cost estimate"}
        description={cmsPage?.heroSubtitle || "Answer three quick questions to see an indicative monthly cost and how much you could save versus ride-hailing. We'll follow up with a tailored proposal."}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Get a quote" }]}
        image={cmsPage?.heroImage || "/media/services/staff-transport.png"}
      />

      {cmsPage && rest.length ? <CmsPageContent page={cmsPage} sections={rest} /> : null}

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            <div className="order-2 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:order-1">
              <QuoteWizard services={serviceOptions.length ? serviceOptions : ["Employee Transportation"]} />
            </div>

            <aside className="order-1 space-y-6 lg:order-2">
              {/* Authored in Admin → Content → Site Pages → Get a Quote. */}
              <CmsIconList section={picked["icon-list"]} />
              {settings?.phone ? (
                <CmsNoteCard section={picked["note-card"]}>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
                  >
                    {settings.phone}
                  </a>
                </CmsNoteCard>
              ) : null}
            </aside>
          </div>
        </Container>
      </section>
    </>
  )
}
