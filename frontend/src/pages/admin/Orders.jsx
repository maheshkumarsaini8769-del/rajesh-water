import { useCallback, useEffect, useState } from 'react'
import { FaTrashCan } from 'react-icons/fa6'

import { formatINR } from '../../data/business'
import { api } from '../../utils/api'
import {
  Card,
  EmptyState,
  ErrorState,
  Modal,
  Spinner,
  StatusBadge,
  STATUS_LABELS,
} from './ui'

const STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled']

const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function Orders() {
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .get('/orders')
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const changeStatus = (id, status) => {
    setBusyId(id)
    api
      .patch(`/orders/${id}`, { status })
      .then((updated) => {
        setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: updated.status } : o)))
        if (selected?._id === id) setSelected((s) => ({ ...s, status: updated.status }))
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusyId(null))
  }

  const removeOrder = (id) => {
    setBusyId(id)
    api
      .del(`/orders/${id}`)
      .then(() => {
        setOrders((prev) => prev.filter((o) => o._id !== id))
        if (selected?._id === id) setSelected(null)
        setConfirmDelete(null)
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusyId(null))
  }

  if (loading) return <Spinner label="Loading ordersâ€¦" />
  if (error && !orders) return <ErrorState message={error} onRetry={load} />

  return (
    <Card
      title="Orders"
      description={`${orders?.length ?? 0} orders â€” newest first`}
      actions={
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-brand-100 bg-white px-4 py-2 text-xs font-bold text-ink-900/55 transition-colors hover:text-brand-700"
        >
          Refresh
        </button>
      }
    >
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Orders placed through the website will appear here automatically."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-[11px] font-bold tracking-wide text-ink-900/50 uppercase">
                <th className="py-3 pr-4">Order ID</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Mobile</th>
                <th className="py-3 pr-4">Address</th>
                <th className="py-3 pr-4">Products</th>
                <th className="py-3 pr-4 text-right">Bottles</th>
                <th className="py-3 pr-4 text-right">Amount</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-brand-50 transition-colors hover:bg-brand-50/40"
                >
                  <td className="py-3 pr-4 font-bold whitespace-nowrap text-brand-700">
                    {order.orderId}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-ink-950">
                    {order.customer.name}
                    {order.source === 'website' && (
                      <span className="ml-1.5 rounded-full bg-aqua-50 px-1.5 py-0.5 text-[10px] font-bold text-aqua-700">
                        web
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-ink-900/70">
                    {order.customer.mobile}
                  </td>
                  <td className="max-w-[180px] truncate py-3 pr-4 text-ink-900/60">
                    {order.customer.address}
                  </td>
                  <td className="max-w-[180px] truncate py-3 pr-4 text-ink-900/60">
                    {order.products.map((p) => p.label).join(', ')}
                  </td>
                  <td className="py-3 pr-4 text-right font-bold text-ink-950 tabular-nums">
                    {order.totalQuantity}
                  </td>
                  <td className="py-3 pr-4 text-right font-bold text-brand-600 tabular-nums">
                    {formatINR(order.totalAmount)}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-xs text-ink-900/50">
                    {fmtDate(order.createdAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={order.status}
                      disabled={busyId === order._id}
                      onChange={(e) => changeStatus(order._id, e.target.value)}
                      className={`cursor-pointer rounded-lg border px-2 py-1.5 text-xs font-bold outline-none disabled:opacity-60 ${
                        {
                          pending: 'border-amber-200 bg-amber-50 text-amber-700',
                          confirmed: 'border-aqua-200 bg-aqua-50 text-aqua-700',
                          delivered: 'border-brand-200 bg-brand-50 text-brand-700',
                          cancelled: 'border-red-200 bg-red-50 text-red-600',
                        }[order.status]
                      }`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelected(order)}
                        className="cursor-pointer rounded-lg border border-brand-100 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        disabled={busyId === order._id}
                        onClick={() => {
                          if (confirmDelete === order._id) removeOrder(order._id)
                          else {
                            setConfirmDelete(order._id)
                            setTimeout(() => setConfirmDelete((c) => (c === order._id ? null : c)), 2500)
                          }
                        }}
                        className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60 ${
                          confirmDelete === order._id
                            ? 'bg-red-500 text-white'
                            : 'border border-brand-100 bg-white text-ink-900/45 hover:text-red-500'
                        }`}
                      >
                        <FaTrashCan />
                        {confirmDelete === order._id ? 'Confirm?' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal title={`Order ${selected.orderId}`} onClose={() => setSelected(null)} wide>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={selected.status} />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-900/45">Change status:</span>
                <select
                  value={selected.status}
                  onChange={(e) => changeStatus(selected._id, e.target.value)}
                  className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-bold outline-none ${
                    {
                      pending: 'border-amber-200 bg-amber-50 text-amber-700',
                      confirmed: 'border-aqua-200 bg-aqua-50 text-aqua-700',
                      delivered: 'border-brand-200 bg-brand-50 text-brand-700',
                      cancelled: 'border-red-200 bg-red-50 text-red-600',
                    }[selected.status]
                  }`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-brand-50/50 p-4">
                <p className="text-[11px] font-bold tracking-wide text-ink-900/45 uppercase">Customer</p>
                <p className="mt-1 font-extrabold text-ink-950">{selected.customer.name}</p>
                <p className="text-sm text-ink-900/65">
                  {selected.customer.mobile}
                  {selected.customer.city && ` Â· ${selected.customer.city}`}
                </p>
                <p className="mt-1 text-sm text-ink-900/65">{selected.customer.address}</p>
                {selected.customer.message && (
                  <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs text-ink-900/70 italic">
                    â€œ{selected.customer.message}â€
                  </p>
                )}
              </div>
              <div className="rounded-2xl bg-aqua-50/50 p-4">
                <p className="text-[11px] font-bold tracking-wide text-ink-900/45 uppercase">Summary</p>
                <p className="mt-3 flex justify-between text-sm text-ink-900/70">
                  <span>Placed</span>
                  <span className="font-semibold">{fmtDate(selected.createdAt)}</span>
                </p>
                <p className="mt-1.5 flex justify-between text-sm text-ink-900/70">
                  <span>Total bottles</span>
                  <span className="font-semibold">{selected.totalQuantity}</span>
                </p>
                <p className="mt-1.5 flex justify-between text-sm text-ink-900/70">
                  <span>Total amount</span>
                  <span className="font-bold text-brand-600">{formatINR(selected.totalAmount)}</span>
                </p>
                <p className="mt-1.5 flex justify-between text-sm text-ink-900/70">
                  <span>Source</span>
                  <span className="font-semibold capitalize">{selected.source}</span>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-brand-100">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-brand-50/60 text-[11px] font-bold tracking-wide text-ink-900/50 uppercase">
                    <th className="px-4 py-2.5">Product</th>
                    <th className="px-4 py-2.5 text-right">Price</th>
                    <th className="px-4 py-2.5 text-right">Qty</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.products.map((p, i) => (
                    <tr key={`${p.id}-${i}`} className="border-t border-brand-50">
                      <td className="px-4 py-2.5 font-semibold text-ink-950">{p.label}</td>
                      <td className="px-4 py-2.5 text-right text-ink-900/60">{formatINR(p.price)}</td>
                      <td className="px-4 py-2.5 text-right text-ink-900/60">{p.quantity}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-ink-950">
                        {formatINR((p.price || 0) * (p.quantity || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (confirmDelete === selected._id) {
                    removeOrder(selected._id)
                  } else {
                    setConfirmDelete(selected._id)
                  }
                }}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                  confirmDelete === selected._id
                    ? 'bg-red-500 text-white'
                    : 'border border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                }`}
              >
                <FaTrashCan />
                {confirmDelete === selected._id ? 'Click again to confirm delete' : 'Delete order'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  )
}