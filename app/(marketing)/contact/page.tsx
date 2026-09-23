import type { Metadata } from "next"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { getSiteSettings, getCmsPageBySlug } from "@/lib/data/queries"
import { CmsPageContent, CmsNoteCard, splitSections } from "@/components/site/cms-section-renderer"
import { buildMetadata } from "@/lib/seo"
import { Container } from "@/components/site/primitives"
import { PageHero } from "@/components/site/page-shell"
import { ContactForm } from "@/components/site/forms"
import { MapEmbed } from "@/components/site/map-embed"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug("contact")
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || "Contact VIARIDEZ | Request a Corporate Transport Quote",
    description: page?.heroSubtitle || "Talk to VIARIDEZ about employee transportation, corporate shuttles and managed mobility across Dubai, the UAE, Kuwait, India and Nepal. Request a tailored quote today.",
    path: "/contact",
    image: page?.heroImage,
  })
}

export default async function ContactPage() {
  const [settings, cmsPage] = await Promise.all([getSiteSettings(), getCmsPageBySlug("contact")])

  // The navy sidebar card is authored in the CMS; everything else in the page
  // flows above the form.
  const { picked, rest } = splitSections(cmsPage, ["note-card"])

  const contactItems = [
    settings.phone ? { icon: Phone, label: "Call us", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` } : null,
    settings.email ? { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` } : null,
    settings.address ? { icon: MapPin, label: "Head office", value: settings.address } : null,
    { icon: Clock, label: "Hours", value: settings.businessHours || "Sun–Fri, 8:00–18:00 GST" },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[]

  return (
    <>
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "Get in touch"}
        title={cmsPage?.heroTitle || "Let's design your mobility programme"}
        description={cmsPage?.heroSubtitle || "Tell us about your routes, headcount and timelines. A VIARIDEZ specialist will prepare a tailored proposal — usually within one business day."}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Contact" }]}
        image={cmsPage?.heroImage || "/media/services/executive-chauffeur.png"}
      />

      {cmsPage && rest.length ? <CmsPageContent page={cmsPage} sections={rest} /> : null}

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <aside className="space-y-8">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">Contact details</h2>
                <ul className="mt-6 border-t border-border">
                  {contactItems.map((item) => (
                    <li key={item.label} className="flex items-start gap-4 border-b border-border py-5">
                      <item.icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm font-medium text-foreground transition-colors hover:text-accent">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-foreground">{item.value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <CmsNoteCard section={picked["note-card"]} />
            </aside>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-foreground">Send us a message</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us how we can help and our team will reply within one business day. Looking for pricing?{" "}
                <a href="/get-quote" className="font-medium text-accent hover:underline">
                  Request a quote
                </a>
                .
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>

          {settings.address && (
            <div className="mt-12">
              <h2 className="mb-4 font-display text-xl font-semibold text-foreground">Find us</h2>
              <MapEmbed
                query={settings.address}
                title={`Map showing ${settings.companyName || "VIARIDEZ"} head office`}
                className="overflow-hidden rounded-2xl"
              />
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
