import cors from 'cors'
import crypto from 'crypto'
import express from 'express'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'

try {
  process.loadEnvFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '.env'))
} catch {
  /* .env not present — fall back to defaults / process env */
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist')

const PORT = Number(process.env.PORT || 4000)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const MONGODB_URI = process.env.MONGODB_URI || ''

const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')

const DEFAULT_SETTINGS = {
  businessName: 'RAJESH WATER',
  whatsappNumber: '7742735762',
  contactNumber: '7742735762',
  deliveryMessage: 'Fresh delivery for homes, offices, shops & events',
  minOrder: 48,
  heroImage: '',
}

/* ------------------------------ Mongo models ------------------------------ */

const SettingsModel = mongoose.model(
  'Settings',
  new mongoose.Schema(
    { key: { type: String, required: true }, value: mongoose.Schema.Types.Mixed },
    { collection: 'settings' },
  ),
)
const ProductModel = mongoose.model(
  'Product',
  new mongoose.Schema({ _id: String }, { strict: false, collection: 'products' }),
)
const OrderModel = mongoose.model(
  'Order',
  new mongoose.Schema({ _id: String }, { strict: false, collection: 'orders' }),
)

let mongoConnected = false

/* ----------------------------- file fallbacks ----------------------------- */

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(file, value) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8')
  fs.renameSync(tmp, file)
}

/* -------------------------------- live data ------------------------------- */

let settings = null
let products = []
let orders = []
let orderCounter = 1000

function refreshOrderCounter() {
  const max = orders.reduce((m, o) => {
    const n = Number(String(o.orderId || '').replace(/\D/g, ''))
    return Number.isFinite(n) && n > m ? n : m
  }, 1000)
  orderCounter = Math.max(orderCounter, max)
}

function saveSettings(next) {
  settings = { ...DEFAULT_SETTINGS, ...(next ?? {}) }
  writeJson(SETTINGS_FILE, settings)
  if (mongoConnected) {
    SettingsModel.replaceOne({ key: 'main' }, { key: 'main', value: settings }, { upsert: true }).catch((e) => console.error('mongo settings save failed:', e.message))
  }
}

function saveProducts(next) {
  products = Array.isArray(next) ? next : []
  writeJson(PRODUCTS_FILE, products)
  if (mongoConnected) {
    const docs = products.map((p) => {
      const { _id, ...rest } = p
      return { replaceOne: { filter: { _id: p._id ?? p.id }, replacement: { ...rest, id: p.id }, upsert: true } }
    })
    const ids = products.map((p) => p._id ?? p.id)
    docs.push({ deleteMany: { filter: { _id: { $nin: ids } } } })
    ProductModel.bulkWrite(docs).catch((e) => console.error('mongo products save failed:', e.message))
  }
}

function saveOrders(next) {
  orders = Array.isArray(next) ? next : []
  writeJson(ORDERS_FILE, orders)
  refreshOrderCounter()
  if (mongoConnected) {
    const docs = orders.map((o) => {
      const { _id, ...rest } = o
      return { replaceOne: { filter: { _id: o._id }, replacement: rest, upsert: true } }
    })
    const ids = orders.map((o) => o._id)
    docs.push({ deleteMany: { filter: { _id: { $nin: ids } } } })
    OrderModel.bulkWrite(docs).catch((e) => console.error('mongo orders save failed:', e.message))
  }
}

/* --------------------------------- startup -------------------------------- */

async function connectMongo() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set — running in file-only mode')
    return
  }
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
    mongoConnected = true
    console.log('✔️  Mongo connected')

    const mSettings = await SettingsModel.findOne({ key: 'main' }).lean()
    const mProducts = await ProductModel.find().lean()
    const mOrders = await OrderModel.find().lean()

    settings = mSettings ? { ...DEFAULT_SETTINGS, ...(mSettings.value ?? {}) } : null
    products = mProducts.map((p) => {
      const { _id, __v, ...rest } = p
      return { _id, id: rest.id ?? _id, ...rest }
    })
    orders = mOrders.map((o) => {
      const { _id, __v, ...rest } = o
      return { _id, ...rest }
    })

    if (!settings && fs.existsSync(SETTINGS_FILE)) {
      settings = readJson(SETTINGS_FILE, DEFAULT_SETTINGS)
      await SettingsModel.replaceOne({ key: 'main' }, { key: 'main', value: settings }, { upsert: true })
    }
    if (products.length === 0 && fs.existsSync(PRODUCTS_FILE)) {
      products = readJson(PRODUCTS_FILE, [])
      await saveProducts(products)
    }
    if (orders.length === 0 && fs.existsSync(ORDERS_FILE)) {
      orders = readJson(ORDERS_FILE, [])
      await saveOrders(orders)
    }
  } catch (e) {
    console.error('Mongo connection failed — running file-only mode:', e.message)
  }
  if (!settings) settings = readJson(SETTINGS_FILE, DEFAULT_SETTINGS)
  if (Array.isArray(products) && products.length === 0) products = readJson(PRODUCTS_FILE, [])
  if (Array.isArray(orders) && orders.length === 0) orders = readJson(ORDERS_FILE, [])
  refreshOrderCounter()
}

