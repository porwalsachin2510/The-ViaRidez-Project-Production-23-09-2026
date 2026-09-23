"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { saveResource } from "@/app/actions/resources"
import type { FieldConfig, RelationOptions } from "@/lib/admin/resource-types"
import { GalleryField, ImageField } from "./image-field"
import { BlocksField } from "./blocks-field"

function getPath(obj: Record<string, unknown> | undefined, path: string): unknown {
  if (!obj) return undefined
  return path.split(".").reduce<unknown>((acc, p) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[p]
    return undefined
  }, obj)
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  )
}

export function ResourceForm({
  resourceKey,
  fields,
  record,
  relationOptions,
}: {
  resourceKey: string
  fields: FieldConfig[]
  record?: Record<string, unknown>
  relationOptions?: RelationOptions
}) {
  const router = useRouter()
  const id = record ? String(record._id ?? record.id ?? "") : null
  const [state, action] = useActionState(saveResource.bind(null, resourceKey, id), { ok: false })

  return (
    <form action={action} className="space-y-6">
      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      ) : null}
      <div className="grid gap-6">
        {fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={getPath(record, field.name)}
            options={relationOptions?.[field.name]}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-border pt-5">
        <SubmitButton />
        <button
          type="button"
          onClick={() => router.push(`/admin/${resourceKey}`)}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function Field({
  field,
  value,
  options,
}: {
  field: FieldConfig
  value: unknown
  options?: { value: string; label: string }[]
}) {
  const [checked, setChecked] = useState(Boolean(value))
  const label = (
    <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-foreground">
      {field.label}
      {field.required ? <span className="text-red-500"> *</span> : null}
    </label>
  )
  const help = field.help ? <p className="mt-1 text-xs text-muted-foreground">{field.help}</p> : null
  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"

  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={field.name}
          name={field.name}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
        />
        <label htmlFor={field.name} className="text-sm font-medium text-foreground">
          {field.label}
        </label>
      </div>
    )
  }

  if (field.type === "date") {
    // Normalise whatever the DB returned (Date, ISO string, empty) to the
    // YYYY-MM-DD the native date picker requires.
    const toDateValue = (v: unknown): string => {
      if (!v) return ""
      const d = new Date(v as string)
      return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
    }
    return (
      <div>
        {label}
        <input type="date" id={field.name} name={field.name} defaultValue={toDateValue(value)} className={inputCls} />
        {help}
      </div>
    )
  }

  if (field.type === "image") {
    return (
      <div>
        {label}
        <ImageField name={field.name} defaultValue={typeof value === "string" ? value : ""} />
        {help}
      </div>
    )
  }

  if (field.type === "file") {
    return (
      <div>
        {label}
        <ImageField name={field.name} mode="document" defaultValue={typeof value === "string" ? value : ""} />
        {help}
      </div>
    )
  }

  if (field.type === "relation") {
    // A single-select referencing another collection (e.g. parent service,
    // blog category). Options are loaded server-side and passed in.
    const current = value && typeof value === "object" ? String((value as { _id?: unknown })._id ?? "") : String(value ?? "")
    return (
      <div>
        {label}
        <select id={field.name} name={field.name} defaultValue={current} className={inputCls}>
          <option value="">{field.relation?.emptyLabel ?? "None"}</option>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {help}
      </div>
    )
  }

  if (field.type === "select") {
    return (
      <div>
        {label}
        <select id={field.name} name={field.name} defaultValue={String(value ?? "")} className={inputCls}>
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {help}
      </div>
    )
  }

  if (field.type === "status") {
    return (
      <div>
        {label}
        <select
          id={field.name}
          name={field.name}
          defaultValue={typeof value === "string" && value ? value : "draft"}
          className={inputCls}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        {help}
      </div>
    )
  }

  if (field.type === "keyvalue") {
    return (
      <div>
        {label}
        <KeyValueField name={field.name} value={value} />
        {help}
      </div>
    )
  }

  if (field.type === "objectlist") {
    return (
      <div>
        {label}
        <ObjectListField field={field} value={value} />
        {help}
      </div>
    )
  }

  if (field.type === "blocks") {
    return (
      <div>
        {label}
        {help}
        <div className="mt-2">
          <BlocksField name={field.name} value={value} />
        </div>
      </div>
    )
  }

  if (field.type === "gallery") {
    // Multi-image uploader; submits a newline-joined string that the save
    // action splits back into a string[].
    const initial = Array.isArray(value)
      ? (value as unknown[]).map((v) => String(v ?? "")).filter(Boolean)
      : String(value ?? "")
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean)
    return (
      <div>
        {label}
        <GalleryField name={field.name} defaultValue={initial} />
        {help}
      </div>
    )
  }

  if (field.type === "json") {
    const textValue = value && typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "[]")
    return (
      <div>
        {label}
        <textarea
          id={field.name}
          name={field.name}
          rows={16}
          defaultValue={textValue}
          spellCheck={false}
          className={`${inputCls} font-mono text-xs leading-relaxed`}
        />
        {help}
      </div>
    )
  }

  if (field.type === "textarea" || field.type === "richtext" || field.type === "lines") {
    // `lines` edits a string[] as one item per line.
    const textValue = Array.isArray(value) ? value.join("\n") : String(value ?? "")
    return (
      <div>
        {label}
        <textarea
          id={field.name}
          name={field.name}
          rows={field.type === "richtext" ? 12 : field.type === "lines" ? 5 : 3}
          defaultValue={textValue}
          className={`${inputCls} font-mono`}
        />
        {help}
      </div>
    )
  }

  const defaultVal = Array.isArray(value) ? value.join(", ") : String(value ?? "")
  return (
    <div>
      {label}
      <input
        type={field.type === "number" ? "number" : "text"}
        id={field.name}
        name={field.name}
        defaultValue={defaultVal}
        className={inputCls}
      />
      {help}
    </div>
  )
}

