import { useCallback, useEffect, useState } from 'react'
import {
  FaBottleWater,
  FaChartLine,
  FaCircleCheck,
  FaClock,
  FaHourglassHalf,
  FaIndianRupeeSign,
} from 'react-icons/fa6'

import { formatINR } from '../../data/business'
import { api } from '../../utils/api'
import { Card, EmptyState, ErrorState, Spinner } from './ui'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .get('/dashboard')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  if (loading) return <Spinner label="Loading dashboardâ€¦" />
  if (error) return <ErrorState message={error} onRetry={load} />

  const stats = [
    { icon: FaClock, label: "Today's orders", value: data.todayOrders, color: 'from-aqua-500 to-aqua-600' },
    { icon: FaIndianRupeeSign, label: "Today's sales", value: formatINR(data.todaySales), color: 'from-brand-500 to-brand-600' },
    { icon: FaHourglassHalf, label: 'Pending orders', value: data.pendingOrders, color: 'from-amber-400 to-amber-500' },
    { icon: FaCircleCheck, label: 'Completed orders', value: data.completedOrders, color: 'from-brand-600 to-brand-700' },
    { icon: FaBottleWater, label: 'Total orders', value: data.totalOrders, color: 'from-ink-900 to-ink-950' },
    { icon: FaBottleWater, label: 'Total bottles sold', value: data.totalBottlesSold, color: 'from-aqua-600 to-aqua-700' },
  ]

  const maxOrders = Math.max(1, ...data.chart.map((d) => d.orders))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <article
            key={s.label}
            className="flex items-center gap-4 rounded-3xl border border-brand-100 bg-white/85 p-5 shadow-[0_10px_30px_rgba(20,75,51,0.06)] backdrop-blur"
          >
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}
            >
              <s.icon className="text-lg" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xl font-extrabold tracking-tight text-ink-950">
                {s.value}
              </p>
              <p className="text-xs font-bold tracking-wide text-ink-900/50 uppercase">
                {s.label}
              </p>
            </div>
          </article>
        ))}
      </div>

      <Card
        title="Last 7 days"
        description="Orders and sales per day"
        actions={
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-900/45">
            <FaChartLine className="text-brand-500" /> Sales Â· Orders
          </span>
        }
      >
        {data.chart.length === 0 ? (
          <EmptyState title="No data yet" message="Orders will appear here once customers place them." />
        ) : (
          <div className="flex h-48 items-end gap-3 sm:gap-5">
            {data.chart.map((day) => (
              <div key={day.date} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex h-36 w-full items-end justify-center gap-1">
                  {/* sales bar */}
                  <div
                    className="w-1/3 rounded-t-md bg-gradient-to-t from-aqua-500 to-aqua-300 transition-all duration-300 group-hover:from-aqua-600"
                    style={{ height: `${Math.min(100, (day.sales / Math.max(1, data.todaySales || 1)) * 100)}%` }}
                    title={`Sales: ${formatINR(day.sales)}`}
                  />
                  {/* orders bar */}
                  <div
                    className="w-1/3 rounded-t-md bg-gradient-to-t from-brand-500 to-brand-300 transition-all duration-300 group-hover:from-brand-600"
                    style={{ height: `${(day.orders / maxOrders) * 100}%` }}
                    title={`Orders: ${day.orders}`}
                  />
                  <div className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-ink-950 px-2 py-1 text-[10px] font-bold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {day.orders} orders Â· {formatINR(day.sales)}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-ink-900/50">{day.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-4 text-[11px] font-bold text-ink-900/50">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Orders
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-aqua-500" /> Sales
          </span>
        </div>
      </Card>
    </div>
  )
}