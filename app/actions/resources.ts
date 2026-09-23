"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Types } from "mongoose"
import { requireModule } from "@/lib/auth-helpers"
import { connectToDatabase } from "@/lib/db/mongoose"
import { Resource, ResourceLead } from "@/models"
import { recordAuditEvent } from "@/lib/audit"
import { getResource } from "@/lib/admin/resources"
import { invalidateRedirectCache } from "@/lib/redirects"
import { syncLeadToCrm } from "@/lib/crm"
import { resourceLeadSchema } from "@/lib/validation/forms"
import { sendEmail } from "@/lib/email"
import { resourceDownloadEmail, teamNotificationEmail } from "@/lib/email/templates"
import { emailFooter, teamInbox, sendCustomerEmail } from "@/lib/email/notify"

/** Set a value at a dot-path (e.g. "seo.metaTitle") on a plain object. */
function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".")
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]
    if (typeof cur[p] !== "object" || cur[p] === null) cur[p] = {}
    cur = cur[p] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]] = value
}

/** Coerce a raw FormData string into the typed value for a field. */
function coerce(type: string, raw: FormDataEntryValue | null): unknown {
  const s = typeof raw === "string" ? raw : ""
  switch (type) {
    case "boolean":
      return s === "on" || s === "true"
    case "number":
      return s === "" ? undefined : Number(s)
    case "json":
      if (!s.trim()) return []
      try {
        return JSON.parse(s)
      } catch {
        throw new Error(`Invalid JSON in ${type} field`)
      }
    case "tags":
      return s.split(",").map((t) => t.trim()).filter(Boolean)
    case "lines":
    case "gallery":
      // One item per line; also tolerate comma separation for convenience.
      return s
        .split(/[\n,]/)
        .map((t) => t.trim())
        .filter(Boolean)
    default:
      return s
  }
}

/**
 * Parse a `keyvalue` field into `{ label, value }[]`.
 * The form submits parallel arrays under `<name>.value[]` and `<name>.label[]`
 * so admins can add/remove rows without editing JSON. Empty rows are dropped.
 */
function parseKeyValue(formData: FormData, name: string): { label: string; value: string }[] {
  const values = formData.getAll(`${name}.value`).map((v) => (typeof v === "string" ? v.trim() : ""))
  const labels = formData.getAll(`${name}.label`).map((v) => (typeof v === "string" ? v.trim() : ""))
  const rows: { label: string; value: string }[] = []
  const len = Math.max(values.length, labels.length)
  for (let i = 0; i < len; i++) {
    const value = values[i] ?? ""
    const label = labels[i] ?? ""
    if (value || label) rows.push({ label, value })
  }
  return rows
}

/**
 * Parse an `objectlist` field into an array of objects.
 * Each sub-field submits as a parallel array under `<name>.<subfield>`, which
 * we zip back together row-by-row. Rows where every sub-field is empty are
 * dropped so clearing a row removes it.
 */
function parseObjectList(
  formData: FormData,
  name: string,
  itemFields: { name: string }[],
): Record<string, string>[] {
  const columns = itemFields.map((f) => ({
    name: f.name,
    values: formData.getAll(`${name}.${f.name}`).map((v) => (typeof v === "string" ? v.trim() : "")),
  }))
  const len = columns.reduce((max, c) => Math.max(max, c.values.length), 0)
  const rows: Record<string, string>[] = []
  for (let i = 0; i < len; i++) {
    const row: Record<string, string> = {}
    let hasValue = false
    for (const col of columns) {
      const v = col.values[i] ?? ""
      row[col.name] = v
      if (v) hasValue = true
    }
    if (hasValue) rows.push(row)
  }
  return rows
}

/** Estimate reading time in minutes from body text at ~200 words/min. */
function estimateReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/**
 * Resource-specific normalisation applied after the raw form is parsed.
 * For the blog this makes the CMS behave like a real editorial tool:
 *  - auto-estimate reading time from the body when the editor leaves it blank
 *  - stamp a publish date when an article is published without one
 * (The public byline defaults — "ViaRidez Editorial Team" — are applied at
 * render time so the stored document stays clean.)
 */
function normalizeDoc(resourceKey: string, doc: Record<string, unknown>) {
  if (resourceKey !== "blog") return
  const body = typeof doc.body === "string" ? doc.body : ""
  if (!doc.readingTime && body) doc.readingTime = estimateReadingTime(body)
  if (doc.status === "published" && !doc.publishedAt) doc.publishedAt = new Date()
}

