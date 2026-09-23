import { ExternalLink } from 'lucide-react'
import { Container, SectionHeading } from '@/components/site/primitives'
import { externalUrl } from '@/lib/external-url'
import type { ClientData } from '@/lib/data/queries'

/**
 * Trust bar / logo wall. Surfaces published clients from the CMS. Renders
 * nothing when there are no clients so the home page never shows an empty rail.
 *
 * Each tile always shows the client *name* underneath the logo — a wall of
 * unlabelled marks reads as decoration and is useless to screen readers.
 */
function ClientTile({ client }: { client: ClientData }) {
  const href = externalUrl(client.website)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-6 text-center transition-colors duration-300 group-hover:border-accent/40">
      <div className="flex h-10 items-center justify-center">
        {client.logo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={client.logo}
            alt={`${client.name} logo`}
            className="h-10 w-auto max-w-[130px] object-contain opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
            loading="lazy"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary"
          >
            {client.name.trim().charAt(0).toUpperCase() || 'C'}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span className="inline-flex items-center gap-1 text-sm font-semibold leading-snug text-foreground text-pretty">
          {client.name}
          {href && (
            <ExternalLink
              className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          )}
        </span>
        {client.industry && (
          <span className="text-xs leading-snug text-muted-foreground">{client.industry}</span>
        )}
      </div>
    </div>
  )
}

export function ClientWall({
  clients,
  eyebrow = 'Trusted by',
  title = 'Enterprises that move with VIARIDEZ',
  compact = false,
}: {
  clients: ClientData[]
  eyebrow?: string
  title?: string
  compact?: boolean
}) {
  if (!clients?.length) return null

  return (
    <section className={compact ? 'py-12' : 'py-16 sm:py-20'}>
      <Container>
        {!compact && (
          <SectionHeading eyebrow={eyebrow} title={title} align="center" className="mb-12" />
        )}
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {clients.map((c) => {
            const href = externalUrl(c.website)
            return (
              <li key={c._id} className="group">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    aria-label={`${c.name} — visit website (opens in a new tab)`}
                  >
                    <ClientTile client={c} />
                  </a>
                ) : (
                  <ClientTile client={c} />
                )}
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
