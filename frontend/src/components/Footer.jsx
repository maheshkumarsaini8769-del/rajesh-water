import { FaBottleWater, FaPhone, FaWhatsapp } from 'react-icons/fa6'

import { useSite } from '../context/SiteContext'
import { useSiteData } from '../context/SiteDataContext'
import { onAnchorClick } from '../utils/smoothScroll'

export default function Footer() {
  const { content } = useSite()
  const { settings } = useSiteData()
  const year = new Date().getFullYear()
  const brand = content.brand ?? {}
  const businessName = settings.businessName || brand.name || 'RAJESH WATER'
  const footer = content.footer ?? {}
  const number = settings.whatsappNumber || content.contact?.whatsappNumber || ''
  const waLink = number ? `https://wa.me/91${number}` : '#'
  const telLink = number ? `tel:+91${number}` : '#'
  const products = content.products?.items ?? []

  return (
    <footer className="relative border-t border-brand-100 bg-white/70 py-12 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-aqua-500 text-white shadow-[0_6px_18px_rgba(31,143,88,0.35)]">
                <FaBottleWater className="text-lg" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-ink-950">
                {businessName.split(' ')[0] ?? ''}{' '}
                <span className="text-brand-600">
                  {businessName.split(' ').slice(1).join(' ') || brand.highlight}
                </span>
              </span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-900/60">
              {footer.tagline}
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-xs font-extrabold tracking-[0.2em] text-ink-950 uppercase">Products</h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-900/65">
              {products.map((p) => (
                <li key={p.id}>{p.label} Bottles ({p.unit})</li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-extrabold tracking-[0.2em] text-ink-950 uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#home" onClick={onAnchorClick} className="text-ink-900/65 transition-colors hover:text-brand-600">Home</a></li>
              <li><a href="#products" onClick={onAnchorClick} className="text-ink-900/65 transition-colors hover:text-brand-600">Products</a></li>
              <li><a href="#about" onClick={onAnchorClick} className="text-ink-900/65 transition-colors hover:text-brand-600">About</a></li>
              <li><a href="#contact" onClick={onAnchorClick} className="text-ink-900/65 transition-colors hover:text-brand-600">Contact</a></li>
              <li>
                <a
                  href="#/admin"
                  className="font-semibold text-ink-900/40 transition-colors hover:text-brand-600"
                >
                  Admin Panel
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-extrabold tracking-[0.2em] text-ink-950 uppercase">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-ink-900/75 transition-colors hover:text-brand-600"
                >
                  <FaWhatsapp className="text-[#25D366]" /> {number}
                </a>
              </li>
              <li>
                <a
                  href={telLink}
                  className="inline-flex items-center gap-2 font-semibold text-ink-900/75 transition-colors hover:text-brand-600"
                >
                  <FaPhone className="text-brand-500" /> {number}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-100 pt-6 text-center text-xs text-ink-900/50">
          © {year} {businessName}. {footer.copyright}
        </div>
      </div>
    </footer>
  )
}