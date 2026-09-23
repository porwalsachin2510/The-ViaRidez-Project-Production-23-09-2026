import type { Metadata } from 'next'
import Link from 'next/link'
import { getCmsPageBySlug } from '@/lib/data/queries'
import { buildMetadata, breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo'
import { CtaSection, JsonLd, PageHero } from '@/components/site/page-shell'
import { CmsPageContent } from '@/components/site/cms-section-renderer'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug('sustainability')
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || 'Sustainability',
    description: page?.heroSubtitle || 'Lower-impact employee transportation through smarter routes and cleaner fleets.',
    path: '/sustainability',
    image: page?.heroImage,
  })
}

export default async function SustainabilityPage() {
  const page = await getCmsPageBySlug('sustainability')
  const title = page?.heroTitle || 'A more responsible way to move people'
  const subtitle =
    page?.heroSubtitle ||
    'Sustainability is practical at ViaRidez: optimise the network, improve utilisation and transition to cleaner vehicles with evidence.'

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Sustainability', path: '/sustainability' }]),
          serviceJsonLd({ name: 'Sustainable employee transportation', description: subtitle, path: '/sustainability' }),
        ]}
      />
      <PageHero
        eyebrow={page?.heroEyebrow || 'Sustainability'}
        title={title}
        description={subtitle}
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Sustainability' }]}
        image={page?.heroImage || '/media/sections/sustainability.png'}
      >
        <Link
          href="/contact"
          className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-110"
        >
          Plan a lower-impact programme
        </Link>
      </PageHero>

      {/* Every section below is editable in Admin → Content → Site Pages → Sustainability. */}
      {page ? <CmsPageContent page={page} /> : null}

      <CtaSection
        title="Make your next mobility decision count"
        description="We will help you identify practical improvements that support people, performance and the planet."
      />
    </>
  )
}