/* ---------------------------------- auth ---------------------------------- */

const sessions = new Map()

function issueToken() {
  const token = crypto.randomBytes(24).toString('hex')
  sessions.set(token, { username: ADMIN_USERNAME, expires: Date.now() + 24 * 60 * 60 * 1000 })
  return token
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const session = sessions.get(token)
  if (!session || session.expires < Date.now()) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  req.admin = session
  return next()
}

/* ------------------------------- Truecaller ------------------------------- */

const TC_PARTNER_KEY = process.env.TRUECALLER_APP_KEY || ''
const TC_PARTNER_NAME = process.env.TRUECALLER_PARTNER_NAME || 'Rajesh Water'
const TC_ADMIN_PHONE = String(process.env.TRUECALLER_ADMIN_PHONE || '').replace(/\D/g, '')
const TC_CTA_COLOR = process.env.TRUECALLER_CTA_COLOR || '1f8f58'
const tcRequests = new Map()
const TC_TTL = 10 * 60 * 1000

function tcCleanup() {
  const now = Date.now()
  for (const [id, entry] of tcRequests) {
    if (now - entry.createdAt > TC_TTL) entry.status = 'expired'
  }
}

function dayKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function newOrderId() {
  orderCounter += 1
  return `RW-${String(orderCounter).padStart(4, '0')}`
}

/* ---------------------------------- app ----------------------------------- */

const app = express()
app.use(cors())
app.use(express.json({ limit: '8mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (_req, res) => res.json({ ok: true, db: mongoConnected ? 'connected' : 'file-only' }))

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body ?? {}
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' })
  }
  res.json({ token: issueToken(), admin: { username: ADMIN_USERNAME } })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ admin: { username: req.admin.username } })
})

app.get('/api/auth/truecaller/config', (_req, res) => {
  res.json({
    enabled: Boolean(TC_PARTNER_KEY),
    partnerKey: TC_PARTNER_KEY,
    partnerName: TC_PARTNER_NAME,
    ctaColor: TC_CTA_COLOR,
  })
})

app.get('/api/auth/truecaller/start', (_req, res) => {
  tcCleanup()
  if (!TC_PARTNER_KEY) return res.status(400).json({ error: 'Truecaller not configured' })
  const requestId = crypto.randomBytes(16).toString('hex')
  tcRequests.set(requestId, { createdAt: Date.now(), status: 'pending' })
  res.json({ requestId })
})

app.post('/api/auth/truecaller/callback', async (req, res) => {
  const body = req.body ?? {}
  const requestId = String(body.requestId || '')
  const entry = tcRequests.get(requestId)
  if (!entry) return res.status(400).json({ error: 'Unknown requestId' })
  res.setTimeout(2800)
  if (body.status === 'user_rejected') {
    entry.status = 'user_rejected'
    return res.json({ ok: true })
  }
  const accessToken = String(body.accessToken || '')
  const endpoint = String(body.endpoint || '')
  if (!accessToken || !endpoint) return res.status(400).json({ error: 'Missing accessToken or endpoint' })
  try {
    const r = await fetch(endpoint, { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(2500) })
    const profile = r.ok ? await r.json() : null
    const phone = String((profile?.phoneNumbers?.[0] || '').replace(/\D/g, ''))
    const first = profile?.name?.first || ''
    const last = profile?.name?.last || ''
    entry.phone = phone
    entry.name = [first, last].filter(Boolean).join(' ').trim()
    entry.status = 'verified'
  } catch (e) {
    entry.status = 'failed'
    console.error('Truecaller profile fetch failed:', e.message)
  }
  res.json({ ok: true })
})

