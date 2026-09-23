import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getActiveSessionUser } from "@/lib/auth-helpers"
import { SignInForm } from "@/components/admin/sign-in-form"

export const metadata: Metadata = {
  title: "Sign in | ViaRidez Admin",
  robots: { index: false, follow: false },
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ inactive?: string; callbackUrl?: string }>
}) {
  // Only redirect to the dashboard when the session resolves to a real, active
  // account. Validating against the database (rather than just checking for a
  // cookie) prevents a stale/invalid session from looping between /sign-in and
  // /admin.
  const activeUser = await getActiveSessionUser()
  if (activeUser) redirect("/admin")

  const { inactive } = await searchParams

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link href="/" className="relative z-10 inline-flex">
          <Image
            src="/brand/viaridez-logo-light.png"
            alt="ViaRidez"
            width={160}
            height={46}
            className="h-10 w-auto"
          />
        </Link>
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-3xl font-semibold leading-tight text-balance">
            Enterprise mobility, managed with precision.
          </h1>
          <p className="mt-4 leading-relaxed text-primary-foreground/70">
            Manage services, fleet, content, and enquiries across the ViaRidez
            platform from one secure control centre.
          </p>
        </div>
        <div className="relative z-10 text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} ViaRidez. All rights reserved.
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/30"
          aria-hidden="true"
        />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Image
              src="/brand/viaridez-logo.png"
              alt="ViaRidez"
              width={150}
              height={43}
              className="h-9 w-auto"
            />
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Sign in to the admin panel
          </h2>
          <p className="mb-8 mt-2 text-sm text-muted-foreground">
            Enter your credentials to access the ViaRidez control centre.
          </p>
          {inactive && (
            <div
              role="status"
              className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400"
            >
              Your session is no longer valid. Please sign in again to continue.
            </div>
          )}
          <SignInForm />
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Authorised personnel only. Access is monitored and logged.
          </p>
        </div>
      </div>
    </main>
  )
}
