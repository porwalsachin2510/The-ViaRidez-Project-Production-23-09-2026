import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"
import { getSiteSettings } from "@/lib/data/queries"

export const dynamic = "force-dynamic"

/**
 * Well-known AI/LLM crawler user agents. When "Block AI crawlers" is enabled in
 * the SEO Command Center we emit an explicit `Disallow: /` block for each so the
 * site's content is not ingested for model training.
 */
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "CCBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "Meta-ExternalAgent",
  "FacebookBot",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "YouBot",
]

/** Paths that must never be crawled, regardless of admin configuration. */
const BASE_DISALLOW = ["/admin", "/admin/", "/api/", "/sign-in"]

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings()
  const robotsCfg = settings.seo?.robots ?? {}

  // Merge the always-on protected paths with any admin-configured extras.
  const extra = (robotsCfg.extraDisallow ?? []).filter(Boolean)
  const disallow = Array.from(new Set([...BASE_DISALLOW, ...extra]))

  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow,
    },
  ]

  // Optionally lock out AI/LLM training crawlers entirely.
  if (robotsCfg.blockAiBots) {
    rules.push({
      userAgent: AI_BOTS,
      disallow: "/",
    })
  }

  return {
    rules,
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
