const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// --- Mock Data ---
// Using mock data to run on GitHub Pages without a live backend.
const db = {
  products: [
    { id: 1, sku: 'SKU-001', title: 'Товар 1', brand: 'Brand', price: 1990, oldPrice: 0, volume: '250 мл', country: 'Италия', badges: ['NEW'] },
    { id: 2, sku: 'SKU-002', title: 'Товар 2', brand: 'Brand', price: 2990, oldPrice: 3490, volume: '200 мл', country: 'США', badges: ['HIT'] }
  ],
  cart: []
}

// Function to simulate async API calls
const mockRequest = (data, delay = 100) => {
  return new Promise(resolve => {
    setTimeout(() => {
      // Deep copy to prevent mutation issues
      resolve(JSON.parse(JSON.stringify(data)))
    }, delay)
  })
}

function uid() {
  const k = 'mini_uid'
  let v = localStorage.getItem(k)
  if (!v) { v = Math.random().toString(36).slice(2); localStorage.setItem(k, v) }
  return v
}

// This function is no longer used with mock data, but kept for reference
async function r(path, options={}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-user-id': uid(), ...(options.headers||{}) },
    ...options
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const getProducts = () => mockRequest({ items: db.products })

export const getCart = () => mockRequest({ items: db.cart })

export const addToCart = (productId, qty = 1) => {
  const product = db.products.find(p => p.id === productId)
  if (!product) return Promise.reject(new Error('Invalid productId'))

  const existing = db.cart.find(i => i.productId === productId)
  if (existing) {
    existing.qty += qty
  } else {
    db.cart.push({ productId, qty, price: product.price, title: product.title })
  }
  return mockRequest({ items: db.cart })
}

export const removeFromCart = (productId) => {
  db.cart = db.cart.filter(i => i.productId !== productId)
  return mockRequest({ items: db.cart })
}

export const createOrder = () => {
  const total = db.cart.reduce((s, i) => s + i.price * i.qty, 0)
  const order = { id: Date.now(), status: 'created', total, items: [...db.cart] }
  db.cart = [] // Clear the cart
  return mockRequest(order)
}


