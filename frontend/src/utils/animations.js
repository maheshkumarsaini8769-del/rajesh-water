import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches ||
    'ontouchstart' in window)

export const motionEnabled = () => !prefersReducedMotion()

/**
 * Set up scroll-reveal animations for the whole page.
 * Elements with [data-reveal] fade/slide in when they enter the viewport.
 * Elements with [data-reveal-group] stagger their direct children.
 * Returns a cleanup function (used with gsap.context reverse-safe handling).
 */
export function initScrollAnimations(scope) {
  if (!motionEnabled()) return () => {}

  const ctx = gsap.context(() => {
    // Section headings + single elements
    gsap.utils.toArray('[data-reveal]', scope).forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        },
      )
    })

    // Groups: stagger children one by one
    gsap.utils.toArray('[data-reveal-group]', scope).forEach((group) => {
      const cards = [...group.children].filter(
        (el) => !el.hasAttribute('data-reveal-none'),
      )
      if (cards.length === 0) return
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.14,
          scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        },
      )
    })

    // Subtle parallax on elements marked with data-parallax
    gsap.utils.toArray('[data-parallax]', scope).forEach((el) => {
      const speed = Number(el.dataset.parallax) || 0.15
      gsap.fromTo(
        el,
        { y: () => speed * 80 },
        {
          y: () => -speed * 80,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        },
      )
    })
  }, scope)

  return () => ctx.revert()
}

/** Simple tween helper that respects reduced motion. */
export function tween(target, vars) {
  if (!motionEnabled()) return null
  return gsap.to(target, vars)
}