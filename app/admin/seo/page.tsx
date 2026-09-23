import { requireModule } from "@/lib/auth-helpers"
import { getSiteSettings } from "@/lib/data/queries"
import { getSeoAudit } from "@/lib/data/seo-audit"
import { SeoCommandCenter, type SeoSettingsInput } from "@/components/admin/seo-command-center"

export const dynamic = "force-dynamic"

export default async function SeoPage() {
  await requireModule("seo")

  const [s, audit] = await Promise.all([getSiteSettings(), getSeoAudit()])

  const seo = s.seo ?? {}
  const org = seo.organization ?? {}
  const v = seo.verification ?? {}
  const robots = seo.robots ?? {}

  const settings: SeoSettingsInput = {
    // Default metadata
    metaTitle: s.defaultSeo?.metaTitle ?? "",
    metaDescription: s.defaultSeo?.metaDescription ?? "",
    ogImage: s.defaultSeo?.ogImage ?? "",
    // Advanced
    titleTemplate: seo.titleTemplate ?? "%s | ViaRidez",
    defaultKeywords: (seo.defaultKeywords ?? []).join(", "),
    defaultOgImage: seo.defaultOgImage ?? "",
    twitterSite: seo.twitterSite ?? "",
    twitterCreator: seo.twitterCreator ?? "",
    // Analytics
    gaId: s.analytics?.gaId ?? "",
    gtmId: s.analytics?.gtmId ?? "",
    // Verification
    verifyGoogle: v.google ?? "",
    verifyBing: v.bing ?? "",
    verifyYandex: v.yandex ?? "",
    verifyPinterest: v.pinterest ?? "",
    // Organization / LocalBusiness
    orgLegalName: org.legalName ?? "",
    orgFoundingDate: org.foundingDate ?? "",
    orgStreetAddress: org.streetAddress ?? "",
    orgLocality: org.addressLocality ?? "",
    orgRegion: org.addressRegion ?? "",
    orgPostalCode: org.postalCode ?? "",
    orgCountry: org.addressCountry ?? "AE",
    orgLatitude: org.latitude ?? "",
    orgLongitude: org.longitude ?? "",
    orgPriceRange: org.priceRange ?? "$$",
    orgOpeningHours: org.openingHours ?? "",
    // Crawl
    blockAiBots: Boolean(robots.blockAiBots),
    extraDisallow: (robots.extraDisallow ?? []).join("\n"),
  }

  return (
    <SeoCommandCenter
      settings={settings}
      audit={audit}
      companyName={s.companyName || "ViaRidez"}
    />
  )
}
