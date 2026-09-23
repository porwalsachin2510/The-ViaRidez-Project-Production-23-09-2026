"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Pencil, Trash2, Plus } from "lucide-react"
import { togglePublish, deleteResource } from "@/app/actions/resources"
import type { FieldConfig } from "@/lib/admin/resource-types"

function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, p) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[p]
    return undefined
  }, obj)
}

function Row({
  resourceKey,
  record,
  columns,
}: {
  resourceKey: string
  record: Record<string, unknown>
  columns: FieldConfig[]
}) {
  const id = String(record._id ?? record.id)
  const [pending, startTransition] = useTransition()
  const [deleted, setDeleted] = useState(false)
  // Content models track publish state via a `status` enum, not a boolean.
  const [published, setPublished] = useState(record.status === "published")

  if (deleted) return null

  return (
    <tr className="border-b border-border last:border-0">
      {columns.map((col) => {
        const raw = getPath(record, col.name)
        if (col.name === "status" || col.type === "boolean") {
          return (
            <td key={col.name} className="px-4 py-3">
              <button
                onClick={() =>
                  startTransition(async () => {
                    const next = !published
                    setPublished(next)
                    await togglePublish(resourceKey, id, next)
                  })
                }
                disabled={pending}
                title="Click to toggle published state"
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition ${
                  published
                    ? "bg-emerald-100 text-emerald-800 ring-emerald-200 hover:bg-emerald-200"
                    : "bg-slate-100 text-slate-600 ring-slate-200 hover:bg-slate-200"
                }`}
              >
                {published ? "Published" : "Draft"}
              </button>
            </td>
          )
        }
        return (
          <td key={col.name} className="px-4 py-3 text-sm text-foreground">
            {raw ? String(raw) : <span className="text-muted-foreground">—</span>}
          </td>
        )
      })}
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          <Link
            href={`/admin/${resourceKey}/${id}`}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => {
              if (!confirm("Delete this item permanently? This removes it from the database and cannot be undone.")) return
              startTransition(async () => {
                const res = await deleteResource(resourceKey, id)
                if (res?.ok) setDeleted(true)
                else alert(res?.error || "Could not delete this item. Please try again.")
              })
            }}
            disabled={pending}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function ResourceList({
  resourceKey,
  label,
  singular,
  columns,
  records,
}: {
  resourceKey: string
  label: string
  singular: string
  columns: FieldConfig[]
  records: Record<string, unknown>[]
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{records.length} items</p>
        </div>
        <Link
          href={`/admin/${resourceKey}/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
        >
          <Plus className="h-4 w-4" />
          New {singular}
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center text-sm text-muted-foreground">
          No {label.toLowerCase()} yet. Create your first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-left">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c.name} className="px-4 py-3 font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <Row key={String(r._id ?? r.id)} resourceKey={resourceKey} record={r} columns={columns} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
