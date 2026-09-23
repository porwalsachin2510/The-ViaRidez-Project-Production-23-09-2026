/**
 * Lightweight Google Maps embed. Uses the keyless `output=embed` endpoint so
 * no Maps API key or billing account is required. Accepts either a free-text
 * address/place query or explicit lat,lng coordinates.
 */
export function MapEmbed({
  query,
  title = 'Location map',
  zoom = 15,
  className,
}: {
  query: string
  title?: string
  zoom?: number
  className?: string
}) {
  if (!query) return null
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`

  return (
    <div className={className}>
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full min-h-[320px] w-full rounded-2xl border border-border"
        style={{ border: 0 }}
        allowFullScreen
      />
    </div>
  )
}
