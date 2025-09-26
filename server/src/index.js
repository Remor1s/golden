import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { seedIfEmpty, getProducts as dbGetProducts, createProduct, updateProduct, deleteProduct, replaceAllProducts } from './db.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env.ORIGIN || '*'}))

// Инициализация БД с дефолтными товарами (один раз)
const defaultProducts = [
  { id: 1, sku: 'SKU-001', title: 'Товар 1', brand: 'Brand', price: 1990, oldPrice: 0, volume: '250 мл', country: 'Италия', badges: ['NEW'], category: 'dav_shampoo', image: '' },
  { id: 2, sku: 'SKU-002', title: 'Товар 2', brand: 'Brand', price: 2990, oldPrice: 3490, volume: '200 мл', country: 'США', badges: ['HIT'], category: 'dav_shampoo', image: '' }
]
await seedIfEmpty(defaultProducts)

const dbMem = { cartByUser: new Map() }

// Каталог
app.get('/api/products', async (req, res) => {
  const items = await dbGetProducts()
  res.json({ items })
})

app.get('/api/products/:id', async (req, res) => {
  const items = await dbGetProducts()
  const product = items.find(p => String(p.id) === req.params.id)
  if (!product) return res.status(404).json({ error: 'Not found' })
  res.json(product)
})

// Admin: простая защита ключом
const ADMIN_KEY = process.env.ADMIN_KEY || 'dev123'
app.use('/api/admin', (req, res, next) => {
  const key = req.header('x-admin-key')
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' })
  next()
})

app.put('/api/admin/products', async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : []
  await replaceAllProducts(items)
  res.json({ ok: true })
})

app.post('/api/admin/products', async (req, res) => {
  const item = await createProduct(req.body || {})
  res.json(item)
})

app.put('/api/admin/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  const item = await updateProduct(id, req.body || {})
  res.json(item)
})

app.delete('/api/admin/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  await deleteProduct(id)
  res.json({ ok: true })
})

// Корзина (в памяти по tg_id)
function getUserId(req) {
  return req.header('x-user-id') || 'guest'
}

app.get('/api/cart', (req, res) => {
  const uid = getUserId(req)
  const cart = dbMem.cartByUser.get(uid) || []
  res.json({ items: cart })
})

app.post('/api/cart', async (req, res) => {
  const uid = getUserId(req)
  const { productId, qty } = req.body || {}
  const products = await dbGetProducts()
  const product = products.find(p => p.id === productId)
  if (!product) return res.status(400).json({ error: 'Invalid productId' })
  const cart = dbMem.cartByUser.get(uid) || []
  const existing = cart.find(i => i.productId === productId)
  if (existing) existing.qty += qty || 1
  else cart.push({ productId, qty: qty || 1, price: product.price })
  dbMem.cartByUser.set(uid, cart)
  res.json({ items: cart })
})

app.delete('/api/cart/:productId', (req, res) => {
  const uid = getUserId(req)
  const pid = Number(req.params.productId)
  const cart = (dbMem.cartByUser.get(uid) || []).filter(i => i.productId !== pid)
  dbMem.cartByUser.set(uid, cart)
  res.json({ items: cart })
})

// Заказ (без реальной оплаты, только заглушка)
app.post('/api/orders', (req, res) => {
  const uid = getUserId(req)
  const cart = dbMem.cartByUser.get(uid) || []
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  dbMem.cartByUser.set(uid, [])
  res.json({ id: Date.now(), status: 'created', total })
})

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))


