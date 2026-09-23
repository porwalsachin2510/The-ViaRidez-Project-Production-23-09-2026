"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { requestResourceDownload, type ResourceDownloadState } from "@/app/actions/resources"

const initialState: ResourceDownloadState = { ok: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Preparing download…" : "Unlock download"}
    </button>
  )
}

export function ResourceDownloadForm({ resourceId }: { resourceId: string }) {
  const [state, action] = useActionState(requestResourceDownload, initialState)

  if (state.ok && state.downloadUrl) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4">
        <p className="text-sm font-medium text-foreground">{state.message}</p>
        <a
          href={state.downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:brightness-110"
        >
          Download resource
        </a>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="resourceId" value={resourceId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Name <span className="text-muted-foreground">(optional)</span>
          <input
            name="name"
            maxLength={120}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none ring-accent/30 transition focus:ring-2"
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Company <span className="text-muted-foreground">(optional)</span>
          <input
            name="company"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none ring-accent/30 transition focus:ring-2"
            placeholder="Company name"
            autoComplete="organization"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Work email
        <input
          name="email"
          type="email"
          required
          maxLength={160}
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none ring-accent/30 transition focus:ring-2"
          placeholder="you@company.com"
          autoComplete="email"
        />
        {state.errors?.email ? <span className="text-xs font-normal text-destructive">{state.errors.email}</span> : null}
      </label>
      <label className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <input name="consent" type="checkbox" required className="mt-0.5 accent-accent" />
        <span>I agree to receive this resource and occasional mobility insights from ViaRidez.</span>
      </label>
      {state.errors?.consent || state.message ? (
        <p className="text-sm text-destructive">{state.errors?.consent ?? state.message}</p>
      ) : null}
      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
