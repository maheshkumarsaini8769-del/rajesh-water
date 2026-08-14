import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'
import { FaArrowRight, FaDroplet } from 'react-icons/fa6'

import { HERO_IMAGE } from '../utils/imageConfig'
import { motionEnabled } from '../utils/animations'
import { onAnchorClick } from '../utils/smoothScroll'
import { useSite } from '../context/SiteContext'
import { useSiteData } from '../context/SiteDataContext'
import BottleImage from './BottleImage'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const { content } = useSite()
  const { settings } = useSiteData()
  const hero = content.hero ?? {}
  const customImage = settings.heroImage || hero.image
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const bottleWrapRef = useRef(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const bottleWrap = bottleWrapRef.current
    const text = textRef.current
    if (!section || !bottleWrap || !text) return

    const mm = gsap.matchMedia()

    // Mouse follow with smooth interpolation — small, natural movement.
    // (Float is handled by a lightweight CSS animation, so no conflicts.)
    mm.add('(prefers-reduced-motion: no-preference) and (pointer: fine)', () => {
      const xTo = gsap.quickTo(bottleWrap, 'x', { duration: 0.8, ease: 'power3.out' })
      const yTo = gsap.quickTo(bottleWrap, 'y', { duration: 0.8, ease: 'power3.out' })
      const rotTo = gsap.quickTo(bottleWrap, 'rotation', { duration: 0.9, ease: 'power3.out' })

      const onMove = (e) => {
        const rect = section.getBoundingClientRect()
        const nx = (e.clientX - rect.left) / rect.width - 0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5
        xTo(nx * 26)
        yTo(ny * 18)
        rotTo(nx * 4)
      }

      window.addEventListener('mousemove', onMove, { passive: true })
      return () => window.removeEventListener('mousemove', onMove)
    })

    // Scroll scrub: hero text fades up, bottle moves/rotates/scales toward next section.
    if (motionEnabled()) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
      tl.to(text, { y: -90, opacity: 0, ease: 'none' }, 0)
      tl.to(
        bottleWrap,
        { y: 90, rotation: 8, scale: 0.82, opacity: 0.55, ease: 'none' },
        0,
      )
    }

    return () => mm.revert()
  }, [])

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-[100dvh] items-center overflow-hidden pt-28 pb-16 lg:pt-20"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:px-8">
        {/* Left — text */}
        <div ref={textRef} className="relative z-10 text-center lg:text-left">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-4 py-1.5 text-xs font-bold tracking-wide text-brand-700 uppercase"
            data-reveal
          >
            <FaDroplet className="text-brand-500" />
            {hero.badge}
          </span>

          <h1
            className="mt-5 text-balance text-4xl leading-[1.08] font-extrabold tracking-tight text-ink-950 sm:text-5xl xl:text-6xl"
            data-reveal
          >
            {hero.titleA}
            <br />
            <span className="bg-gradient-to-r from-brand-500 to-aqua-500 bg-clip-text text-transparent">
              {hero.titleB}
            </span>
          </h1>

          <p
            className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink-900/65 sm:text-lg lg:mx-0"
            data-reveal
          >
            {hero.subtitle}
          </p>

          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            data-reveal
          >
            <a
              href="#products"
              onClick={onAnchorClick}
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(31,143,88,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(31,143,88,0.45)] active:scale-95"
            >
              {hero.ctaPrimary}
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#products"
              onClick={onAnchorClick}
              className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-white/70 px-7 py-3.5 text-sm font-bold text-brand-700 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 active:scale-95"
            >
              {hero.ctaSecondary}
            </a>
          </div>
        </div>

        {/* Right — floating bottle */}
        <div
          ref={bottleWrapRef}
          className="relative z-10 mx-auto w-full max-w-sm sm:max-w-md"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div className="hero-float will-change-transform">
            <div
              className={`relative transition-transform duration-500 ease-out ${
                hovering ? '-translate-y-4 scale-[1.045] rotate-[1.5deg]' : ''
              }`}
            >
              {/* Water pool & ripples */}
              <div
                aria-hidden="true"
                className={`absolute inset-x-6 bottom-4 h-24 rounded-[50%] transition-all duration-500 ${
                  hovering
                    ? 'bg-brand-200/70 shadow-[0_0_70px_24px_rgba(47,174,109,0.28)]'
                    : 'bg-brand-100/50'
                }`}
              />
              <div
                aria-hidden="true"
                className="ripple-ring bottom-2 left-1/2 top-auto h-24 w-11/12 -translate-x-1/2"
              />
              <div
                aria-hidden="true"
                className="ripple-ring bottom-0 left-1/2 top-auto h-20 w-3/4 -translate-x-1/2 [animation-delay:0.9s]"
              />

              {/* Bottle image with soft shadow */}
              <div
                className={`relative mx-auto w-56 drop-shadow-[0_28px_36px_rgba(20,75,51,0.22)] transition-all duration-500 sm:w-64 lg:w-72 ${
                  hovering ? 'drop-shadow-[0_40px_52px_rgba(20,75,51,0.32)]' : ''
                }`}
              >
                <div className="absolute inset-0 -z-10 scale-x-110 rounded-[50%] bg-brand-400/20 blur-2xl transition-all duration-500" />
                <BottleImage
                  srcs={customImage ? [customImage, ...HERO_IMAGE] : HERO_IMAGE}
                  alt="RAJESH WATER bottle — pure drinking water"
                  eager
                  className="w-full select-none object-contain"
                  draggable={false}
                />
              </div>

              {/* Small side bubbles */}
              <span className="bubble absolute top-10 -left-2 h-4 w-4" style={{ animationDuration: '4s' }} />
              <span className="bubble absolute top-1/3 -right-1 h-5 w-5" style={{ animationDuration: '5s', animationDelay: '1.2s' }} />
              <span className="bubble absolute bottom-14 left-6 h-3 w-3" style={{ animationDuration: '4.5s', animationDelay: '0.6s' }} />
            </div>
          </div>

          <p
            className="mt-8 text-center text-xs font-semibold tracking-[0.25em] text-brand-600/70 uppercase"
            data-reveal
          >
            {hero.sizesLine}
          </p>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-brand-600/60 md:flex"
        data-reveal
      >
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Scroll</span>
        <span className="h-9 w-px animate-pulse bg-gradient-to-b from-brand-400 to-transparent" />
      </div>
    </section>
  )
}