'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export function WhatsAppButton({ number, message, consentRequired = true }: { number?: string; message?: string; consentRequired?: boolean }) {
  const [open, setOpen] = useState(false)
  const [consent, setConsent] = useState(false)
  if (!number) return null
  const clean = number.replace(/[^\d]/g, '')
  const href = `https://wa.me/${clean}?text=${encodeURIComponent(message || 'Hello ViaRidez, I would like to learn more.')}`

  if (!open || !consentRequired || consent) {
    return <button type="button" onClick={() => { if (consentRequired) setOpen(true); else window.open(href, '_blank', 'noopener,noreferrer') }} className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label="Open chat"><MessageCircle className="h-7 w-7" /></button>
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[min(22rem,calc(100vw-3rem))] rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div><p className="font-display text-sm font-semibold">Chat with ViaRidez</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">We will open WhatsApp in a new tab. Please confirm you are happy to continue.</p></div>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground" aria-label="Close chat prompt"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 flex gap-2"><a href={href} target="_blank" rel="noopener noreferrer" onClick={() => setConsent(true)} className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground">Continue</a><button type="button" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground">Not now</button></div>
    </div>
  )
}
