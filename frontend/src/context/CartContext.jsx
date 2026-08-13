import gsap from 'gsap'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getProduct } from '../data/products'
import { boxSizeOf } from '../data/business'
import { useSiteData } from './SiteDataContext'

const CartContext = createContext(null)

const STORAGE_KEY = 'rajesh-water-cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((it) => ({ ...it, id: String(it.id) }))
      .filter((it) => getProduct(it.id))
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { settings } = useSiteData()
  const [items, setItems] = useState(loadCart)
  const [isOpen, setIsOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState(0)
  const cartIconRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable — cart still works in memory */
    }
  }, [items])

  const addItem = useCallback((productId, quantity = 1, overrides = {}) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.id === productId)
      if (existing) {
        return prev.map((it) =>
          it.id === productId
            ? {
                ...it,
                quantity: it.quantity + quantity,
                ...(overrides.price != null ? { price: overrides.price } : {}),
                ...(overrides.label ? { label: overrides.label } : {}),
              }
            : it,
        )
      }
      const product = getProduct(productId)
      if (!product) return prev
      return [
        ...prev,
        {
          id: productId,
          quantity,
          price: overrides.price ?? product.price,
          label: overrides.label ?? product.label,
        },
      ]
    })
    setLastAdded(Date.now())
  }, [])

  const setQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      prev
        .map((it) => (it.id === productId ? { ...it, quantity: Math.max(0, quantity) } : it))
        .filter((it) => it.quantity > 0),
    )
  }, [])

  const increment = useCallback((productId, amount) => {
    const step = amount ?? boxSizeOf(getProduct(productId))
    setItems((prev) =>
      prev.map((it) =>
        it.id === productId ? { ...it, quantity: it.quantity + step } : it,
      ),
    )
  }, [])

  const decrement = useCallback((productId, amount) => {
    const step = amount ?? boxSizeOf(getProduct(productId))
    setItems((prev) =>
      prev.map((it) =>
        it.id === productId
          ? { ...it, quantity: Math.max(step, it.quantity - step) }
          : it,
      ),
    )
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((it) => it.id !== productId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const totalQuantity = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity, 0),
    [items],
  )
  const totalAmount = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity * it.price, 0),
    [items],
  )
  const meetsMinimum = totalQuantity >= (settings?.minOrder ?? 48)

  /**
   * Fly animation: small copy of the product image travels from a position
   * to the cart icon in the navbar.
   */
  const flyToCart = useCallback((fromRect, imageSrc) => {
    const target = typeof document !== 'undefined'
      ? document.querySelector('[data-cart-target]')
      : null
    if (!target || !fromRect || !imageSrc) return

    const toRect = target.getBoundingClientRect()
    const el = document.createElement('img')
    el.src = imageSrc
    el.alt = ''
    el.style.position = 'fixed'
    el.style.left = '0'
    el.style.top = '0'
    el.style.width = `${fromRect.width}px`
    el.style.height = `${fromRect.height}px`
    el.style.objectFit = 'contain'
    el.style.borderRadius = '18px'
    el.style.zIndex = '9999'
    el.style.pointerEvents = 'none'
    el.style.willChange = 'transform, opacity'
    document.body.appendChild(el)

    gsap.fromTo(
      el,
      { x: fromRect.left, y: fromRect.top, opacity: 1, scale: 1 },
      {
        x: toRect.left + toRect.width / 2 - fromRect.width / 2,
        y: toRect.top + toRect.height / 2 - fromRect.height / 2,
        scale: 0.18,
        opacity: 0.75,
        duration: 0.75,
        ease: 'power2.inOut',
        onComplete: () => el.remove(),
      },
    )

    const badge = document.querySelector('[data-cart-badge]')
    if (badge) {
      gsap.fromTo(
        badge,
        { scale: 1 },
        { scale: 1.45, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' },
      )
    }
  }, [])

  const value = useMemo(
    () => ({
      items,
      addItem,
      setQuantity,
      increment,
      decrement,
      removeItem,
      clearCart,
      isOpen,
      openCart,
      closeCart,
      totalQuantity,
      totalAmount,
      meetsMinimum,
      lastAdded,
      flyToCart,
      cartIconRef,
    }),
    [
      items,
      addItem,
      setQuantity,
      increment,
      decrement,
      removeItem,
      clearCart,
      isOpen,
      openCart,
      closeCart,
      totalQuantity,
      totalAmount,
      meetsMinimum,
      lastAdded,
      flyToCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}