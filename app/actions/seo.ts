"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth-helpers"
import { connectToDatabase } from "@/lib/db/mongoose"
import { SiteSettings } from "@/models"
import { recordAuditEvent } from "@/lib/audit"

export type SeoState = { success?: string; error?: string } | null

/** Splits a textarea of comma- or newline-separated values into a clean array. */
function toList(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Editable by admins and SEO managers. Persists all site-wide SEO settings. */
export async function saveGlobalSeo(_prev: SeoState, formData: FormData): Promise<SeoState> {
  const user = await requireRole(["admin", "seo_manager"])

  try {
    await connectToDatabase()

    const get = (k: string) => String(formData.get(k) ?? "").trim()
    const getBool = (k: string) => formData.get(k) === "on" || formData.get(k) === "true"

    await SiteSettings.updateOne(
      { key: "global" },
      {
        $set: {
          // Default metadata
          "defaultSeo.metaTitle": get("metaTitle"),
          "defaultSeo.metaDescription": get("metaDescription"),
          "defaultSeo.ogImage": get("ogImage"),
          // Analytics
          "analytics.gaId": get("gaId"),
          "analytics.gtmId": get("gtmId"),
          // Advanced SEO config
          "seo.titleTemplate": get("titleTemplate") || "%s | ViaRidez",
          "seo.defaultKeywords": toList(get("defaultKeywords")),
          "seo.defaultOgImage": get("defaultOgImage"),
          "seo.twitterSite": get("twitterSite"),
          "seo.twitterCreator": get("twitterCreator"),
          // Search-console verification
          "seo.verification.google": get("verifyGoogle"),
          "seo.verification.bing": get("verifyBing"),
          "seo.verification.yandex": get("verifyYandex"),
          "seo.verification.pinterest": get("verifyPinterest"),
          // Organization / LocalBusiness structured data
          "seo.organization.legalName": get("orgLegalName"),
          "seo.organization.foundingDate": get("orgFoundingDate"),
          "seo.organization.streetAddress": get("orgStreetAddress"),
          "seo.organization.addressLocality": get("orgLocality"),
          "seo.organization.addressRegion": get("orgRegion"),
          "seo.organization.postalCode": get("orgPostalCode"),
          "seo.organization.addressCountry": get("orgCountry") || "AE",
          "seo.organization.latitude": get("orgLatitude"),
          "seo.organization.longitude": get("orgLongitude"),
          "seo.organization.priceRange": get("orgPriceRange"),
          "seo.organization.openingHours": get("orgOpeningHours"),
          // Crawl directives
          "seo.robots.blockAiBots": getBool("blockAiBots"),
          "seo.robots.extraDisallow": toList(get("extraDisallow")),
        },
      },
      { upsert: true },
    )

    await recordAuditEvent({ user, action: "update", entity: "seo", entityId: "global" })

    // Refresh the whole site so metadata, robots, structured data and analytics
    // pick up the new values on the next request.
    revalidatePath("/", "layout")
    revalidatePath("/robots.txt")
    revalidatePath("/sitemap.xml")
    return { success: "SEO settings saved." }
  } catch (error) {
    console.error("[v0] saveGlobalSeo failed:", (error as Error).message)
    return { error: "Could not save SEO settings. Please try again." }
  }
}
