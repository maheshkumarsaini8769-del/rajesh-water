import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaCircleCheck, FaWhatsapp } from 'react-icons/fa6'

import { formatINR, cartBoxSummary, boxSizeOf } from '../data/business'
import { getProduct } from '../data/products'
import { useCart } from '../context/CartContext'
import { useSite } from '../context/SiteContext'
import { useSiteData } from '../context/SiteDataContext'
import { buildOrderMessage, openWhatsApp } from '../utils/whatsapp'

const MOBILE_RE = /^[6-9]\d{9}$/

const initial = { name: '', mobile: '', address: '', city: '', message: '' }

export default function Checkout({ onBack, onClose }) {
  const { items, totalQuantity, totalAmount, meetsMinimum } = useCart()
  const { content } = useSite()
  const { settings } = useSiteData()
  const whatsappNumber = settings.whatsappNumber || content.contact?.whatsappNumber
  const minOrder = settings?.minOrder ?? 48
  const boxSummary = cartBoxSummary(items, (id) => boxSizeOf(getProduct(id)))
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [saveError, setSaveError] = useState(false)
  const successRef = useRef(null)

  useEffect(() => {
    if (status === 'sent' && successRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          successRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' },
        )
      })
      return () => ctx.revert()
    }
    return undefined
  }, [status])

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.mobile.trim()) next.mobile = 'Mobile number is required'
    else if (!MOBILE_RE.test(form.mobile.replace(/\s+/g, '')))
      next.mobile = 'Enter a valid 10-digit Indian mobile number'
    if (!form.address.trim()) next.address = 'Delivery address is required'
    if (totalQuantity < minOrder) next.cart = `Minimum order is ${minOrder} bottles`
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setSummaryOpen(true)
  }

  const handleWhatsAppOrder = () => {
    if (status !== 'idle') return
    const message = buildOrderMessage(
      {
        name: form.name.trim(),
        mobile: form.mobile.replace(/\s+/g, ''),
        address: form.address.trim(),
        city: form.city.trim(),
        message: form.message.trim(),
      },
      {
        products: items.map((it) => ({
          label: it.label,
          quantity: it.quantity,
          price: it.price,
          boxSize: boxSizeOf(getProduct(it.id)),
        })),
        totalQuantity,
        totalAmount,
      },
    )

    setStatus('sent')

    const payload = {
      customer: {
        name: form.name.trim(),
        mobile: form.mobile.replace(/\s+/g, ''),
        address: form.address.trim(),
        city: form.city.trim(),
        message: form.message.trim(),
      },
      products: items.map((it) => ({
        id: it.id,
        label: it.label,
        quantity: it.quantity,
        price: it.price,
      })),
      totalQuantity,
      totalAmount,
    }

    if (typeof fetch === 'function') {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`save failed (${res.status})`)
        })
        .catch(() => setSaveError(true))
    }

    setTimeout(() => openWhatsApp(message, whatsappNumber), 1700)
  }

  const inputClass = (key) =>
    `w-full rounded-2xl border bg-white px-4 py-3 text-sm text-ink-950 outline-none transition-all duration-200 placeholder:text-ink-900/35 focus:ring-2 ${
      errors[key]
        ? 'border-red-400 focus:ring-red-200'
        : 'border-brand-100 focus:border-brand-400 focus:ring-brand-100'
    }`

  if (status === 'sent') {
    return (
      <div ref={successRef} className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="animate-check-pop grid h-20 w-20 place-items-center rounded-full bg-brand-50">
          <svg viewBox="0 0 52 52" className="h-11 w-11">
            <circle cx="26" cy="26" r="24" fill="none" stroke="#2fae6d" strokeWidth="3" />
            <path
              fill="none"
              stroke="#1f8f58"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 27 L23 36 L38 18"
              className="stroke-draw"
            />
          </svg>
        </span>
        <p className="text-2xl font-extrabold text-ink-950">Order Ready ✓</p>
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-600">
          <span className="inline-block h-2.5 w-2.5 animate-ping rounded-full bg-brand-400" />
          Opening WhatsApp...
        </p>
        <p className="max-w-xs text-xs text-ink-900/55">
          Your order message is being prepared. The business will confirm your
          order on WhatsApp.
        </p>
        {saveError && (
          <p className="max-w-xs rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            Could not save the order online — please share it on WhatsApp and we
            will note it down.
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-2 rounded-2xl border border-brand-200 bg-white px-6 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  if (summaryOpen) {
    return (
      <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
        <button
          type="button"
          onClick={() => setSummaryOpen(false)}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-brand-600 transition hover:text-brand-700"
        >
          <FaArrowLeft className="text-xs" /> Edit details
        </button>

        <h3 className="mt-4 flex items-center gap-2 text-lg font-extrabold text-ink-950">
          <FaCircleCheck className="text-brand-500" /> Order Summary
        </h3>

        <div className="mt-4 space-y-1.5 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-sm">
          <p className="flex justify-between gap-4"><span className="font-semibold text-ink-900/60">Customer Name</span><span className="font-bold text-ink-950">{form.name}</span></p>
          <p className="flex justify-between gap-4"><span className="font-semibold text-ink-900/60">Mobile Number</span><span className="font-bold text-ink-950">{form.mobile}</span></p>
          <p className="flex justify-between gap-4"><span className="font-semibold text-ink-900/60">Address</span><span className="text-right font-bold text-ink-950">{form.address}</span></p>
          {form.city && (
            <p className="flex justify-between gap-4"><span className="font-semibold text-ink-900/60">City</span><span className="font-bold text-ink-950">{form.city}</span></p>
          )}
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border border-brand-100 p-4">
          <p className="text-xs font-bold tracking-wide text-ink-900/50 uppercase">Products</p>
          {items.map((it) => (
            <p key={it.id} className="flex justify-between text-sm">
              <span className="font-semibold text-ink-900/75">{it.label} <span className="text-ink-900/45">× {it.quantity}</span></span>
              <span className="font-bold text-ink-950">{formatINR(it.price * it.quantity)}</span>
            </p>
          ))}
          <div className="border-t border-brand-100 pt-2">
            <p className="flex justify-between text-sm"><span className="font-semibold text-ink-900/60">Total Boxes</span><span className="font-bold text-brand-700">{boxSummary.boxes}{boxSummary.extra > 0 ? ` + ${boxSummary.extra} bottle${boxSummary.extra === 1 ? '' : 's'}` : ''}</span></p>
            <p className="flex justify-between text-sm"><span className="font-semibold text-ink-900/60">Total Bottles</span><span className="font-bold text-brand-700">{totalQuantity}</span></p>
            <p className="mt-1 flex justify-between text-base"><span className="font-bold text-ink-950">Total Amount</span><span className="font-extrabold text-ink-950">{formatINR(totalAmount)}</span></p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWhatsAppOrder}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] px-6 py-4 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(37,211,102,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(37,211,102,0.5)] active:scale-[0.98]"
        >
          <FaWhatsapp className="text-xl" />
          ORDER ON WHATSAPP
        </button>
        <p className="mt-3 text-center text-xs text-ink-900/50">
          Your order will be sent to RAJESH WATER on WhatsApp for confirmation.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-6 py-6"
      noValidate
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex cursor-pointer items-center gap-2 self-start text-sm font-bold text-brand-600 transition hover:text-brand-700"
      >
        <FaArrowLeft className="text-xs" /> Back to cart
      </button>

      <h3 className="mt-4 text-lg font-extrabold text-ink-950">Delivery Details</h3>
      <p className="mt-1 text-xs text-ink-900/55">
        Fill in your details and place the order on WhatsApp.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="co-name" className="mb-1.5 block text-xs font-bold text-ink-900/70">Customer Name</label>
          <input id="co-name" type="text" placeholder="Your name" value={form.name} onChange={set('name')} className={inputClass('name')} />
          {errors.name && <p className="mt-1 text-xs font-semibold text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="co-mobile" className="mb-1.5 block text-xs font-bold text-ink-900/70">Mobile Number</label>
          <input id="co-mobile" type="tel" inputMode="numeric" placeholder="10-digit mobile number" value={form.mobile} onChange={set('mobile')} className={inputClass('mobile')} />
          {errors.mobile && <p className="mt-1 text-xs font-semibold text-red-500">{errors.mobile}</p>}
        </div>
        <div>
          <label htmlFor="co-address" className="mb-1.5 block text-xs font-bold text-ink-900/70">Delivery Address</label>
          <textarea id="co-address" rows={3} placeholder="House / street / landmark" value={form.address} onChange={set('address')} className={`${inputClass('address')} resize-none`} />
          {errors.address && <p className="mt-1 text-xs font-semibold text-red-500">{errors.address}</p>}
        </div>
        <div>
          <label htmlFor="co-city" className="mb-1.5 block text-xs font-bold text-ink-900/70">City</label>
          <input id="co-city" type="text" placeholder="City (optional)" value={form.city} onChange={set('city')} className={inputClass('city')} />
        </div>
        <div>
          <label htmlFor="co-message" className="mb-1.5 block text-xs font-bold text-ink-900/70">Message <span className="font-medium text-ink-900/40">(optional)</span></label>
          <textarea id="co-message" rows={2} placeholder="Any instructions for delivery" value={form.message} onChange={set('message')} className={`${inputClass('message')} resize-none`} />
        </div>
      </div>

      {errors.cart && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-500">{errors.cart}</p>
      )}

      <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm">
        <p className="flex justify-between"><span className="font-semibold text-ink-900/60">Total Bottles</span><span className="font-bold text-brand-700">{totalQuantity}</span></p>
        <p className="mt-1 flex justify-between"><span className="font-semibold text-ink-900/60">Total Amount</span><span className="font-extrabold text-ink-950">{formatINR(totalAmount)}</span></p>
      </div>

      <button
        type="submit"
        disabled={!meetsMinimum}
        className={`mt-5 w-full cursor-pointer rounded-2xl px-6 py-4 text-sm font-extrabold text-white transition-all duration-300 ${
          meetsMinimum
            ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-[0_14px_32px_rgba(31,143,88,0.4)] hover:-translate-y-0.5 active:scale-[0.98]'
            : 'cursor-not-allowed bg-ink-900/15'
        }`}
      >
        {meetsMinimum ? 'Review Order' : `Minimum order is ${minOrder} bottles`}
      </button>
    </form>
  )
}