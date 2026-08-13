import { Router } from 'express'
import bcrypt from 'bcryptjs'

import {
  Admin,
  Order,
  Product,
  getSettings,
  setSettings,
} from './models.js'
import { requireAuth, signToken } from './auth.js'

const router = Router()

/* ---------- helpers ---------- */

const orderFields = { __v: 0 }

const validateOrder = (body) => {
  const { customer, products, totalQuantity, totalAmount } = body ?? {}
  if (!customer?.name?.trim()) return 'Customer name is required'
  if (!customer?.mobile || !/^\d{6,15}$/.test(String(customer.mobile).replace(/\D/g, '')))
    return 'Valid customer mobile number is required'
  if (!customer?.address?.trim()) return 'Delivery address is required'
  if (!Array.isArray(products) || products.length === 0) return 'Order must have products'
  if (!Number.isFinite(totalQuantity) || totalQuantity <= 0) return 'Order quantity is invalid'
  if (!Number.isFinite(totalAmount) || totalAmount < 0) return 'Order amount is invalid'
  return null
}

export const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled']

/* ---------- public: storefront ---------- */

router.get('/site', async (req, res) => {
  try {
    const [settings, products] = await Promise.all([
      getSettings(),
      Product.find({ enabled: true })
        .select('id label price unit image stock')
        .lean(),
    ])
    res.json({ settings, products })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/orders', async (req, res) => {
  const err = validateOrder(req.body)
  if (err) return res.status(400).json({ error: err })
  try {
    const { customer, products, totalQuantity, totalAmount, message } = req.body
    const order = await Order.create({
      orderId: `RW-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`,
      customer: {
        name: customer.name.trim(),
        mobile: String(customer.mobile).replace(/\D/g, ''),
        address: customer.address.trim(),
        city: customer.city || '',
        message: message || customer.message || '',
      },
      products,
      totalQuantity,
      totalAmount,
      status: 'pending',
      source: 'website',
    })
    res.status(201).json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

/* ---------- auth (admin only) ---------- */

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }
  const admin = await Admin.findOne({ username: String(username).trim() })
  if (!admin || !(await bcrypt.compare(String(password), admin.passwordHash))) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }
  res.json({ token: signToken(admin), admin: { username: admin.username } })
})

router.get('/auth/me', requireAuth, (req, res) => {
  res.json({ admin: { username: req.admin.username } })
})

/* ---------- dashboard stats (admin only) ---------- */

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(startOfDay.getTime() - 6 * 86400000)

    const counters = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          bottles: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'confirmed', 'delivered']] },
                '$totalQuantity',
                0,
              ],
            },
          },
          sales: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'confirmed', 'delivered']] },
                '$totalAmount',
                0,
              ],
            },
          },
          todayOrders: {
            $sum: { $cond: [{ $gte: ['$createdAt', startOfDay] }, 1, 0] },
          },
          todaySales: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$createdAt', startOfDay] },
                    { $in: ['$status', ['pending', 'confirmed', 'delivered']] },
                  ],
                },
                '$totalAmount',
                0,
              ],
            },
          },
        },
      },
    ])

    const dayDocs = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $project: {
          day: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' },
          },
          amount: '$totalAmount',
          cancelled: { $eq: ['$status', 'cancelled'] },
        },
      },
      {
        $group: {
          _id: '$day',
          orders: { $sum: 1 },
          sales: { $sum: { $cond: ['$cancelled', 0, '$amount'] } },
        },
      },
    ])
    const dayMap = new Map(dayDocs.map((d) => [d._id, d]))

    const chart = []
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(startOfDay.getTime() - i * 86400000)
      const key = d.toISOString().slice(0, 10)
      const entry = dayMap.get(key)
      chart.push({
        date: key,
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        orders: entry?.orders ?? 0,
        sales: entry?.sales ?? 0,
      })
    }

    const c = counters[0] ?? {}
    res.json({
      todayOrders: c.todayOrders ?? 0,
      todaySales: c.todaySales ?? 0,
      totalOrders: c.totalOrders ?? 0,
      pendingOrders: c.pending ?? 0,
      confirmedOrders: c.confirmed ?? 0,
      completedOrders: c.delivered ?? 0,
      cancelledOrders: c.cancelled ?? 0,
      totalBottlesSold: c.bottles ?? 0,
      totalSales: c.sales ?? 0,
      chart,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ---------- orders (admin only) ---------- */

router.get('/orders', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500)
    const orders = await Order.find({}, orderFields)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/orders/:id', requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id, orderFields).lean()
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/orders/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body ?? {}
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' })
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true },
    ).select(orderFields)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/orders/:id', requireAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ---------- products (admin only) ---------- */

