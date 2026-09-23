"use client"

import { useEffect, useState } from "react"

const keys = ["leadSource", "landingPage", "referrer", "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm"] as const

export function LeadAttributionFields() {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const next: Record<string, string> = {
      leadSource: params.get("leadSource") || params.get("utm_source") || "website",
      landingPage: window.location.pathname,
      referrer: document.referrer.slice(0, 300),
      utmSource: params.get("utm_source") || "",
      utmMedium: params.get("utm_medium") || "",
      utmCampaign: params.get("utm_campaign") || "",
      utmContent: params.get("utm_content") || "",
      utmTerm: params.get("utm_term") || "",
    }
    setValues(next)
  }, [])

  return (
    <>
      {keys.map((key) => (
        <input key={key} type="hidden" name={key} value={values[key] || ""} />
      ))}
    </>
  )
}
