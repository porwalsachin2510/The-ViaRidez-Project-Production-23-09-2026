'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Animated count-up for stat values. Handles values like "13+", "50+", "99.7%",
 * "24/7" or "4" by isolating the leading number and preserving any prefix/suffix.
 * If the value has no clean single number (e.g. "24/7"), it renders statically.
 * Animation runs once when the element scrolls into view; respects reduced motion.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()

  // Parse "<prefix><number><suffix>" — only a single leading numeric token.
  const match = value.match(/^(\D*?)(\d+(?:\.\d+)?)([\s\S]*)$/)
  const hasExtraDigits = match ? /\d/.test(match[3]) : false
  const target = match && !hasExtraDigits ? parseFloat(match[2]) : null
  const decimals = match && match[2].includes('.') ? match[2].split('.')[1].length : 0
  const prefix = match?.[1] ?? ''
  const suffix = match?.[3] ?? ''

  const [display, setDisplay] = useState(target === null ? value : `${prefix}0${suffix}`)

  useEffect(() => {
    if (target === null) {
      setDisplay(value)
      return
    }
    if (reduce) {
      setDisplay(`${prefix}${target.toFixed(decimals)}${suffix}`)
      return
    }
    const el = ref.current
    if (!el) return

    let raf = 0
    let started = false
    const run = () => {
      const duration = 1400
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
        const current = target * eased
        setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`)
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true
          run()
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)

    // Safety: if the observer never fires, show the final value.
    const safety = setTimeout(() => {
      if (!started) setDisplay(`${prefix}${target.toFixed(decimals)}${suffix}`)
    }, 1500)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      clearTimeout(safety)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