async function buildDoc(resourceKey: string, formData: FormData) {
  const resource = getResource(resourceKey)
  if (!resource) throw new Error("Unknown resource")
  const doc: Record<string, unknown> = {}
  for (const field of resource.fields) {
    if (field.type === "boolean") {
      const raw = formData.get(field.name)
      setPath(doc, field.name, raw === "on" || raw === "true")
    } else if (field.type === "keyvalue") {
      // Always set (even to []) so clearing all rows persists an empty array.
      setPath(doc, field.name, parseKeyValue(formData, field.name))
    } else if (field.type === "objectlist") {
      // Always set (even to []) so clearing all rows persists an empty array.
      setPath(doc, field.name, parseObjectList(formData, field.name, field.itemFields ?? []))
    } else if (field.type === "blocks") {
      // The structured block editor serialises the whole array to a single
      // hidden JSON input. Parse it back into a section array (always set so
      // clearing every block persists an empty array).
      const raw = formData.get(field.name)
      let parsed: unknown = []
      if (typeof raw === "string" && raw.trim()) {
        try {
          parsed = JSON.parse(raw)
        } catch {
          throw new Error(`Invalid data in ${field.label} field`)
        }
      }
      setPath(doc, field.name, Array.isArray(parsed) ? parsed : [])
    } else if (field.type === "date") {
      // Always set (null when cleared) so a deadline/publish date can be removed.
      const raw = formData.get(field.name)
      const s = typeof raw === "string" ? raw.trim() : ""
      const d = s ? new Date(s) : null
      setPath(doc, field.name, d && !Number.isNaN(d.getTime()) ? d : null)
    } else if (field.type === "relation") {
      // Store the referenced ObjectId, or null when the picker is cleared, so
      // relations (e.g. a service's parent) can be set and unset from the CMS.
      const raw = formData.get(field.name)
      const val = typeof raw === "string" ? raw.trim() : ""
      setPath(doc, field.name, val && Types.ObjectId.isValid(val) ? val : null)
    } else {
      const raw = formData.get(field.name)
      const val = coerce(field.type, raw)
      if (val !== undefined && val !== "") setPath(doc, field.name, val)
    }
  }
  normalizeDoc(resourceKey, doc)
  return { resource, doc }
}

/**
 * Purge the caches touched by a CMS content change.
 *
 * The admin list is revalidated directly, but the public marketing pages are
 * statically generated (`generateStaticParams`, no time-based `revalidate`),
 * so without an explicit purge they keep serving the build-time snapshot until
 * a full redeploy. Content is also shared across the whole site (services in
 * the nav/footer, featured items on the homepage, etc.), so we revalidate the
 * entire public tree via the root layout. This makes every create / update /
 * publish / delete appear on the live site immediately.
 */
function revalidateContent(resourceKey: string) {
  revalidatePath(`/admin/${resourceKey}`)
  revalidatePath("/", "layout")
}

export type SaveResourceState = { ok: boolean; error?: string }

export async function saveResource(
  resourceKey: string,
  id: string | null,
  _prev: SaveResourceState,
  formData: FormData,
): Promise<SaveResourceState> {
  const cfg = getResource(resourceKey)
  if (!cfg) return { ok: false, error: "Unknown resource." }

  try {
    const user = await requireModule(cfg.moduleKey)
    await connectToDatabase()
    const { doc } = await buildDoc(resourceKey, formData)
    const Model = cfg.model

    if (id) await Model.updateOne({ _id: id }, { $set: doc })
    else await Model.create(doc)

    await recordAuditEvent({ user, action: id ? "update" : "create", entity: resourceKey, entityId: id ?? "" })

    if (resourceKey === "redirects") invalidateRedirectCache()
    revalidateContent(resourceKey)
  } catch (error) {
    // Surface a friendly message in the form instead of crashing the page.
    // Mongoose duplicate-key errors (e.g. a slug that already exists) are the
    // most common cause, so we translate those specifically.
    console.log("[v0] saveResource error:", error instanceof Error ? error.message : error)
    const message =
      error && typeof error === "object" && "code" in error && (error as { code?: number }).code === 11000
        ? "A record with one of these unique values (e.g. slug) already exists."
        : error instanceof Error
          ? error.message
          : "Could not save. Please check your input and try again."
    return { ok: false, error: message }
  }

  // redirect() throws NEXT_REDIRECT; keep it outside the try so it is never
  // swallowed by the error handler above.
  redirect(`/admin/${resourceKey}`)
}

