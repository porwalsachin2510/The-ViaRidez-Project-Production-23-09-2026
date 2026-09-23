import 'server-only'
import crypto from 'node:crypto'
import { headers } from 'next/headers'

const MAX_TEXT = 2000

export function boundedText(value: unknown, max = MAX_TEXT): string {
  return String(value ?? '').trim().slice(0, max)
}

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export async function requestMetadata() {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || h.get('x-real-ip') || 'unknown'
  const userAgent = boundedText(h.get('user-agent'), 300)
  const referrer = boundedText(h.get('referer'), 500)
  return {
    ipHash: sha256(ip),
    userAgentHash: sha256(userAgent),
    referrer,
    origin: boundedText(h.get('origin'), 300),
  }
}

export function fingerprint(scope: string, payload: unknown): string {
  return sha256(`${scope}:${JSON.stringify(payload)}`)
}
