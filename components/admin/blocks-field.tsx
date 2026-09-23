"use client"

import { useMemo, useState } from "react"
import { ICON_KEYS } from "@/lib/icons"
import { ImageUploader } from "./image-field"

/* -------------------------------------------------------------------------- */
/*  Block registry — the single source of truth the admin editor uses to      */
/*  decide which fields and item sub-fields each section type exposes. Must    */
/*  stay in sync with the renderer in `cms-section-renderer.tsx`.              */
/* -------------------------------------------------------------------------- */

type ItemInput = "text" | "textarea" | "icon" | "lines" | "points" | "image"
type ItemField = { name: string; label: string; input: ItemInput }
type TopField =
  | "eyebrow"
  | "heading"
  | "subheading"
  | "body"
  | "image"
  | "imageAlt"
  | "variant"
  | "background"
  | "align"
  | "ctaLabel"
  | "ctaHref"

type BlockDef = {
  label: string
  description: string
  fields: TopField[]
  variantOptions?: string[]
  bodyLabel?: string
  item?: ItemField[]
  itemLabel?: string
}

const BLOCK_TYPES: Record<string, BlockDef> = {
  "stat-bar": {
    label: "Stat bar",
    description: "Four headline figures in an overlapping bar (best placed first, under the hero).",
    fields: [],
    item: [
      { name: "value", label: "Value (e.g. 99.5%)", input: "text" },
      { name: "label", label: "Label", input: "text" },
    ],
    itemLabel: "stat",
  },
  "split-checklist": {
    label: "Split — image + checklist",
    description: "Heading, description, a checklist and an optional link beside a large image.",
    fields: ["eyebrow", "heading", "subheading", "body", "image", "imageAlt", "variant", "ctaLabel", "ctaHref"],
    variantOptions: ["image-right", "image-left"],
    item: [{ name: "body", label: "Checklist point", input: "text" }],
    itemLabel: "point",
  },
  "card-grid": {
    label: "Card grid",
    description: "Centered heading with a responsive grid of icon cards.",
    fields: ["eyebrow", "heading", "subheading", "background", "variant"],
    variantOptions: ["cols-3", "cols-4", "icon-primary"],
    item: [
      { name: "icon", label: "Icon", input: "icon" },
      { name: "title", label: "Title", input: "text" },
      { name: "body", label: "Description", input: "textarea" },
    ],
    itemLabel: "card",
  },
  steps: {
    label: "Numbered steps",
    description: "Centered heading with numbered icon cards for a process / how-it-works.",
    fields: ["eyebrow", "heading", "subheading", "background"],
    item: [
      { name: "icon", label: "Icon", input: "icon" },
      { name: "title", label: "Title", input: "text" },
      { name: "body", label: "Description", input: "textarea" },
    ],
    itemLabel: "step",
  },
  "feature-split": {
    label: "Feature split (image + icon grid)",
    description: "An image beside a heading and a two-column grid of small icon features.",
    fields: ["eyebrow", "heading", "subheading", "image", "imageAlt", "variant"],
    variantOptions: ["image-left", "image-right"],
    item: [
      { name: "icon", label: "Icon", input: "icon" },
      { name: "title", label: "Title", input: "text" },
      { name: "body", label: "Description", input: "textarea" },
    ],
    itemLabel: "feature",
  },
  tabs: {
    label: "Tabbed showcase",
    description: "Interactive tabs. Light = screenshot + checklist; Dark = navy panel with point cards.",
    fields: ["eyebrow", "heading", "subheading", "variant"],
    variantOptions: ["light", "dark"],
    item: [
      { name: "icon", label: "Tab icon", input: "icon" },
      { name: "label", label: "Tab label", input: "text" },
      { name: "heading", label: "Panel heading", input: "text" },
      { name: "body", label: "Panel description (light only)", input: "textarea" },
      { name: "image", label: "Screenshot (light only)", input: "image" },
      { name: "imageAlt", label: "Screenshot alt (light only)", input: "text" },
      { name: "bullets", label: "Checklist (light only)", input: "lines" },
      { name: "points", label: "Point cards (dark only)", input: "points" },
    ],
    itemLabel: "tab",
  },
  legal: {
    label: "Legal document",
    description: "Numbered legal sections. The 'Last updated' note goes in the body field.",
    fields: ["body"],
    bodyLabel: "Footer note (e.g. Last updated: 1 January 2026)",
    item: [
      { name: "heading", label: "Section heading", input: "text" },
      { name: "body", label: "Paragraphs (one per line)", input: "lines" },
    ],
    itemLabel: "section",
  },
  cta: {
    label: "Call to action band",
    description: "A gradient band with a heading, description and a button.",
    fields: ["heading", "subheading", "ctaLabel", "ctaHref"],
  },
  richtext: {
    label: "Rich text",
    description: "A centered/left heading with a Markdown body.",
    fields: ["eyebrow", "heading", "subheading", "align", "background", "body"],
    bodyLabel: "Body (Markdown)",
  },
  "prose-split": {
    label: "Prose + image split",
    description: "Eyebrow, heading and paragraphs beside a large photo. One paragraph per item (or use the body field).",
    fields: ["eyebrow", "heading", "image", "imageAlt", "variant", "background", "body"],
    variantOptions: ["image-right", "image-left"],
    bodyLabel: "Paragraphs (one per line, used if no items added)",
    item: [{ name: "body", label: "Paragraph", input: "textarea" }],
    itemLabel: "paragraph",
  },
  "stat-band": {
    label: "Stat band",
    description: "A full-width divided band of headline figures. Leave items empty to reuse the stats from Site Settings.",
    fields: [],
    item: [
      { name: "value", label: "Value (e.g. 99.5%)", input: "text" },
      { name: "label", label: "Label", input: "text" },
    ],
    itemLabel: "stat",
  },
  "value-list": {
    label: "Value list",
    description: "Understated grid of values — a hairline rule above an inline icon + title, then a short description.",
    fields: ["eyebrow", "heading", "subheading", "background"],
    item: [
      { name: "icon", label: "Icon", input: "icon" },
      { name: "title", label: "Title", input: "text" },
      { name: "body", label: "Description", input: "textarea" },
    ],
    itemLabel: "value",
  },
  "icon-cards": {
    label: "Icon cards (left-aligned heading)",
    description: "Left-aligned heading with bordered icon cards. 'plain' drops the icon tile for a lighter card.",
    fields: ["eyebrow", "heading", "subheading", "background", "variant"],
    variantOptions: ["cols-4", "cols-3", "plain"],
    item: [
      { name: "icon", label: "Icon", input: "icon" },
      { name: "title", label: "Title", input: "text" },
      { name: "body", label: "Description", input: "textarea" },
    ],
    itemLabel: "card",
  },
  "prose-columns": {
    label: "Prose columns",
    description: "Three text columns under a hairline rule. Navy by default; pick a light background to invert.",
    fields: ["eyebrow", "heading", "subheading", "background"],
    item: [
      { name: "heading", label: "Column heading", input: "text" },
      { name: "body", label: "Column text", input: "textarea" },
    ],
    itemLabel: "column",
  },
  "split-highlights": {
    label: "Heading + two highlight cards",
    description: "A heading on the left with exactly two highlight cards on the right (first navy, second white).",
    fields: ["eyebrow", "heading", "subheading", "background"],
    item: [
      { name: "icon", label: "Icon", input: "icon" },
      { name: "title", label: "Title", input: "text" },
      { name: "body", label: "Description", input: "textarea" },
    ],
    itemLabel: "card",
  },
  "icon-list": {
    label: "Icon list (form sidebar)",
    description: "On the Contact / Book a demo / Get a quote pages this renders in the sidebar beside the form.",
    fields: ["heading", "background"],
    item: [
      { name: "icon", label: "Icon", input: "icon" },
      { name: "title", label: "Title", input: "text" },
      { name: "body", label: "Description", input: "textarea" },
    ],
    itemLabel: "entry",
  },
  "note-card": {
    label: "Navy note card (form sidebar)",
    description: "A small navy card. On the Contact / Get a quote pages it renders in the sidebar beside the form.",
    fields: ["heading", "body", "background"],
    bodyLabel: "Body text",
  },
}

