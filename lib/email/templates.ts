import "server-only"

import { SITE_URL } from "@/lib/seo"

/**
 * Branded transactional email templates.
 *
 * Constraints that drive the odd-looking markup here:
 *  - Nested <table> layout, not flex/grid: Outlook (Word rendering engine)
 *    ignores modern CSS entirely.
 *  - Every style is inline. Gmail strips <style> blocks in some clients, so the
 *    <style> tag only carries progressive enhancements (mobile media query,
 *    dark-mode hints) that are safe to lose.
 *  - Fixed 600px shell with a fluid mobile fallback.
 *  - A hidden preheader controls the inbox preview line instead of letting the
 *    client scrape whatever text comes first.
 */

const BRAND = {
  navy: "#0f2e4d",
  navyDeep: "#0a2138",
  teal: "#00a88e",
  ink: "#0f172a",
  body: "#44546a",
  muted: "#7b8794",
  border: "#e3e8ef",
  surface: "#f5f7fa",
  white: "#ffffff",
} as const

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"

export function escapeHtml(value: string): string {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ] || char,
  )
}

/** Preserve author line breaks when echoing a free-text message back. */
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />")
}

export interface EmailFooterContext {
  companyName?: string
  email?: string
  phone?: string
  address?: string
  /** Absolute unsubscribe URL. Only set for opt-in marketing mail. */
  unsubscribeUrl?: string
}

export interface DetailRow {
  label: string
  value?: string | number | null
  /** Render as a multi-line block rather than a table row. */
  long?: boolean
}

export interface ShellOptions {
  /** Inbox preview line. Keep under ~90 chars. */
  preheader: string
  /** Small teal eyebrow above the headline. */
  eyebrow?: string
  heading: string
  /** Body HTML — compose with `paragraph`, `detailTable`, `steps`, `button`. */
  body: string
  footer?: EmailFooterContext
}

/* ------------------------------- fragments ------------------------------- */

export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:${BRAND.body};">${html}</p>`
}

export function lead(html: string): string {
  return `<p style="margin:0 0 20px;font-family:${FONT};font-size:16px;line-height:1.6;color:${BRAND.ink};">${html}</p>`
}

/**
 * "Bulletproof" CTA: a table cell with a background colour so Outlook still
 * paints the button even though it drops border-radius.
 */
export function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
  <tr>
    <td align="center" bgcolor="${BRAND.teal}" style="border-radius:6px;">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 28px;font-family:${FONT};font-size:15px;font-weight:600;color:${BRAND.white};text-decoration:none;border-radius:6px;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`
}

/** Read-only summary card of what the user submitted. */
export function detailTable(rows: DetailRow[], title?: string): string {
  const present = rows.filter(
    (row) => row.value !== undefined && row.value !== null && String(row.value).trim() !== "",
  )
  if (!present.length) return ""

  const shortRows = present
    .filter((row) => !row.long)
    .map(
      (row) => `<tr>
      <td style="padding:9px 0;font-family:${FONT};font-size:13px;color:${BRAND.muted};width:38%;vertical-align:top;">${escapeHtml(row.label)}</td>
      <td style="padding:9px 0;font-family:${FONT};font-size:14px;color:${BRAND.ink};font-weight:500;vertical-align:top;">${escapeHtml(String(row.value))}</td>
    </tr>`,
    )
    .join("")

  const longRows = present
    .filter((row) => row.long)
    .map(
      (row) => `<tr>
      <td colspan="2" style="padding:12px 0 0;">
        <div style="font-family:${FONT};font-size:13px;color:${BRAND.muted};margin-bottom:5px;">${escapeHtml(row.label)}</div>
        <div style="font-family:${FONT};font-size:14px;line-height:1.6;color:${BRAND.ink};">${escapeMultiline(String(row.value))}</div>
      </td>
    </tr>`,
    )
    .join("")

  const caption = title
    ? `<div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.muted};margin-bottom:8px;">${escapeHtml(title)}</div>`
    : ""

  return `${caption}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:8px;padding:6px 18px;margin:0 0 24px;">
  ${shortRows}${longRows}
</table>`
}

