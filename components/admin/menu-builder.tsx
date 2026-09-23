"use client"

import { useMemo, useRef, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  IndentIncrease,
  IndentDecrease,
  Plus,
  Search,
  Trash2,
  Layers,
  PanelsTopLeft,
  MousePointerClick,
} from "lucide-react"
import type { NavItem, FooterColumn, LinkGroup, LinkOption } from "@/lib/data/queries"

/* --------------------------------- utils --------------------------------- */

const uid = () => Math.random().toString(36).slice(2, 9)

function insertBefore<T extends { uid: string }>(arr: T[], item: T, beforeUid: string | null): T[] {
  if (beforeUid === null) return [...arr, item]
  const i = arr.findIndex((x) => x.uid === beforeUid)
  if (i < 0) return [...arr, item]
  const next = [...arr]
  next.splice(i, 0, item)
  return next
}

function moveIndex<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"

/* ------------------------------- nav model ------------------------------- */

type NavChildRow = { uid: string; label: string; href: string; description?: string; icon?: string }
type NavNode = { uid: string; label: string; href: string; children: NavChildRow[] }

function toNodes(items: NavItem[]): NavNode[] {
  return (items ?? []).map((i) => ({
    uid: uid(),
    label: i.label,
    href: i.href,
    children: (i.children ?? []).map((c) => ({
      uid: uid(),
      label: c.label,
      href: c.href,
      description: c.description,
      icon: c.icon,
    })),
  }))
}

function serializeNodes(nodes: NavNode[]): NavItem[] {
  return nodes.map((n) => ({
    label: n.label,
    href: n.href,
    children: n.children.map((c) => ({
      label: c.label,
      href: c.href,
      ...(c.description ? { description: c.description } : {}),
      ...(c.icon ? { icon: c.icon } : {}),
    })),
  }))
}

/* ----------------------------- footer model ------------------------------ */

type FooterLinkRow = { uid: string; label: string; href: string }
type FooterColRow = { uid: string; title: string; links: FooterLinkRow[] }

function toFooterRows(cols: FooterColumn[]): FooterColRow[] {
  return (cols ?? []).map((c) => ({
    uid: uid(),
    title: c.title,
    links: (c.links ?? []).map((l) => ({ uid: uid(), label: l.label, href: l.href })),
  }))
}

function serializeFooter(cols: FooterColRow[]): FooterColumn[] {
  return cols.map((c) => ({
    title: c.title,
    links: c.links.map((l) => ({ label: l.label, href: l.href })),
  }))
}

/* ------------------------------ drag payload ----------------------------- */

type Drag =
  | { kind: "palette"; option: LinkOption }
  | { kind: "node"; uid: string }
  | { kind: "child"; parentUid: string; uid: string }
  | { kind: "fcol"; uid: string }
  | { kind: "flink"; colUid: string; uid: string }

type DragRef = React.MutableRefObject<Drag | null>

/* ================================ component =============================== */

export function MenuBuilder({
  navigation,
  footerColumns,
  destinations,
}: {
  navigation: NavItem[]
  footerColumns: FooterColumn[]
  destinations: LinkGroup[]
}) {
  const [nav, setNav] = useState<NavNode[]>(() => toNodes(navigation))
  const [footer, setFooter] = useState<FooterColRow[]>(() => toFooterRows(footerColumns))
  const drag = useRef<Drag | null>(null)

  const navJson = useMemo(() => JSON.stringify(serializeNodes(nav)), [nav])
  const footerJson = useMemo(() => JSON.stringify(serializeFooter(footer)), [footer])

  const addNav = (opt: LinkOption) =>
    setNav((prev) => [...prev, { uid: uid(), label: opt.label, href: opt.href, children: [] }])

  const addFooterLink = (colUid: string, opt: LinkOption) =>
    setFooter((prev) =>
      prev.map((c) =>
        c.uid === colUid
          ? { ...c, links: [...c.links, { uid: uid(), label: opt.label, href: opt.href }] }
          : c,
      ),
    )

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      {/* Hidden inputs consumed by the existing saveSettings server action. */}
      <input type="hidden" name="navigation" value={navJson} />
      <input type="hidden" name="footerColumns" value={footerJson} />

      <LinkPalette
        destinations={destinations}
        columns={footer}
        dragRef={drag}
        onAddToNav={addNav}
        onAddToFooter={addFooterLink}
      />

      <div className="min-w-0 space-y-6">
        <NavigationBuilder nodes={nav} setNodes={setNav} dragRef={drag} />
        <FooterBuilder columns={footer} setColumns={setFooter} dragRef={drag} />
      </div>
    </div>
  )
}

