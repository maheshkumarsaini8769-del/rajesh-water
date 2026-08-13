import { FaBagShopping, FaPhone, FaWhatsapp } from 'react-icons/fa6'

import { useCart } from '../context/CartContext'
import { useSiteData } from '../context/SiteDataContext'

/** Floating WhatsApp + call buttons (right side) and mobile sticky cart button. */
export default function FloatingActions() {
  const { totalQuantity, openCart } = useCart()
  const { settings, waLink, telLink } = useSiteData()
  const number = settings.whatsappNumber || ''

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {/* WhatsApp */}
      <div className="group relative">
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 rounded-xl bg-ink-950/85 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
          Order on WhatsApp
        </span>
        <a
          href={waLink(number)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Order on WhatsApp"
          className="animate-pulse-soft grid cursor-pointer place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_rgba(37,211,102,0.45)] transition-transform duration-300 hover:scale-110 active:scale-95"
          style={{ width: '3.25rem', height: '3.25rem' }}
        >
          <FaWhatsapp className="text-2xl" />
        </a>
      </div>

      {/* Call */}
      <div className="group relative">
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 rounded-xl bg-ink-950/85 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
          Call Us
        </span>
        <a
          href={telLink(number)}
          aria-label="Call RAJESH WATER"
          className="grid cursor-pointer place-items-center rounded-full bg-gradient-to-r from-brand-500 to-aqua-500 text-white shadow-[0_10px_24px_rgba(31,143,88,0.4)] transition-transform duration-300 hover:scale-110 hover:rotate-6 active:scale-95"
          style={{ width: '3.25rem', height: '3.25rem' }}
        >
          <FaPhone className="text-xl" />
        </a>
      </div>

      {/* Mobile sticky cart button */}
      <button
        type="button"
        onClick={openCart}
        aria-label={`Open cart, ${totalQuantity} items`}
        className="relative grid cursor-pointer place-items-center rounded-2xl bg-ink-950 text-white shadow-[0_10px_24px_rgba(10,36,29,0.35)] transition-transform duration-300 hover:scale-105 active:scale-95 sm:hidden"
        style={{ width: '3.25rem', height: '3.25rem' }}
      >
        <FaBagShopping className="text-lg" />
        {totalQuantity > 0 && (
          <span className="absolute -top-1.5 -right-1.5 grid min-w-[20px] place-items-center rounded-full bg-brand-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
            {totalQuantity}
          </span>
        )}
      </button>
    </div>
  )
}