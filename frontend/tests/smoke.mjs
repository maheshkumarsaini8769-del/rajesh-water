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

// --- 200 ML box rules: min 4 boxes (312 bottles), +78 per press, box price line ---
const ml200Card = document.querySelectorAll('[data-reveal-group-item]')[0]
check('200ml card starts at 4 boxes (312 bottles)', ml200Card.querySelector('.tabular-nums')?.textContent.trim() === '4')
check('200ml note 1 box = 78 bottles', ml200Card.textContent.includes('1 box = 78 bottles'))
check('200ml box price line', ml200Card.textContent.includes('₹78 / box (78 bottles)'))
check('200ml min order line', ml200Card.textContent.includes('Min 312 bottles per order'))
const ml200Plus = [...ml200Card.querySelectorAll('button')].find(
  (b) => (b.getAttribute('aria-label') || '').includes('Increase'),
)
const ml200Minus = [...ml200Card.querySelectorAll('button')].find(
  (b) => (b.getAttribute('aria-label') || '').includes('Decrease'),
)
click(ml200Plus)
await sleep(30)
check('200ml plus adds 1 box (4 -> 5)', ml200Card.querySelector('.tabular-nums')?.textContent.trim() === '5')
click(ml200Minus)
await sleep(30)
check('200ml minus steps back by 1 box', ml200Card.querySelector('.tabular-nums')?.textContent.trim() === '4')
check('500ml card starts at 4 cartons (48 bottles)', document.querySelectorAll('[data-reveal-group-item]')[1].querySelector('.tabular-nums')?.textContent.trim() === '4')
check('500ml note 1 carton = 12 bottles', document.querySelectorAll('[data-reveal-group-item]')[1].textContent.includes('1 carton = 12 bottles'))

// Re-query after the card interactions (React may have swapped nodes)
const addButtons2 = $$('button').filter((b) => b.textContent.includes('Add to Cart'))
check('add-to-cart buttons still present', addButtons2.length === 4)

// Add 500 ML at its default 48 bottles (4 boxes)
await sleep(200)
click(addButtons2[1])
await sleep(400)
let badge = document.querySelector('[data-cart-badge]')
check('cart badge shows 4 boxes', badge && badge.textContent.trim() === '4')
const stored = JSON.parse(localStorage.getItem('rajesh-water-cart') || '[]')
check('cart persisted to localStorage', stored.length === 1 && stored[0].quantity === 48)
const ml500Card = document.querySelectorAll('[data-reveal-group-item]')[1]
const ml500addBtn = [...ml500Card.querySelectorAll('button')].find(
  (b) => b.getAttribute('data-in-cart-boxes') != null,
)
check('add button shows cartons in cart', ml500addBtn && ml500addBtn.getAttribute('data-in-cart-boxes') === '4')
await sleep(1200)
const ml500countBadge = ml500addBtn?.querySelector('[data-cart-count]')
check('add button badge displays carton count', ml500countBadge && ml500countBadge.textContent.trim() === '4')

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
check('your order progress', drawerWarn.textContent.includes('Your order: 1 box') && drawerWarn.textContent.includes('Min 48 bottles'))
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
check('boxes shown in cart', drawer2.textContent.includes('4 Boxes'))

// --- Go to checkout: name + address only, then WhatsApp opens directly ---
const orderBtn = $$('button').find((b) => b.textContent.includes('Order on WhatsApp'))
check('order on whatsapp button enabled at 48', !!orderBtn && !orderBtn.disabled)
click(orderBtn)
await sleep(700)
const formDialog = document.querySelector('[role="dialog"]')
check('delivery details form shown', formDialog.textContent.includes('Delivery Details'))
check('form has name, mobile, address fields', !!document.querySelector('#co-name') && !!document.querySelector('#co-mobile') && !!document.querySelector('#co-address'))
check('no city/message fields', !document.querySelector('#co-city') && !document.querySelector('#co-message'))

// --- Validate form ---
const submitBtn = $$('button').find((b) => b.textContent.includes('Send Order on WhatsApp'))
click(submitBtn)
await sleep(300)
check('name required error', formDialog.textContent.includes('Name is required'))
check('mobile required error', formDialog.textContent.includes('Valid mobile number is required'))
check('address required error', formDialog.textContent.includes('Delivery address is required'))

