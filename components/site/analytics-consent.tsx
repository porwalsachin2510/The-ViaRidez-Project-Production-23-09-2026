'use client'

import Link from 'next/link'
import Script from 'next/script'
import { useCallback, useEffect, useState } from 'react'

/**
 * Consent-gated analytics for the public site.
 *
 * - Reads GA4 / GTM ids from CMS site settings (passed as props).
 * - Uses Google Consent Mode v2: consent defaults to "denied" so no
 *   analytics/ads cookies are set until the visitor opts in (PDPL / GDPR).
 * - Renders a cookie consent banner until a choice is stored.
 * - Choice persists in localStorage AND a first-party cookie so the decision
 *   survives reloads and is available to the server if ever needed.
 */

const CONSENT_KEY = 'vr-cookie-consent'
const CONSENT_COOKIE = 'vr_consent'
type ConsentState = 'granted' | 'denied' | null

function readConsent(): ConsentState {
  if (typeof window === 'undefined') return null
  const v = window.localStorage.getItem(CONSENT_KEY)
  return v === 'granted' || v === 'denied' ? v : null
}

function persistConsent(state: 'granted' | 'denied') {
  window.localStorage.setItem(CONSENT_KEY, state)
  // 6-month first-party cookie, lax so it survives normal navigation.
  const maxAge = 60 * 60 * 24 * 180
  document.cookie = `${CONSENT_COOKIE}=${state}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function AnalyticsConsent({
  gaId,
  gtmId,
  cookiePolicyHref = '/legal/cookie-policy',
}: {
  gaId?: string
  gtmId?: string
  cookiePolicyHref?: string
}) {
  const [consent, setConsent] = useState<ConsentState>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setConsent(readConsent())
    setMounted(true)
  }, [])

  const update = useCallback((state: 'granted' | 'denied') => {
    persistConsent(state)
    setConsent(state)
    // Update Google Consent Mode live so no reload is required.
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
        analytics_storage: state,
      })
    }
  }, [])

  const hasAnalytics = Boolean(gaId || gtmId)
  const showBanner = mounted && hasAnalytics && consent === null

  return (
    <>
      {/* Consent Mode defaults — must load before GA/GTM. */}
      {hasAnalytics && (
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            var stored = (function(){try{return localStorage.getItem('${CONSENT_KEY}')}catch(e){return null}})();
            gtag('consent', 'default', {
              ad_storage: stored === 'granted' ? 'granted' : 'denied',
              ad_user_data: stored === 'granted' ? 'granted' : 'denied',
              ad_personalization: stored === 'granted' ? 'granted' : 'denied',
              analytics_storage: stored === 'granted' ? 'granted' : 'denied',
              wait_for_update: 500
            });
          `}
        </Script>
      )}

      {/* GA4 */}
      {gaId && (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {/* GTM */}
      {gtmId && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      )}

      {showBanner && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-2xl md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We use cookies to analyse traffic and improve your experience. You can accept
              analytics cookies or continue with only essential cookies. See our{' '}
              <Link
                href={cookiePolicyHref}
                className="font-medium text-accent underline underline-offset-2"
              >
                Cookie Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => update('denied')}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => update('granted')}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}