app.get('/api/auth/truecaller/status', (req, res) => {
  const entry = tcRequests.get(String(req.query.requestId || ''))
  if (!entry) return res.json({ status: 'unknown' })
  res.json({
    status: entry.status,
    phone: entry.phone || '',
    name: entry.name || '',
    isAdmin: entry.status === 'verified' && Boolean(TC_ADMIN_PHONE) && entry.phone === TC_ADMIN_PHONE,
  })
})

app.post('/api/auth/truecaller/verify', (req, res) => {
  const entry = tcRequests.get(String(req.body?.requestId || ''))
  if (!entry || entry.status !== 'verified') {
    return res.status(400).json({ error: 'Verification not completed' })
  }
  if (TC_ADMIN_PHONE && entry.phone === TC_ADMIN_PHONE) {
    res.json({ token: issueToken(), admin: { username: ADMIN_USERNAME }, phone: entry.phone, name: entry.name, isAdmin: true })
  } else {
    res.json({ phone: entry.phone, name: entry.name, isAdmin: false })
  }
})

app.get('/api/site', (_req, res) => {
  const enabled = products.filter((p) => p.enabled !== false)
  res.json({ settings, products: enabled })
})

app.get('/api/settings', requireAuth, (_req, res) => res.json(settings))

app.put('/api/settings', requireAuth, (req, res) => {
  const body = req.body ?? {}
  const next = {
    businessName: typeof body.businessName === 'string' ? body.businessName.trim() : settings.businessName,
    whatsappNumber: typeof body.whatsappNumber === 'string' ? body.whatsappNumber.replace(/\D/g, '') : settings.whatsappNumber,
    contactNumber: typeof body.contactNumber === 'string' ? body.contactNumber.replace(/\D/g, '') : settings.contactNumber,
    deliveryMessage: typeof body.deliveryMessage === 'string' ? body.deliveryMessage.trim() : settings.deliveryMessage,
    minOrder: Number.isFinite(Number(body.minOrder)) ? Math.max(1, Math.round(Number(body.minOrder))) : settings.minOrder,
    heroImage: typeof body.heroImage === 'string' ? body.heroImage.trim() : settings.heroImage,
  }
  saveSettings(next)
  res.json(settings)
})

app.get('/api/products', requireAuth, (_req, res) => res.json(products))

app.post('/api/products', requireAuth, (req, res) => {
  const body = req.body ?? {}
  const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : `bottle-${crypto.randomBytes(4).toString('hex')}`
  const product = {
    _id: id,
    id,
    label: typeof body.label === 'string' ? body.label.trim() : 'NEW PRODUCT',
    price: Number.isFinite(Number(body.price)) ? Math.round(Number(body.price) * 100) / 100 : 0,
    unit: typeof body.unit === 'string' ? body.unit.trim() : 'per bottle',
    image: typeof body.image === 'string' ? body.image : '',
    stock: Number.isFinite(Number(body.stock)) ? Math.round(Number(body.stock)) : 999,
    enabled: body.enabled !== false,
  }
  const next = [...products, product]
  saveProducts(next)
  res.status(201).json(product)
})

app.put('/api/products/:id', requireAuth, (req, res) => {
  const body = req.body ?? {}
  let found = null
  const next = products.map((p) => {
    if (p.id !== req.params.id && p._id !== req.params.id) return p
    found = p
    return {
      ...p,
      label: typeof body.label === 'string' && body.label.trim() ? body.label.trim() : p.label,
      price: Number.isFinite(Number(body.price)) ? Math.round(Number(body.price) * 100) / 100 : p.price,
      unit: typeof body.unit === 'string' && body.unit.trim() ? body.unit.trim() : p.unit,
      image: typeof body.image === 'string' ? body.image : p.image,
      stock: Number.isFinite(Number(body.stock)) ? Math.round(Number(body.stock)) : p.stock,
      enabled: typeof body.enabled === 'boolean' ? body.enabled : p.enabled,
    }
  })
  if (!found) return res.status(404).json({ error: 'Product not found' })
  saveProducts(next)
  const updated = next.find((p) => p._id === found._id)
  res.json(updated)
})

app.delete('/api/products/:id', requireAuth, (req, res) => {
  const next = products.filter((p) => p.id !== req.params.id && p._id !== req.params.id)
  if (next.length === products.length) return res.status(404).json({ error: 'Product not found' })
  saveProducts(next)
  res.json({ ok: true })
})

app.get('/api/orders', requireAuth, (req, res) => {
  const limit = Math.min(500, Number(req.query.limit) || 100)
  res.json([...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit))
})

