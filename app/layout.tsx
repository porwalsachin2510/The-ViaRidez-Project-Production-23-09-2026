import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Sora, Inter } from 'next/font/google'
import { getSiteSettings } from '@/lib/data/queries'
import { SITE_URL, DEFAULT_TWITTER, DEFAULT_OG_IMAGE } from '@/lib/seo'
import './globals.css'

const display = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const FALLBACK_TITLE =
  'ViaRidez | Enterprise Employee Transportation & Corporate Mobility'
const FALLBACK_DESCRIPTION =
  'ViaRidez delivers reliable, technology-driven employee transportation, corporate shuttles, and managed mobility across Dubai, the UAE free zones, Kuwait, India and Nepal.'
const FALLBACK_KEYWORDS = [
  'employee transportation',
  'corporate mobility',
  'staff transport Dubai',
  'free zone shuttle',
  'JAFZA transport',
  'MICE transport',
  'fleet management',
]

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const seo = settings.seo ?? {}

  const defaultTitle = settings.defaultSeo?.metaTitle || FALLBACK_TITLE
  const template = seo.titleTemplate || '%s | ViaRidez'
  const description = settings.defaultSeo?.metaDescription || FALLBACK_DESCRIPTION
  const keywords = seo.defaultKeywords?.length ? seo.defaultKeywords : FALLBACK_KEYWORDS
  const ogImage = seo.defaultOgImage || settings.defaultSeo?.ogImage || DEFAULT_OG_IMAGE
  const twitterSite = seo.twitterSite || DEFAULT_TWITTER
  const v = seo.verification ?? {}
  const otherVerification: Record<string, string> = {}
  if (v.bing) otherVerification['msvalidate.01'] = v.bing
  if (v.pinterest) otherVerification['p:domain_verify'] = v.pinterest

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: defaultTitle, template },
    description,
    generator: 'v0.app',
    applicationName: 'ViaRidez',
    keywords,
    ...(v.google || v.yandex || Object.keys(otherVerification).length
      ? {
          verification: {
            ...(v.google ? { google: v.google } : {}),
            ...(v.yandex ? { yandex: v.yandex } : {}),
            ...(Object.keys(otherVerification).length ? { other: otherVerification } : {}),
          },
        }
      : {}),
    openGraph: {
      type: 'website',
      siteName: 'ViaRidez',
      locale: 'en_AE',
      title: defaultTitle,
      description,
      url: SITE_URL,
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'ViaRidez' }],
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterSite,
      creator: seo.twitterCreator || twitterSite,
      title: defaultTitle,
      description,
      images: [ogImage],
    },
    icons: {
      icon: '/icon.svg',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F2E4D' },
    { media: '(prefers-color-scheme: dark)', color: '#0F2E4D' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} bg-background`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
