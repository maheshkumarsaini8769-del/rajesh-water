import { FaBuilding, FaHandHoldingHeart, FaHouse, FaShop } from 'react-icons/fa6'

import { useSite } from '../context/SiteContext'

const ICONS = [FaHouse, FaBuilding, FaShop, FaHandHoldingHeart]

export default function About() {
  const { content } = useSite()
  const about = content.about ?? {}
  const cards = about.cards ?? []

  return (
    <section id="about" className="relative scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass overflow-hidden rounded-[2.5rem] p-8 shadow-[0_24px_60px_rgba(20,75,51,0.1)] sm:p-12 lg:p-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div data-reveal>
              <span className="text-xs font-bold tracking-[0.3em] text-brand-600 uppercase">
                About Us
              </span>
              <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
                {about.heading}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-900/70">
                {about.text1}
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink-900/70">
                {about.text2}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-reveal-group>
              {cards.map((point, i) => {
                const Icon = ICONS[i % ICONS.length] ?? FaHouse
                return (
                  <div
                    key={`${point.title}-${i}`}
                    className="rounded-3xl border border-brand-100 bg-white/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_16px_36px_rgba(20,75,51,0.12)]"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-100 to-aqua-100 text-brand-600">
                      <Icon className="text-lg" />
                    </span>
                    <h3 className="mt-3 text-sm font-extrabold text-ink-950">{point.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-900/60">{point.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}