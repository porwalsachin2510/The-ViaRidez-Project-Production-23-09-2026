"use client"

import { useActionState, useState } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { saveSettings, type SettingsState } from "@/app/actions/settings"
import { ImageField } from "@/components/admin/image-field"
import { MenuBuilder } from "@/components/admin/menu-builder"
import type { NavItem, FooterColumn, LinkGroup } from "@/lib/data/queries"

type Stat = { value: string; label: string }

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"

function Field({ name, label, defaultValue, placeholder }: { name: string; label: string; defaultValue?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} className={inputCls} />
    </div>
  )
}

function UploadField({
  name,
  label,
  defaultValue,
  help,
}: {
  name: string
  label: string
  defaultValue?: string
  help?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <ImageField name={name} defaultValue={defaultValue} mode="image" />
      {help ? <p className="mt-2 text-xs text-muted-foreground">{help}</p> : null}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

type Settings = Record<string, string>

/**
 * Friendly, non-technical editor for the "Performance stats" shown across the
 * public site (home hero band, About, Why ViaRidez). Admins add/remove/reorder
 * rows and type the big number + its caption directly — no JSON. The current
 * list is serialized into a hidden `stats` input so the existing server action
 * (which expects a JSON array of { value, label }) keeps working unchanged.
 */
function StatsEditor({ initial }: { initial: Stat[] }) {
  const [stats, setStats] = useState<Stat[]>(initial.length ? initial : [{ value: "", label: "" }])

  const update = (i: number, patch: Partial<Stat>) =>
    setStats((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const remove = (i: number) => setStats((prev) => prev.filter((_, idx) => idx !== i))
  const add = () => setStats((prev) => [...prev, { value: "", label: "" }])
  const move = (i: number, dir: -1 | 1) =>
    setStats((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  // Only persist rows that have at least a value or a label.
  const cleaned = stats
    .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
    .filter((s) => s.value || s.label)

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-1 font-display text-lg font-semibold text-foreground">Performance stats</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        The headline numbers shown across your site (home page, About, Why ViaRidez). Enter the big
        figure and a short caption for each — for example <strong>13+</strong> and{" "}
        <strong>Years of operating heritage</strong>.
      </p>

      <input type="hidden" name="stats" value={JSON.stringify(cleaned)} />

      <div className="space-y-3">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-background p-3">
            <div className="flex flex-col gap-1 pt-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="grid flex-1 gap-3 sm:grid-cols-[140px_1fr]">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Figure</label>
                <input
                  value={stat.value}
                  onChange={(e) => update(i, { value: e.target.value })}
                  placeholder="13+"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Caption</label>
                <input
                  value={stat.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="Years of operating heritage"
                  className={inputCls}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove stat"
              className="mt-6 rounded-md p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <Plus className="h-4 w-4" /> Add stat
      </button>
    </section>
  )
}

export function SettingsForm({
  settings,
  stats,
  navigation,
  footerColumns,
  destinations,
}: {
  settings: Settings
  stats: Stat[]
  navigation: NavItem[]
  footerColumns: FooterColumn[]
  destinations: LinkGroup[]
}) {
  const [state, action] = useActionState<SettingsState, FormData>(saveSettings, null)

  return (
    <form action={action} className="space-y-6">
      <Section title="Company">
        <Field name="companyName" label="Company name" defaultValue={settings.companyName} />
        <Field name="tagline" label="Tagline" defaultValue={settings.tagline} />
      </Section>

      <Section title="Contact">
        <Field name="email" label="Email" defaultValue={settings.email} />
        <Field name="phone" label="Phone" defaultValue={settings.phone} />
        <Field name="whatsapp" label="WhatsApp number" defaultValue={settings.whatsapp} placeholder="+9715..." />
        <Field name="address" label="Address" defaultValue={settings.address} />
        <Field name="businessHours" label="Office hours" defaultValue={settings.businessHours} placeholder="Sun–Fri, 8:00–18:00 GST" />
      </Section>

      <Section title="Branding & calls to action">
        <UploadField
          name="logo"
          label="Primary logo"
          defaultValue={settings.logo}
          help="Dark version shown on light backgrounds (header when scrolled). Upload a PNG or SVG."
        />
        <UploadField
          name="logoMark"
          label="Inverted logo"
          defaultValue={settings.logoMark}
          help="Light/white version shown on dark backgrounds (hero header & footer)."
        />
        <Field name="ctaPrimary.label" label="Primary button label" defaultValue={settings.ctaPrimaryLabel} placeholder="Request a quote" />
        <Field name="ctaPrimary.href" label="Primary button link" defaultValue={settings.ctaPrimaryHref} placeholder="/contact" />
        <Field name="ctaSecondary.label" label="Secondary button label" defaultValue={settings.ctaSecondaryLabel} placeholder="Book now" />
        <Field name="ctaSecondary.href" label="Secondary button link" defaultValue={settings.ctaSecondaryHref} placeholder="/book-demo" />
      </Section>

      <Section title="Live chat">
        <Field name="chat.number" label="WhatsApp number" defaultValue={settings.chatNumber} placeholder="+9715..." />
        <Field name="chat.message" label="Opening message" defaultValue={settings.chatMessage} />
        <label className="flex items-center gap-2 text-sm text-foreground"><input name="chat.enabled" type="checkbox" value="true" defaultChecked={settings.chatEnabled !== "false"} /> Enable chat widget</label>
        <label className="flex items-center gap-2 text-sm text-foreground"><input name="chat.consentRequired" type="checkbox" value="true" defaultChecked={settings.chatConsentRequired !== "false"} /> Ask for consent before opening WhatsApp</label>
        <input type="hidden" name="chat.provider" value="whatsapp" />
      </Section>

      <Section title="Social profiles">
        <Field name="social.linkedin" label="LinkedIn" defaultValue={settings.linkedin} />
        <Field name="social.instagram" label="Instagram" defaultValue={settings.instagram} />
        <Field name="social.facebook" label="Facebook" defaultValue={settings.facebook} />
        <Field name="social.youtube" label="YouTube" defaultValue={settings.youtube} />
        <Field name="social.twitter" label="X / Twitter" defaultValue={settings.twitter} />
      </Section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-1 font-display text-lg font-semibold text-foreground">Menus &amp; footer</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Build the header navigation and footer visually. Every page and piece of content on your
          site appears in the left panel — add it to the navbar or a footer column, then drag to
          arrange. Newly created pages and services show up here automatically.
        </p>
        <MenuBuilder navigation={navigation} footerColumns={footerColumns} destinations={destinations} />
      </section>

      <StatsEditor initial={stats} />

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">
          Save settings
        </button>
        {state?.success ? <span className="text-sm text-emerald-600">{state.success}</span> : null}
        {state?.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
      </div>
    </form>
  )
}
