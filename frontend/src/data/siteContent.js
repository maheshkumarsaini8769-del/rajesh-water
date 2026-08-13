/**
 * Site content — every editable string on the website lives here.
 * The admin panel (#/admin) edits these values and saves overrides to
 * localStorage. Defaults below are the base values.
 */

export const ADMIN_PASSCODE = 'admin123'

export const DEFAULT_CONTENT = {
  brand: {
    name: 'RAJESH WATER',
    highlight: 'WATER',
    tagline: 'Quality drinking water delivered to your doorstep.',
  },
  nav: {
    links: [
      { label: 'Home', href: '#home' },
      { label: 'Products', href: '#products' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  hero: {
    badge: 'Fresh & Safe Drinking Water',
    titleA: 'Pure Water.',
    titleB: 'Delivered Fresh.',
    subtitle: 'Quality drinking water delivered to your doorstep.',
    ctaPrimary: 'Order Now',
    ctaSecondary: 'View Bottles',
    sizesLine: '200 ML · 500 ML · 1 LITRE · 2 LITRE',
    image: '',
  },
  products: {
    heading: 'Choose Your Bottle',
    subtitle:
      'Pick the size you need — every order is delivered fresh and sealed. Minimum order is 50 bottles.',
    note: 'per bottle',
    items: [
      { id: 'bottle-200ml', label: '200 ML', price: 15, unit: 'per bottle', image: '' },
      { id: 'bottle-500ml', label: '500 ML', price: 25, unit: 'per bottle', image: '' },
      { id: 'bottle-1l', label: '1 LITRE', price: 45, unit: 'per bottle', image: '' },
      { id: 'bottle-2l', label: '2 LITRE', price: 80, unit: 'per bottle', image: '' },
    ],
  },
  about: {
    heading: 'Fresh water, delivered to your door',
    text1:
      'Fresh drinking water supplied directly to homes, offices, shops, events and businesses. Quality sealed bottles, right sizes, and simple WhatsApp ordering — that’s RAJESH WATER.',
    text2:
      'Order 50 or more bottles and we’ll take care of the rest — clean, safe and delivered on time.',
    cards: [
      { title: 'Homes', text: 'Regular doorstep delivery for households.' },
      { title: 'Offices', text: 'Reliable supply for offices and teams.' },
      { title: 'Shops & Events', text: 'Bulk bottles for shops, functions and events.' },
      { title: 'Businesses', text: 'Steady, quality water for your business.' },
    ],
  },
  contact: {
    heading: 'Order in seconds, delivered fresh',
    subtitle: 'Reach us on WhatsApp or call — we’ll confirm your bottle order right away.',
    whatsappNumber: '7742735762',
    orderOnline: {
      title: 'Order Online',
      text: 'Pick bottles, order in minutes',
      cta: 'Start Ordering',
    },
    deliveryInfo: {
      title: 'Delivery Info',
      text: 'Fresh delivery for homes, offices, shops & events',
      cta: '',
    },
  },
  footer: {
    tagline: 'Quality drinking water delivered to your doorstep.',
    copyright: 'All rights reserved.',
  },
}

const STORAGE_KEY = 'rajesh-water-admin-v1'

/** Deep-merge overrides onto defaults (overrides win). */
export function mergeContent(defaults, overrides) {
  if (overrides == null || typeof overrides !== 'object') return defaults
  const out = Array.isArray(defaults) ? [...defaults] : { ...defaults }
  for (const key of Object.keys(overrides)) {
    const dv = defaults?.[key]
    const ov = overrides[key]
    if (ov != null && typeof dv === 'object' && !Array.isArray(dv)) {
      out[key] = mergeContent(dv, ov)
    } else {
      out[key] = ov
    }
  }
  return out
}

export function loadContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONTENT
    return mergeContent(DEFAULT_CONTENT, JSON.parse(raw))
  } catch {
    return DEFAULT_CONTENT
  }
}

export function saveContent(content) {
  try {
    const clean = JSON.parse(JSON.stringify(content))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
    return true
  } catch {
    return false
  }
}

export function resetContent() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  return DEFAULT_CONTENT
}