import { useRef, useState } from 'react'
import { FaBagShopping, FaMinus, FaPlus } from 'react-icons/fa6'

import { formatINR, boxSizeOf, MAX_CARTONS } from '../data/business'
import { useCart } from '../context/CartContext'
import { getBottleImages } from '../utils/imageConfig'
import BottleImage from './BottleImage'

const PRIMARY = '#00aeef'
const DARK = '#00658d'
const SUCCESS = '#2eba62'

export default function ProductCard({ product, index = 0, reveal = true }) {
  const { items, addItem, flyToCart, openCart } = useCart()
  const boxSize = boxSizeOf(product)
  const minQty = Math.max(boxSize, 48)
  const [quantity, setQuantity] = useState(minQty)
  const [added, setAdded] = useState(false)
  const [hover, setHover] = useState(false)
  const imageRef = useRef(null)
  const addTimer = useRef(null)

  const packWord = boxSize > 12 ? 'box' : 'carton'
  const inCart = items.find((it) => it.id === product.id)?.quantity ?? 0
  const inCartBoxes = inCart / boxSize
  const atMax = inCartBoxes >= MAX_CARTONS

  const srcs = product.image
    ? [product.image, ...getBottleImages('bottle200', index)]
    : getBottleImages('bottle200', index)

  const handleAdd = (e) => {
    e?.preventDefault?.()
    if (atMax) return
    const img = imageRef.current?.querySelector('img')
    const rect = img?.getBoundingClientRect()

    addItem(product.id, quantity, {
      price: product.price,
      label: product.label,
    })
    if (rect && img) flyToCart(rect, img.currentSrc || img.src)

    setAdded(true)
    clearTimeout(addTimer.current)
    addTimer.current = setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article
      className="group relative flex flex-col items-center rounded-xl bg-white p-3 transition-all duration-300 hover:shadow-2xl sm:rounded-2xl sm:p-5"
      style={{ border: `1px solid ${hover ? PRIMARY : '#e2e2e2'}` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-reveal-group-item
      {...(reveal ? {} : { 'data-reveal-none': '' })}
    >
      <div
        ref={imageRef}
        className="-mt-12 relative z-10 mb-2 flex h-40 w-28 items-end justify-center pointer-events-none sm:-mt-24 sm:mb-3 sm:h-60 sm:w-40 md:-mt-32 md:h-68 md:w-48"
      >
        <BottleImage
          srcs={srcs}
          alt={`${product.label} water bottle`}
          className="h-full max-w-full w-full object-contain object-bottom drop-shadow-[0_15px_25px_rgba(0,101,141,0.28)] transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-105"
        />
      </div>

      <div className="mb-2.5 w-full space-y-0.5 text-center sm:mb-3.5 sm:space-y-1">
        <div
          className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
          style={{ color: DARK, backgroundColor: `${PRIMARY}1a` }}
        >
          {formatINR(product.price)} / bottle
        </div>
        <h3 className="pt-1 text-base leading-tight font-bold text-[#1a1c1c] sm:text-lg">
          {product.label}
        </h3>
        <p className="line-clamp-1 text-[11px] text-[#3e4850] sm:text-xs">
          Min {minQty} bottles per order
        </p>
        <div className="pt-1">
          <span className="text-base font-black sm:text-xl" style={{ color: DARK }}>
            {formatINR(product.price * boxSize)}
          </span>
          <span className="text-[11px] font-semibold text-[#6e7881]">
            {' '}
            / {packWord}
            {boxSize > 12 && ` (${boxSize} bottles)`}
          </span>
        </div>
        <p className="text-[10px] text-[#6e7881]">
          ({formatINR(product.price)}/bottle • Min {minQty} bottles)
        </p>
      </div>

      <div className="mb-2 flex w-full items-center justify-center gap-1 rounded-lg border border-[#e2e2e2] bg-white p-1">
        <button
          type="button"
          aria-label={`Decrease ${product.label} quantity`}
          onClick={() => setQuantity((q) => Math.max(minQty, q - boxSize))}
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-[#00658d] transition hover:bg-[#f3f3f4] active:scale-90"
        >
          <FaMinus className="text-[10px]" />
        </button>
        <span className="min-w-10 text-center text-sm font-extrabold text-[#1a1c1c] tabular-nums">
          {quantity / boxSize}
        </span>
        <button
          type="button"
          aria-label={`Increase ${product.label} quantity`}
          onClick={() => setQuantity((q) => Math.min(boxSize * 40, q + boxSize))}
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-white transition hover:brightness-110 active:scale-90"
          style={{ backgroundColor: PRIMARY }}
        >
          <FaPlus className="text-[10px]" />
        </button>
      </div>
      <p className="mb-3 -mt-1 text-[10px] font-semibold text-[#6e7881]">
        1 {packWord} = {boxSize} bottles
      </p>

      <div className="mt-auto w-full space-y-1.5">
        <button
          type="button"
          onClick={handleAdd}
          disabled={atMax}
          data-in-cart-boxes={inCartBoxes}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded px-2 py-2 text-[10px] font-bold tracking-wider text-white uppercase shadow-md transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:py-2.5 sm:text-xs"
          style={{ backgroundColor: PRIMARY }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = DARK
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = PRIMARY
          }}
        >
          {added ? (
            <>
              Added <span className="animate-check-pop">✓</span>
            </>
          ) : atMax ? (
            <>Max {MAX_CARTONS} {packWord}s reached</>
          ) : (
            <>
              <FaBagShopping className="h-3.5 w-3.5" />
              Add to Cart
              {inCartBoxes > 0 && (
                <span
                  data-cart-count={inCartBoxes}
                  className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1 text-[10px] font-black text-white tabular-nums"
                >
                  {inCartBoxes}
                </span>
              )}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={openCart}
          className="w-full cursor-pointer rounded py-1 text-[10px] font-semibold transition-colors sm:py-1.5 sm:text-xs"
          style={{ color: DARK, backgroundColor: '#f9f9f9' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#eeeeee'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9'
          }}
        >
          View Cart
        </button>
      </div>
    </article>
  )
}