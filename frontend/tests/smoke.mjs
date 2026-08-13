/**
 * Smoke test — renders the real app in jsdom, drives the cart and checkout
 * flows with real clicks, and asserts expected behavior.
 * Run with: node tests/smoke.mjs
 */
import { JSDOM } from 'jsdom'
import { createRoot } from 'react-dom/client'
import React from 'react'

process.env.NODE_ENV = 'test'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:4173/',
  pretendToBeVisual: true,
})

globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.localStorage = dom.window.localStorage
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
globalThis.requestIdleCallback = dom.window.requestIdleCallback || ((cb) => setTimeout(cb, 0))
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window)
const mq = (query) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
})
dom.window.matchMedia = mq
globalThis.matchMedia = mq
globalThis.Node = dom.window.Node
globalThis.Element = dom.window.Element
globalThis.HTMLElement = dom.window.HTMLElement

// Fake layout metrics so GSAP ScrollTrigger has stable values.
Object.defineProperty(dom.window.HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value() {
    return { top: 0, left: 0, right: 800, bottom: 100, width: 100, height: 100, x: 0, y: 0 }
  },
})

const results = []
const check = (name, ok) => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const click = (el) => el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
/**
 * jsdom synthetic Events don't reach React 19.2 listeners in this setup
 * (clicks do, text-input events don't). To still exercise the checkout state
 * logic end-to-end, we call the component's own onChange handler from the
 * fiber props — the same code path a real keystroke takes.
 */
const type = (el, value) => {
  el.value = value
  const propsKey = Object.getOwnPropertyNames(el).find((k) => k.startsWith('__reactProps'))
  if (!propsKey) return
  const props = el[propsKey]
  if (typeof props.onChange === 'function') {
    props.onChange({ target: { value } })
  }
}
const $$ = (sel) => [...document.querySelectorAll(sel)]

const { default: App } = await import('../src/App.jsx')

const root = createRoot(document.getElementById('root'))
root.render(React.createElement(App))
await sleep(800)

const body = document.body.innerHTML
check('hero heading', body.includes('Pure Water.'))
check('hero sub', body.includes('Quality drinking water delivered to your doorstep.'))
check('order now CTA', body.includes('Order Now'))
check('view bottles CTA', body.includes('View Bottles'))
check('product heading', body.includes('Choose Your Bottle'))
check('4 product cards', $$('[data-reveal-group-item]').length === 4)
check('about section', body.includes('Fresh water, delivered to your door'))
check('contact section', body.includes('Order in seconds, delivered fresh'))
check('footer', body.includes('RAJESH WATER') && body.includes('All rights reserved'))
check('floating whatsapp tooltip', body.includes('Order on WhatsApp'))
check('floating call tooltip', body.includes('Call Us'))
check('wa link', body.includes('https://wa.me/917742735762'))
check('tel link', body.includes('tel:+917742735762'))

// --- Add to cart (500 ML card starts at 48 bottles = 4 boxes) ---
const addButtons = $$('button').filter((b) => b.textContent.includes('Add to Cart'))
check('add-to-cart buttons present', addButtons.length === 4)

// --- 200 ML box rules: min 78, +78 per press, box price line ---
const ml200Card = document.querySelectorAll('[data-reveal-group-item]')[0]
check('200ml card starts at 78', ml200Card.querySelector('.tabular-nums')?.textContent.trim() === '78')
check('200ml box price line', ml200Card.textContent.includes('₹78 / box (78 bottles)'))
const ml200Plus = [...ml200Card.querySelectorAll('button')].find(
  (b) => (b.getAttribute('aria-label') || '').includes('Increase'),
)
const ml200Minus = [...ml200Card.querySelectorAll('button')].find(
  (b) => (b.getAttribute('aria-label') || '').includes('Decrease'),
)
click(ml200Plus)
await sleep(30)
check('200ml plus adds 78 (78 -> 156)', ml200Card.querySelector('.tabular-nums')?.textContent.trim() === '156')
click(ml200Minus)
await sleep(30)
check('200ml minus steps back by 78', ml200Card.querySelector('.tabular-nums')?.textContent.trim() === '78')
check('500ml card starts at 48', document.querySelectorAll('[data-reveal-group-item]')[1].querySelector('.tabular-nums')?.textContent.trim() === '48')

// Re-query after the card interactions (React may have swapped nodes)
const addButtons2 = $$('button').filter((b) => b.textContent.includes('Add to Cart'))
check('add-to-cart buttons still present', addButtons2.length === 4)

// Add 500 ML at its default 48 bottles (4 boxes)
await sleep(200)
click(addButtons2[1])
await sleep(400)
let badge = document.querySelector('[data-cart-badge]')
check('cart badge shows 48', badge && badge.textContent.trim() === '48')
const stored = JSON.parse(localStorage.getItem('rajesh-water-cart') || '[]')
check('cart persisted to localStorage', stored.length === 1 && stored[0].quantity === 48)

