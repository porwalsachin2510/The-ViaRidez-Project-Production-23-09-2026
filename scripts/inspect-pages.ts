/**
 * Diagnostic helper: prints which CMS Page documents exist, their status and
 * how many section blocks each one carries, plus the footer link hrefs stored
 * in SiteSettings. Read-only — safe to run at any time.
 *
 *   npx tsx scripts/inspect-pages.ts
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.development.local' })
loadEnv()

import { connectToDatabase } from '../lib/db/mongoose'
import { Page, SiteSettings } from '../models'

async function main() {
  await connectToDatabase()

  const pages = await Page.find({}).select('slug title status sections').sort({ slug: 1 }).lean()
  console.log(`\n--- Page documents (${pages.length}) ---`)
  for (const p of pages as Array<Record<string, any>>) {
    const types = (p.sections ?? []).map((s: Record<string, unknown>) => s.type).join(', ')
    console.log(`${p.slug.padEnd(26)} [${p.status}] ${(p.sections?.length ?? 0)} blocks  ${types}`)
  }

  const settings = (await SiteSettings.findOne({ key: 'global' }).lean()) as Record<string, any> | null
  console.log('\n--- Footer columns ---')
  for (const col of (settings?.footerColumns ?? []) as Array<Record<string, any>>) {
    console.log(`${col.title}: ${(col.links ?? []).map((l: Record<string, string>) => l.href).join(' | ')}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
