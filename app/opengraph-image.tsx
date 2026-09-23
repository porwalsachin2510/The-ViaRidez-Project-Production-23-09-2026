import { ImageResponse } from "next/og"
import { getSiteSettings } from "@/lib/data/queries"

/* -------------------------------------------------------------------------- */
/*  Dynamic Open Graph image                                                  */
/*  Rendered on demand at /opengraph-image and used as the site-wide default  */
/*  social share artwork (DEFAULT_OG_IMAGE in lib/seo.ts points here).        */
/* -------------------------------------------------------------------------- */

export const runtime = "nodejs"
export const alt = "ViaRidez — Enterprise Employee Transportation & Corporate Mobility"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Brand palette (derived from the ViaRidez logo / design system).
const NAVY = "#0F2E4D"
const NAVY_DEEP = "#0A2138"
const TEAL = "#00A88E"

export default async function Image() {
  // Pull live company + tagline so the artwork stays in sync with the CMS.
  const settings = await getSiteSettings().catch(() => null)
  const company = settings?.companyName || "ViaRidez"
  const tagline =
    settings?.tagline ||
    "Enterprise Employee Transportation & Corporate Mobility"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, #123a60 100%)`,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Signature teal accent bar down the left edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 16,
            height: "100%",
            background: TEAL,
          }}
        />

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: TEAL,
              color: NAVY,
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            V
          </div>
          <div
            style={{
              color: "white",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            {company}
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "white",
              fontSize: 66,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "#B9C6D6",
              fontSize: 30,
              fontWeight: 500,
            }}
          >
            <div
              style={{ width: 44, height: 4, background: TEAL, borderRadius: 2, display: "flex" }}
            />
            Dubai · UAE Free Zones · Kuwait · India · Nepal
          </div>
        </div>

        {/* Footer URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#8DA2B8",
            fontSize: 26,
            fontWeight: 500,
          }}
        >
          <span>www.viaridez.com</span>
          <span style={{ color: TEAL, fontWeight: 700 }}>Move People Better</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
