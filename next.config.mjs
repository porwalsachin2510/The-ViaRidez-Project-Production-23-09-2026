/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow the dev server's static assets (_next/static, HMR websocket) to be
  // requested from LAN / loopback hosts. Without this, opening the app via
  // http://127.0.0.1:3000 or your machine's network IP (e.g. 10.73.14.229)
  // makes Next.js block the JS chunks with a 403, leaving a blank/buffering
  // page. Add any other host you use to reach the dev server here.
  allowedDevOrigins: ['127.0.0.1', 'localhost', '10.73.14.229'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: "default-src 'self'; img-src 'self' data: https:; font-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
      {
        // Extra clickjacking protection for the authenticated admin surface.
        source: '/admin/:path*',
        headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }],
      },
    ]
  },
}

export default nextConfig
