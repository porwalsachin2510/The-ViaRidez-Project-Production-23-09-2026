import { cn } from '@/lib/utils'

/** Two-letter monogram fallback when no avatar has been uploaded. */
function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'V'
  )
}

const SIZES = {
  sm: { box: 'h-10 w-10', text: 'text-xs' },
  md: { box: 'h-12 w-12', text: 'text-sm' },
  lg: { box: 'h-16 w-16', text: 'text-base' },
} as const

/**
 * Shared avatar for CMS testimonials. Uploaded avatars are Cloudinary URLs and
 * `next.config` runs with `images.unoptimized`, so a plain <img> is used here to
 * avoid needing remotePatterns entries for every future CDN host.
 *
 * `invert` switches the monogram fallback to the on-dark palette.
 */
export function TestimonialAvatar({
  name,
  avatar,
  size = 'md',
  invert = false,
  className,
}: {
  name: string
  avatar?: string | null
  size?: keyof typeof SIZES
  invert?: boolean
  className?: string
}) {
  const { box, text } = SIZES[size]

  return (
    <span
      className={cn(
        box,
        'relative shrink-0 overflow-hidden rounded-full',
        invert ? 'bg-primary-foreground/15' : 'bg-primary/10',
        className,
      )}
    >
      {avatar ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={avatar}
          alt={`${name} avatar`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            'flex h-full w-full items-center justify-center font-semibold',
            text,
            invert ? 'text-primary-foreground' : 'text-primary',
          )}
        >
          {initials(name)}
        </span>
      )}
    </span>
  )
}
