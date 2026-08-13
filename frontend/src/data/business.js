/** Business contact details — single source of truth. */

export const BUSINESS = {
  name: 'RAJESH WATER',
  whatsappNumber: '7742735762',
  whatsappLink: 'https://wa.me/917742735762',
  telLink: 'tel:+917742735762',
  minOrder: 48,
}

/** Bottles per box — products without an explicit boxSize use this. */
export const CARTON_SIZE = 12

export const DEFAULT_BOX_SIZE = CARTON_SIZE

/** Box size for a product (e.g. 200 ML ships 78 bottles per box). */
export const boxSizeOf = (product) => product?.boxSize || DEFAULT_BOX_SIZE

/** Split bottle count into full boxes + leftover bottles. */
export const bottlesToBoxes = (bottles, boxSize = DEFAULT_BOX_SIZE) => ({
  boxes: Math.floor(bottles / boxSize),
  extra: bottles % boxSize,
})

/**
 * Sum full boxes across cart lines. Each line may use its own box size.
 * @param {Array<{id:string, quantity:number}>} items
 * @param {(id: string) => number} sizeOf box-size lookup by product id
 */
export const cartBoxSummary = (items, sizeOf) =>
  items.reduce(
    (acc, it) => {
      const bs = sizeOf(it.id) || DEFAULT_BOX_SIZE
      const b = bottlesToBoxes(it.quantity, bs)
      return { boxes: acc.boxes + b.boxes, extra: acc.extra + b.extra }
    },
    { boxes: 0, extra: 0 },
  )

export const formatINR = (amount) =>
  `\u20B9${Number(amount || 0).toLocaleString('en-IN')}`