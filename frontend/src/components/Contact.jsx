import { FaPhone, FaTruckFast, FaWhatsapp, FaCartShopping } from 'react-icons/fa6'

import { useSite } from '../context/SiteContext'
import { useSiteData } from '../context/SiteDataContext'
import { onAnchorClick } from '../utils/smoothScroll'

export default function Contact() {
  const { content } = useSite()
  const { settings } = useSiteData()
  const contact = content.contact ?? {}
  const number = settings.whatsappNumber || contact.whatsappNumber || ''
  const waLink = number ? `https://wa.me/91${number}` : '#'
  const telLink = number ? `tel:+91${number}` : '#'

  const cards = [
    {
      icon: FaWhatsapp,
      title: 'WhatsApp',
      text: number || 'Not set',
      href: waLink,
      external: true,
      cta: 'Chat on WhatsApp',
      color: 'from-[#25D366]/90 to-[#1eb85a]',
    },
    {
      icon: FaPhone,
      title: 'Call',
      text: number || 'Not set',
      href: telLink,
      external: false,
      cta: 'Call Now',
      color: 'from-brand-500 to-brand-600',
    },
    {
      icon: FaCartShopping,
      title: contact.orderOnline?.title || 'Order Online',
      text: contact.orderOnline?.text || 'Pick bottles, order in minutes',
      href: '#products',
      external: false,
      cta: 'Start Ordering',
      color: 'from-brand-500 to-brand-600',
    },
    {
      icon: FaTruckFast,
      title: contact.deliveryInfo?.title || 'Delivery Info',
      text: settings.deliveryMessage || contact.deliveryInfo?.text || 'Fresh delivery for homes, offices, shops & events',
      href: null,
      external: false,
      cta: contact.deliveryInfo?.cta || null,
      color: 'from-aqua-500 to-aqua-600',
    },
  ]

  const CardLink = ({ card }) => {
    const inner = (
      <>
        <span
          className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}
        >
          <card.icon className="text-xl" />
        </span>
        <h3 className="mt-4 text-base font-extrabold text-ink-950">{card.title}</h3>
        <p className="mt-1 text-sm font-medium text-ink-900/60">{card.text}</p>
        {card.cta && (
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 transition-all duration-300 group-hover:gap-2.5">
            {card.cta}
          </span>
        )}
      </>
    )

    const className =
      'group relative flex h-full flex-col rounded-3xl border border-brand-100 bg-white/85 p-6 text-center shadow-[0_10px_30px_rgba(20,75,51,0.06)] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-[0_20px_44px_rgba(20,75,51,0.14)]'

    if (card.href) {
      if (card.external) {
        return (
          <a
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {inner}
          </a>
        )
      }
      return (
        <a href={card.href} onClick={onAnchorClick} className={className}>
          {inner}
        </a>
      )
    }
    return <div className={className}>{inner}</div>
  }

  return (
    <section id="contact" className="relative scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <span className="text-xs font-bold tracking-[0.3em] text-brand-600 uppercase">
            Contact Us
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
            {contact.heading}
          </h2>
          <p className="mt-4 text-ink-900/65">
            {contact.subtitle}
          </p>
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          data-reveal-group
        >
          {cards.map((card) => (
            <CardLink key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}