import { useEffect, useRef, useState } from 'react'
import {
  FaBottleWater,
  FaCircleExclamation,
  FaImage,
  FaRotate,
  FaTriangleExclamation,
} from 'react-icons/fa6'

import { fileToDataUrl } from '../../utils/imageUpload'

export const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-aqua-50 text-aqua-700 border-aqua-200',
  delivered: 'bg-brand-50 text-brand-700 border-brand-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}

export const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function StatusBadge({ status }) {
  const key = STATUS_LABELS[status] ? status : 'pending'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${
        STATUS_STYLES[key]
      }`}
    >
      {STATUS_LABELS[key]}
    </span>
  )
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-900/50">
      <FaBottleWater className="animate-bounce text-2xl text-brand-400" />
      <p className="text-sm font-bold">{label}</p>
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-brand-200 bg-white/60 px-6 py-16 text-center">
      <FaCircleExclamation className="text-2xl text-brand-300" />
      <p className="text-sm font-extrabold text-ink-950">{title}</p>
      {message && <p className="max-w-sm text-xs text-ink-900/50">{message}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-red-200 bg-red-50/70 px-6 py-16 text-center">
      <FaTriangleExclamation className="text-2xl text-red-400" />
      <p className="text-sm font-extrabold text-red-600">Something went wrong</p>
      <p className="max-w-sm text-xs text-red-500/80">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <FaRotate /> Try again
        </button>
      )}
    </div>
  )
}

export function Card({ title, description, actions, children }) {
  return (
    <section className="rounded-3xl border border-brand-100 bg-white/85 p-6 shadow-[0_10px_30px_rgba(20,75,51,0.06)] backdrop-blur sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-ink-950">{title}</h3>
          {description && <p className="mt-1 text-sm text-ink-900/55">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function Modal({ title, onClose, children, wide }) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[92svh] origin-bottom overflow-y-auto rounded-t-3xl border border-brand-100 bg-white shadow-2xl sm:origin-center sm:rounded-3xl animate-modal-in ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'
        }"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-100 bg-white/95 px-6 py-4 backdrop-blur">
          <h3 className="text-base font-extrabold tracking-tight text-ink-950">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink-900/50 transition-colors hover:bg-brand-50 hover:text-ink-950"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export const inputClass =
  'w-full rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-sm text-ink-950 shadow-sm outline-none transition-all duration-200 placeholder:text-ink-900/35 focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

export function ImageInput({ label, value, onChange, hint, fallback }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      onChange(await fileToDataUrl(file))
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const showCurrent = !value && fallback

  return (
    <div>
      {label && (
        <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-900/70 uppercase">
          {label}
        </span>
      )}
      <div className="flex items-center gap-3">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-brand-100 bg-brand-50"
          title={showCurrent ? 'Current image on the website' : undefined}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : showCurrent ? (
            <img src={fallback} alt="" className="h-full w-full object-cover opacity-75" />
          ) : (
            <FaImage className="text-lg text-brand-300" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={/^https?:\/\//i.test(value ?? '') ? value : ''}
            placeholder="Paste an image URL…"
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
            >
              {busy ? 'Processing…' : 'Upload image'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="cursor-pointer rounded-lg border border-brand-100 px-3 py-1.5 text-xs font-bold text-ink-900/50 transition-colors hover:bg-brand-50 hover:text-ink-950"
              >
                Clear
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </div>
      {showCurrent && (
        <span className="mt-1 block text-[11px] font-bold text-brand-600">
          Showing the current site image — upload or paste a URL to replace it.
        </span>
      )}
      {hint && !showCurrent && (
        <span className="mt-1 block text-[11px] text-ink-900/45">{hint}</span>
      )}
    </div>
  )
}