import { BUSINESS, boxSizeOf, formatINR } from '../data/business'

/**
 * Build the WhatsApp order message text.
 * @param {{ name: string, mobile: string, address: string, city: string, message: string }} customer
 * @param {{ products: Array<{ label: string, quantity: number, price: number, boxSize?: number }> }} order
 */
export function buildOrderMessage(customer, order) {
  const boxes = order.products.reduce(
    (acc, p) => acc + Math.floor(p.quantity / boxSizeOf({ boxSize: p.boxSize })),
    0,
  )
  const extras = order.products.reduce(
    (acc, p) => acc + (p.quantity % boxSizeOf({ boxSize: p.boxSize })),
    0,
  )
  const boxLine =
    extras > 0 ? `${boxes} boxes + ${extras} bottles` : `${boxes} boxes`

  const lines = [
    `Hello ${BUSINESS.name},`,
    '',
    'I want to place a water bottle order.',
    '',
    `Customer Name: ${customer.name}`,
    `Mobile: ${customer.mobile}`,
    `Address: ${customer.address}`,
    `City: ${customer.city || '—'}`,
    customer.message ? `Message: ${customer.message}` : null,
    '',
    'Order:',
    ...order.products.map((p) => `${p.label} - ${p.quantity} bottles`),
    '',
    `Total Bottles: ${order.totalQuantity} (${boxLine})`,
    '',
    `Total Amount: ${formatINR(order.totalAmount)}`,
    '',
    'Please confirm my order.',
  ]
    .filter((line) => line !== null)
    .join('\n')

  return lines
}

/** Open WhatsApp with a pre-filled message. */
export function openWhatsApp(message, number) {
  const digits = (number || BUSINESS.whatsappNumber).replace(/\D/g, '')
  const link = `https://wa.me/91${digits}`
  const text = encodeURIComponent(message)
  window.open(`${link}?text=${text}`, '_blank', 'noopener')
}