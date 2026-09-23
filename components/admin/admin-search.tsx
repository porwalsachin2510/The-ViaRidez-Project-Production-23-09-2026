"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SearchResult {
  type: string
  label: string
  detail: string
  href: string
}

export function AdminSearch() {
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const value = query.trim()
    if (value.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    fetch(`/api/admin/search?q=${encodeURIComponent(value)}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setResults(data.results ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [query])

  useEffect(() => {
    setQuery("")
    setOpen(false)
  }, [pathname])

  return (
    <div className="relative hidden w-full max-w-sm md:block">
      <label htmlFor="admin-global-search" className="sr-only">Search admin content</label>
      <input
        id="admin-global-search"
        value={query}
        onChange={(event) => { setQuery(event.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Search content, leads, services..."
        className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none ring-accent placeholder:text-muted-foreground focus:ring-2"
      />
      {open && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {loading ? <p className="px-3 py-4 text-sm text-muted-foreground">Searching...</p> : null}
          {!loading && results.length === 0 ? <p className="px-3 py-4 text-sm text-muted-foreground">No matching records.</p> : null}
          {!loading && results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((result, index) => (
                <li key={`${result.type}-${result.label}-${index}`}>
                  <Link href={result.href} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-muted">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">{result.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{result.detail}</span>
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{result.type}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
