import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaWhatsapp } from 'react-icons/fa6'

import { formatINR, cartBoxSummary, boxSizeOf } from '../data/business'
import { getProduct } from '../data/products'
import { useCart } from '../context/CartContext'
import { useSite } from '../context/SiteContext'
import { useSiteData } from '../context/SiteDataContext'
import { buildOrderMessage, openWhatsApp } from '../utils/whatsapp'
import { beginTruecaller, isAndroid, pollTruecaller } from '../utils/truecaller'
import { API_BASE } from '../utils/api'

const initial = { name: '', mobile: '', address: '' }

export default function Checkout({ onBack, onClose }) {
  const { items, totalQuantity, totalAmount, meetsMinimum, clearCart } = useCart()
  const { content } = useSite()
  const { settings } = useSiteData()
  const whatsappNumber = settings.whatsappNumber || content.contact?.whatsappNumber
  const minOrder = settings?.minOrder ?? 48
  const boxSummary = cartBoxSummary(items, (id) => boxSizeOf(getProduct(id)))
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sent
  const [saveError, setSaveError] = useState(false)
  const [tcBusy, setTcBusy] = useState(false)
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
    if (!/^\d{10,12}$/.test(form.mobile.replace(/\D/g, ''))) next.mobile = 'Valid mobile number is required'
    if (!form.address.trim()) next.address = 'Delivery address is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const tcAutofill = async () => {
    if (tcBusy) return
    setTcBusy(true)
    try {
      const { available, requestId } = await beginTruecaller(`${API_BASE}/api`)
      if (!available) {
        setTcBusy(false)
        return
      }
      pollTruecaller({
        base: `${API_BASE}/api`,
        requestId,
        onResult: (result) => {
          setTcBusy(false)
          if (result.status === 'verified' && result.phone) {
            setForm((f) => ({
              ...f,
              name: result.name && !f.name.trim() ? result.name : f.name,
              mobile: result.phone,
            }))
            setErrors((er) => ({ ...er, name: undefined, mobile: undefined }))
          }
        },
      })
    } catch {
      setTcBusy(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const message = buildOrderMessage(
      {
        name: form.name.trim(),
        mobile: form.mobile.replace(/\D/g, ''),
        address: form.address.trim(),
        city: '',
        message: '',
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
        mobile: form.mobile.replace(/\D/g, ''),
        address: form.address.trim(),
        city: '',
        message: '',
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
      fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`save failed (${res.status})`)
        })
        .catch(() => setSaveError(true))
    }

    openWhatsApp(message, whatsappNumber)
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
          onClick={() => {
            clearCart()
            onClose()
          }}
          className="mt-2 cursor-pointer rounded-2xl border border-brand-200 bg-white px-6 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
        >
          Continue Shopping
        </button>
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
        Enter your name and address, then confirm on WhatsApp.
      </p>

      <div className="mt-5 space-y-4">
        {isAndroid() && (
          <button
            type="button"
            onClick={tcAutofill}
            disabled={tcBusy}
            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-2 border-brand-500 bg-white px-4 py-3 text-sm font-bold text-brand-600 transition-all duration-200 hover:bg-brand-50 disabled:opacity-60"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            {tcBusy ? 'Waiting for Truecaller…' : 'Autofill with Truecaller'}
          </button>
        )}
        <div>
          <label htmlFor="co-name" className="mb-1.5 block text-xs font-bold text-ink-900/70">Name</label>
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
          <textarea id="co-address" rows={4} placeholder="House / street / landmark / city" value={form.address} onChange={set('address')} className={`${inputClass('address')} resize-none`} />
          {errors.address && <p className="mt-1 text-xs font-semibold text-red-500">{errors.address}</p>}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm">
        <p className="flex justify-between"><span className="font-semibold text-ink-900/60">Total Boxes</span><span className="font-bold text-brand-700">{boxSummary.boxes}{boxSummary.extra > 0 ? ` + ${boxSummary.extra} bottle${boxSummary.extra === 1 ? '' : 's'}` : ''}</span></p>
        <p className="mt-1 flex justify-between"><span className="font-semibold text-ink-900/60">Total Bottles</span><span className="font-bold text-brand-700">{totalQuantity}</span></p>
        <p className="mt-1 flex justify-between"><span className="font-semibold text-ink-900/60">Total Amount</span><span className="font-extrabold text-ink-950">{formatINR(totalAmount)}</span></p>
      </div>

      <button
        type="submit"
        disabled={!meetsMinimum}
        className={`mt-5 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-sm font-extrabold text-white transition-all duration-300 ${
          meetsMinimum
            ? 'bg-[#25D366] shadow-[0_14px_32px_rgba(37,211,102,0.4)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(37,211,102,0.5)] active:scale-[0.98]'
            : 'cursor-not-allowed bg-ink-900/15'
        }`}
      >
        <FaWhatsapp className="text-xl" />
        {meetsMinimum ? 'Send Order on WhatsApp' : `Minimum order is ${minOrder} bottles`}
      </button>
    </form>
  )
}