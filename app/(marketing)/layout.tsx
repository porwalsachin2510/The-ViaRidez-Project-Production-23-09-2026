import type { ReactNode } from 'react'
import Script from 'next/script'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { WhatsAppButton } from '@/components/site/whatsapp-button'
import { AnalyticsConsent } from '@/components/site/analytics-consent'
import { getSiteSettings } from '@/lib/data/queries'
import { organizationJsonLd, localBusinessJsonLd, websiteJsonLd } from '@/lib/seo'

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()
  const org = settings.seo?.organization ?? {}

  const sameAs = Object.values(settings.social ?? {}).filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  )

  const structuredAddress = {
    streetAddress: org.streetAddress,
    addressLocality: org.addressLocality,
    addressRegion: org.addressRegion,
    postalCode: org.postalCode,
    addressCountry: org.addressCountry,
  }

  const siteLd = websiteJsonLd({ name: settings.companyName || 'ViaRidez' })

  const orgLd = organizationJsonLd({
    name: settings.companyName || 'ViaRidez',
    legalName: org.legalName,
    phone: settings.phone,
    email: settings.email,
    foundingDate: org.foundingDate,
    address: structuredAddress,
    sameAs,
  })

  const businessLd = localBusinessJsonLd({
    name: settings.companyName || 'ViaRidez',
    path: '/',
    address: settings.address,
    structuredAddress,
    phone: settings.phone,
    email: settings.email,
    areaServed: 'United Arab Emirates',
    priceRange: org.priceRange,
    openingHours: org.openingHours,
    latitude: org.latitude,
    longitude: org.longitude,
  })

  return (
    <>
      <Script
        id="ld-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([siteLd, orgLd, businessLd]) }}
      />
      <SiteHeader settings={settings} />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <SiteFooter settings={settings} />
      {settings.chat?.enabled !== false ? <WhatsAppButton number={settings.chat?.number || settings.whatsapp || settings.phone} message={settings.chat?.message} consentRequired={settings.chat?.consentRequired !== false} /> : null}
      <AnalyticsConsent
        gaId={settings.analytics?.gaId}
        gtmId={settings.analytics?.gtmId}
      />
    </>
  )
}
