const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function uid() {
  const k = 'mini_uid'
  let v = localStorage.getItem(k)
  if (!v) { v = Math.random().toString(36).slice(2); localStorage.setItem(k, v) }
  return v
}

async function r(path, options={}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-user-id': uid(), ...(options.headers||{}) },
    ...options
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const getProducts = () => r('/api/products')
export const getCart = () => r('/api/cart')
export const addToCart = (productId, qty=1) => r('/api/cart', { method: 'POST', body: JSON.stringify({ productId, qty }) })
export const removeFromCart = (productId) => r(`/api/cart/${productId}`, { method: 'DELETE' })
export const createOrder = () => r('/api/orders', { method: 'POST' })


