'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Subtle, tasteful scroll-reveal.
 *
 * Hardened so content is NEVER permanently hidden:
 *  - Uses an IntersectionObserver we control (not just whileInView) so we can
 *    guarantee a visible fallback.
 *  - A mount-time safety timer forces visibility shortly after mount, so if the
 *    observer never fires (e.g. element already fully in view, JS hiccup, or a
 *    full-page screenshot tool) the content still shows.
 *  - Respects prefers-reduced-motion by rendering statically.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
    )
    observer.observe(el)

    // Safety net: never leave content hidden for long.
    const timer = window.setTimeout(() => setVisible(true), 1200)

    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [reduceMotion])

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
