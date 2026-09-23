import { Hero } from '@/components/site/home/hero'
import {
  StatsBar,
  ServicesSection,
  IndustriesSection,
  ProcessSection,
  FleetSection,
  WhySection,
  CoverageSection,
  TestimonialsSection,
  CtaBand,
} from '@/components/site/home/sections'
import {
  getSiteSettings,
  getParentServices,
  getIndustries,
  getFleetCategories,
  getTestimonials,
  getLocations,
  getClients,
} from '@/lib/data/queries'
import { ClientWall } from '@/components/site/client-wall'
import { getCmsPageBySlug } from '@/lib/data/queries'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug('home')
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || 'Corporate Transportation & Employee Mobility | ViaRidez UAE',
    description: page?.heroSubtitle || 'Reliable, compliant and technology-driven corporate transportation across the UAE.',
    path: '/',
    image: page?.heroImage,
  })
}

export default async function HomePage() {
  const [settings, services, industries, fleet, testimonials, locations, clients, page] =
    await Promise.all([
      getSiteSettings(),
      getParentServices(),
      getIndustries(),
      getFleetCategories(),
      getTestimonials(),
      getLocations(),
      getClients(),
      getCmsPageBySlug('home'),
    ])

  const trustBar = page?.sections?.find((s) => s.type === 'trust-bar')

  return (
    <>
      <Hero settings={settings} page={page} />
      <StatsBar stats={settings.stats} />
      <ClientWall clients={clients} eyebrow={trustBar?.eyebrow || undefined} title={trustBar?.heading || undefined} />
      <ServicesSection services={services} />
      <IndustriesSection industries={industries} />
      <ProcessSection />
      <FleetSection fleet={fleet} />
      <WhySection />
      <CoverageSection locations={locations} />
      <TestimonialsSection testimonials={testimonials} />
      <CtaBand settings={settings} />
    </>
  )
}
