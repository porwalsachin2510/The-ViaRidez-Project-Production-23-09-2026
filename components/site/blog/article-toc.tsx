"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Heading {
  id: string
  text: string
  level: number
}

/**
 * In-article table of contents. Reads the headings that rehype-slug rendered
 * inside `#article-body`, so the anchors always match. Highlights the section
 * currently in view with an IntersectionObserver (scroll-spy) and smooth-scrolls
 * on click. Renders nothing when the article has fewer than two headings.
 */
export function ArticleToc() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const container = document.getElementById("article-body")
    if (!container) return
    const nodes = Array.from(container.querySelectorAll<HTMLElement>("h2, h3")).filter((n) => n.id)
    setHeadings(
      nodes.map((n) => ({ id: n.id, text: n.textContent ?? "", level: n.tagName === "H3" ? 3 : 2 })),
    )

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    )
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [])

  if (headings.length < 2) return null

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
      <ul className="space-y-2 border-l border-border">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-3" : ""}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                setActiveId(h.id)
                history.replaceState(null, "", `#${h.id}`)
              }}
              className={cn(
                "-ml-px block border-l-2 py-0.5 pl-3 leading-snug transition-colors",
                activeId === h.id
                  ? "border-accent font-medium text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
