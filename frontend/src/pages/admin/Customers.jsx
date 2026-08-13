import { useCallback, useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa6'

import { formatINR } from '../../data/business'
import { api } from '../../utils/api'
import { Card, EmptyState, ErrorState, Modal, Spinner, StatusBadge } from './ui'

const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function Customers() {
  const [customers, setCustomers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .get('/customers')
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const openHistory = (customer) => {
    setSelected(customer)
    setHistory(null)
    setHistoryLoading(true)
    api
      .get(`/customers/${customer.mobile}/orders`)
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setHistoryLoading(false))
  }

  if (loading) return <Spinner label="Loading customersâ€¦" />
  if (error && !customers) return <ErrorState message={error} onRetry={load} />

  return (
    <>
      <Card
        title="Customers"
        description={`${customers?.length ?? 0} customers â€” click a customer to see order history`}
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
        {customers.length === 0 ? (
          <EmptyState
            title="No customers yet"
            message="Customer details are built from orders placed on the website."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-[11px] font-bold tracking-wide text-ink-900/50 uppercase">
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Mobile</th>
                  <th className="py-3 pr-4">Address</th>
                  <th className="py-3 pr-4 text-right">Total orders</th>
                  <th className="py-3 pr-4 text-right">Bottles ordered</th>
                  <th className="py-3 text-right">Last order</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => openHistory(c)}
                    className="cursor-pointer border-b border-brand-50 transition-colors hover:bg-brand-50/40"
                  >
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex items-center gap-2.5 font-semibold text-ink-950">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-100 to-aqua-100 text-brand-600">
                          <FaUser className="text-sm" />
                        </span>
                        {c.name}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 whitespace-nowrap text-ink-900/70">{c.mobile}</td>
                    <td className="max-w-[220px] truncate py-3.5 pr-4 text-ink-900/60">
                      {c.address}
                      {c.city && `, ${c.city}`}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-bold text-ink-950 tabular-nums">
                      {c.totalOrders}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-bold text-brand-600 tabular-nums">
                      {c.totalBottles}
                    </td>
                    <td className="py-3.5 text-right text-xs text-ink-900/50">
                      {fmtDate(c.lastOrderAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <Modal
          title={`${selected.name} â€” order history`}
          onClose={() => setSelected(null)}
          wide
        >
          {historyLoading ? (
            <Spinner label="Loading historyâ€¦" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-50/50 p-4">
                <p className="text-sm font-bold text-ink-950">
                  {selected.mobile}
                  <span className="ml-2 font-normal text-ink-900/50">
                    {selected.address}
                    {selected.city && `, ${selected.city}`}
                  </span>
                </p>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/91${selected.mobile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`tel:+91${selected.mobile}`}
                    className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Call
                  </a>
                </div>
              </div>
              {history.length === 0 ? (
                <EmptyState title="No orders found" />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-brand-100">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="bg-brand-50/60 text-[11px] font-bold tracking-wide text-ink-900/50 uppercase">
                        <th className="px-4 py-2.5">Order</th>
                        <th className="px-4 py-2.5">Products</th>
                        <th className="px-4 py-2.5 text-right">Bottles</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((o) => (
                        <tr key={o._id} className="border-t border-brand-50">
                          <td className="px-4 py-3 font-bold whitespace-nowrap text-brand-700">
                            {o.orderId}
                          </td>
                          <td className="max-w-[160px] truncate px-4 py-3 text-ink-900/60">
                            {o.products.map((p) => p.label).join(', ')}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-ink-950 tabular-nums">
                            {o.totalQuantity}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-brand-600 tabular-nums">
                            {formatINR(o.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap text-ink-900/50">
                            {fmtDate(o.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={o.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  )
}