app.post('/api/orders', (req, res) => {
  const body = req.body ?? {}
  const customer = body.customer ?? {}
  const items = Array.isArray(body.products) ? body.products : []
  const totalQuantity = Number.isFinite(Number(body.totalQuantity)) ? Number(body.totalQuantity) : items.reduce((s, it) => s + Number(it.quantity || 0), 0)
  const totalAmount = Number.isFinite(Number(body.totalAmount)) ? Number(body.totalAmount) : 0

  const order = {
    _id: crypto.randomUUID(),
    orderId: newOrderId(),
    customer: {
      name: String(customer.name || '').trim(),
      mobile: String(customer.mobile || '').replace(/\D/g, ''),
      address: String(customer.address || '').trim(),
      city: String(customer.city || '').trim(),
      message: String(customer.message || '').trim(),
    },
    products: items.map((it) => ({
      id: String(it.id ?? ''),
      label: String(it.label ?? ''),
      quantity: Number(it.quantity) || 0,
      price: Number(it.price) || 0,
    })),
    totalQuantity,
    totalAmount: Math.round(totalAmount * 100) / 100,
    source: 'website',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  if (!order.customer.name || !order.customer.mobile || !order.customer.address) {
    return res.status(400).json({ error: 'Customer details are required' })
  }

  const next = [...orders, order]
  saveOrders(next)
  res.status(201).json(order)
})

app.patch('/api/orders/:id', requireAuth, (req, res) => {
  const status = req.body?.status
  if (!['pending', 'confirmed', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  let found = null
  const next = orders.map((o) => {
    if (o._id !== req.params.id) return o
    found = o
    return { ...o, status }
  })
  if (!found) return res.status(404).json({ error: 'Order not found' })
  saveOrders(next)
  res.json(next.find((o) => o._id === req.params.id))
})

app.delete('/api/orders/:id', requireAuth, (req, res) => {
  const next = orders.filter((o) => o._id !== req.params.id)
  if (next.length === orders.length) return res.status(404).json({ error: 'Order not found' })
  saveOrders(next)
  res.json({ ok: true })
})

app.get('/api/customers', requireAuth, (_req, res) => {
  const byMobile = new Map()
  for (const o of orders) {
    const mobile = o.customer?.mobile
    if (!mobile) continue
    const has = byMobile.has(mobile)
    const entry = has ? byMobile.get(mobile) : { _id: mobile, totalOrders: 0, totalBottles: 0 }
    entry.name = has ? entry.name : o.customer.name
    entry.mobile = mobile
    entry.address = has ? entry.address : (o.customer.address || '')
    entry.city = has ? entry.city : (o.customer.city || '')
    entry.totalOrders += 1
    entry.totalBottles += Number(o.totalQuantity) || 0
    if (!has || new Date(o.createdAt) > new Date(entry.lastOrderAt)) {
      entry.lastOrderAt = o.createdAt
    }
    byMobile.set(mobile, entry)
  }
  res.json(
    [...byMobile.values()].sort((a, b) => new Date(b.lastOrderAt) - new Date(a.lastOrderAt)),
  )
})

app.get('/api/customers/:mobile/orders', requireAuth, (req, res) => {
  const mobile = req.params.mobile.replace(/\D/g, '')
  const list = orders
    .filter((o) => String(o.customer?.mobile || '').replace(/\D/g, '') === mobile)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json(list)
})

app.get('/api/dashboard', requireAuth, (_req, res) => {
  const now = new Date()
  const today = dayKey(now)
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push({
      date: dayKey(d),
      label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      orders: 0,
      sales: 0,
    })
  }

  let todayOrders = 0
  let todaySales = 0
  let pendingOrders = 0
  let completedOrders = 0
  let totalBottlesSold = 0

  for (const o of orders) {
    const key = dayKey(o.createdAt)
    const slot = days.find((d) => d.date === key)
    if (slot) {
      slot.orders += 1
      slot.sales += Number(o.totalAmount) || 0
    }
    if (key === today) {
      todayOrders += 1
      todaySales += Number(o.totalAmount) || 0
    }
    if (o.status === 'pending') pendingOrders += 1
    if (o.status === 'delivered') completedOrders += 1
    totalBottlesSold += Number(o.totalQuantity) || 0
  }

  res.json({
    todayOrders,
    todaySales: Math.round(todaySales * 100) / 100,
    pendingOrders,
    completedOrders,
    totalOrders: orders.length,
    totalBottlesSold,
    chart: days,
  })
})

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'))
  })
}

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Rajesh Water backend running on http://localhost:${PORT}`)
    console.log(`Admin login: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`)
  })
})