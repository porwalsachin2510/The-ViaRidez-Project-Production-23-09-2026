import 'server-only'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Redirect } from '@/models'

export interface RedirectRule {
  source: string
  destination: string
  permanent: boolean
}

/**
 * In-memory cache of all redirect rules. Refreshed at most once per TTL so the
 * proxy can resolve 301/302s on every request without hammering Mongo. The
 * admin CRUD can call `invalidateRedirectCache()` after edits for instant apply.
 */
let cache: { rules: Map<string, RedirectRule>; at: number } | null = null
const TTL_MS = 60_000

function normalize(path: string): string {
  if (!path) return '/'
  const clean = path.split('?')[0].split('#')[0]
  const trimmed = clean.length > 1 ? clean.replace(/\/+$/, '') : clean
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

async function loadRules(): Promise<Map<string, RedirectRule>> {
  await connectToDatabase()
  const docs = await Redirect.find({}).lean()
  const map = new Map<string, RedirectRule>()
  for (const d of docs as unknown as RedirectRule[]) {
    map.set(normalize(d.source), {
      source: normalize(d.source),
      destination: d.destination,
      permanent: d.permanent !== false,
    })
  }
  return map
}

export async function getRedirectFor(pathname: string): Promise<RedirectRule | null> {
  const now = Date.now()
  if (!cache || now - cache.at > TTL_MS) {
    try {
      cache = { rules: await loadRules(), at: now }
    } catch {
      // On DB error, fail open (no redirect) rather than breaking navigation.
      return null
    }
  }
  return cache.rules.get(normalize(pathname)) ?? null
}

/** Force the next lookup to reload from the database. */
export function invalidateRedirectCache() {
  cache = null
}
