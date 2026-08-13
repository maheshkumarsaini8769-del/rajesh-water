import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { FaBagShopping, FaMinus, FaPlus, FaTrash, FaWhatsapp, FaXmark } from 'react-icons/fa6'

import { formatINR, cartBoxSummary, boxSizeOf, MAX_CARTONS } from '../data/business'
import { getProduct } from '../data/products'
import { useCart } from '../context/CartContext'
import { useSiteData } from '../context/SiteDataContext'
import BottleImage from './BottleImage'
import Checkout from './Checkout'
import { onAnchorClick } from '../utils/smoothScroll'

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    increment,
    decrement,
    removeItem,
    totalQuantity,
    totalBoxes,
    totalAmount,
    meetsMinimum,
  } = useCart()
  const { settings } = useSiteData()
  const minOrder = settings?.minOrder ?? 48
  const [step, setStep] = useState('cart')
  const panelRef = useRef(null)
  const overlayRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    setStep('cart')

    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 })
      gsap.fromTo(
        panelRef.current,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.45, ease: 'power3.out' },
      )
      gsap.fromTo(
        listRef.current?.children ?? [],
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.07,
          ease: 'power2.out',
          delay: 0.22,
        },
      )
    })

    const onKey = (e) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      ctx.revert()
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, closeCart])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && step === 'cart' && listRef.current) {
      gsap.fromTo(
        listRef.current.children ?? [],
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.2 },
      )
    }
  }, [isOpen, step, items])

  if (!isOpen) return null

  const progress = Math.min((totalQuantity / minOrder) * 100, 100)
  const sizeOf = (id) => boxSizeOf(getProduct(id))
  const boxSummary = cartBoxSummary(items, sizeOf)

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className="absolute inset-0 bg-ink-950/40 opacity-0 backdrop-blur-sm"
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="glass flex items-center justify-between border-b border-brand-100 px-6 py-4">
          <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-ink-950">
            <FaBagShopping className="text-brand-500" />
            Your Cart
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">
              {totalBoxes} box{totalBoxes === 1 ? '' : 'es'}
            </span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-ink-900/70 transition-all duration-300 hover:rotate-90 hover:bg-brand-50 hover:text-brand-700 active:scale-90"
          >
            <FaXmark className="text-xl" />
          </button>
        </div>

        {step === 'cart' ? (
          <>
            {/* Items */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-brand-400">
                  <FaBagShopping className="text-3xl" />
                </span>
                <p className="text-lg font-bold text-ink-950">Your cart is empty</p>
                <p className="max-w-xs text-sm text-ink-900/60">
                  Add bottles from the products section to start your order.
                </p>
                <a
                  href="#products"
                  onClick={(e) => {
                    onAnchorClick(e)
                    closeCart()
                  }}
                  className="mt-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(31,143,88,0.35)] transition hover:-translate-y-0.5"
                >
                  Browse Bottles
                </a>
              </div>
            ) : (
              <ul ref={listRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-6 py-5">
                {items.map((item) => {
                  const product = getProduct(item.id)
                  const itemBoxSize = boxSizeOf(product)
                  const itemBoxes = item.quantity / itemBoxSize
                  const atMax = item.quantity >= itemBoxSize * MAX_CARTONS
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-3"
                    >
                      <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-white p-1.5 shadow-sm">
                        <BottleImage
                          srcs={product?.images ?? []}
                          alt={item.label}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-extrabold text-ink-950">
                            {item.label}
                          </span>
                          <span className="text-sm font-bold text-brand-600">
                            {formatINR(item.price * item.quantity)}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-ink-900/55">
                          {formatINR(item.price)} / bottle
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-xl border border-brand-100 bg-white p-0.5 shadow-sm">
                            <button
                              type="button"
                              aria-label={`Decrease ${item.label}`}
                              onClick={() => decrement(item.id)}
                              className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-brand-600 transition hover:bg-brand-50 active:scale-90"
                            >
                              <FaMinus className="text-[10px]" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-extrabold text-ink-950 tabular-nums">
                              {itemBoxes}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase ${item.label}`}
                              onClick={() => increment(item.id)}
                              disabled={atMax}
                              className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <FaPlus className="text-[10px]" />
                            </button>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-semibold text-ink-900/55">
                              {atMax
                                ? `Max ${MAX_CARTONS} ${itemBoxSize === 12 ? 'cartons' : 'boxes'} reached`
                                : `1 ${itemBoxSize > 12 ? 'box' : 'carton'} = ${itemBoxSize} bottles`}
                            </span>
                            <button
                              type="button"
                              aria-label={`Remove ${item.label} from cart`}
                              onClick={() => removeItem(item.id)}
                              className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-ink-900/40 transition hover:bg-red-50 hover:text-red-500 active:scale-90"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* Footer — totals + minimum order */}
            <div className="border-t border-brand-100 bg-white px-6 py-5">
              {items.length > 0 && (
                <>
                  <div className="mb-4">
                    <p
                      className={`flex items-center justify-between text-sm font-bold ${
                        meetsMinimum ? 'text-brand-600' : 'text-red-500'
                      }`}
                    >
                      <span>
                        {meetsMinimum
                          ? 'Minimum order met'
                          : `Minimum order is ${minOrder} bottles`}
                      </span>
                      {meetsMinimum && <span className="animate-check-pop">✓</span>}
                    </p>
                    <p className="mt-1 text-xs text-ink-900/60">
                      Your order: {totalBoxes} box{totalBoxes === 1 ? '' : 'es'} · Min {minOrder} bottles
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          meetsMinimum
                            ? 'bg-gradient-to-r from-brand-400 to-brand-500'
                            : 'bg-red-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-1 flex items-baseline justify-between rounded-xl bg-brand-50/60 px-3 py-2">
                    <span className="text-xs font-extrabold tracking-wide text-ink-900/60 uppercase">
                      Boxes
                    </span>
                    <span className="text-xs font-bold text-brand-700">
                      {boxSummary.boxes} Box{boxSummary.boxes === 1 ? '' : 'es'}
                    </span>
                  </div>

                  <div className="mb-4 flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-ink-900/70">Grand Total</span>
                    <span className="text-2xl font-extrabold text-ink-950">
                      {formatINR(totalAmount)}
                    </span>
                  </div>
                </>
              )}

              <button
                type="button"
                disabled={!meetsMinimum || items.length === 0}
                onClick={() => setStep('checkout')}
                className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-extrabold text-white transition-all duration-300 ${
                  meetsMinimum && items.length > 0
                    ? 'bg-[#25D366] shadow-[0_14px_32px_rgba(37,211,102,0.4)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(37,211,102,0.5)] active:scale-[0.98]'
                    : 'cursor-not-allowed bg-ink-900/15 shadow-none'
                }`}
              >
                <FaWhatsapp className="text-xl" />
                {meetsMinimum ? 'Order on WhatsApp' : `Add ${minOrder - totalQuantity} more bottles`}
              </button>
            </div>
          </>
        ) : (
          <Checkout onBack={() => setStep('cart')} onClose={closeCart} />
        )}
      </aside>
    </div>
  )
}