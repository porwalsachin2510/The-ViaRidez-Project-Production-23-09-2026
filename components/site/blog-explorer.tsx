'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, CalendarDays, Clock, Search, X } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'
import { cn } from '@/lib/utils'
import type { BlogData } from '@/lib/data/queries'

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function BlogExplorer({ posts }: { posts: BlogData[] }) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState<string | null>(null)

  // Derive the tag list from real post data, sorted by frequency.
  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of posts) {
      for (const t of p.tags ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
  }, [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      const matchesTag = !tag || (p.tags ?? []).some((t) => t === tag)
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      return matchesTag && matchesQuery
    })
  }, [posts, query, tag])

  const isFiltering = query.trim().length > 0 || tag !== null
  const [featured, ...rest] = filtered
  const gridPosts = isFiltering ? filtered : rest

  return (
    <div className="space-y-10">
      {/* Controls */}
      <div className="flex flex-col gap-5">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="blog-search" className="sr-only">
            Search articles
          </label>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search insights…"
            className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
            <button
              type="button"
              onClick={() => setTag(null)}
              aria-pressed={tag === null}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                tag === null
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-accent hover:text-accent',
              )}
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t === tag ? null : t)}
                aria-pressed={tag === t}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors',
                  tag === t
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-accent hover:text-accent',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-muted-foreground">
            No articles match{' '}
            {query ? <span className="font-medium text-foreground">“{query}”</span> : 'that filter'}.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setTag(null)
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Featured (only when browsing, not filtering) */}
          {!isFiltering && featured && (
            <Reveal>
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2"
              >
                <div className="relative aspect-[16/10] lg:aspect-auto">
                  {featured.coverImage ? (
                    <Image
                      src={featured.coverImage || '/placeholder.svg'}
                      alt={featured.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary to-primary/70" />
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-12">
                  <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Featured
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground text-balance">
                    {featured.title}
                  </h2>
                  {featured.excerpt ? (
                    <p className="mt-3 leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                  ) : null}
                  <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                    {featured.publishedAt ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatDate(featured.publishedAt)}
                      </span>
                    ) : null}
                    {featured.readingTime ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {featured.readingTime} min read
                      </span>
                    ) : null}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                    Read article
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          {gridPosts.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post, i) => (
                <Reveal key={post._id} delay={i * 0.05}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10]">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage || '/placeholder.svg'}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary to-primary/70" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-lg font-semibold text-foreground text-balance">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                          {post.excerpt}
                        </p>
                      ) : null}
                      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                        {post.publishedAt ? <span>{formatDate(post.publishedAt)}</span> : null}
                        {post.readingTime ? <span>· {post.readingTime} min</span> : null}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
