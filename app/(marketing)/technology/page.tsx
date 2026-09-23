import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getCmsPageBySlug,
  getSiteSettings,
  getTestimonials,
  getClients,
} from '@/lib/data/queries'
import { buildMetadata, breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo'
import { CtaSection, JsonLd, PageHero } from '@/components/site/page-shell'
import { ClientWall } from '@/components/site/client-wall'
import { TestimonialsSection } from '@/components/site/home/sections'
import { CmsSectionRenderer } from '@/components/site/cms-section-renderer'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug('technology')
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || 'Technology Platform',
    description:
      page?.heroSubtitle ||
      'One connected platform to plan, track and manage corporate transport — with live GPS tracking, onboard cameras and operational analytics.',
    path: '/technology',
    image: page?.heroImage,
  })
}

export default async function TechnologyPage() {
  const [page, settings, testimonials, clients] = await Promise.all([
    getCmsPageBySlug('technology'),
    getSiteSettings(),
    getTestimonials(),
    getClients(),
  ])

  const title = page?.heroTitle || 'The technology platform behind every ViaRidez trip'
  const subtitle =
    page?.heroSubtitle ||
    'One connected platform to plan, track and manage corporate transport — giving your teams live visibility, safer journeys and data they can act on.'

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Technology', path: '/technology' },
          ]),
          serviceJsonLd({
            name: 'Corporate mobility technology platform',
            description: subtitle,
            path: '/technology',
          }),
        ]}
      />

      <PageHero
        eyebrow={page?.heroEyebrow || 'Technology & platform'}
        title={title}
        description={subtitle}
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Technology' }]}
        image={page?.heroImage || '/media/technology/platform-dashboard.png'}
      >
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/book-demo"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-110"
          >
            See the platform in action
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            Talk to our team
          </Link>
        </div>
      </PageHero>

      {/* Fully CMS-managed body: stat bar, overview, capabilities, modules,
          steps, personas, mobile app and trust sections are all editable
          from Admin → Content → Landing Pages → Technology. */}
      <CmsSectionRenderer sections={page?.sections} />

      {/* Social proof (real, separately-managed data) */}
      <ClientWall clients={clients} eyebrow="Trusted by" title="Enterprises that move with ViaRidez" />
      <TestimonialsSection testimonials={testimonials} />

      <CtaSection
        cta={settings.ctaPrimary}
        title="See the ViaRidez platform in action"
        description="Book a walkthrough and we'll show you how the platform gives your organisation live visibility, safer journeys and data you can act on."
      />
    </>
  )
}
