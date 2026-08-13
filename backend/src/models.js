import mongoose from 'mongoose'

export const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'per bottle' },
    image: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    stock: { type: Number, default: 999 },
  },
  { timestamps: true },
)

export const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, default: '' },
      message: { type: String, default: '' },
    },
    products: [
      {
        id: String,
        label: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalQuantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
      default: 'pending',
    },
    source: {
      type: String,
      enum: ['website', 'manual'],
      default: 'website',
    },
  },
  { timestamps: true },
)

orderSchema.index({ createdAt: -1 })
orderSchema.index({ 'customer.mobile': 1 })

export const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
)

export const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
)

export const Product = mongoose.model('Product', productSchema)
export const Order = mongoose.model('Order', orderSchema)
export const Setting = mongoose.model('Setting', settingSchema)
export const Admin = mongoose.model('Admin', adminSchema)

export const DEFAULT_SETTINGS = {
  businessName: 'RAJESH WATER',
  whatsappNumber: '7742735762',
  contactNumber: '7742735762',
  deliveryMessage: 'Fresh delivery for homes, offices, shops & events',
  minOrder: 48,
  heroImage: '',
}

export const DEFAULT_PRODUCTS = [
  {
    id: 'bottle-200ml',
    label: '200 ML',
    price: 6.5,
    unit: 'per bottle',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bottle_of_Water.jpg/960px-Bottle_of_Water.jpg',
    enabled: true,
    stock: 999,
  },
  {
    id: 'bottle-500ml',
    label: '500 ML',
    price: 25,
    unit: 'per bottle',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Plastic_Water_Bottle.jpg/960px-Plastic_Water_Bottle.jpg',
    enabled: true,
    stock: 999,
  },
  {
    id: 'bottle-1l',
    label: '1 LITRE',
    price: 45,
    unit: 'per bottle',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Water_bottle_%2813779%29.jpg/960px-Water_bottle_%2813779%29.jpg',
    enabled: true,
    stock: 999,
  },
  {
    id: 'bottle-2l',
    label: '2 LITRE',
    price: 80,
    unit: 'per bottle',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Water_bottle_3.jpg/960px-Water_bottle_3.jpg',
    enabled: true,
    stock: 999,
  },
]

export async function getSettings() {
  const docs = await Setting.find()
  const merged = { ...DEFAULT_SETTINGS }
  for (const d of docs) merged[d.key] = d.value
  return merged
}

export async function setSettings(values) {
  for (const [key, value] of Object.entries(values)) {
    if (!(key in DEFAULT_SETTINGS)) continue
    await Setting.findOneAndUpdate(
      { key },
      { $set: { value } },
      { upsert: true, new: true },
    )
  }
  return getSettings()
}