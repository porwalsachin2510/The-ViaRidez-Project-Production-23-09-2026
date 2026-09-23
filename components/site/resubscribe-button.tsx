"use client"

import { useState, useTransition } from "react"
import { Loader2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { resubscribeByToken } from "@/app/actions/newsletter"

/**
 * Undo affordance on the unsubscribe screen. Kept as a client island so the
 * page itself stays a server component that performs the unsubscribe on render.
 */
export function ResubscribeButton({ email, token }: { email: string; token: string }) {
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<"idle" | "done" | "error">("idle")

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Check className="h-4 w-4" aria-hidden="true" />
        You&apos;re back on the list.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-fit"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await resubscribeByToken(email, token)
            setState(result.status === "done" ? "done" : "error")
          })
        }
      >
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        Resubscribe me
      </Button>
      {state === "error" ? (
        <p className="text-sm text-destructive">
          We couldn&apos;t resubscribe you. Please try again.
        </p>
      ) : null}
    </div>
  )
}
