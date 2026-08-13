import { useCallback, useEffect, useState } from 'react'
import { FaCircleCheck, FaCircleXmark, FaPlus, FaPen, FaTrashCan } from 'react-icons/fa6'

import { api } from '../../utils/api'
import { fileToDataUrl } from '../../utils/imageUpload'
import { Card, ErrorState, Spinner, inputClass } from './ui'

export default function Products() {
  const [products, setProducts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const fail = (e) => {
    setError(e.message)
    setTimeout(() => setError(null), 5000)
  }

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .get('/products')
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((e) => fail(e))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const startEdit = (p) => {
    setEditingId(p._id)
    setDraft({ label: p.label, price: p.price, unit: p.unit, image: p.image, stock: p.stock })
  }

  const save = (product) => {
    setBusy(true)
    const patch = {}
    if (typeof draft.label === 'string' && draft.label.trim()) {
      patch.label = draft.label.trim()
    }
    if (typeof draft.unit === 'string' && draft.unit.trim()) {
      patch.unit = draft.unit.trim()
    }
    if (draft.price != null && Number.isFinite(Number(draft.price))) {
      patch.price = Math.round(Number(draft.price) * 100) / 100
    }
    if (draft.stock != null && Number.isFinite(Number(draft.stock))) {
      patch.stock = Math.round(Number(draft.stock))
    }
    if (typeof draft.image === 'string' && draft.image.length > 0) {
      patch.image = draft.image
    }
    api
      .put(`/products/${product.id}`, patch)
      .then((updated) => {
        setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
        setEditingId(null)
        notify(`${product.label} updated`)
      })
      .catch((e) => fail(e))
      .finally(() => setBusy(false))
  }

  const toggleEnabled = (product) => {
    api
      .put(`/products/${product.id}`, { enabled: !product.enabled })
      .then((updated) => {
        setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
        notify(updated.enabled ? `${updated.label} enabled` : `${updated.label} disabled`)
      })
      .catch((e) => fail(e))
  }

  const addProduct = () => {
    setBusy(true)
    api
      .post('/products', {
        id: `bottle-${Date.now().toString(36)}`,
        label: 'NEW PRODUCT',
        price: 0,
        unit: 'per bottle',
        image: '',
        enabled: true,
        stock: 999,
      })
      .then((created) => {
        setProducts((prev) => [...prev, created])
        notify(`${created.label} added`)
        startEdit(created)
        setBusy(false)
      })
      .catch((e) => fail(e))
  }

  const deleteProduct = (product) => {
    setBusy(true)
    api
      .del(`/products/${product.id}`)
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== product.id))
        setConfirmDelete(null)
        if (editingId === product._id) setEditingId(null)
        notify(`${product.label} deleted`)
      })
      .catch((e) => fail(e))
      .finally(() => setBusy(false))
  }

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const url = await fileToDataUrl(file)
      setDraft((d) => ({ ...d, image: url }))
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  if (loading) return <Spinner label="Loading products…" />
  if (error && !products) return <ErrorState message={error} onRetry={load} />

  return (
    <>
      <Card
        title="Products"
        description="Bottle sizes — price, image, availability and stock. Add new sizes anytime."
        actions={
          <button
            type="button"
            onClick={addProduct}
            disabled={busy}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(31,143,88,0.3)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
          >
            <FaPlus /> Add product
          </button>
        }
      >
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-500">
            {error}
          </p>
        )}
        <div className="space-y-4">
          {products.map((p) => {
            const editing = editingId === p._id
            const previewImage = editing && draft?.image ? draft.image : p.image
            return (
              <article
                key={p._id}
                className={`flex flex-col gap-5 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center ${
                  editing ? 'border-brand-300 bg-brand-50/50' : 'border-brand-100 bg-brand-50/30'
                } ${!p.enabled && !editing ? 'opacity-55' : ''}`}
              >
                <img
                  src={previewImage}
                  alt={p.label}
                  className={`h-16 w-16 shrink-0 rounded-xl border bg-white object-cover ${
                    editing && draft?.image && draft.image !== p.image
                      ? 'border-brand-400 ring-2 ring-brand-100'
                      : 'border-brand-100'
                  }`}
                />
                <div className="w-40 shrink-0">
                  <p className="text-base font-extrabold tracking-tight text-ink-950">{p.label}</p>
                  <p className="text-xs text-ink-900/50">{p.unit} · id: {p.id}</p>
                  <p className="mt-1 text-xs font-bold text-ink-900/55">
                    Stock: {p.stock} bottles
                  </p>
                </div>

                {editing ? (
                  <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold tracking-wide text-ink-900/55 uppercase">Label</span>
                      <input
                        type="text"
                        value={draft.label ?? p.label}
                        onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold tracking-wide text-ink-900/55 uppercase">Price (₹)</span>
                      <input
                        type="number"
                        min="0"
                        value={draft.price}
                        onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold tracking-wide text-ink-900/55 uppercase">Stock</span>
                      <input
                        type="number"
                        min="0"
                        value={draft.stock}
                        onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                    <label className="block sm:col-span-2 lg:col-span-1">
                      <span className="mb-1 block text-[11px] font-bold tracking-wide text-ink-900/55 uppercase">Unit</span>
                      <input
                        type="text"
                        value={draft.unit ?? p.unit}
                        onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                    <label className="block sm:col-span-2 lg:col-span-2">
                      <span className="mb-1 block text-[11px] font-bold tracking-wide text-ink-900/55 uppercase">Image URL</span>
                      <input
                        type="text"
                        value={draft.image}
                        placeholder="https://… or upload"
                        onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
                        className={inputClass}
                      />
                    </label>
                    <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
                      <button
                        type="button"
                        onClick={() => document.getElementById(`file-${p._id}`)?.click()}
                        disabled={busy}
                        className="cursor-pointer rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
                      >
                        {busy ? 'Processing…' : 'Upload image'}
                      </button>
                      <input
                        id={`file-${p._id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFile}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => save(p)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(31,143,88,0.3)] transition-all hover:-translate-y-0.5 disabled:opacity-50"
                      >
                        <FaCircleCheck /> Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="cursor-pointer rounded-xl border border-brand-100 px-4 py-2.5 text-xs font-bold text-ink-900/50 hover:text-ink-950"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-between gap-3">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs font-bold tracking-wide text-ink-900/45 uppercase">Price</p>
                        <p className="text-lg font-extrabold text-brand-600">
                          ₹{p.price}
                          <span className="ml-1 text-[11px] font-medium text-ink-900/45">{p.unit}</span>
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${
                          p.enabled
                            ? 'border-brand-200 bg-brand-50 text-brand-700'
                            : 'border-red-200 bg-red-50 text-red-500'
                        }`}
                      >
                        {p.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleEnabled(p)}
                        className="cursor-pointer rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-xs font-bold text-ink-900/60 transition-colors hover:text-brand-700"
                      >
                        {p.enabled ? (
                          <span className="inline-flex items-center gap-1.5"><FaCircleXmark /> Disable</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5"><FaCircleCheck /> Enable</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(31,143,88,0.3)] transition-all hover:-translate-y-0.5"
                      >
                        <FaPen /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (confirmDelete === p.id) deleteProduct(p)
                          else {
                            setConfirmDelete(p.id)
                            setTimeout(() => setConfirmDelete((c) => (c === p.id ? null : c)), 2500)
                          }
                        }}
                        className={`inline-flex cursor-pointer items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors disabled:opacity-60 ${
                          confirmDelete === p.id
                            ? 'bg-red-500 text-white'
                            : 'border border-brand-100 bg-white text-ink-900/45 hover:text-red-500'
                        }`}
                      >
                        <FaTrashCan />
                        {confirmDelete === p.id ? 'Confirm?' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </Card>

      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </>
  )
}