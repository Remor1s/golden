import React, { useEffect, useMemo, useState, useRef } from 'react'
import { getProducts, getCart, addToCart, removeFromCart, createOrder } from './api.js'
import ProductCard from './components/ProductCard.jsx'
import PromoCategories from './components/PromoCategories.jsx'

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const drawerRef = useRef(null)
  const [promoInput, setPromoInput] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmPromoInput, setConfirmPromoInput] = useState('')
  const [confirmError, setConfirmError] = useState('')

  useEffect(() => {
    // Инициализация Telegram WebApp (если открыто внутри Telegram)
    try {
      const w = window
      if (w?.Telegram?.WebApp) {
        w.Telegram.WebApp.ready()
        if (typeof w.Telegram.WebApp.expand === 'function') {
          w.Telegram.WebApp.expand()
        }
        // Блокируем закрытие свайпом вниз (как в SheBanShe)
        if (typeof w.Telegram.WebApp.disableVerticalSwipes === 'function') {
          w.Telegram.WebApp.disableVerticalSwipes()
        }
      }
    } catch {}
    Promise.all([getProducts(), getCart()])
      .then(([p, c]) => { setProducts(p.items || []); setCart(c.items || []) })
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const available = Array.from(new Set(products.map(p => p.category))).filter(Boolean)
    const map = {
      dav_shampoo: { title: 'Шампуни', color: '#e0f3ff' },
      dav_body: { title: 'Гели/Body', color: '#fbe0ff' },
      dav_cond: { title: 'Кондиционеры', color: '#d1f7c4' },
      dav_mask_treat: { title: 'Маски/Уход', color: '#ffe9f0' },
      dav_leave_in: { title: 'Несмываемый уход', color: '#ffdfba' },
      dav_styling: { title: 'Стайлинг', color: '#e0ffe0' },
      dav_refil: { title: 'Рефил/Скрин', color: '#eee' }
    }
    return available.map((value, i) => ({ id: i + 1, value, title: map[value]?.title || value, color: map[value]?.color || '#eee' }))
  }, [products])

  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart])
  const discountPercent = useMemo(() => (promoCode === 'SKIDKA' ? 10 : 0), [promoCode])
  const discount = useMemo(() => Math.round(total * discountPercent / 100), [total, discountPercent])
  const payable = useMemo(() => Math.max(total - discount, 0), [total, discount])
  const filteredProducts = useMemo(() => {
    if (!selectedCategories.length) return products
    const set = new Set(selectedCategories)
    return products.filter(p => set.has(p.category))
  }, [products, selectedCategories])

  const toggleCategory = (value) => {
    setSelectedCategories(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

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
      const order = await createOrder({
        total,
        promoCode,
        discountPercent,
        discount,
        payable
      })
      alert(`Заказ создан: ${order.id}, сумма ${order.payable || order.total} ₽`)
      const c = await getCart()
      setCart(c.items || [])
    } finally { setPlacing(false); setConfirmOpen(false) }
  }

  const openConfirm = () => {
    setConfirmPromoInput(promoCode || promoInput || '')
    setConfirmError('')
    setConfirmOpen(true)
  }

  const applyConfirmPromo = () => {
    const code = (confirmPromoInput || '').trim().toUpperCase()
    if (!code) { setPromoCode(''); setPromoInput(''); setConfirmError(''); return }
    if (code === 'SKIDKA') { setPromoCode(code); setPromoInput(code); setConfirmError('') }
    else { setConfirmError('Неверный промокод') }
  }

  const goToCart = () => {
    if (drawerRef.current) {
      drawerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) return <div className="page"><div className="toolbar"><h1>Магазин</h1></div><div className="content">Загрузка…</div></div>

  return (
    <div className="page">
      <div className="neon"><span>Скидка 10% по промокоду SKIDKA</span></div>
      
      <PromoCategories />
      
      <div className="toolbar">
        <h1>Новинки</h1>
        <div className="tabs" style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
          <button className="icon-btn" aria-label="Фильтры" title="Фильтры" onClick={() => setFilterOpen(v => !v)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {selectedCategories.length > 0 && (
            <span className="badge-count" title="Выбрано категорий">{selectedCategories.length}</span>
          )}
          {filterOpen && (
            <>
              <div className="filter-overlay" onClick={() => setFilterOpen(false)} />
              <div className="filter-popover">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={selectedCategories.length === 0} onChange={() => setSelectedCategories([])} /> Все
                </label>
                {categories.map(cat => (
                  <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={selectedCategories.includes(cat.value)} onChange={() => toggleCategory(cat.value)} /> {cat.title}
                  </label>
                ))}
                <button className="primary w-100" onClick={() => setFilterOpen(false)}>Готово</button>
              </div>
            </>
          )}
        </div>
        
      </div>
      <div className="grid">
        {filteredProducts.map(p => (
          <ProductCard key={p.id} product={p} onAdd={() => handleAdd(p.id)} />
        ))}
      </div>

      <div className="drawer" ref={drawerRef}>
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
        <div className="promo-row">
          <input
            className="promo-input"
            type="text"
            placeholder="Промокод"
            value={promoInput}
            onChange={e => { setPromoInput(e.target.value); setPromoError('') }}
          />
          {promoCode ? (
            <button className="link apply" onClick={() => { setPromoCode(''); setPromoInput(''); setPromoError('') }}>убрать</button>
          ) : (
            <button
              className="apply primary"
              onClick={() => {
                const code = (promoInput || '').trim().toUpperCase()
                if (code === 'SKIDKA') { setPromoCode(code); setPromoError('') }
                else { setPromoError('Неверный промокод') }
              }}
            >Применить</button>
          )}
        </div>
        {promoError && <div className="promo-error">{promoError}</div>}
        {discount > 0 && (
          <div className="row total-row">
            <div className="row-title">Скидка ({discountPercent}%)</div>
            <div className="row-qty" />
            <div className="row-price">−{discount} ₽</div>
            <div />
          </div>
        )}
        <div className="drawer-footer">
          <div className="total">Итого: {discount > 0 ? (<><span className="old-inline">{total} ₽</span> <span>{payable} ₽</span></>) : (<span>{payable} ₽</span>)}</div>
          <button className="secondary" disabled={!payable || placing} onClick={goToCart}>КОРЗИНА</button>
          <button className="primary" disabled={!payable || placing} onClick={openConfirm}>Оформить</button>
        </div>
      </div>
      {confirmOpen && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-sheet">
            <div className="confirm-grabber" />
            <div className="confirm-title">Подтвердите заказ</div>
            <div className="confirm-summary">
              <div>Товары: {cart.reduce((s,i)=>s+i.qty,0)} шт.</div>
              <div>Сумма: {total} ₽</div>
              {discount > 0 && <div>Скидка: −{discount} ₽</div>}
              <div className="confirm-total">К оплате: {payable} ₽</div>
            </div>
            <div className="promo-row" style={{ marginTop: 12 }}>
              <input
                className="promo-input"
                type="text"
                placeholder="Промокод"
                value={confirmPromoInput}
                onChange={e => { setConfirmPromoInput(e.target.value); setConfirmError('') }}
              />
              <button className="primary apply" onClick={applyConfirmPromo}>Применить</button>
            </div>
            {confirmError && <div className="promo-error">{confirmError}</div>}
            <div className="confirm-actions">
              <button className="link" onClick={() => setConfirmOpen(false)}>Отмена</button>
              <button className="primary" disabled={placing} onClick={handleCheckout}>Оформить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