/* ------------------------------ Link palette ----------------------------- */

function LinkPalette({
  destinations,
  columns,
  dragRef,
  onAddToNav,
  onAddToFooter,
}: {
  destinations: LinkGroup[]
  columns: FooterColRow[]
  dragRef: DragRef
  onAddToNav: (opt: LinkOption) => void
  onAddToFooter: (colUid: string, opt: LinkOption) => void
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState<Record<string, boolean>>({ "System pages": true })
  const [customLabel, setCustomLabel] = useState("")
  const [customHref, setCustomHref] = useState("")

  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!q) return destinations
    return destinations
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) => i.label.toLowerCase().includes(q) || i.href.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0)
  }, [destinations, q])

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-1 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <PanelsTopLeft className="h-4 w-4 text-accent" /> Add links
        </h3>
        <p className="mb-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <MousePointerClick className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          Drag any page straight into the navbar or a footer column on the right — or use the quick
          buttons. Newly created pages and services appear here automatically.
        </p>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages…"
            className={`${inputCls} pl-8`}
          />
        </div>

        <div className="max-h-[440px] space-y-1 overflow-y-auto pr-1">
          {filtered.map((group) => {
            const isOpen = q ? true : open[group.group] ?? false
            return (
              <div key={group.group} className="rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setOpen((p) => ({ ...p, [group.group]: !isOpen }))}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold text-foreground"
                >
                  <span>
                    {group.group}
                    <span className="ml-1.5 font-normal text-muted-foreground">({group.items.length})</span>
                  </span>
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {isOpen && (
                  <ul className="border-t border-border/60 p-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item.href}
                        draggable
                        onDragStart={(ev) => {
                          dragRef.current = { kind: "palette", option: item }
                          ev.dataTransfer.effectAllowed = "copy"
                          ev.dataTransfer.setData("text/plain", item.label)
                        }}
                        onDragEnd={() => (dragRef.current = null)}
                        className="group cursor-grab rounded-md border border-transparent px-2 py-1.5 hover:border-border hover:bg-secondary active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 group-hover:text-muted-foreground" />
                          <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 pl-5">
                          <span className="truncate font-mono text-[11px] text-muted-foreground">{item.href}</span>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onAddToNav(item)}
                              className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                            >
                              + Nav
                            </button>
                            <FooterAddSelect columns={columns} onPick={(colUid) => onAddToFooter(colUid, item)} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">No pages match “{query}”.</p>
          )}
        </div>

        {/* Custom link */}
        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-xs font-semibold text-foreground">Custom link</p>
          <div className="space-y-2">
            <input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Label"
              className={inputCls}
            />
            <input
              value={customHref}
              onChange={(e) => setCustomHref(e.target.value)}
              placeholder="/path or https://…"
              className={`${inputCls} font-mono text-xs`}
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!customLabel.trim() || !customHref.trim()}
                onClick={() => {
                  onAddToNav({ label: customLabel.trim(), href: customHref.trim() })
                  setCustomLabel("")
                  setCustomHref("")
                }}
                className="flex-1 rounded-md border border-border px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                + Nav
              </button>
              <FooterAddSelect
                columns={columns}
                disabled={!customLabel.trim() || !customHref.trim()}
                onPick={(colUid) => {
                  onAddToFooter(colUid, { label: customLabel.trim(), href: customHref.trim() })
                  setCustomLabel("")
                  setCustomHref("")
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function FooterAddSelect({
  columns,
  onPick,
  disabled,
}: {
  columns: FooterColRow[]
  onPick: (colUid: string) => void
  disabled?: boolean
}) {
  if (columns.length === 0) {
    return (
      <span className="rounded border border-dashed border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
        No footer columns
      </span>
    )
  }
  return (
    <select
      value=""
      disabled={disabled}
      onChange={(e) => {
        if (e.target.value) onPick(e.target.value)
        e.currentTarget.selectedIndex = 0
      }}
      aria-label="Add to footer column"
      className="max-w-[7.5rem] rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium text-foreground focus:border-accent focus:outline-none disabled:opacity-50"
    >
      <option value="">+ Footer…</option>
      {columns.map((c) => (
        <option key={c.uid} value={c.uid}>
          {c.title || "Untitled column"}
        </option>
      ))}
    </select>
  )
}

/* --------------------------- Navigation builder -------------------------- */

function NavigationBuilder({
  nodes,
  setNodes,
  dragRef,
}: {
  nodes: NavNode[]
  setNodes: React.Dispatch<React.SetStateAction<NavNode[]>>
  dragRef: DragRef
}) {
  // Visual drop targets: a top-level insertion point (before a node uid or "end")
  // and a nested insertion point (parent uid + before child uid or "end").
  const [overTop, setOverTop] = useState<string | null>(null)
  const [overChild, setOverChild] = useState<string | null>(null)

  const updateNode = (u: string, patch: Partial<NavNode>) =>
    setNodes((prev) => prev.map((n) => (n.uid === u ? { ...n, ...patch } : n)))
  const removeNode = (u: string) => setNodes((prev) => prev.filter((n) => n.uid !== u))
  const updateChild = (parent: string, cu: string, patch: Partial<NavChildRow>) =>
    setNodes((prev) =>
      prev.map((n) =>
        n.uid === parent
          ? { ...n, children: n.children.map((c) => (c.uid === cu ? { ...c, ...patch } : c)) }
          : n,
      ),
    )
  const removeChild = (parent: string, cu: string) =>
    setNodes((prev) =>
      prev.map((n) => (n.uid === parent ? { ...n, children: n.children.filter((c) => c.uid !== cu) } : n)),
    )

  // Promote a child to a top-level node (placed right after its old parent).
  const promoteChild = (parent: string, cu: string) =>
    setNodes((prev) => {
      const pi = prev.findIndex((n) => n.uid === parent)
      if (pi < 0) return prev
      const child = prev[pi].children.find((c) => c.uid === cu)
      if (!child) return prev
      const stripped = prev.map((n) =>
        n.uid === parent ? { ...n, children: n.children.filter((c) => c.uid !== cu) } : n,
      )
      const node: NavNode = {
        uid: uid(),
        label: child.label,
        href: child.href,
        children: [],
      }
      const next = [...stripped]
      next.splice(pi + 1, 0, node)
      return next
    })

  // Demote a top-level node into the previous node's children.
  const demoteNode = (u: string) =>
    setNodes((prev) => {
      const idx = prev.findIndex((n) => n.uid === u)
      if (idx <= 0) return prev
      const node = prev[idx]
      const target = prev[idx - 1]
      const child: NavChildRow = { uid: uid(), label: node.label, href: node.href }
      // Lift the demoted node's own children up so nothing is lost.
      const lifted = node.children.map((c) => ({ ...c, uid: uid(), children: [] as NavChildRow[] }))
      const next: NavNode[] = []
      for (const n of prev) {
        if (n.uid === u) {
          for (const c of lifted) next.push({ uid: c.uid, label: c.label, href: c.href, children: [] })
          continue
        }
        if (n.uid === target.uid) {
          next.push({ ...n, children: [...n.children, child] })
          continue
        }
        next.push(n)
      }
      return next
    })

  const dropTop = (beforeUid: string | null) => {
    const d = dragRef.current
    dragRef.current = null
    setOverTop(null)
    setOverChild(null)
    if (!d) return
    setNodes((prev) => {
      if (d.kind === "palette") {
        return insertBefore(prev, { uid: uid(), label: d.option.label, href: d.option.href, children: [] }, beforeUid)
      }
      if (d.kind === "node") {
        if (d.uid === beforeUid) return prev
        const node = prev.find((n) => n.uid === d.uid)
        if (!node) return prev
        return insertBefore(prev.filter((n) => n.uid !== d.uid), node, beforeUid)
      }
      if (d.kind === "child") {
        let moved: NavChildRow | undefined
        const stripped = prev.map((n) => {
          const ci = n.children.findIndex((c) => c.uid === d.uid)
          if (ci < 0) return n
          moved = n.children[ci]
          return { ...n, children: n.children.filter((c) => c.uid !== d.uid) }
        })
        if (!moved) return prev
        return insertBefore(
          stripped,
          { uid: uid(), label: moved.label, href: moved.href, children: [] },
          beforeUid,
        )
      }
      return prev
    })
  }

  const dropChild = (parentUid: string, beforeChildUid: string | null) => {
    const d = dragRef.current
    dragRef.current = null
    setOverTop(null)
    setOverChild(null)
    if (!d) return
    setNodes((prev) => {
      if (d.kind === "palette") {
        return prev.map((n) =>
          n.uid === parentUid
            ? {
                ...n,
                children: insertBefore(
                  n.children,
                  { uid: uid(), label: d.option.label, href: d.option.href, description: d.option.description },
                  beforeChildUid,
                ),
              }
            : n,
        )
      }
      if (d.kind === "child") {
        if (d.uid === beforeChildUid) return prev
        let moved: NavChildRow | undefined
        const stripped = prev.map((n) => {
          const ci = n.children.findIndex((c) => c.uid === d.uid)
          if (ci < 0) return n
          moved = n.children[ci]
          return { ...n, children: n.children.filter((c) => c.uid !== d.uid) }
        })
        if (!moved) return prev
        const movedRow = moved
        return stripped.map((n) =>
          n.uid === parentUid ? { ...n, children: insertBefore(n.children, movedRow, beforeChildUid) } : n,
        )
      }
      if (d.kind === "node") {
        if (d.uid === parentUid) return prev
        const node = prev.find((n) => n.uid === d.uid)
        if (!node) return prev
        // Lift the dragged node's children up to top level, then nest the node.
        const next: NavNode[] = []
        for (const n of prev) {
          if (n.uid === d.uid) {
            for (const c of n.children) next.push({ uid: uid(), label: c.label, href: c.href, children: [] })
            continue
          }
          next.push(n)
        }
        const child: NavChildRow = { uid: uid(), label: node.label, href: node.href }
        return next.map((n) =>
          n.uid === parentUid ? { ...n, children: insertBefore(n.children, child, beforeChildUid) } : n,
        )
      }
      return prev
    })
  }

  const allowDrop = (ev: React.DragEvent) => {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = dragRef.current?.kind === "palette" ? "copy" : "move"
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <Layers className="h-4 w-4 text-accent" />
        <h2 className="font-display text-lg font-semibold text-foreground">Primary navigation</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Drop pages here to build the header menu. Drag onto a menu item&apos;s{" "}
        <span className="font-medium text-foreground">sub-items</span> area to nest it as a dropdown link.
      </p>

      {nodes.length === 0 ? (
        <div
          onDragOver={allowDrop}
          onDrop={() => dropTop(null)}
          className={`rounded-lg border-2 border-dashed px-4 py-10 text-center text-sm transition-colors ${
            dragRef.current ? "border-accent bg-accent/5 text-accent" : "border-border text-muted-foreground"
          }`}
        >
          Drag a page here to start your menu.
        </div>
      ) : (
        <ul className="space-y-2">
          {nodes.map((node) => (
            <li key={node.uid}>
              {/* Top-level insertion indicator + drop target */}
              <div
                onDragOver={(ev) => {
                  allowDrop(ev)
                  setOverTop(node.uid)
                }}
                onDragLeave={() => setOverTop((v) => (v === node.uid ? null : v))}
                onDrop={() => dropTop(node.uid)}
                className={`h-2 rounded transition-colors ${overTop === node.uid ? "bg-accent/60" : ""}`}
                aria-hidden="true"
              />
              <div
                draggable
                onDragStart={(ev) => {
                  dragRef.current = { kind: "node", uid: node.uid }
                  ev.dataTransfer.effectAllowed = "move"
                }}
                onDragEnd={() => (dragRef.current = null)}
                className="rounded-lg border border-border bg-background p-2.5"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-2 cursor-grab text-muted-foreground active:cursor-grabbing" aria-hidden="true">
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <input
                      value={node.label}
                      onChange={(ev) => updateNode(node.uid, { label: ev.target.value })}
                      placeholder="Menu label"
                      className={inputCls}
                    />
                    <input
                      value={node.href}
                      onChange={(ev) => updateNode(node.uid, { href: ev.target.value })}
                      placeholder="/path"
                      className={`${inputCls} font-mono text-xs`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => demoteNode(node.uid)}
                    title="Nest under the item above"
                    className="rounded border border-border p-1.5 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    <IndentIncrease className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeNode(node.uid)}
                    title="Remove"
                    className="rounded border border-border p-1.5 text-muted-foreground transition-colors hover:border-red-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Sub-items (dropdown) drop zone */}
                <div
                  onDragOver={(ev) => {
                    allowDrop(ev)
                    setOverChild(node.uid)
                  }}
                  onDragLeave={() => setOverChild((v) => (v === node.uid ? null : v))}
                  onDrop={(ev) => {
                    ev.stopPropagation()
                    dropChild(node.uid, null)
                  }}
                  className={`mt-2 ml-6 rounded-lg border border-dashed p-2 transition-colors ${
                    overChild === node.uid ? "border-accent bg-accent/5" : "border-border/70"
                  }`}
                >
                  <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    <ChevronDown className="h-3 w-3" /> Sub-items
                  </p>
                  {node.children.length === 0 ? (
                    <p className="px-1 py-1.5 text-center text-[11px] text-muted-foreground">
                      Drop a page here to add a dropdown link.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {node.children.map((child) => (
                        <li
                          key={child.uid}
                          draggable
                          onDragStart={(ev) => {
                            ev.stopPropagation()
                            dragRef.current = { kind: "child", parentUid: node.uid, uid: child.uid }
                            ev.dataTransfer.effectAllowed = "move"
                          }}
                          onDragEnd={() => (dragRef.current = null)}
                          onDragOver={(ev) => {
                            allowDrop(ev)
                            setOverChild(child.uid)
                          }}
                          onDrop={(ev) => {
                            ev.stopPropagation()
                            dropChild(node.uid, child.uid)
                          }}
                          className={`rounded-md border bg-card p-2 transition-colors ${
                            overChild === child.uid ? "border-accent" : "border-border"
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <span className="mt-1.5 cursor-grab text-muted-foreground active:cursor-grabbing" aria-hidden="true">
                              <GripVertical className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1 space-y-1">
                              <input
                                value={child.label}
                                onChange={(ev) => updateChild(node.uid, child.uid, { label: ev.target.value })}
                                placeholder="Label"
                                className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-accent focus:outline-none"
                              />
                              <input
                                value={child.href}
                                onChange={(ev) => updateChild(node.uid, child.uid, { href: ev.target.value })}
                                placeholder="/path"
                                className="w-full rounded border border-border bg-background px-2 py-1 font-mono text-[11px] text-foreground focus:border-accent focus:outline-none"
                              />
                              <input
                                value={child.description ?? ""}
                                onChange={(ev) => updateChild(node.uid, child.uid, { description: ev.target.value })}
                                placeholder="Dropdown description (optional)"
                                className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] text-foreground focus:border-accent focus:outline-none"
                              />
                            </div>
                            <div className="flex shrink-0 flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => promoteChild(node.uid, child.uid)}
                                title="Promote to top-level item"
                                className="rounded border border-border p-1 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                              >
                                <IndentDecrease className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeChild(node.uid, child.uid)}
                                title="Remove"
                                className="rounded border border-border p-1 text-muted-foreground transition-colors hover:border-red-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          ))}
          {/* Trailing top-level drop zone */}
          <li
            onDragOver={(ev) => {
              allowDrop(ev)
              setOverTop("end")
            }}
            onDragLeave={() => setOverTop((v) => (v === "end" ? null : v))}
            onDrop={() => dropTop(null)}
            className={`rounded-lg border-2 border-dashed px-4 py-4 text-center text-xs transition-colors ${
              overTop === "end" ? "border-accent bg-accent/5 text-accent" : "border-border/70 text-muted-foreground"
            }`}
          >
            Drop here to add to the end of the menu
          </li>
        </ul>
      )}
    </section>
  )
}

/* ----------------------------- Footer builder ---------------------------- */

function FooterBuilder({
  columns,
  setColumns,
  dragRef,
}: {
  columns: FooterColRow[]
  setColumns: React.Dispatch<React.SetStateAction<FooterColRow[]>>
  dragRef: DragRef
}) {
  const [overCol, setOverCol] = useState<string | null>(null)
  const [overLink, setOverLink] = useState<string | null>(null)

  const addColumn = () =>
    setColumns((prev) => [...prev, { uid: uid(), title: "New column", links: [] }])
  const removeColumn = (colUid: string) => setColumns((prev) => prev.filter((c) => c.uid !== colUid))
  const renameColumn = (colUid: string, title: string) =>
    setColumns((prev) => prev.map((c) => (c.uid === colUid ? { ...c, title } : c)))
  const updateLink = (colUid: string, linkUid: string, patch: Partial<FooterLinkRow>) =>
    setColumns((prev) =>
      prev.map((c) =>
        c.uid === colUid
          ? { ...c, links: c.links.map((l) => (l.uid === linkUid ? { ...l, ...patch } : l)) }
          : c,
      ),
    )
  const removeLink = (colUid: string, linkUid: string) =>
    setColumns((prev) =>
      prev.map((c) => (c.uid === colUid ? { ...c, links: c.links.filter((l) => l.uid !== linkUid) } : c)),
    )

  const dropColumn = (targetColUid: string) => {
    const d = dragRef.current
    dragRef.current = null
    setOverCol(null)
    if (!d || d.kind !== "fcol" || d.uid === targetColUid) return
    setColumns((prev) => {
      const from = prev.findIndex((c) => c.uid === d.uid)
      const to = prev.findIndex((c) => c.uid === targetColUid)
      if (from < 0 || to < 0) return prev
      return moveIndex(prev, from, to)
    })
  }

  // Drop a link (from the palette or another column) into `targetColUid`,
  // inserting before `beforeLinkUid` (or at the end when null).
  const dropLink = (targetColUid: string, beforeLinkUid: string | null) => {
    const d = dragRef.current
    dragRef.current = null
    setOverCol(null)
    setOverLink(null)
    if (!d) return
    setColumns((prev) => {
      if (d.kind === "palette") {
        return prev.map((c) =>
          c.uid === targetColUid
            ? { ...c, links: insertBefore(c.links, { uid: uid(), label: d.option.label, href: d.option.href }, beforeLinkUid) }
            : c,
        )
      }
      if (d.kind === "flink") {
        if (d.uid === beforeLinkUid) return prev
        let moved: FooterLinkRow | undefined
        const stripped = prev.map((c) =>
          c.uid === d.colUid ? { ...c, links: c.links.filter((l) => {
            if (l.uid === d.uid) { moved = l; return false }
            return true
          }) } : c,
        )
        if (!moved) return prev
        const movedRow = moved
        return stripped.map((c) =>
          c.uid === targetColUid ? { ...c, links: insertBefore(c.links, movedRow, beforeLinkUid) } : c,
        )
      }
      return prev
    })
  }

  const allowLinkDrop = (ev: React.DragEvent) => {
    const k = dragRef.current?.kind
    if (k === "palette" || k === "flink") {
      ev.preventDefault()
      ev.dataTransfer.dropEffect = k === "palette" ? "copy" : "move"
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PanelsTopLeft className="h-4 w-4 text-accent" />
          <h2 className="font-display text-lg font-semibold text-foreground">Footer columns</h2>
        </div>
        <button
          type="button"
          onClick={addColumn}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" /> Column
        </button>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Drag pages from the left into any column. Reorder columns by their handle, and drag links to
        rearrange them or move them between columns.
      </p>

      {columns.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No footer columns yet. Add one, then drop links into it from the left panel.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {columns.map((col) => (
            <div
              key={col.uid}
              onDragOver={(ev) => {
                if (dragRef.current?.kind === "fcol") {
                  ev.preventDefault()
                  setOverCol(col.uid)
                }
              }}
              onDragLeave={() => setOverCol((v) => (v === col.uid ? null : v))}
              onDrop={() => {
                if (dragRef.current?.kind === "fcol") dropColumn(col.uid)
              }}
              className={`rounded-lg border bg-background p-3 transition-colors ${
                overCol === col.uid ? "border-accent" : "border-border"
              }`}
            >
              <div className="mb-2 flex items-center gap-1.5">
                <span
                  draggable
                  onDragStart={(ev) => {
                    dragRef.current = { kind: "fcol", uid: col.uid }
                    ev.dataTransfer.effectAllowed = "move"
                  }}
                  onDragEnd={() => (dragRef.current = null)}
                  className="cursor-grab text-muted-foreground active:cursor-grabbing"
                  aria-hidden="true"
                >
                  <GripVertical className="h-4 w-4" />
                </span>
                <input
                  value={col.title}
                  onChange={(ev) => renameColumn(col.uid, ev.target.value)}
                  placeholder="Column title"
                  className="w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm font-semibold text-foreground focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeColumn(col.uid)}
                  title="Remove column"
                  className="rounded border border-border p-1.5 text-muted-foreground transition-colors hover:border-red-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <ul
                className={`min-h-[4rem] space-y-1.5 rounded-md border border-dashed p-1.5 transition-colors ${
                  overLink === col.uid ? "border-accent bg-accent/5" : "border-border/70"
                }`}
                onDragOver={(ev) => {
                  allowLinkDrop(ev)
                  if (dragRef.current?.kind === "palette" || dragRef.current?.kind === "flink") setOverLink(col.uid)
                }}
                onDragLeave={() => setOverLink((v) => (v === col.uid ? null : v))}
                onDrop={(ev) => {
                  if (dragRef.current?.kind === "palette" || dragRef.current?.kind === "flink") {
                    ev.stopPropagation()
                    dropLink(col.uid, null)
                  }
                }}
              >
                {col.links.length === 0 && (
                  <li className="px-1 py-3 text-center text-[11px] text-muted-foreground">Drop links here</li>
                )}
                {col.links.map((link) => (
                  <li
                    key={link.uid}
                    draggable
                    onDragStart={(ev) => {
                      ev.stopPropagation()
                      dragRef.current = { kind: "flink", colUid: col.uid, uid: link.uid }
                      ev.dataTransfer.effectAllowed = "move"
                    }}
                    onDragOver={(ev) => {
                      allowLinkDrop(ev)
                      if (dragRef.current?.kind === "palette" || dragRef.current?.kind === "flink") setOverLink(link.uid)
                    }}
                    onDrop={(ev) => {
                      if (dragRef.current?.kind === "palette" || dragRef.current?.kind === "flink") {
                        ev.stopPropagation()
                        dropLink(col.uid, link.uid)
                      }
                    }}
                    onDragEnd={() => (dragRef.current = null)}
                    className={`rounded-md border bg-card p-2 transition-colors ${
                      overLink === link.uid ? "border-accent" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-1.5">
                      <span className="mt-1.5 cursor-grab text-muted-foreground active:cursor-grabbing" aria-hidden="true">
                        <GripVertical className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          value={link.label}
                          onChange={(ev) => updateLink(col.uid, link.uid, { label: ev.target.value })}
                          placeholder="Label"
                          className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-accent focus:outline-none"
                        />
                        <input
                          value={link.href}
                          onChange={(ev) => updateLink(col.uid, link.uid, { href: ev.target.value })}
                          placeholder="/path"
                          className="w-full rounded border border-border bg-background px-2 py-1 font-mono text-[11px] text-foreground focus:border-accent focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLink(col.uid, link.uid)}
                        title="Remove link"
                        className="rounded border border-border p-1 text-muted-foreground transition-colors hover:border-red-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