// --- Open cart ---
click(document.querySelector('[data-cart-target]'))
await sleep(800)
const drawer = document.querySelector('[role="dialog"]')
check('cart drawer opens', !!drawer)
check('min order met initially', drawer.textContent.includes('Minimum order met'))

// --- Reduce below 48 via drawer minus (clamps at 1 box = 12) ---
for (let i = 0; i < 3; i += 1) {
  const drawerEl = document.querySelector('[role="dialog"]')
  const minus = [...drawerEl.querySelectorAll('button')].find(
    (b) => (b.getAttribute('aria-label') || '').includes('Decrease'),
  )
  click(minus)
  await sleep(30)
}
await sleep(600)
const drawerWarn = document.querySelector('[role="dialog"]')
check('min order warning', drawerWarn.textContent.includes('Minimum order is 48 bottles'))
check('your order progress', drawerWarn.textContent.includes('Your order: 12 / 48 bottles'))
const disabledBtn = drawerWarn.querySelector('button[disabled]')
check('checkout disabled below 48', !!(disabledBtn && disabledBtn.textContent.includes('36 more bottles')))

// --- Bump quantity to 48 via + button (one carton per press) ---
const plusButtons = $$('button').filter((b) => (b.getAttribute('aria-label') || '').includes('Increase'))
check('quantity + buttons present', plusButtons.length >= 1)
for (let i = 0; i < 3; i += 1) {
  const drawerEl = document.querySelector('[role="dialog"]')
  const plus = [...drawerEl.querySelectorAll('button')].find(
    (b) => (b.getAttribute('aria-label') || '').includes('Increase'),
  )
  click(plus)
  await sleep(30)
}
await sleep(600)
const drawer2 = document.querySelector('[role="dialog"]')
check('min order met state', drawer2.textContent.includes('Minimum order met'))
check('success check on min', drawer2.textContent.includes('✓'))
check('boxes shown in cart', drawer2.textContent.includes('4 Boxes') && drawer2.textContent.includes('(48 Bottles)'))

// --- Go to checkout ---
const checkoutBtn = $$('button').find((b) => b.textContent.includes('Checkout & Order'))
check('checkout enabled at 48', !!checkoutBtn)
click(checkoutBtn)
await sleep(700)
const formDialog = document.querySelector('[role="dialog"]')
check('checkout form shown', formDialog.textContent.includes('Delivery Details'))

// --- Validate form ---
const submitBtn = $$('button').find((b) => b.textContent.includes('Review Order'))
click(submitBtn)
await sleep(300)
check('name required error', formDialog.textContent.includes('Name is required'))
check('mobile required error', formDialog.textContent.includes('Mobile number is required'))

type(document.querySelector('#co-name'), 'Rahul')
await sleep(150)
type(document.querySelector('#co-mobile'), '98765')
await sleep(150)
type(document.querySelector('#co-address'), '12 Main Road')
await sleep(150)
click(submitBtn)
await sleep(300)
check('invalid mobile error', formDialog.textContent.includes('valid 10-digit Indian mobile number'))

type(document.querySelector('#co-mobile'), '9876543210')
await sleep(150)
click(submitBtn)
await sleep(500)
const summary = document.querySelector('[role="dialog"]')
check('order summary shown', summary.textContent.includes('Order Summary'))
check('summary name', summary.textContent.includes('Rahul'))
check('summary mobile', summary.textContent.includes('9876543210'))
check('summary bottles', summary.textContent.includes('Total Bottles'))
check('summary amount', summary.textContent.includes('₹'))

// --- WhatsApp order ---
const waBtn = $$('button').find((b) => b.textContent.includes('ORDER ON WHATSAPP'))
check('whatsapp order button present', !!waBtn)
const opened = []
dom.window.open = (url) => opened.push(url)
click(waBtn)
await sleep(400)
const successEl = document.querySelector('[role="dialog"]')
check('success animation', successEl.textContent.includes('Order Ready ✓'))
check('opening whatsapp', successEl.textContent.includes('Opening WhatsApp...'))
await sleep(2000)
check('whatsapp opened with message', opened.length === 1 && opened[0].startsWith('https://wa.me/917742735762?text='))
const msg = decodeURIComponent(opened[0].split('?text=')[1])
check('message has customer name', msg.includes('Customer Name: Rahul'))
check('message has mobile', msg.includes('Mobile: 9876543210'))
check('message has order lines', msg.includes('500 ML - 48 bottles'))
check('message totals', msg.includes('Total Bottles: 48 (4 boxes)'))

// --- Persistence across remount ---
root.unmount()
const root2 = createRoot(document.getElementById('root'))
root2.render(React.createElement(App))
await sleep(400)
badge = document.querySelector('[data-cart-badge]')
check('cart restored from localStorage', badge && badge.textContent.trim() === '48')

const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
process.exit(failed ? 1 : 0)