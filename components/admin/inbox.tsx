"use client"

import { Fragment, useState, useTransition } from "react"
import { ChevronDown, Mail, Phone, Building2, MapPin, Users, FileText, Check, Loader2 } from "lucide-react"
import { updateInboxStatus, updateInboxNotes } from "@/app/actions/admin"

type InboxKind = "enquiry" | "quote" | "application" | "demo" | "partner"

// Must mirror the Mongoose schema enums (see app/actions/admin.ts).
const statusOptions: Record<InboxKind, string[]> = {
  enquiry: ["new", "in-progress", "resolved", "spam"],
  quote: ["new", "contacted", "quoted", "won", "lost"],
  application: ["new", "reviewing", "shortlisted", "interview", "offer", "rejected", "hired"],
  demo: ["new", "scheduled", "completed", "no-show", "cancelled"],
  partner: ["new", "reviewing", "approved", "rejected", "onboarded"],
}

function NotesEditor({ kind, id, initial }: { kind: InboxKind; id: string; initial: string }) {
  const [value, setValue] = useState(initial)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const dirty = value !== initial

  return (
    <div className="mt-3 rounded-lg border border-border bg-card p-3">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Internal notes
      </label>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setSaved(false)
        }}
        rows={3}
        placeholder="Add a note for your team (follow-ups, context, next steps)…"
        className="mt-1.5 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={() =>
            startTransition(async () => {
              const res = await updateInboxNotes(kind, id, value)
              if (res?.ok) setSaved(true)
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Save note
        </button>
        {saved && !dirty ? <span className="text-xs text-emerald-600">Saved</span> : null}
      </div>
    </div>
  )
}

function StatusControl({ kind, id, status }: { kind: InboxKind; id: string; status: string }) {
  const [value, setValue] = useState(status)
  const [pending, startTransition] = useTransition()

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value
        setValue(next)
        startTransition(async () => {
          await updateInboxStatus(kind, id, next)
        })
      }}
      className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium capitalize text-foreground disabled:opacity-50"
      aria-label="Update status"
    >
      {statusOptions[kind].map((s) => (
        <option key={s} value={s}>
          {s.replace(/[-_]/g, " ")}
        </option>
      ))}
    </select>
  )
}

type BaseRecord = {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: string
  createdAt: string
  message?: string
  subject?: string
  serviceType?: string
  pickupLocation?: string
  dropoffLocation?: string
  startDate?: string
  employeeCount?: string
  position?: string
  coverLetter?: string
  resumeUrl?: string
  resumeFileName?: string
  notes?: string
  // Fleet-partner specific
  city?: string
  fleetSize?: string
  vehicleTypes?: string
  website?: string
  logoUrl?: string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function InboxList({ kind, records }: { kind: InboxKind; records: BaseRecord[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center text-sm text-muted-foreground">
        No records yet. Submissions from the website will appear here.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Details</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Received</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map((r) => {
            const isOpen = openId === r.id
            return (
              <Fragment key={r.id}>
                <tr className="align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                    {r.company ? <div className="text-xs text-muted-foreground">{r.company}</div> : null}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {kind === "quote" && (r.serviceType || r.pickupLocation)
                      ? `${r.serviceType ?? ""}${r.pickupLocation ? ` • ${r.pickupLocation}` : ""}`
                      : kind === "application" && r.position
                        ? r.position
                        : kind === "partner" && (r.fleetSize || r.city)
                          ? `${r.fleetSize ?? ""}${r.city ? ` • ${r.city}` : ""}`
                          : r.subject || (r.message ? `${r.message.slice(0, 60)}…` : "—")}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                    {fmtDate(r.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusControl kind={kind} id={r.id} status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setOpenId(isOpen ? null : r.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                      aria-expanded={isOpen}
                    >
                      {isOpen ? "Hide" : "View"}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  </td>
                </tr>
                {isOpen ? (
                  <tr className="bg-muted/20">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <DetailItem icon={<Mail className="h-4 w-4" />} label="Email" value={r.email} />
                        {r.phone ? <DetailItem icon={<Phone className="h-4 w-4" />} label="Phone" value={r.phone} /> : null}
                        {r.company ? <DetailItem icon={<Building2 className="h-4 w-4" />} label="Company" value={r.company} /> : null}
                        {r.pickupLocation ? <DetailItem icon={<MapPin className="h-4 w-4" />} label="Pickup" value={r.pickupLocation} /> : null}
                        {r.employeeCount ? <DetailItem icon={<Users className="h-4 w-4" />} label="Passengers" value={String(r.employeeCount)} /> : null}
                        {r.position ? <DetailItem icon={<FileText className="h-4 w-4" />} label="Position" value={r.position} /> : null}
                        {r.city ? <DetailItem icon={<MapPin className="h-4 w-4" />} label="City" value={r.city} /> : null}
                        {r.fleetSize ? <DetailItem icon={<Users className="h-4 w-4" />} label="Fleet size" value={r.fleetSize} /> : null}
                        {r.vehicleTypes ? <DetailItem icon={<FileText className="h-4 w-4" />} label="Vehicle types" value={r.vehicleTypes} /> : null}
                        {r.website ? (
                          <DetailItem
                            icon={<FileText className="h-4 w-4" />}
                            label="Website"
                            value={<a href={r.website} className="text-accent underline" target="_blank" rel="noreferrer">Open</a>}
                          />
                        ) : null}
                        {r.logoUrl ? (
                          <DetailItem
                            icon={<FileText className="h-4 w-4" />}
                            label="Company logo"
                            value={<a href={r.logoUrl} className="text-accent underline" target="_blank" rel="noreferrer">View logo</a>}
                          />
                        ) : null}
                        {r.resumeUrl ? (
                          <DetailItem
                            icon={<FileText className="h-4 w-4" />}
                            label="Resume / CV"
                            value={
                              <a href={r.resumeUrl} className="text-accent underline" target="_blank" rel="noreferrer">
                                {r.resumeFileName || "Download CV"}
                              </a>
                            }
                          />
                        ) : null}
                      </div>
                      {(r.message || r.coverLetter) ? (
                        <div className="mt-3 rounded-lg border border-border bg-card p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {kind === "application" ? "Cover letter" : kind === "demo" ? "Goals" : "Message"}
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm text-foreground">
                            {r.message || r.coverLetter}
                          </p>
                        </div>
                      ) : null}
                      <NotesEditor kind={kind} id={r.id} initial={r.notes ?? ""} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}
