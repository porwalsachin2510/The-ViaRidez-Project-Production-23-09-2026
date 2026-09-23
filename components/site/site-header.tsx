'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Phone, Mail, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Icon } from '@/lib/icons'
import type { SiteSettingsData, NavItem, CtaData } from '@/lib/data/queries'

export function SiteHeader({ settings }: { settings: SiteSettingsData }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setOpenMenu(null)
  }, [pathname])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const nav = settings.navigation ?? []
  const cta = settings.ctaPrimary
  const ctaSecondary = settings.ctaSecondary
  // Over the (dark) hero we use light text; once scrolled onto the solid bar we
  // switch to dark text. The mobile drawer also forces the solid treatment.
  const solid = scrolled || mobileOpen
  const phoneHref = settings.phone ? `tel:${settings.phone.replace(/\s/g, '')}` : null

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Utility bar — collapses on scroll */}
      <div
        className={cn(
          'hidden overflow-hidden border-b border-white/10 bg-primary text-primary-foreground transition-all duration-300 lg:block',
          scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100',
        )}
      >
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-6 text-xs lg:px-8">
          <p className="text-primary-foreground/70">
            Enterprise employee transportation &amp; corporate mobility across the UAE
          </p>
          <div className="flex items-center gap-6">
            {phoneHref && (
              <a href={phoneHref} className="flex items-center gap-1.5 text-primary-foreground/80 transition-colors hover:text-accent">
                <Phone className="h-3.5 w-3.5" />
                {settings.phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 text-primary-foreground/80 transition-colors hover:text-accent">
                <Mail className="h-3.5 w-3.5" />
                {settings.email}
              </a>
            )}
            {settings.ctaClientLogin?.href && (
              <Link
                href={settings.ctaClientLogin.href}
                className="border-l border-white/15 pl-6 font-medium text-primary-foreground/90 transition-colors hover:text-accent"
              >
                {settings.ctaClientLogin.label || 'Client Login'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          'transition-all duration-300',
          solid ? 'border-b border-border bg-background/95 shadow-sm backdrop-blur-md' : 'bg-transparent',
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 lg:px-8',
            scrolled ? 'h-16' : 'h-20',
          )}
        >
          <Link href="/" className="flex shrink-0 items-center" aria-label={`${settings.companyName} home`}>
            <Image
              src={
                solid
                  ? settings.logoLight || '/brand/viaridez-logo.png'
                  : settings.logoDark || '/brand/viaridez-logo-light.png'
              }
              alt={settings.companyName}
              width={220}
              height={40}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((item, itemIndex) => (
              <NavEntry
                key={`${item.href}-${itemIndex}`}
                item={item}
                solid={solid}
                active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                open={openMenu === item.href}
                onEnter={() => setOpenMenu(item.children?.length ? item.href : null)}
                onLeave={() => setOpenMenu(null)}
                onToggle={() =>
                  setOpenMenu((prev) => (prev === item.href ? null : item.children?.length ? item.href : null))
                }
                onClose={() => setOpenMenu(null)}
              />
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            {ctaSecondary?.href && (
              <Link
                href={ctaSecondary.href}
                target={ctaSecondary.external ? '_blank' : undefined}
                rel={ctaSecondary.external ? 'noopener noreferrer' : undefined}
                className={cn(
                  'rounded-full px-4 py-2.5 text-sm font-semibold transition-colors',
                  solid
                    ? 'text-foreground/80 hover:text-primary'
                    : 'text-white/85 hover:text-white',
                )}
              >
                {ctaSecondary.label || 'Book a Demo'}
              </Link>
            )}
            <CtaButton cta={cta} />
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className={cn(
              'inline-flex items-center justify-center rounded-md p-2 lg:hidden',
              solid ? 'text-foreground' : 'text-primary-foreground',
            )}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4" aria-label="Mobile">
            {nav.map((item, itemIndex) => (
              <MobileNavEntry key={`${item.href}-${itemIndex}`} item={item} />
            ))}
            <div className="space-y-3 pt-4">
              <CtaButton cta={cta} full />
              {ctaSecondary?.href && (
                <Link
                  href={ctaSecondary.href}
                  target={ctaSecondary.external ? '_blank' : undefined}
                  rel={ctaSecondary.external ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold text-foreground"
                >
                  {ctaSecondary.label || 'Book a Demo'}
                </Link>
              )}
              {phoneHref && (
                <a
                  href={phoneHref}
                  className="flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold text-foreground"
                >
                  <Phone className="h-4 w-4 text-accent" />
                  {settings.phone}
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function NavEntry({
  item,
  active,
  open,
  solid,
  onEnter,
  onLeave,
  onToggle,
  onClose,
}: {
  item: NavItem
  active: boolean
  open: boolean
  solid: boolean
  onEnter: () => void
  onLeave: () => void
  onToggle: () => void
  onClose: () => void
}) {
  const hasChildren = !!item.children?.length
  const base = cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    solid
      ? active
        ? 'text-primary'
        : 'text-foreground/80 hover:text-primary'
      : active
        ? 'text-white'
        : 'text-white/80 hover:text-white',
  )

  if (!hasChildren) {
    return (
      <Link href={item.href} className={base}>
        {item.label}
      </Link>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      // Close when keyboard focus leaves the whole group (tabbing past it).
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <button
        type="button"
        className={cn(base, 'flex items-center gap-1')}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
      >
        {item.label}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-3">
          <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-2xl">
            {item.children!.map((child, childIndex) => (
              <Link
                key={`${child.href}-${childIndex}`}
                href={child.href}
                className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon name={child.icon || 'arrow-right'} className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{child.label}</span>
                  {child.description && (
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {child.description}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MobileNavEntry({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false)
  const hasChildren = !!item.children?.length

  if (!hasChildren) {
    return (
      <Link href={item.href} className="block rounded-md px-3 py-2.5 text-base font-medium text-foreground">
        {item.label}
      </Link>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-base font-medium text-foreground"
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown className={cn('h-5 w-5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="ml-3 border-l border-border pl-3">
          {item.children!.map((child, childIndex) => (
            <Link
              key={`${child.href}-${childIndex}`}
              href={child.href}
              className="block rounded-md px-3 py-2 text-sm text-foreground/80"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function CtaButton({ cta, full }: { cta: CtaData; full?: boolean }) {
  if (!cta?.href) return null
  return (
    <Link
      href={cta.href}
      target={cta.external ? '_blank' : undefined}
      rel={cta.external ? 'noopener noreferrer' : undefined}
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:brightness-110 hover:shadow-md',
        full && 'w-full',
      )}
    >
      {cta.label || 'Get a Quote'}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
