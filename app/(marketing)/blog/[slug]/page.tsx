import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data/queries"
import { buildMetadata, articleJsonLd } from "@/lib/seo"
import { Container } from "@/components/site/primitives"
import { Breadcrumbs, JsonLd, CtaSection } from "@/components/site/page-shell"
import { Reveal } from "@/components/site/reveal"
import { ReadingProgress } from "@/components/site/blog/reading-progress"
import { ArticleMarkdown } from "@/components/site/blog/article-markdown"
import { ArticleToc } from "@/components/site/blog/article-toc"
import { EngagementProvider, EngagementBar } from "@/components/site/blog/article-engagement"
import { ArticleComments } from "@/components/site/blog/article-comments"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return { title: "Article not found" }
  return buildMetadata({
    seo: post.seo,
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage ?? undefined,
  })
}

function formatDate(iso?: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function authorInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "V"
  )
}

function AuthorByline({
  name,
  role,
  avatar,
  size = "md",
  invert = false,
}: {
  name: string
  role: string
  avatar?: string | null
  size?: "sm" | "md"
  /** Use on the dark article header, where default text colours vanish. */
  invert?: boolean
}) {
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11"
  return (
    <div className="flex items-center gap-3">
      <span
        className={`relative ${dim} shrink-0 overflow-hidden rounded-full ${
          invert ? "bg-primary-foreground/15" : "bg-primary/10"
        }`}
      >
        {avatar ? (
          <Image src={avatar} alt={`${name} avatar`} fill className="object-cover" sizes="44px" />
        ) : (
          <span
            aria-hidden="true"
            className={`flex h-full w-full items-center justify-center text-sm font-semibold ${
              invert ? "text-primary-foreground" : "text-primary"
            }`}
          >
            {authorInitials(name)}
          </span>
        )}
      </span>
      <div className="leading-tight">
        <p className={`text-sm font-semibold ${invert ? "text-primary-foreground" : "text-foreground"}`}>
          {name}
        </p>
        <p className={`text-xs ${invert ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {role}
        </p>
      </div>
    </div>
  )
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  const authorName = post.authorName?.trim() || "ViaRidez Editorial Team"
  const authorRole = post.authorRole?.trim() || "Corporate Mobility Insights"

  // Related posts ranked by shared-tag overlap, then recency as a tiebreaker.
  const currentTags = new Set((post.tags ?? []).map((t) => t.toLowerCase()))
  const related = (await getBlogPosts())
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      const shared = (p.tags ?? []).filter((t) => currentTags.has(t.toLowerCase())).length
      return { post: p, shared }
    })
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared
      return (
        new Date(b.post.publishedAt ?? 0).getTime() -
        new Date(a.post.publishedAt ?? 0).getTime()
      )
    })
    .slice(0, 3)
    .map((r) => r.post)

  return (
    <>
      <ReadingProgress />
      <JsonLd data={articleJsonLd(post)} />
      <article>
        {/* Header — the site nav is fixed and transparent with light text over a
            dark hero, so this must stay on the dark palette (like PageHero) or
            the logo and nav links become invisible. */}
        <header className="relative overflow-hidden bg-primary text-primary-foreground">
          <div
            className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(var(--color-primary-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-primary-foreground)_1px,transparent_1px)] [background-size:56px_56px]"
            aria-hidden="true"
          />
          <Container className="relative pb-12 pt-32 md:pb-16 md:pt-36">
            <Breadcrumbs
              invert
              items={[
                { name: "Home", href: "/" },
                { name: "Insights", href: "/blog" },
                { name: post.title },
              ]}
            />
            <div className="mt-6 max-w-3xl">
              {post.tags && post.tags.length > 0 ? (
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold capitalize text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <h1 className="font-display text-3xl font-bold leading-tight text-primary-foreground text-balance md:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-4 text-lg leading-relaxed text-primary-foreground/80 text-pretty">{post.excerpt}</p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <AuthorByline name={authorName} role={authorRole} avatar={post.authorAvatar} invert />
                <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
                  {post.publishedAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-accent" aria-hidden="true" />
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                  {post.readingTime ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
                      {post.readingTime} min read
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </Container>
        </header>

        {/* Cover */}
        {post.coverImage && (
          <Container className="py-8 md:py-10">
            <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl">
              <Image
                src={post.coverImage || "/placeholder.svg"}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </Container>
        )}

        {/* Body + sticky rail */}
        <Container className="pb-16">
          <div className="gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem]">
            <EngagementProvider
              slug={post.slug}
              title={post.title}
              initialClaps={post.claps ?? 0}
              initialViews={post.views ?? 0}
            >
            <div className="mx-auto w-full max-w-3xl lg:mx-0">
              {/* Engagement bar (top) */}
              <div className="mb-8 border-y border-border py-3">
                <EngagementBar variant="inline" />
              </div>

              <div id="article-body">
                <ArticleMarkdown content={post.body?.trim() || post.excerpt || "_This article is coming soon._"} />
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
                  <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface px-3 py-1 text-xs font-medium capitalize text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Engagement bar (bottom) */}
              <div className="mt-8">
                <EngagementBar variant="bar" />
              </div>

              {/* Author card */}
              <div className="mt-10 rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Written by</p>
                <div className="mt-3">
                  <AuthorByline name={authorName} role={authorRole} avatar={post.authorAvatar} />
                </div>
              </div>

              <ArticleComments slug={post.slug} />

              <div className="mt-10">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to all insights
                </Link>
              </div>
            </div>
            </EngagementProvider>

            {/* Sticky table of contents */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <ArticleToc />
              </div>
            </aside>
          </div>
        </Container>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border bg-surface py-16">
          <Container>
            <h2 className="font-display text-2xl font-bold text-primary">More insights</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rp, i) => (
                <Reveal key={rp._id} delay={i * 0.05}>
                  <Link
                    href={`/blog/${rp.slug}`}
                    className="group block overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-primary/5">
                      {rp.coverImage ? (
                        <Image
                          src={rp.coverImage || "/placeholder.svg"}
                          alt={rp.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary to-primary/70">
                          <span className="font-display text-lg font-bold text-primary-foreground/90">ViaRidez</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-base font-semibold text-primary group-hover:text-accent">
                        {rp.title}
                      </h3>
                      {rp.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{rp.excerpt}</p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaSection />
    </>
  )
}