const TOP_FIELD_META: Record<TopField, { label: string; input: "text" | "textarea" | "image" }> = {
  eyebrow: { label: "Eyebrow / kicker", input: "text" },
  heading: { label: "Heading", input: "text" },
  subheading: { label: "Description", input: "textarea" },
  body: { label: "Body", input: "textarea" },
  image: { label: "Image", input: "image" },
  imageAlt: { label: "Image alt text", input: "text" },
  variant: { label: "Layout variant", input: "text" },
  background: { label: "Background", input: "text" },
  align: { label: "Alignment", input: "text" },
  ctaLabel: { label: "Button label", input: "text" },
  ctaHref: { label: "Button link", input: "text" },
}

type Block = Record<string, unknown> & { type: string; items?: Record<string, unknown>[] }

/* ------------------------------- component -------------------------------- */

const cell =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"

export function BlocksField({ name, value }: { name: string; value: unknown }) {
  const initial = useMemo<Block[]>(() => {
    if (!Array.isArray(value)) return []
    return (value as Record<string, unknown>[])
      .filter((b) => b && typeof b === "object")
      .map((b) => normalizeBlock(b))
  }, [value])

  const [blocks, setBlocks] = useState<Block[]>(initial)
  const [newType, setNewType] = useState<string>("card-grid")

  const update = (i: number, patch: Partial<Block>) =>
    setBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b)))
  const remove = (i: number) => setBlocks((prev) => prev.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) =>
    setBlocks((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  const add = () => setBlocks((prev) => [...prev, normalizeBlock({ type: newType })])

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(blocks)} />

      {blocks.map((block, i) => {
        const def = BLOCK_TYPES[block.type]
        return (
          <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-accent/12 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                  {def?.label ?? block.type}
                </span>
                <span className="text-xs text-muted-foreground">Section {i + 1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                  ↓
                </button>
                <button type="button" onClick={() => remove(i)} aria-label="Remove section" className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:border-red-400 hover:text-red-500">
                  Remove
                </button>
              </div>
            </div>

            {def?.description ? <p className="mb-3 text-xs text-muted-foreground">{def.description}</p> : null}

            <div className="grid gap-3">
              {(def?.fields ?? []).map((f) => (
                <TopFieldEditor
                  key={f}
                  field={f}
                  def={def}
                  value={block[f]}
                  onChange={(v) => update(i, { [f]: v } as Partial<Block>)}
                />
              ))}
            </div>

            {def?.item ? (
              <ItemsEditor
                itemFields={def.item}
                itemLabel={def.itemLabel ?? "item"}
                items={Array.isArray(block.items) ? block.items : []}
                onChange={(items) => update(i, { items })}
              />
            ) : null}
          </div>
        )
      })}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border p-3">
        <select value={newType} onChange={(e) => setNewType(e.target.value)} className={`${cell} sm:max-w-xs`}>
          {Object.entries(BLOCK_TYPES).map(([key, def]) => (
            <option key={key} value={key}>
              {def.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:brightness-110"
        >
          + Add section
        </button>
      </div>
    </div>
  )
}

function normalizeBlock(b: Record<string, unknown>): Block {
  const type = typeof b.type === "string" ? b.type : "card-grid"
  const items = Array.isArray(b.items)
    ? (b.items as Record<string, unknown>[]).map((it) => ({ ...it }))
    : []
  return { ...b, type, items }
}

function TopFieldEditor({
  field,
  def,
  value,
  onChange,
}: {
  field: TopField
  def: BlockDef
  value: unknown
  onChange: (v: string) => void
}) {
  const meta = TOP_FIELD_META[field]
  const label =
    field === "body" && def.bodyLabel ? def.bodyLabel : meta.label
  const v = typeof value === "string" ? value : ""

  if (field === "variant" && def.variantOptions) {
    return (
      <Labeled label={label}>
        <select value={v} onChange={(e) => onChange(e.target.value)} className={cell}>
          {def.variantOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Labeled>
    )
  }
  if (field === "background") {
    return (
      <Labeled label={label}>
        <select value={v} onChange={(e) => onChange(e.target.value)} className={cell}>
          <option value="">Default (white)</option>
          <option value="surface">Surface (off-white)</option>
          <option value="secondary">Secondary (light grey)</option>
          <option value="primary">Primary (navy)</option>
        </select>
      </Labeled>
    )
  }
  if (field === "align") {
    return (
      <Labeled label={label}>
        <select value={v} onChange={(e) => onChange(e.target.value)} className={cell}>
          <option value="left">Left</option>
          <option value="center">Center</option>
        </select>
      </Labeled>
    )
  }
  if (meta.input === "image") {
    return (
      <Labeled label={label}>
        <ImageUploader value={v} onChange={onChange} />
      </Labeled>
    )
  }
  if (meta.input === "textarea") {
    return (
      <Labeled label={label}>
        <textarea value={v} onChange={(e) => onChange(e.target.value)} rows={field === "body" ? 6 : 2} className={cell} />
      </Labeled>
    )
  }
  return (
    <Labeled label={label}>
      <input type="text" value={v} onChange={(e) => onChange(e.target.value)} className={cell} />
    </Labeled>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function ItemsEditor({
  itemFields,
  itemLabel,
  items,
  onChange,
}: {
  itemFields: ItemField[]
  itemLabel: string
  items: Record<string, unknown>[]
  onChange: (items: Record<string, unknown>[]) => void
}) {
  const emptyRow = () => {
    const row: Record<string, unknown> = {}
    for (const f of itemFields) row[f.name] = f.input === "lines" ? [] : f.input === "points" ? [] : ""
    return row
  }
  const rows = items.length ? items : []
  const setRow = (i: number, patch: Record<string, unknown>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addRow = () => onChange([...rows, emptyRow()])
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i))
  const moveRow = (i: number, dir: -1 | 1) => {
    const next = [...rows]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items ({itemLabel})</p>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {itemLabel} {i + 1}
              </span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => moveRow(i, -1)} aria-label="Move up" className="rounded border border-border px-1.5 text-xs text-muted-foreground hover:text-foreground">↑</button>
                <button type="button" onClick={() => moveRow(i, 1)} aria-label="Move down" className="rounded border border-border px-1.5 text-xs text-muted-foreground hover:text-foreground">↓</button>
                <button type="button" onClick={() => removeRow(i)} aria-label="Remove" className="rounded border border-border px-1.5 text-xs text-muted-foreground hover:border-red-400 hover:text-red-500">×</button>
              </div>
            </div>
            <div className="grid gap-2">
              {itemFields.map((f) => (
                <ItemFieldEditor key={f.name} field={f} value={row[f.name]} onChange={(v) => setRow(i, { [f.name]: v })} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-3 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"
      >
        + Add {itemLabel}
      </button>
    </div>
  )
}

function ItemFieldEditor({
  field,
  value,
  onChange,
}: {
  field: ItemField
  value: unknown
  onChange: (v: unknown) => void
}) {
  if (field.input === "image") {
    const v = typeof value === "string" ? value : ""
    return (
      <Labeled label={field.label}>
        <ImageUploader value={v} onChange={(url) => onChange(url)} compact />
      </Labeled>
    )
  }
  if (field.input === "icon") {
    const v = typeof value === "string" ? value : ""
    return (
      <Labeled label={field.label}>
        <select value={v} onChange={(e) => onChange(e.target.value)} className={cell}>
          <option value="">Auto / none</option>
          {ICON_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </Labeled>
    )
  }
  if (field.input === "lines") {
    const v = Array.isArray(value) ? (value as string[]).join("\n") : typeof value === "string" ? value : ""
    return (
      <Labeled label={field.label}>
        <textarea
          value={v}
          onChange={(e) => onChange(e.target.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean))}
          rows={4}
          placeholder="One per line"
          className={cell}
        />
      </Labeled>
    )
  }
  if (field.input === "points") {
    const pts = Array.isArray(value) ? (value as { title?: string; body?: string }[]) : []
    const setPt = (i: number, patch: Record<string, string>) =>
      onChange(pts.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
    return (
      <Labeled label={field.label}>
        <div className="space-y-2">
          {pts.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="grid flex-1 gap-1.5">
                <input type="text" value={p.title ?? ""} onChange={(e) => setPt(i, { title: e.target.value })} placeholder="Point title" className={cell} />
                <textarea value={p.body ?? ""} onChange={(e) => setPt(i, { body: e.target.value })} rows={2} placeholder="Point description" className={cell} />
              </div>
              <button
                type="button"
                onClick={() => onChange(pts.filter((_, idx) => idx !== i))}
                aria-label="Remove point"
                className="mt-1 rounded border border-border px-1.5 py-1 text-xs text-muted-foreground hover:border-red-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...pts, { title: "", body: "" }])}
            className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-accent hover:text-accent"
          >
            + Add point
          </button>
        </div>
      </Labeled>
    )
  }
  if (field.input === "textarea") {
    const v = typeof value === "string" ? value : ""
    return (
      <Labeled label={field.label}>
        <textarea value={v} onChange={(e) => onChange(e.target.value)} rows={2} className={cell} />
      </Labeled>
    )
  }
  const v = typeof value === "string" ? value : ""
  return (
    <Labeled label={field.label}>
      <input type="text" value={v} onChange={(e) => onChange(e.target.value)} className={cell} />
    </Labeled>
  )
}