type(document.querySelector('#co-name'), 'Rahul')
await sleep(150)
type(document.querySelector('#co-mobile'), '9876543210')
await sleep(150)
type(document.querySelector('#co-address'), '12 Main Road, City')
await sleep(150)
const opened = []
dom.window.open = (url) => opened.push(url)
click(submitBtn)
await sleep(400)
const successEl = document.querySelector('[role="dialog"]')
check('success animation', successEl.textContent.includes('Order Ready ✓'))
check('opening whatsapp', successEl.textContent.includes('Opening WhatsApp...'))
await sleep(300)
check('whatsapp opened with message', opened.length === 1 && opened[0].startsWith('https://wa.me/917742735762?text='))
const msg = decodeURIComponent(opened[0].split('?text=')[1])
check('message has name', msg.includes('Name: Rahul'))
check('message has address', msg.includes('Delivery Address: 12 Main Road, City'))
check('message has no mobile line', !msg.includes('Mobile:'))
check('message has order lines', msg.includes('500 ML - 48 bottles'))
check('message totals', msg.includes('Total Bottles: 48 (4 boxes)'))
check('message has amount', msg.includes('Total Amount: ₹'))

// --- Persistence across remount ---
root.unmount()
const root2 = createRoot(document.getElementById('root'))
root2.render(React.createElement(App))
await sleep(400)
badge = document.querySelector('[data-cart-badge]')
check('cart restored from localStorage', badge && badge.textContent.trim() === '4')

// --- Max 40 cartons cap on the card Add button ---
const ml200card2 = document.querySelectorAll('[data-reveal-group-item]')[0]
const ml200plus2 = [...ml200card2.querySelectorAll('button')].find(
  (b) => (b.getAttribute('aria-label') || '').includes('Increase'),
)
for (let i = 0; i < 39; i += 1) {
  click(ml200plus2)
  await sleep(5)
}
await sleep(100)
check('card stepper caps at 40 boxes', ml200card2.querySelector('.tabular-nums')?.textContent.trim() === '40')
const ml200add2 = [...ml200card2.querySelectorAll('button')].find(
  (b) => b.getAttribute('data-in-cart-boxes') != null,
)
check('add button selects 40 boxes', ml200add2.getAttribute('data-in-cart-boxes') === '0')
click(ml200add2)
await sleep(400)
const ml200addAfter = [...ml200card2.querySelectorAll('button')].find(
  (b) => b.getAttribute('data-in-cart-boxes') != null,
)
check('add button shows 40 boxes in cart', ml200addAfter && ml200addAfter.getAttribute('data-in-cart-boxes') === '40')
check('add button disabled at max', ml200addAfter && ml200addAfter.disabled === true)

// --- Cart drawer + button caps at 40 cartons and image is full bottle ---
click(document.querySelector('[data-cart-target]'))
await sleep(600)
const maxDrawer = document.querySelector('[role="dialog"]')
const ml200row = [...maxDrawer.querySelectorAll('li')].find((li) => li.textContent.includes('200 ML'))
const drawerPlus200 = [...ml200row.querySelectorAll('button')].find(
  (b) => (b.getAttribute('aria-label') || '').includes('Increase'),
)
check('cart + button disabled at 40 boxes', drawerPlus200 && drawerPlus200.disabled === true)
const cartImg = ml200row.querySelector('img')
check('cart shows full bottle image', cartImg && cartImg.className.includes('object-contain'))

// --- 200 ML cart min clamps at 4 boxes on minus ---
const drawerMinus200 = [...ml200row.querySelectorAll('button')].find(
  (b) => (b.getAttribute('aria-label') || '').includes('Decrease'),
)
for (let i = 0; i < 50; i += 1) {
  const rowEl = [...document.querySelector('[role="dialog"]').querySelectorAll('li')].find((li) => li.textContent.includes('200 ML'))
  const minus = [...rowEl.querySelectorAll('button')].find(
    (b) => (b.getAttribute('aria-label') || '').includes('Decrease'),
  )
  click(minus)
  await sleep(5)
}
await sleep(100)
const ml200rowMin = [...document.querySelector('[role="dialog"]').querySelectorAll('li')].find((li) => li.textContent.includes('200 ML'))
check('200ml cart clamps at 4 boxes', ml200rowMin.querySelector('.tabular-nums')?.textContent.trim() === '4')

const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
process.exit(failed ? 1 : 0)