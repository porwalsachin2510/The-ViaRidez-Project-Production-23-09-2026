import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, AlertCircle, Mail } from "lucide-react"

import { unsubscribeByToken } from "@/app/actions/newsletter"
import { ResubscribeButton } from "@/components/site/resubscribe-button"

export const metadata: Metadata = {
  title: "Unsubscribe | ViaRidez",
  description: "Manage your ViaRidez email subscription preferences.",
  robots: { index: false, follow: false },
}

/**
 * One-click unsubscribe landing page. The mutation runs on render because mail
 * clients only give us a plain GET link — there is no opportunity to POST. This
 * is why the link carries a per-subscriber token rather than just the address.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>
}) {
  const { email = "", token = "" } = await searchParams
  const result = await unsubscribeByToken(email, token)

  const copy = {
    done: {
      icon: CheckCircle2,
      tone: "text-[var(--brand-teal,#00a88e)]",
      title: "You've been unsubscribed",
      body: "You won't receive any more ViaRidez insights emails. Transactional messages about enquiries or bookings you make will still reach you.",
    },
    already: {
      icon: CheckCircle2,
      tone: "text-muted-foreground",
      title: "Already unsubscribed",
      body: "This address is not on our insights list, so there's nothing more to do.",
    },
    invalid: {
      icon: AlertCircle,
      tone: "text-destructive",
      title: "This link isn't valid",
      body: "The unsubscribe link may have expired or been altered. Email us and we'll remove you straight away.",
    },
    error: {
      icon: AlertCircle,
      tone: "text-destructive",
      title: "Something went wrong",
      body: "We couldn't update your preferences just now. Please try the link again in a moment, or email us directly.",
    },
  }[result.status]

  const Icon = copy.icon
  const showResubscribe = result.status === "done"

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-start gap-6 px-6 py-24">
      <Icon className={`h-10 w-10 ${copy.tone}`} aria-hidden="true" />

      <div className="flex flex-col gap-3">
        <h1 className="text-pretty text-3xl font-bold tracking-tight text-foreground">
          {copy.title}
        </h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">{copy.body}</p>
        {"email" in result && result.email ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium text-foreground">{result.email}</span>
          </p>
        ) : null}
      </div>

      {showResubscribe ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-5">
          <p className="text-sm text-muted-foreground">
            Unsubscribed by mistake? You can rejoin the list instantly.
          </p>
          <ResubscribeButton email={result.email} token={token} />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-4 pt-2 text-sm">
        <Link href="/" className="font-medium text-foreground underline underline-offset-4">
          Back to viaridez.com
        </Link>
        <Link href="/contact" className="font-medium text-muted-foreground underline underline-offset-4">
          Contact us
        </Link>
      </div>
    </section>
  )
}
