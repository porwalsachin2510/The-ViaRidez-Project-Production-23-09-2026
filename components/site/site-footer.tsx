import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react'
import type { SiteSettingsData } from '@/lib/data/queries'
import { NewsletterForm } from '@/components/site/forms'
import { externalUrl } from '@/lib/external-url'

const socialIcons = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
} as const

export function SiteFooter({ settings }: { settings: SiteSettingsData }) {
  const year = new Date().getFullYear()
  const columns = settings.footerColumns ?? []
  const social = settings.social ?? {}

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand + contact */}
          <div className="lg:col-span-4">
            <Image
              src={settings.logoDark || '/brand/viaridez-logo-light.png'}
              alt={settings.companyName}
              width={240}
              height={44}
              className="h-9 w-auto"
            />
            {settings.tagline && (
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
                {settings.tagline}
              </p>
            )}
            <ul className="mt-6 space-y-3 text-sm text-primary-foreground/80">
              {settings.address && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-accent">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <a href={`mailto:${settings.email}`} className="hover:text-accent">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {columns.map((col, colIndex) => (
              <div key={`${col.title}-${colIndex}`}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link, linkIndex) => (
                    <li key={`${link.href}-${linkIndex}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 sm:grid-cols-[1.2fr_1fr] sm:items-center sm:p-8">
          <div>
            <h3 className="font-display text-lg font-semibold text-primary-foreground">
              Mobility insights, straight to your inbox
            </h3>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-primary-foreground/70">
              Practical guidance on corporate transport, free-zone logistics and workforce
              mobility. No spam — unsubscribe anytime.
            </p>
          </div>
          <NewsletterForm source="footer" compact />
        </div>

        <nav
          aria-label="Utility"
          className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-primary-foreground/15 pt-8 text-xs"
        >
          {[
            { label: 'FAQ', href: '/faq' },
            { label: 'Contact', href: '/contact' },
            { label: 'Privacy Policy', href: '/legal/privacy-policy' },
            { label: 'Cookie Policy', href: '/legal/cookie-policy' },
            { label: 'Terms', href: '/legal/terms-of-service' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-primary-foreground/60 transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-col items-center justify-between gap-6 pt-2 sm:flex-row">
          <p className="text-xs text-primary-foreground/60">
            &copy; {year} {settings.companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {(Object.keys(socialIcons) as (keyof typeof socialIcons)[]).map((key) => {
              // Normalise so a CMS value like `linkedin.com/company/x` doesn't
              // resolve against our own origin.
              const url = externalUrl(social[key])
              if (!url) return null
              const SocialIcon = socialIcons[key]
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${settings.companyName} on ${key}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/70 transition-colors hover:border-accent hover:text-accent"
                >
                  <SocialIcon className="h-4 w-4" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