/** Numbered "what happens next" list — sets expectations and reduces inbound. */
export function steps(items: string[], title = "What happens next"): string {
  if (!items.length) return ""
  const rendered = items
    .map(
      (item, i) => `<tr>
      <td width="28" style="vertical-align:top;padding:0 0 12px;">
        <div style="width:20px;height:20px;border-radius:10px;background:${BRAND.teal};color:${BRAND.white};font-family:${FONT};font-size:11px;font-weight:700;text-align:center;line-height:20px;">${i + 1}</div>
      </td>
      <td style="padding:0 0 12px;font-family:${FONT};font-size:14px;line-height:1.55;color:${BRAND.body};">${item}</td>
    </tr>`,
    )
    .join("")

  return `<div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.muted};margin:0 0 12px;">${escapeHtml(title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">${rendered}</table>`
}

export function divider(): string {
  return `<div style="height:1px;background:${BRAND.border};margin:0 0 24px;"></div>`
}

/** Small print, e.g. GDPR/consent notes. */
export function finePrint(html: string): string {
  return `<p style="margin:0 0 8px;font-family:${FONT};font-size:12px;line-height:1.55;color:${BRAND.muted};">${html}</p>`
}

/* --------------------------------- shell --------------------------------- */

function footerBlock(ctx: EmailFooterContext = {}): string {
  const company = escapeHtml(ctx.companyName || "ViaRidez")
  const contactBits = [
    ctx.phone
      ? `<a href="tel:${escapeHtml(String(ctx.phone).replace(/[^\d+]/g, ""))}" style="color:${BRAND.muted};text-decoration:none;">${escapeHtml(ctx.phone)}</a>`
      : "",
    ctx.email
      ? `<a href="mailto:${escapeHtml(ctx.email)}" style="color:${BRAND.muted};text-decoration:none;">${escapeHtml(ctx.email)}</a>`
      : "",
  ]
    .filter(Boolean)
    .join(' <span style="color:#c8d1dc;">&bull;</span> ')

  const unsubscribe = ctx.unsubscribeUrl
    ? `<p style="margin:12px 0 0;font-family:${FONT};font-size:11px;line-height:1.5;color:${BRAND.muted};">
        You are receiving this because you subscribed to ViaRidez insights.
        <a href="${escapeHtml(ctx.unsubscribeUrl)}" style="color:${BRAND.muted};text-decoration:underline;">Unsubscribe</a>.
      </p>`
    : ""

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:22px 32px 28px;background:${BRAND.surface};border-top:1px solid ${BRAND.border};">
      <p style="margin:0 0 6px;font-family:${FONT};font-size:13px;font-weight:600;color:${BRAND.ink};">${company}</p>
      ${ctx.address ? `<p style="margin:0 0 6px;font-family:${FONT};font-size:12px;line-height:1.55;color:${BRAND.muted};">${escapeHtml(ctx.address)}</p>` : ""}
      ${contactBits ? `<p style="margin:0;font-family:${FONT};font-size:12px;color:${BRAND.muted};">${contactBits}</p>` : ""}
      ${unsubscribe}
    </td>
  </tr>
</table>`
}

/**
 * Wraps body content in the branded shell. All templates below go through this
 * so header, footer and spacing stay identical across every email we send.
 */
export function emailShell({ preheader, eyebrow, heading, body, footer }: ShellOptions): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>${escapeHtml(heading)}</title>
<style>
  @media only screen and (max-width:620px){
    .vr-shell{width:100% !important;}
    .vr-pad{padding-left:22px !important;padding-right:22px !important;}
    .vr-h1{font-size:21px !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#eef1f5;-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:#eef1f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef1f5;">
  <tr>
    <td align="center" style="padding:28px 12px;">
      <table role="presentation" class="vr-shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${BRAND.white};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,46,77,.08);">

        <tr>
          <td style="background:${BRAND.navy};padding:22px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <a href="${SITE_URL}" style="font-family:${FONT};font-size:19px;font-weight:700;letter-spacing:-.01em;color:${BRAND.white};text-decoration:none;">VIA<span style="color:${BRAND.teal};">RIDEZ</span></a>
                </td>
                <td align="right" style="font-family:${FONT};font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.62);">Corporate Mobility</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td class="vr-pad" style="padding:32px 32px 8px;">
            ${eyebrow ? `<div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:${BRAND.teal};margin:0 0 10px;">${escapeHtml(eyebrow)}</div>` : ""}
            <h1 class="vr-h1" style="margin:0 0 18px;font-family:${FONT};font-size:24px;line-height:1.28;font-weight:700;color:${BRAND.ink};">${escapeHtml(heading)}</h1>
          </td>
        </tr>

        <tr>
          <td class="vr-pad" style="padding:0 32px 8px;">${body}</td>
        </tr>

        <tr><td>${footerBlock(footer)}</td></tr>
      </table>

      <p style="margin:16px 0 0;font-family:${FONT};font-size:11px;color:#93a1b0;">&copy; ${new Date().getFullYear()} ViaRidez. All rights reserved.</p>
    </td>
  </tr>
</table>
</body>
</html>`
}

/* ------------------------ internal team notification ---------------------- */

/**
 * Internal lead alert. Deliberately denser than customer mail and leads with
 * the reply-to address so the team can action it straight from the inbox.
 */
export function teamNotificationEmail(opts: {
  title: string
  rows: DetailRow[]
  adminPath?: string
  footer?: EmailFooterContext
}): string {
  const cta = opts.adminPath
    ? button("Open in admin", `${SITE_URL}${opts.adminPath}`)
    : ""
  return emailShell({
    preheader: `${opts.title} — action required`,
    eyebrow: "New lead",
    heading: opts.title,
    body: `${detailTable(opts.rows, "Submission details")}${cta}`,
    footer: opts.footer,
  })
}

/* --------------------------- customer templates --------------------------- */

export function contactConfirmationEmail(opts: {
  name: string
  subject?: string
  message: string
  footer?: EmailFooterContext
}): string {
  const first = escapeHtml((opts.name || "there").trim().split(/\s+/)[0])
  return emailShell({
    preheader: "We've received your enquiry and will reply within one business day.",
    eyebrow: "Enquiry received",
    heading: "Thanks for getting in touch",
    body: `${lead(`Hi ${first},`)}
${paragraph("Thank you for contacting ViaRidez. Your enquiry has reached our corporate mobility team and we'll respond within <strong>one business day</strong>.")}
${detailTable(
  [
    { label: "Subject", value: opts.subject || "General enquiry" },
    { label: "Your message", value: opts.message, long: true },
  ],
  "A copy of your enquiry",
)}
${steps([
  "A mobility specialist reviews your requirements.",
  "We reply with answers and any clarifying questions.",
  "If useful, we'll arrange a call to scope your transport needs.",
])}
${paragraph("Need something urgently? Just reply to this email — it reaches the same team.")}`,
    footer: opts.footer,
  })
}

export function quoteConfirmationEmail(opts: {
  name: string
  company?: string
  service?: string
  route?: string
  passengers?: string
  startDate?: string
  estimate?: string
  footer?: EmailFooterContext
}): string {
  const first = escapeHtml((opts.name || "there").trim().split(/\s+/)[0])
  return emailShell({
    preheader: "Your quote request is confirmed — a tailored proposal is on its way.",
    eyebrow: "Quote request received",
    heading: "Your quote request is confirmed",
    body: `${lead(`Hi ${first},`)}
${paragraph(`Thank you for requesting a quote${opts.company ? ` for <strong>${escapeHtml(opts.company)}</strong>` : ""}. A mobility specialist is already reviewing your requirements and will prepare a tailored proposal.`)}
${detailTable(
  [
    { label: "Service", value: opts.service },
    { label: "Route", value: opts.route },
    { label: "Passengers", value: opts.passengers },
    { label: "Preferred start", value: opts.startDate },
    { label: "Indicative estimate", value: opts.estimate },
  ],
  "Your requirements",
)}
${opts.estimate ? finePrint("The figure above is an indicative range generated from your inputs. Your formal proposal will be priced on final routing, vehicle mix and contract term.") : ""}
${steps([
  "We validate routing, vehicle mix and scheduling.",
  "You receive a written proposal with transparent pricing.",
  "We refine it together and agree a pilot or start date.",
])}
${button("Explore our fleet", `${SITE_URL}/fleet`)}`,
    footer: opts.footer,
  })
}

export function demoConfirmationEmail(opts: {
  name: string
  company?: string
  preferredDate?: string
  preferredTime?: string
  footer?: EmailFooterContext
}): string {
  const first = escapeHtml((opts.name || "there").trim().split(/\s+/)[0])
  const slot = [opts.preferredDate, opts.preferredTime].filter(Boolean).join(" at ")
  return emailShell({
    preheader: "Your demo request is confirmed — we'll send a calendar invite shortly.",
    eyebrow: "Demo requested",
    heading: "Your demo request is confirmed",
    body: `${lead(`Hi ${first},`)}
${paragraph("Thanks for booking a walkthrough of the ViaRidez mobility platform. Our team will confirm the exact slot and send a calendar invite with joining details.")}
${detailTable(
  [
    { label: "Company", value: opts.company },
    { label: "Requested slot", value: slot || "To be confirmed" },
  ],
  "Your request",
)}
${steps([
  "We confirm your slot and send a calendar invite.",
  "A specialist walks you through live routing, tracking and reporting.",
  "You get a recap with pricing tailored to your headcount.",
])}
${paragraph("If your availability changes, reply to this email and we'll rearrange.")}`,
    footer: opts.footer,
  })
}

export function newsletterWelcomeEmail(opts: {
  name?: string
  footer?: EmailFooterContext
}): string {
  const first = opts.name?.trim()
    ? escapeHtml(opts.name.trim().split(/\s+/)[0])
    : ""
  return emailShell({
    preheader: "You're subscribed to ViaRidez insights on corporate mobility.",
    eyebrow: "Subscription confirmed",
    heading: "Welcome to ViaRidez Insights",
    body: `${lead(first ? `Hi ${first},` : "Hello,")}
${paragraph("You're on the list. From now on you'll receive our practical briefings on corporate mobility across the UAE and wider region — written for the people who actually run employee transport.")}
${steps(
  [
    "<strong>Fleet &amp; cost benchmarks</strong> — what comparable operations really spend per seat.",
    "<strong>Compliance updates</strong> — RTA, free-zone and duty-of-care changes that affect you.",
    "<strong>Operator playbooks</strong> — routing, shift alignment and utilisation tactics.",
  ],
  "What you'll receive",
)}
${paragraph("We send only when we have something genuinely useful — typically once or twice a month. No noise.")}
${button("Read the latest insights", `${SITE_URL}/blog`)}`,
    footer: opts.footer,
  })
}

export function partnerConfirmationEmail(opts: {
  contactName: string
  companyName?: string
  fleetSize?: string
  city?: string
  vehicleTypes?: string
  footer?: EmailFooterContext
}): string {
  const first = escapeHtml((opts.contactName || "there").trim().split(/\s+/)[0])
  return emailShell({
    preheader: "We've received your fleet partner application.",
    eyebrow: "Application received",
    heading: "Thanks for your interest in partnering",
    body: `${lead(`Hi ${first},`)}
${paragraph(`We've received the partnership application${opts.companyName ? ` for <strong>${escapeHtml(opts.companyName)}</strong>` : ""}. Our fleet team reviews every operator carefully — vehicle standards, permits and driver compliance.`)}
${detailTable(
  [
    { label: "Company", value: opts.companyName },
    { label: "Operating city", value: opts.city },
    { label: "Fleet size", value: opts.fleetSize },
    { label: "Vehicle types", value: opts.vehicleTypes },
  ],
  "Your application",
)}
${steps([
  "Our fleet team reviews your vehicles, permits and coverage.",
  "If there's a fit, we arrange a compliance and standards check.",
  "Approved operators are onboarded onto the ViaRidez network.",
])}
${paragraph("Have documents to share, such as trade licence or permits? Reply to this email and attach them.")}`,
    footer: opts.footer,
  })
}

export function applicationConfirmationEmail(opts: {
  name: string
  position: string
  footer?: EmailFooterContext
}): string {
  const first = escapeHtml((opts.name || "there").trim().split(/\s+/)[0])
  return emailShell({
    preheader: `We've received your application for ${opts.position}.`,
    eyebrow: "Application received",
    heading: "Your application is with our talent team",
    body: `${lead(`Hi ${first},`)}
${paragraph(`Thank you for applying for the <strong>${escapeHtml(opts.position)}</strong> role at ViaRidez. Your application has been logged and our talent team will review it properly — every application is read by a person.`)}
${steps([
  "Our talent team reviews your experience against the role.",
  "Shortlisted candidates are invited to an introductory call.",
  "You'll hear from us either way — we don't leave applications unanswered.",
])}
${paragraph("If you'd like to add anything to your application, simply reply to this email.")}
${button("See all open roles", `${SITE_URL}/careers`)}`,
    footer: opts.footer,
  })
}

