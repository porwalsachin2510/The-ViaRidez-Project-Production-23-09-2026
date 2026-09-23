import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Building2, MapPin, Quote } from "lucide-react"
import type { CaseStudyData } from "@/lib/data/queries"

/**
 * Large editorial spotlight for the single most important (first featured)
 * case study. Photo panel on one side, outcome metrics + quote on the other.
 */
export function CaseStudySpotlight({ cs }: { cs: CaseStudyData }) {
  const metrics = cs.metrics?.slice(0, 3) ?? []

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="grid lg:grid-cols-2">
        {/* Media */}
        <div className="relative min-h-[280px] bg-secondary lg:min-h-full">
          {cs.coverImage ? (
            <Image
              src={cs.coverImage || "/placeholder.svg"}
              alt={cs.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary/30">
              <Building2 className="h-16 w-16" aria-hidden="true" />
            </div>
          )}
          <span className="absolute left-5 top-5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow">
            Featured case study
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {cs.industry ? (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                {cs.industry}
              </span>
            ) : null}
            {cs.client ? <span className="font-medium text-foreground">{cs.client}</span> : null}
            {cs.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                {cs.location}
              </span>
            ) : null}
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-foreground text-balance sm:text-3xl">
            {cs.title}
          </h2>
          {cs.excerpt ? (
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">{cs.excerpt}</p>
          ) : null}

          {metrics.length > 0 ? (
            <div className="mt-7 grid grid-cols-3 gap-4 border-y border-border py-6">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="font-display text-2xl font-bold text-accent sm:text-3xl">{m.value}</div>
                  <div className="mt-1 text-xs leading-tight text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          ) : null}

          {cs.testimonialQuote ? (
            <figure className="mt-6">
              <Quote className="h-5 w-5 text-accent/40" aria-hidden="true" />
              <blockquote className="mt-1 text-sm italic leading-relaxed text-foreground">
                {cs.testimonialQuote}
              </blockquote>
              {cs.testimonialAuthor ? (
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {cs.testimonialAuthor}
                  {cs.testimonialRole ? `, ${cs.testimonialRole}` : ""}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <Link
            href={`/case-studies/${cs.slug}`}
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            Read the full story
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
