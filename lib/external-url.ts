/**
 * Normalises CMS-authored outbound links.
 *
 * Admins routinely type `www.viaridez.com` or `viaridez.com` without a scheme.
 * A bare value like that is a *relative* href, so the browser resolves it
 * against the current origin and you end up on
 * `http://localhost:3000/www.viaridez.com` instead of the client's site.
 * Prefixing `https://` makes it an absolute URL again.
 *
 * Returns `null` when there is nothing usable to link to, so callers can fall
 * back to rendering plain text rather than a dead anchor.
 */
export function externalUrl(value?: string | null): string | null {
  const raw = (value ?? '').trim()
  if (!raw) return null

  // Already-absolute, or a non-web scheme we should leave untouched.
  if (/^(https?:)?\/\//i.test(raw)) {
    // Protocol-relative (`//example.com`) -> pin to https.
    return raw.startsWith('//') ? `https:${raw}` : raw
  }
  if (/^(mailto:|tel:)/i.test(raw)) return raw

  // Reject anything that still can't be a hostname (e.g. a stray "/about" or
  // a bare label with no dot) so we never emit a broken absolute link.
  if (raw.startsWith('/') || raw.startsWith('#')) return null
  if (!/^[^\s/?#]+\.[^\s/?#]+/.test(raw)) return null

  return `https://${raw.replace(/^\/+/, '')}`
}

/**
 * Display form of a link: strips the scheme, `www.` and any trailing slash so
 * the UI can show `viaridez.com` instead of `https://www.viaridez.com/`.
 */
export function prettyUrlLabel(value?: string | null): string {
  const url = externalUrl(value)
  if (!url) return ''
  return url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '')
}
