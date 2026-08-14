import { useCallback, useEffect, useState } from 'react'
import {
  FaBars,
  FaBottleWater,
  FaCircleUser,
  FaClipboardList,
  FaEnvelope,
  FaGaugeHigh,
  FaLockOpen,
  FaRightFromBracket,
  FaUsers,
  FaWhatsapp,
  FaXmark,
} from 'react-icons/fa6'

import { api, getToken, setToken, API_BASE } from '../utils/api'
import { androidNote, beginTruecaller, isAndroid, pollTruecaller } from '../utils/truecaller'
import AdminBackground from './admin/Background'
import Customers from './admin/Customers'
import Dashboard from './admin/Dashboard'
import Orders from './admin/Orders'
import Products from './admin/Products'
import Settings from './admin/Settings'
import WhatsAppOrders from './admin/WhatsAppOrders'
import { Spinner } from './admin/ui'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: FaGaugeHigh },
  { id: 'orders', label: 'Orders', icon: FaClipboardList },
  { id: 'products', label: 'Products', icon: FaBottleWater },
  { id: 'customers', label: 'Customers', icon: FaUsers },
  { id: 'whatsapp', label: 'WhatsApp Orders', icon: FaWhatsapp },
  { id: 'settings', label: 'Settings', icon: FaEnvelope },
]

const TAB_IDS = TABS.map((t) => t.id)

function tabFromHash() {
  if (typeof window === 'undefined') return 'dashboard'
  const part = (window.location.hash || '').split('/').pop()
  return TAB_IDS.includes(part) ? part : 'dashboard'
}

const PAGE_TITLES = Object.fromEntries(TABS.map((t) => [t.id, t.label]))

function LoginGate({ onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [tcAdminPhone, setTcAdminPhone] = useState('')

  useEffect(() => {
    api
      .get('/auth/truecaller/config')
      .then((cfg) => setTcAdminPhone(String(cfg.adminPhone || '').replace(/\D/g, '')))
      .catch(() => {})
  }, [])

  const submit = (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    api
      .post('/auth/login', { password })
      .then((res) => {
        setToken(res.token)
        onUnlock(res.admin)
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false))
  }

  const tcLogin = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const { available, requestId, config } = await beginTruecaller(`${API_BASE}/api`)
      if (!available) {
        setError(
          config && config.enabled === false
            ? 'Truecaller login is not configured yet. Use the password for now.'
            : 'Open this page on an Android phone with the Truecaller app installed.'
        )
        setBusy(false)
        return
      }
      pollTruecaller({
        base: `${API_BASE}/api`,
        requestId,
        onResult: async (result) => {
          setBusy(false)
          if (result.status === 'verified') {
            if (result.isAdmin) {
              try {
                const v = await api.post('/auth/truecaller/verify', { requestId })
                setToken(v.token)
                onUnlock(v.admin)
              } catch (err) {
                setError(err.message)
              }
            } else {
              setError(`Number +91 ${result.phone} is not an authorized admin number.`)
            }
          } else if (result.status === 'user_rejected') {
            setError('Verification cancelled in Truecaller.')
          } else if (result.status === 'timeout') {
            setError('Verification timed out. Please try again.')
          } else {
            setError('Verification could not be completed. Try again.')
          }
        },
      })
    } catch (err) {
      setBusy(false)
      setError(err.message)
    }
  }

  return (
    <div className="relative grid min-h-svh place-items-center px-4 py-10">
      <AdminBackground />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-sm rounded-3xl border border-brand-100 bg-white/85 p-8 shadow-[0_24px_60px_rgba(20,75,51,0.12)] backdrop-blur"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-aqua-500 text-white shadow-[0_8px_22px_rgba(31,143,88,0.35)]">
          <FaLockOpen className="text-2xl" />
        </span>
        <h1 className="mt-5 text-center text-2xl font-extrabold tracking-tight text-ink-950">
          Admin Panel
        </h1>
        <p className="mt-1 text-center text-sm text-ink-900/55">
          Sign in to manage orders, products and customers.
        </p>

        <label className="mt-6 block">
          <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-900/70 uppercase">
            Password
          </span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink-950 shadow-sm outline-none transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {error && (
          <p className="mt-2 text-center text-xs font-bold text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full cursor-pointer rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(31,143,88,0.32)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        {isAndroid() && (
          <div className="mt-3">
            <button
              type="button"
              onClick={tcLogin}
              disabled={busy}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-brand-500 bg-white py-3 text-sm font-bold text-brand-600 transition-all duration-200 hover:bg-brand-50 disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6h.01M12 10v4M12 14v.01" />
                <rect x="9.5" y="6" width="5" height="9" rx="1" />
                <path d="M9 5.5h6" />
              </svg>
              {busy ? 'Waiting for Truecaller…' : 'Login with Truecaller'}
            </button>
            <p className="mt-1.5 text-center text-[11px] font-semibold text-ink-900/45">
              {androidNote()}
              {tcAdminPhone ? ` Your number must be +91 ${tcAdminPhone}.` : ''}
            </p>
          </div>
        )}

        <a
          href="#/"
          className="mt-4 block text-center text-xs font-bold text-ink-900/45 transition-colors hover:text-brand-600"
        >
          ← Back to website
        </a>
      </form>
    </div>
  )
}

