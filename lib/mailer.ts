import 'server-only'

import { isIP } from 'node:net'
import { lookup as dnsLookup } from 'node:dns/promises'

import nodemailer, { type Transporter } from 'nodemailer'
import type SMTPPool from 'nodemailer/lib/smtp-pool'

/**
 * SMTP transport for all outbound mail.
 *
 * Env values are trimmed on read: a trailing space pasted into EMAIL_PASS or
 * EMAIL_HOST makes SMTP auth fail with a confusing "invalid login" instead of
 * anything that points at whitespace.
 */
function env(key: string): string {
  return (process.env[key] ?? '').trim()
}

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

/**
 * Reads and validates SMTP settings. Returns null when the transport isn't
 * configured so callers can degrade gracefully rather than throw.
 */
export function getSmtpConfig(): SmtpConfig | null {
  const host = env('EMAIL_HOST')
  const user = env('EMAIL_USER')
  const pass = env('EMAIL_PASS')
  if (!host || !user || !pass) return null

  const port = Number(env('EMAIL_PORT') || 587)
  const secureRaw = env('EMAIL_SECURE').toLowerCase()
  // Implicit TLS on 465; STARTTLS on 587/25. An explicit EMAIL_SECURE wins.
  const secure = secureRaw ? secureRaw === 'true' || secureRaw === '1' : port === 465

  return {
    host,
    port: Number.isFinite(port) && port > 0 ? port : 587,
    secure,
    user,
    pass,
    // Fall back to the authenticated mailbox so `from` is never empty (many
    // providers reject or silently rewrite a mismatched envelope sender).
    from: env('EMAIL_FROM') || `VIARIDEZ <${user}>`,
  }
}

// Reuse one pooled transport across hot reloads / lambda invocations instead of
// opening a fresh TCP+TLS handshake per email.
const globalForMailer = globalThis as unknown as {
  __viaridezTransporter?: Transporter
  __viaridezTransporterPromise?: Promise<Transporter | null>
}

/**
 * Resolve the SMTP host to an IPv4 literal.
 *
 * Many hosting platforms (Render free tier, some container runtimes) have no
 * outbound IPv6 route. nodemailer resolves the SMTP hostname itself and, when
 * the provider publishes AAAA records (Gmail does), can pin the connection to
 * an IPv6 address — which then fails with `connect ENETUNREACH <ipv6>`. By
 * pre-resolving to an A record and handing nodemailer an IPv4 literal (while
 * keeping the original hostname as the TLS servername for certificate
 * validation), we guarantee the socket uses IPv4.
 *
 * Falls back to the original hostname if resolution fails, so a transient DNS
 * hiccup never permanently disables mail.
 */
async function resolveIPv4Host(host: string): Promise<string> {
  if (isIP(host)) return host
  try {
    const { address } = await dnsLookup(host, { family: 4 })
    return address || host
  } catch {
    return host
  }
}

async function createTransporter(): Promise<Transporter | null> {
  const config = getSmtpConfig()
  if (!config) return null

  const ipv4Host = await resolveIPv4Host(config.host)

  const options: SMTPPool.Options = {
    host: ipv4Host,
    port: config.port,
    secure: config.secure,
    // Force IPv4 at the socket layer as well (belt-and-suspenders alongside the
    // pre-resolved A record) and validate the cert against the real hostname.
    // `family` is a valid net.connect option that nodemailer forwards but does
    // not surface in its TransportOptions types, hence the cast below.
    tls: { servername: config.host },
    auth: { user: config.user, pass: config.pass },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  }

  return nodemailer.createTransport({ ...options, family: 4 } as SMTPPool.Options)
}

export async function getTransporter(): Promise<Transporter | null> {
  if (globalForMailer.__viaridezTransporter) {
    return globalForMailer.__viaridezTransporter
  }

  if (!globalForMailer.__viaridezTransporterPromise) {
    globalForMailer.__viaridezTransporterPromise = createTransporter().then((transporter) => {
      if (transporter) globalForMailer.__viaridezTransporter = transporter
      // Clear the in-flight promise so a null result (unconfigured SMTP) can be
      // retried later once env vars are added, without a stale rejected cache.
      globalForMailer.__viaridezTransporterPromise = undefined
      return transporter
    })
  }

  return globalForMailer.__viaridezTransporterPromise
}

/** Verifies the SMTP credentials/connection. Used by the admin health check. */
export async function verifySmtp(): Promise<{ ok: boolean; error?: string }> {
  const transporter = await getTransporter()
  if (!transporter) return { ok: false, error: 'smtp-not-configured' }
  try {
    await transporter.verify()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'unknown' }
  }
}

/**
 * Crude HTML -> text fallback for the multipart alternative. Every template we
 * send is our own simple markup, so this doesn't need to be a full parser —
 * but a text part meaningfully improves spam scoring.
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(p|div|tr|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