export async function togglePublish(resourceKey: string, id: string, next: boolean) {
  const cfg = getResource(resourceKey)
  if (!cfg) return { ok: false }
  await requireModule(cfg.moduleKey)
  await connectToDatabase()
  await cfg.model.updateOne({ _id: id }, { $set: { status: next ? "published" : "draft" } })
  revalidateContent(resourceKey)
  return { ok: true }
}

/**
 * Permanently delete a content record from the database.
 *
 * This is a hard delete: the document is removed from its MongoDB collection
 * (not just flagged with `isDeleted`), matching the expectation that a delete
 * in the CMS actually erases the row. The action is guarded by the same
 * per-module permission check and recorded in the audit log.
 */
export async function deleteResource(resourceKey: string, id: string) {
  const cfg = getResource(resourceKey)
  if (!cfg) return { ok: false, error: "Unknown resource" }
  const user = await requireModule(cfg.moduleKey)
  if (!Types.ObjectId.isValid(id)) return { ok: false, error: "Invalid id" }
  await connectToDatabase()
  const result = await cfg.model.deleteOne({ _id: id })
  if (!result.deletedCount) return { ok: false, error: "Record not found" }
  await recordAuditEvent({ user, action: "delete", entity: resourceKey, entityId: id })
  if (resourceKey === "redirects") invalidateRedirectCache()
  revalidateContent(resourceKey)
  return { ok: true }
}

export type ResourceDownloadState = {
  ok: boolean
  message?: string
  errors?: Record<string, string>
  downloadUrl?: string
}

function fieldErrors(error: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === "string" && !out[key]) out[key] = issue.message
  }
  return out
}

export async function requestResourceDownload(
  _prev: ResourceDownloadState,
  formData: FormData,
): Promise<ResourceDownloadState> {
  const parsed = resourceLeadSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) }
  if (parsed.data.consent !== "on") {
    return { ok: false, errors: { consent: "Please agree to receive this resource." } }
  }
  if (!Types.ObjectId.isValid(parsed.data.resourceId)) {
    return { ok: false, message: "This resource is no longer available." }
  }

  try {
    await connectToDatabase()
    const resource = await Resource.findOne({
      _id: parsed.data.resourceId,
      isDeleted: false,
      status: "published",
    }).lean()
    if (!resource) return { ok: false, message: "This resource is no longer available." }

    const synced = await syncLeadToCrm({
      type: "resource",
      name: parsed.data.name || "",
      email: parsed.data.email,
      company: parsed.data.company || "",
      meta: { resourceId: String(resource._id), resourceTitle: resource.title },
    })

    await ResourceLead.create({
      resourceId: resource._id,
      resourceTitle: resource.title,
      email: parsed.data.email,
      name: parsed.data.name || "",
      company: parsed.data.company || "",
      consent: true,
      syncedToCrm: synced,
    })

    // Email the download link so the lead keeps a permanent copy rather than
    // relying on the one-time link in the browser session.
    await sendCustomerEmail({
      to: parsed.data.email,
      subject: `Your download: ${resource.title}`,
      html: resourceDownloadEmail({
        name: parsed.data.name || "",
        resourceTitle: resource.title,
        downloadUrl: resource.downloadUrl || "",
        footer: await emailFooter(),
      }),
    })

    const inbox = await teamInbox()
    if (inbox) {
      await sendEmail({
        to: inbox,
        subject: `Resource downloaded: ${resource.title}`,
        html: teamNotificationEmail({
          title: "New resource download",
          rows: [
            { label: "Resource", value: resource.title },
            { label: "Name", value: parsed.data.name },
            { label: "Email", value: parsed.data.email },
            { label: "Company", value: parsed.data.company },
          ],
          adminPath: "/admin/resource-leads",
          footer: await emailFooter(),
        }),
        replyTo: parsed.data.email,
      })
    }

    return {
      ok: true,
      message: "Your resource is ready to download — we've also emailed you the link.",
      downloadUrl: resource.downloadUrl,
    }
  } catch (error) {
    console.log("[v0] requestResourceDownload error:", error instanceof Error ? error.message : error)
    return { ok: false, message: "Something went wrong. Please try again." }
  }
}
