import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.development.local' })
loadEnv()

import { connectToDatabase } from '../lib/db/mongoose'
import { Page, User } from '../models'
import { PAGE_CONTENT } from './page-content'

/**
 * `--force` overwrites pages that already have sections. Optionally scope it to
 * specific slugs: `tsx scripts/seed-page-content.ts --force about,contact`.
 */
const args = process.argv.slice(2)
const force = args.includes('--force')
const forcedSlugs = new Set(
  args
    .filter((a) => !a.startsWith('--'))
    .flatMap((a) => a.split(','))
    .map((s) => s.trim())
    .filter(Boolean),
)

async function seedPageContent() {
  await connectToDatabase()
  const admin = await User.findOne({ role: 'admin' }).select('_id').lean()
  if (!admin) throw new Error('No admin user found. Run the main seed first.')

  let seeded = 0
  let skipped = 0
  for (const content of PAGE_CONTENT) {
    const overwrite = force && (forcedSlugs.size === 0 || forcedSlugs.has(content.slug))
    const existing = await Page.findOne({ slug: content.slug }).select('sections').lean()
    if (existing?.sections?.length && !overwrite) {
      skipped += 1
      continue
    }

    await Page.updateOne(
      { slug: content.slug },
      {
        $set: {
          title: content.title,
          heroEyebrow: content.heroEyebrow ?? '',
          heroTitle: content.heroTitle,
          heroSubtitle: content.heroSubtitle,
          heroImage: content.heroImage ?? null,
          body: content.body ?? '',
          sections: content.sections,
          status: 'published',
          updatedBy: admin._id,
        },
        $setOnInsert: { slug: content.slug, createdBy: admin._id },
      },
      { upsert: true },
    )
    seeded += 1
  }

  console.log(`CMS content seeded: ${seeded}; existing content preserved: ${skipped}`)
  process.exit(0)
}

seedPageContent().catch((error) => {
  console.error('CMS content seed failed:', error)
  process.exit(1)
})
