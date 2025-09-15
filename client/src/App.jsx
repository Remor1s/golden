import React, { useEffect, useMemo, useState } from 'react'
import { getProducts, getCart, addToCart, removeFromCart, createOrder } from './api.js'
import ProductCard from './components/ProductCard.jsx'

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    Promise.all([getProducts(), getCart()])
      .then(([p, c]) => { setProducts(p.items || []); setCart(c.items || []) })
      .finally(() => setLoading(false))
  }, [])

  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart])

  const handleAdd = async (productId) => {
    const res = await addToCart(productId, 1)
    setCart(res.items)
  }

  const handleRemove = async (productId) => {
    const res = await removeFromCart(productId)
    setCart(res.items)
  }

  const handleCheckout = async () => {
    setPlacing(true)
    try {
      const order = await createOrder()
      alert(`Заказ создан: ${order.id}, сумма ${order.total} ₽`)
      const c = await getCart()
      setCart(c.items || [])
    } finally { setPlacing(false) }
  }

  if (loading) return <div className="page"><div className="toolbar"><h1>Магазин</h1></div><div className="content">Загрузка…</div></div>

  return (
    <div className="page">
      <div className="neon"><span>Скидка по промокоду позже — дизайн как у "Золотого Яблока"</span></div>
      <div className="toolbar">
        <h1>Новинки</h1>
        <div className="cart-info">{total ? `${total} ₽` : 'Корзина пуста'}</div>
      </div>
      <div className="grid">
        {products.map(p => (
          <ProductCard key={p.id} product={p} onAdd={() => handleAdd(p.id)} />
        ))}
      </div>

      <div className="drawer">
        <div className="drawer-title">Корзина</div>
        {cart.length === 0 && <div className="muted">Пока пусто</div>}
        {cart.map(i => {
          const p = products.find(p => p.id === i.productId)
          return (
            <div key={i.productId} className="row">
              <div className="row-title">{p?.title || i.productId}</div>
              <div className="row-qty">×{i.qty}</div>
              <div className="row-price">{i.price * i.qty} ₽</div>
              <button className="link" onClick={() => handleRemove(i.productId)}>убрать</button>
            </div>
          )
        })}
        <div className="drawer-footer">
          <div className="total">Итого: {total} ₽</div>
          <button className="primary" disabled={!total || placing} onClick={handleCheckout}>Оформить</button>
        </div>
      </div>
    </div>
  )
}