type MetricRow = { value: string; label: string }

/**
 * Repeatable label/value editor for `keyvalue` fields (e.g. case-study result
 * metrics). Rows submit as parallel `<name>.value` / `<name>.label` arrays that
 * the save action reassembles into `{ label, value }[]`.
 */
function KeyValueField({ name, value }: { name: string; value: unknown }) {
  const initial: MetricRow[] = Array.isArray(value)
    ? (value as { label?: string; value?: string }[]).map((m) => ({
        value: String(m?.value ?? ""),
        label: String(m?.label ?? ""),
      }))
    : []
  const [rows, setRows] = useState<MetricRow[]>(initial.length ? initial : [{ value: "", label: "" }])

  const update = (i: number, key: keyof MetricRow, v: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)))
  const addRow = () => setRows((prev) => [...prev, { value: "", label: "" }])
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i))

  const cell =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            name={`${name}.value`}
            value={row.value}
            onChange={(e) => update(i, "value", e.target.value)}
            placeholder="Value (e.g. 99.4%)"
            className={`${cell} sm:max-w-[10rem]`}
          />
          <input
            type="text"
            name={`${name}.label`}
            value={row.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder="Label (e.g. On-time arrivals)"
            className={cell}
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            aria-label="Remove metric"
            className="shrink-0 rounded-lg border border-border px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-red-400 hover:text-red-500"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
      >
        + Add metric
      </button>
    </div>
  )
}

/**
 * Repeatable object editor for `objectlist` fields (e.g. service features with
 * icon / title / description). Each sub-field submits as a parallel array under
 * `<name>.<subfield>`, which the save action reassembles into an object array.
 */
function ObjectListField({ field, value }: { field: FieldConfig; value: unknown }) {
  const itemFields = field.itemFields ?? []
  const emptyRow = () => Object.fromEntries(itemFields.map((f) => [f.name, ""])) as Record<string, string>
  const initial: Record<string, string>[] = Array.isArray(value)
    ? (value as Record<string, unknown>[]).map((item) =>
        Object.fromEntries(itemFields.map((f) => [f.name, String(item?.[f.name] ?? "")])),
      )
    : []
  const [rows, setRows] = useState<Record<string, string>[]>(initial.length ? initial : [emptyRow()])

  const update = (i: number, key: string, v: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)))
  const addRow = () => setRows((prev) => [...prev, emptyRow()])
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i))

  const cell =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <div className="grid flex-1 gap-2">
            {itemFields.map((sf) => (
              <input
                key={sf.name}
                type="text"
                name={`${field.name}.${sf.name}`}
                value={row[sf.name] ?? ""}
                onChange={(e) => update(i, sf.name, e.target.value)}
                placeholder={sf.placeholder ? `${sf.label} — ${sf.placeholder}` : sf.label}
                className={cell}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => removeRow(i)}
            aria-label="Remove item"
            className="shrink-0 rounded-lg border border-border px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-red-400 hover:text-red-500"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
      >
        + Add item
      </button>
    </div>
  )
}
