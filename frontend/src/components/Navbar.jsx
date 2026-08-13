import { useEffect, useState } from 'react'
import { FaBagShopping, FaBars, FaBottleWater, FaXmark } from 'react-icons/fa6'
import { useCart } from '../context/CartContext'
import { useSite } from '../context/SiteContext'
import { onAnchorClick } from '../utils/smoothScroll'

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Products', href: '#products' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const { totalBoxes, openCart } = useCart()
  const { content } = useSite()
  const brand = content.brand ?? {}
  const name = brand.name ?? 'RAJESH WATER'
  const parts = name.split(' ')
  const first = parts[0] ?? ''
  const rest = parts.slice(1).join(' ')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'glass shadow-[0_8px_30px_rgba(20,75,51,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-500 sm:px-6 lg:px-8 ${
          scrolled ? 'py-2.5' : 'py-4'
        }`}
      >
        {/* Logo */}
        <a href="#home" onClick={onAnchorClick} className="group flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-aqua-500 text-white shadow-[0_6px_18px_rgba(31,143,88,0.35)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
            <FaBottleWater className="text-lg" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-950 sm:text-xl">
            {first} <span className="text-brand-600">{rest || brand.highlight}</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={onAnchorClick}
                className="relative rounded-full px-4 py-2 text-sm font-semibold text-ink-900/80 transition-colors duration-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Cart + hamburger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCart}
            data-cart-target
            aria-label={`Open cart, ${totalBoxes} box${totalBoxes === 1 ? '' : 'es'}`}
            className="glass relative grid h-11 w-11 cursor-pointer place-items-center rounded-full text-ink-900 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_24px_rgba(31,143,88,0.3)] active:scale-95"
          >
            <FaBagShopping className="text-lg" />
            <span
              data-cart-badge
              className={`absolute -right-1 -top-1 grid min-w-[20px] place-items-center rounded-full bg-brand-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow transition-transform duration-300 ${
                totalBoxes === 0 ? 'scale-0' : 'scale-100'
              }`}
            >
              {totalBoxes}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="glass grid h-11 w-11 cursor-pointer place-items-center rounded-full text-ink-900 shadow-sm transition-all duration-300 hover:scale-110 md:hidden"
          >
            {menuOpen ? (
              <FaXmark className="text-lg" />
            ) : (
              <FaBars className="text-lg" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-500 md:hidden ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="glass mx-4 mb-4 space-y-1 rounded-2xl p-3 shadow-xl">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => {
                  onAnchorClick(e)
                  setMenuOpen(false)
                }}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink-900/85 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}