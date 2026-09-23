import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCmsPageBySlug, getSiteSettings } from "@/lib/data/queries"
import { CmsPageContent } from "@/components/site/cms-section-renderer"
import { PageHero, CtaSection } from "@/components/site/page-shell"
import { buildMetadata } from "@/lib/seo"

// Newly created CMS pages get their own slug that has no hard-coded route, so a
// single catch-all renders any published Page. Next.js resolves the dedicated
// static routes (/about, /contact, …) first, so this only handles genuinely
// new slugs. `dynamicParams` lets pages created after build render on demand.
export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getCmsPageBySlug(slug)
  if (!page) return { title: "Not found" }
  return buildMetadata({
    seo: page.seo,
    title: page.title,
    description: page.heroSubtitle,
    path: `/${slug}`,
    image: page.heroImage ?? undefined,
  })
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [page, settings] = await Promise.all([getCmsPageBySlug(slug), getSiteSettings()])
  if (!page) notFound()

  return (
    <>
      <PageHero
        title={page.heroTitle || page.title}
        description={page.heroSubtitle}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: page.title }]}
        image={page.heroImage ?? undefined}
      />
      <CmsPageContent page={page} stats={settings.stats ?? []} />
      <CtaSection cta={settings.ctaPrimary} />
    </>
  )
}
