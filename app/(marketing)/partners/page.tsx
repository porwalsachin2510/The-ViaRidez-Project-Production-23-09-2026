import type { Metadata } from "next"
import { TrendingUp, CalendarClock, ShieldCheck, Wallet, Route, Headset } from "lucide-react"
import { getSiteSettings, getCmsPageBySlug } from "@/lib/data/queries"
import { CmsPageContent } from "@/components/site/cms-section-renderer"
import { buildMetadata, breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo"
import { Container, SectionHeading } from "@/components/site/primitives"
import { PageHero, JsonLd } from "@/components/site/page-shell"
import { PartnerForm } from "@/components/site/forms"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug("partners")
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || "Become a Fleet Partner | Attach Your Vehicles to ViaRidez",
    description: page?.heroSubtitle || "Partner with ViaRidez to keep your buses, coaches, vans and cars earning. Join our vetted supply network for corporate employee transportation across the UAE with steady, contracted demand.",
    path: "/partners",
    image: page?.heroImage,
  })
}

const benefits = [
  {
    icon: CalendarClock,
    title: "Steady, contracted demand",
    text: "Long-term corporate transport contracts mean predictable utilisation — not one-off trips.",
  },
  {
    icon: Wallet,
    title: "Reliable, on-time payments",
    text: "Transparent settlement cycles and clear rate cards, so you always know what you'll earn.",
  },
  {
    icon: Route,
    title: "Optimised routing",
    text: "Our planning team maximises trips per vehicle, reducing dead mileage and idle time.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance support",
    text: "We help you stay aligned with RTA and free-zone permit requirements across the Emirates.",
  },
  {
    icon: Headset,
    title: "Dedicated partner desk",
    text: "A single point of contact for scheduling, documentation and day-to-day operations.",
  },
  {
    icon: TrendingUp,
    title: "Grow with us",
    text: "Strong performers get first access to new routes and larger contracts as we scale.",
  },
]

const steps = [
  { n: "01", title: "Apply", text: "Tell us about your company, fleet and coverage using the form." },
  { n: "02", title: "Verification", text: "We review your permits, insurance, vehicle condition and safety record." },
  { n: "03", title: "Onboarding", text: "Sign the partner agreement, align on rate cards, SLAs and branding." },
  { n: "04", title: "Go live", text: "Start receiving optimised, contracted routes through our operations team." },
]

const requirements = [
  "Valid UAE trade licence and passenger transport permits",
  "Comprehensive vehicle and passenger insurance",
  "Well-maintained, roadworthy fleet (buses, vans, SUVs or sedans)",
  "Professional, licensed and background-checked drivers",
  "Ability to meet corporate punctuality and safety standards",
]

export default async function PartnersPage() {
  const [settings, cmsPage] = await Promise.all([getSiteSettings(), getCmsPageBySlug("partners")])

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Fleet Partners", path: "/partners" },
          ]),
          serviceJsonLd({
            name: "Fleet Partner Programme",
            description:
              "Vetted supply network for transport operators to attach their vehicles to ViaRidez corporate mobility contracts.",
            path: "/partners",
          }),
        ]}
      />
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "Fleet partner programme"}
        title={cmsPage?.heroTitle || "Put your fleet to work with ViaRidez"}
        description={cmsPage?.heroSubtitle || "Join our vetted network of transport operators. Attach your buses, coaches, vans and cars to long-term corporate contracts and keep your vehicles earning."}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Fleet Partners" }]}
        image={cmsPage?.heroImage || "/media/sections/fleet-partners.png"}
      >
        <a
          href="#apply"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:brightness-110"
        >
          Apply to become a partner
        </a>
      </PageHero>

      {cmsPage?.sections?.length ? <section className="py-16 sm:py-24"><Container><CmsPageContent page={cmsPage} /></Container></section> : null}

      {/* Benefits */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Why partner with us"
            title="Keep your vehicles moving and earning"
            description="We connect trusted operators with enterprise clients who need dependable, professional transport at scale."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                  <b.icon className="h-5 w-5 text-accent" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="From application to your first route"
            align="center"
          />
          <ol className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <span className="font-display text-2xl font-bold text-accent">{s.n}</span>
                <h3 className="mt-3 font-display text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Requirements + form */}
      <section id="apply" className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <aside className="space-y-6">
              <SectionHeading
                eyebrow="Eligibility"
                title="What we look for in a partner"
              />
              <ul className="space-y-3">
                {requirements.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {settings?.phone ? (
                <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
                  <p className="font-display text-lg font-semibold">Questions first?</p>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
                    Speak to our fleet partnerships desk before you apply.
                  </p>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
                  >
                    {settings.phone}
                  </a>
                </div>
              ) : null}
            </aside>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-semibold text-foreground">Fleet partner application</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Tell us about your company and fleet. Our team reviews every application personally.
              </p>
              <div className="mt-6">
                <PartnerForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