router.get('/products', requireAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ price: 1 }).lean()
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/products', requireAuth, async (req, res) => {
  try {
    const { id, label, price, unit, image, enabled, stock } = req.body ?? {}
    if (!id || !String(id).trim()) return res.status(400).json({ error: 'Product id is required' })
    if (!label || !String(label).trim()) return res.status(400).json({ error: 'Product label is required' })
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' })
    }
    const exists = await Product.findOne({ id: String(id).trim() })
    if (exists) return res.status(409).json({ error: 'A product with this id already exists' })
    const product = await Product.create({
      id: String(id).trim(),
      label: String(label).trim(),
      price: Math.round(price * 100) / 100,
      unit: String(unit || 'per bottle'),
      image: typeof image === 'string' && image.length <= 8_000_000 ? image : '',
      enabled: enabled !== false,
      stock: Number.isFinite(stock) && stock >= 0 ? Math.round(stock) : 999,
    })
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/products/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/products/:id', requireAuth, async (req, res) => {
  try {
    const { label, unit, price, image, enabled, stock } = req.body ?? {}
    const patch = {}
    if (typeof label === 'string' && label.trim()) {
      patch.label = label.trim()
    }
    if (typeof unit === 'string' && unit.trim()) {
      patch.unit = unit.trim()
    }
    if (price != null) {
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ error: 'Price must be a positive number' })
      }
      patch.price = Math.round(price * 100) / 100
    }
    if (typeof image === 'string' && image.length > 0) {
      if (image.length > 8_000_000) {
        return res.status(400).json({ error: 'Image is too large' })
      }
      patch.image = image
    }
    if (typeof enabled === 'boolean') patch.enabled = enabled
    if (stock != null) {
      if (!Number.isFinite(stock) || stock < 0) {
        return res.status(400).json({ error: 'Stock must be a positive number' })
      }
      patch.stock = Math.round(stock)
    }
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: patch },
      { new: true },
    )
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ---------- customers (admin only) ---------- */

router.get('/customers', requireAuth, async (req, res) => {
  try {
    const customers = await Order.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$customer.mobile',
          name: { $first: '$customer.name' },
          mobile: { $first: '$customer.mobile' },
          address: { $first: '$customer.address' },
          city: { $first: '$customer.city' },
          totalOrders: { $sum: 1 },
          totalBottles: { $sum: '$totalQuantity' },
          lastOrderAt: { $first: '$createdAt' },
        },
      },
      { $sort: { lastOrderAt: -1 } },
    ])
    res.json(customers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/customers/:mobile/orders', requireAuth, async (req, res) => {
  try {
    const mobile = String(req.params.mobile || '').replace(/\D/g, '')
    const orders = await Order.find({ 'customer.mobile': mobile }, orderFields)
      .sort({ createdAt: -1 })
      .lean()
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ---------- settings (admin only) ---------- */

router.get('/settings', requireAuth, async (req, res) => {
  try {
    res.json(await getSettings())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/settings', requireAuth, async (req, res) => {
  try {
    res.json(await setSettings(req.body ?? {}))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router