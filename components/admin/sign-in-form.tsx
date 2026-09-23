"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { signInAction, type SignInState } from "@/app/actions/auth"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-accent px-6 font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  )
}

export function SignInForm() {
  const [state, formAction] = useActionState<SignInState, FormData>(signInAction, {})

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@viaridez.ae"
          className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none ring-accent/40 transition focus:border-accent focus:ring-2"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none ring-accent/40 transition focus:border-accent focus:ring-2"
        />
      </div>
      <SubmitButton />
    </form>
  )
}
