import { useCallback, useEffect, useState } from 'react'
import { FaPhone, FaWhatsapp } from 'react-icons/fa6'

import { formatINR } from '../../data/business'
import { api } from '../../utils/api'
import { Card, EmptyState, ErrorState, Modal, Spinner, StatusBadge } from './ui'

const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function WhatsAppOrders() {
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .get('/orders?limit=300')
      .then((data) =>
        setOrders((Array.isArray(data) ? data : []).filter((o) => o.source === 'website')),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  if (loading) return <Spinner label="Loading WhatsApp orders…" />
  if (error && !orders) return <ErrorState message={error} onRetry={load} />

  return (
    <>
      <Card
        title="WhatsApp orders"
        description="Every order placed through the website — chat with the customer or call them directly."
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
            title="No website orders yet"
            message="When customers place an order on the website it will show up here with WhatsApp and call buttons."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-[11px] font-bold tracking-wide text-ink-900/50 uppercase">
                  <th className="py-3 pr-4">Order ID</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Mobile</th>
                  <th className="py-3 pr-4">Bottles</th>
                  <th className="py-3 pr-4 text-right">Amount</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Contact</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    className="cursor-pointer border-b border-brand-50 transition-colors hover:bg-brand-50/40"
                    onClick={() => setSelected(o)}
                  >
                    <td className="py-3.5 pr-4 font-bold whitespace-nowrap text-brand-700">
                      {o.orderId}
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-ink-950">{o.customer.name}</td>
                    <td className="py-3.5 pr-4 whitespace-nowrap text-ink-900/70">
                      {o.customer.mobile}
                    </td>
                    <td className="py-3.5 pr-4 font-bold text-ink-950 tabular-nums">
                      {o.totalQuantity}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-bold text-brand-600 tabular-nums">
                      {formatINR(o.totalAmount)}
                    </td>
                    <td className="py-3.5 pr-4 text-xs whitespace-nowrap text-ink-900/50">
                      {fmtDate(o.createdAt)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3.5 text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`https://wa.me/91${o.customer.mobile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open WhatsApp chat with customer"
                          className="grid h-9 w-9 place-items-center rounded-xl bg-[#25D366] text-white shadow-md transition-transform hover:-translate-y-0.5"
                        >
                          <FaWhatsapp />
                        </a>
                        <a
                          href={`tel:+91${o.customer.mobile}`}
                          title="Call customer"
                          className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-r from-brand-500 to-aqua-500 text-white shadow-md transition-transform hover:-translate-y-0.5"
                        >
                          <FaPhone className="text-sm" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <Modal title={`Order ${selected.orderId}`} onClose={() => setSelected(null)} wide>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-50/50 p-4">
              <p className="text-[11px] font-bold tracking-wide text-ink-900/45 uppercase">Address</p>
              <p className="mt-1 font-extrabold text-ink-950">{selected.customer.name}</p>
              <p className="text-sm text-ink-900/65">
                {selected.customer.mobile}
                {selected.customer.city && ` · ${selected.customer.city}`}
              </p>
              <p className="mt-1 text-sm text-ink-900/65">{selected.customer.address}</p>
              {selected.customer.message && (
                <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs text-ink-900/70 italic">
                  “{selected.customer.message}”
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-aqua-50/50 p-4">
              <p className="text-[11px] font-bold tracking-wide text-ink-900/45 uppercase">Order</p>
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
                <span>Status</span>
                <StatusBadge status={selected.status} />
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/91${selected.customer.mobile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              <FaWhatsapp /> Open WhatsApp
            </a>
            <a
              href={`tel:+91${selected.customer.mobile}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-aqua-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              <FaPhone /> Call Customer
            </a>
          </div>
        </Modal>
      )}
    </>
  )
}