export default function Admin() {
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState(tabFromHash)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onHash = () => {
      const next = tabFromHash()
      setTab((prev) => (prev === next ? prev : next))
      setMenuOpen(false)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const goTab = (id) => {
    setTab(id)
    setMenuOpen(false)
    if (typeof window !== 'undefined') {
      window.location.hash = `#/admin/${id}`
    }
  }

  const verifySession = useCallback(() => {
    if (!getToken()) {
      setChecking(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => setAdmin(res.admin))
      .catch(() => setToken(''))
      .finally(() => setChecking(false))
  }, [])

  useEffect(verifySession, [verifySession])

  const logout = () => {
    setToken('')
    setAdmin(null)
    setTab('dashboard')
  }

  if (checking) {
    return (
      <div className="relative grid min-h-svh place-items-center">
        <AdminBackground />
        <Spinner label="Checking session…" />
      </div>
    )
  }

  if (!admin) return <LoginGate onUnlock={(a) => setAdmin(a)} />

  const sidebar = (
    <nav className="space-y-1.5">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => goTab(t.id)}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
            tab === t.id
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_8px_20px_rgba(31,143,88,0.3)]'
              : 'text-ink-900/60 hover:bg-white/70 hover:text-brand-700'
          }`}
        >
          <t.icon className={tab === t.id ? 'text-sm' : 'text-sm text-ink-900/40'} />
          {t.label}
        </button>
      ))}
    </nav>
  )

  return (
    <div className="relative min-h-svh">
      <AdminBackground />

      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-brand-100 bg-white/80 p-4 backdrop-blur lg:flex">
        <a href="#/" className="flex items-center gap-2.5 p-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-aqua-500 text-white shadow-[0_6px_18px_rgba(31,143,88,0.35)]">
            <FaBottleWater className="text-lg" />
          </span>
          <span>
            <span className="block text-base leading-tight font-extrabold tracking-tight text-ink-950">
              RAJESH <span className="text-brand-600">WATER</span>
            </span>
            <span className="block text-[10px] font-bold tracking-[0.25em] text-brand-600/70 uppercase">
              Admin Panel
            </span>
          </span>
        </a>
        <div className="mt-8 flex-1 overflow-y-auto">{sidebar}</div>
        <button
          type="button"
          onClick={logout}
          className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink-900/55 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <FaRightFromBracket className="text-sm" /> Logout
        </button>
      </aside>

      {/* Mobile sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 space-y-6 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <a href="#/" className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-aqua-500 text-white">
                  <FaBottleWater className="text-lg" />
                </span>
                <span className="text-base font-extrabold tracking-tight text-ink-950">
                  RAJESH <span className="text-brand-600">WATER</span>
                </span>
              </a>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink-900/50 hover:bg-brand-50"
              >
                <FaXmark />
              </button>
            </div>
            {sidebar}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                logout()
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink-900/55 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <FaRightFromBracket className="text-sm" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="relative z-10 min-h-svh lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/85 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-brand-100 bg-white text-ink-900/60 lg:hidden"
              >
                <FaBars />
              </button>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-ink-950">
                  {PAGE_TITLES[tab]}
                </h1>
                <p className="hidden text-[11px] font-bold tracking-wide text-ink-900/40 uppercase sm:block">
                  Admin Panel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="hidden items-center gap-2 rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-xs font-bold text-ink-900/70 sm:inline-flex">
                <FaCircleUser className="text-brand-500" />
                {admin.username}
              </span>
              <a
                href="#/"
                className="hidden rounded-xl border border-brand-100 bg-white px-4 py-2 text-xs font-bold text-ink-900/60 transition-colors hover:text-brand-700 sm:block"
              >
                View website
              </a>
              <button
                type="button"
                onClick={logout}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-ink-950 px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                <FaRightFromBracket className="text-xs" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'orders' && <Orders />}
          {tab === 'products' && <Products />}
          {tab === 'customers' && <Customers />}
          {tab === 'whatsapp' && <WhatsAppOrders />}
          {tab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}