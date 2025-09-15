import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env.ORIGIN || '*'}))

// Простейшие заглушечные данные
const db = {
  products: [
    { id: 1, sku: 'SKU-001', title: 'Товар 1', brand: 'Brand', price: 1990, oldPrice: 0, volume: '250 мл', country: 'Италия', badges: ['NEW'] },
    { id: 2, sku: 'SKU-002', title: 'Товар 2', brand: 'Brand', price: 2990, oldPrice: 3490, volume: '200 мл', country: 'США', badges: ['HIT'] }
  ],
  cartByUser: new Map()
}

// Каталог
app.get('/api/products', (req, res) => {
  res.json({ items: db.products })
})

app.get('/api/products/:id', (req, res) => {
  const product = db.products.find(p => String(p.id) === req.params.id)
  if (!product) return res.status(404).json({ error: 'Not found' })
  res.json(product)
})

// Корзина (в памяти по tg_id)
function getUserId(req) {
  return req.header('x-user-id') || 'guest'
}

app.get('/api/cart', (req, res) => {
  const uid = getUserId(req)
  const cart = db.cartByUser.get(uid) || []
  res.json({ items: cart })
})

app.post('/api/cart', (req, res) => {
  const uid = getUserId(req)
  const { productId, qty } = req.body || {}
  const product = db.products.find(p => p.id === productId)
  if (!product) return res.status(400).json({ error: 'Invalid productId' })
  const cart = db.cartByUser.get(uid) || []
  const existing = cart.find(i => i.productId === productId)
  if (existing) existing.qty += qty || 1
  else cart.push({ productId, qty: qty || 1, price: product.price })
  db.cartByUser.set(uid, cart)
  res.json({ items: cart })
})

app.delete('/api/cart/:productId', (req, res) => {
  const uid = getUserId(req)
  const pid = Number(req.params.productId)
  const cart = (db.cartByUser.get(uid) || []).filter(i => i.productId !== pid)
  db.cartByUser.set(uid, cart)
  res.json({ items: cart })
})

// Заказ (без реальной оплаты, только заглушка)
app.post('/api/orders', (req, res) => {
  const uid = getUserId(req)
  const cart = db.cartByUser.get(uid) || []
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  db.cartByUser.set(uid, [])
  res.json({ id: Date.now(), status: 'created', total })
})

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))


