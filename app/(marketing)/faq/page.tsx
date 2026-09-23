import type { Metadata } from 'next'
import { getFAQs, getSiteSettings, getCmsPageBySlug } from '@/lib/data/queries'
import { CmsPageContent } from '@/components/site/cms-section-renderer'
import { buildMetadata, faqJsonLd, breadcrumbJsonLd } from '@/lib/seo'
import { Container, SectionHeading } from '@/components/site/primitives'
import { PageHero, JsonLd, CtaSection } from '@/components/site/page-shell'
import { FaqAccordion } from '@/components/site/faq-accordion'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug('faq')
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || 'Frequently Asked Questions',
    description: page?.heroSubtitle || 'Answers to common questions about VIARIDEZ employee transportation, corporate shuttles, fleet, free-zone routes, safety, billing and service coverage across the UAE and beyond.',
    path: '/faq',
    image: page?.heroImage,
  })
}

/** Turn a category key into a readable heading. */
function label(cat?: string) {
  if (!cat) return 'General'
  return cat.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function FaqPage() {
  const [faqs, settings, cmsPage] = await Promise.all([getFAQs(), getSiteSettings(), getCmsPageBySlug("faq")])

  // Group by category, preserving DB order within each group.
  const groups = new Map<string, typeof faqs>()
  for (const f of faqs) {
    const key = f.category || 'general'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(f)
  }
  const grouped = Array.from(groups.entries())

  return (
    <>
      <JsonLd
        data={[
          faqJsonLd(faqs.map((f) => ({ question: f.question, answer: f.answer }))),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
        ]}
      />

      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "Answers"}
        title={cmsPage?.heroTitle || "Frequently asked questions"}
        description={cmsPage?.heroSubtitle || "Everything corporate mobility managers ask us — from onboarding and safety to billing, coverage and technology. Can't find your answer? Talk to our team."}
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'FAQ' }]}
        image={cmsPage?.heroImage || undefined}
      />

      {cmsPage?.sections?.length ? <section className="py-16 sm:py-24"><Container><CmsPageContent page={cmsPage} /></Container></section> : null}

      <section className="py-16 sm:py-24">
        <Container>
          {faqs.length === 0 ? (
            <p className="text-center text-muted-foreground">
              FAQs are being updated. Please{' '}
              <a href="/contact" className="text-accent underline underline-offset-2">
                contact us
              </a>{' '}
              in the meantime.
            </p>
          ) : (
            <div className="mx-auto max-w-3xl space-y-14">
              {grouped.map(([cat, items]) => (
                <div key={cat} id={cat}>
                  {grouped.length > 1 && (
                    <SectionHeading title={label(cat)} className="mb-6 max-w-none" />
                  )}
                  <FaqAccordion items={items} />
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      <CtaSection
        cta={settings.ctaPrimary}
        title="Still have questions?"
        description="Our mobility specialists are happy to walk you through routes, pricing and onboarding."
      />
    </>
  )
}
