import type { Metadata } from "next"
import { getBlogPosts, getSiteSettings, getCmsPageBySlug } from "@/lib/data/queries"
import { buildMetadata } from "@/lib/seo"
import { Container } from "@/components/site/primitives"
import { PageHero, CtaSection } from "@/components/site/page-shell"
import { BlogExplorer } from "@/components/site/blog-explorer"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageBySlug("blog")
  return buildMetadata({
    seo: page?.seo,
    title: page?.title || "Insights & News | VIARIDEZ Corporate Mobility Blog",
    description:
      page?.heroSubtitle ||
      "Expert perspectives on employee transportation, corporate mobility, fleet operations and sustainable commuting across Dubai and the UAE.",
    image: page?.heroImage,
    path: "/blog",
  })
}

export default async function BlogPage() {
  const [posts, settings, cmsPage] = await Promise.all([
    getBlogPosts(),
    getSiteSettings(),
    getCmsPageBySlug("blog"),
  ])

  return (
    <>
      <PageHero
        eyebrow={cmsPage?.heroEyebrow || "Insights"}
        title={cmsPage?.heroTitle || "Mobility insights & company news"}
        description={
          cmsPage?.heroSubtitle ||
          "Perspectives on corporate transportation, operations, technology and sustainable mobility from the VIARIDEZ team."
        }
        image={cmsPage?.heroImage}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Blog" }]}
      />

      <section className="py-16 sm:py-24">
        <Container>
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground">New articles are on the way. Check back soon.</p>
          ) : (
            <BlogExplorer posts={posts} />
          )}
        </Container>
      </section>

      <CtaSection cta={settings.ctaPrimary} />
    </>
  )
}
