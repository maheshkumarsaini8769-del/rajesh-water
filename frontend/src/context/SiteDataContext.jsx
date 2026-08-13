import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { BUSINESS } from '../data/business'
import { products as localProducts } from '../data/products'

const SiteDataContext = createContext(null)

const FALLBACK = {
  businessName: BUSINESS.name,
  whatsappNumber: BUSINESS.whatsappNumber,
  contactNumber: BUSINESS.whatsappNumber,
  deliveryMessage: 'Fresh delivery for homes, offices, shops & events',
  minOrder: BUSINESS.minOrder,
  heroImage: '',
}

/**
 * Loads site configuration (settings + enabled products) from the backend.
 * If the backend is unreachable the site keeps working with built-in defaults.
 */
export function SiteDataProvider({ children }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (typeof fetch !== 'function') {
      setError(new Error('fetch unavailable'))
      return undefined
    }
    fetch('/api/site')
      .then((res) => {
        if (!res.ok) throw new Error(`Backend error (${res.status})`)
        return res.json()
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((e) => {
        if (!cancelled) setError(e)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => {
    const settings = { ...FALLBACK, ...(data?.settings ?? {}) }
    const remoteProducts = data?.products?.length ? data.products : null
    const products = remoteProducts
      ? remoteProducts.map((p) => {
          const local = localProducts.find((lp) => lp.id === p.id)
          return local ? { ...local, ...p } : p
        })
      : localProducts
    return {
      ready: data != null || error != null,
      error: error ? { message: error.message } : null,
      settings,
      products,
      waLink: (number) =>
        number ? `https://wa.me/91${String(number).replace(/\D/g, '')}` : '#',
      telLink: (number) =>
        number ? `tel:+91${String(number).replace(/\D/g, '')}` : '#',
    }
  }, [data, error])

  return (
    <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
  )
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext)
  if (!ctx) throw new Error('useSiteData must be used inside <SiteDataProvider>')
  return ctx
}