import { requireRole } from "@/lib/auth-helpers"
import { getRawSiteSettings, getLinkableDestinations, type SiteSettingsData, type LinkGroup } from "@/lib/data/queries"
import { SettingsForm } from "@/components/admin/settings-form"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  await requireRole(["admin"])

  // Read the exact stored document. If the database is unreachable we must NOT
  // fall back to defaults here — presenting an editable default form would let
  // a Save silently overwrite the real navigation/footer.
  let s: SiteSettingsData | null = null
  let dbError: string | null = null
  try {
    s = await getRawSiteSettings()
  } catch (error) {
    dbError = (error as Error).message
  }

  if (dbError) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Site Settings</h1>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <h2 className="font-display text-lg font-semibold text-red-700 dark:text-red-400">
            Database unavailable
          </h2>
          <p className="mt-2 text-sm text-red-700/90 dark:text-red-400/90">
            Site settings could not be loaded, so the editor is disabled to prevent overwriting your
            saved navigation and footer with defaults. Verify that <code>MONGODB_URI</code> is set and
            the database is reachable, then reload this page.
          </p>
          <p className="mt-3 font-mono text-xs text-red-700/70 dark:text-red-400/70">{dbError}</p>
        </div>
      </div>
    )
  }

  // Real content the admin can drop into the navbar / footer (system pages plus
  // every published service, page, industry, etc.).
  let destinations: LinkGroup[] = []
  try {
    destinations = await getLinkableDestinations()
  } catch {
    destinations = []
  }

  // `s` is null only for a fresh install (DB reachable, no document yet); render
  // an empty form the admin can populate and save to create the singleton.
  const flat = {
    companyName: s?.companyName ?? "",
    tagline: s?.tagline ?? "",
    email: s?.email ?? "",
    phone: s?.phone ?? "",
    whatsapp: s?.whatsapp ?? "",
    address: s?.address ?? "",
    businessHours: s?.businessHours ?? "",
    ctaPrimaryLabel: s?.ctaPrimary?.label ?? "",
    ctaPrimaryHref: s?.ctaPrimary?.href ?? "",
    ctaSecondaryLabel: s?.ctaSecondary?.label ?? "",
    ctaSecondaryHref: s?.ctaSecondary?.href ?? "",
    logo: s?.logoLight ?? "",
    logoMark: s?.logoDark ?? "",
    twitter: s?.social?.twitter ?? "",
    linkedin: s?.social?.linkedin ?? "",
    instagram: s?.social?.instagram ?? "",
    facebook: s?.social?.facebook ?? "",
    youtube: s?.social?.youtube ?? "",
    chatEnabled: s?.chat?.enabled === false ? "false" : "true",
    chatProvider: s?.chat?.provider ?? "whatsapp",
    chatNumber: s?.chat?.number ?? s?.whatsapp ?? "",
    chatMessage: s?.chat?.message ?? "Hello ViaRidez, I would like to learn more.",
    chatConsentRequired: s?.chat?.consentRequired === false ? "false" : "true",
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Site Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global company info, contact details, and calls to action used across the public site.
        </p>
      </div>
      <SettingsForm
        settings={flat}
        stats={s?.stats ?? []}
        navigation={s?.navigation ?? []}
        footerColumns={s?.footerColumns ?? []}
        destinations={destinations}
      />
    </div>
  )
}
