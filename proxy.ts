import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from './auth.config'
import { getRedirectFor } from '@/lib/redirects'

// Note: the Next.js 16 proxy always runs on the Node.js runtime, so we can
// query MongoDB for CMS-managed redirects without declaring a runtime here.

const { auth } = NextAuth(authConfig)

/**
 * Next.js 16 proxy (formerly middleware).
 *
 * 1. Resolves CMS-managed 301/302 redirects (from the Redirect collection).
 * 2. Enforces login on the /admin area via the `authorized` callback.
 */
export default auth(async (req) => {
  const { pathname } = req.nextUrl

  // 1. CMS redirects — never intercept admin, api, or Next internals.
  if (
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next')
  ) {
    // Bound the DB lookup so a slow/unreachable database can never stall
    // navigation. If it doesn't resolve quickly we fail open (no redirect).
    const rule = await Promise.race([
      getRedirectFor(pathname),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ])
    if (rule) {
      const url = req.nextUrl.clone()
      // Absolute destination -> external redirect; relative -> in-app.
      if (/^https?:\/\//i.test(rule.destination)) {
        return NextResponse.redirect(rule.destination, rule.permanent ? 308 : 307)
      }
      url.pathname = rule.destination
      url.search = ''
      return NextResponse.redirect(url, rule.permanent ? 308 : 307)
    }
  }

  // 2. Admin auth guard.
  if (pathname.startsWith('/admin') && !req.auth?.user) {
    const signIn = req.nextUrl.clone()
    signIn.pathname = '/sign-in'
    signIn.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signIn)
  }

  return NextResponse.next()
})

export const config = {
  // Run on all routes except static assets & files with an extension.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)'],
}
