'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FaqItem {
  _id: string
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?._id ?? null)

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map((item) => {
        const isOpen = open === item._id
        const panelId = `faq-panel-${item._id}`
        const btnId = `faq-btn-${item._id}`
        return (
          <div key={item._id}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item._id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-muted/50"
              >
                <span className="font-display text-base font-semibold text-foreground">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-accent transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="px-5 pb-5"
            >
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty whitespace-pre-line">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