export function resourceDownloadEmail(opts: {
  name?: string
  resourceTitle: string
  downloadUrl: string
  footer?: EmailFooterContext
}): string {
  const first = opts.name?.trim()
    ? escapeHtml(opts.name.trim().split(/\s+/)[0])
    : ""
  const absolute = opts.downloadUrl.startsWith("http")
    ? opts.downloadUrl
    : `${SITE_URL}${opts.downloadUrl.startsWith("/") ? "" : "/"}${opts.downloadUrl}`
  return emailShell({
    preheader: `Your copy of "${opts.resourceTitle}" is ready to download.`,
    eyebrow: "Your download",
    heading: opts.resourceTitle,
    body: `${lead(first ? `Hi ${first},` : "Hello,")}
${paragraph("Thanks for your interest — your copy is ready. We've emailed it so you can find it again later without refilling the form.")}
${button("Download now", absolute)}
${paragraph(`If the button doesn't work, copy this link into your browser:<br /><span style="word-break:break-all;color:#7b8794;font-size:13px;">${escapeHtml(absolute)}</span>`)}
${divider()}
${finePrint("You received this because you requested this resource on our website. We'll only follow up if it's genuinely relevant.")}`,
    footer: opts.footer,
  })
}

export function adminWelcomeEmail(opts: {
  name: string
  email: string
  role: string
  footer?: EmailFooterContext
}): string {
  const first = escapeHtml((opts.name || "there").trim().split(/\s+/)[0])
  return emailShell({
    preheader: "Your ViaRidez admin account is ready.",
    eyebrow: "Account created",
    heading: "Your admin access is ready",
    body: `${lead(`Hi ${first},`)}
${paragraph("An administrator has created a ViaRidez content management account for you. You can sign in with the email below and the password shared with you separately.")}
${detailTable(
  [
    { label: "Sign-in email", value: opts.email },
    { label: "Role", value: opts.role },
  ],
  "Your account",
)}
${button("Sign in to admin", `${SITE_URL}/sign-in`)}
${finePrint("For security, change your password after your first sign-in and never share it. If you weren't expecting this account, contact your administrator immediately.")}`,
    footer: opts.footer,
  })
}
