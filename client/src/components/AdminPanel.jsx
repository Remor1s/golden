import React, { useEffect, useMemo, useState } from 'react'
import { getProducts, saveProducts } from '../api.js'

export default function AdminPanel() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')

  useEffect(() => {
    getProducts().then(r => setItems(r.items || [])).finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category))).filter(Boolean), [items])

  const view = useMemo(() => {
    let v = items
    if (q) {
      const s = q.toLowerCase()
      v = v.filter(i => i.title.toLowerCase().includes(s) || String(i.id).includes(s) || i.sku.toLowerCase().includes(s))
    }
    if (cat) v = v.filter(i => i.category === cat)
    return v
  }, [items, q, cat])

  const updateField = (id, field, value) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const removeItem = (id) => setItems(prev => prev.filter(p => p.id !== id))

  const addItem = () => {
    const maxId = items.reduce((m, i) => Math.max(m, i.id), 0)
    const next = {
      id: maxId + 1,
      sku: `NEW-${(maxId + 1).toString().padStart(4, '0')}`,
      title: 'Новый товар',
      brand: 'Brand',
      price: 1990,
      oldPrice: 0,
      volume: '',
      country: 'Россия',
      badges: [],
      category: 'dav_shampoo',
      image: ''
    }
    setItems(prev => [next, ...prev])
  }

  const persist = async () => {
    setLoading(true)
    try {
      await saveProducts(items)
      alert('Сохранено')
    } finally { setLoading(false) }
  }

  if (loading) return <div className="page"><div className="toolbar"><h1>Админ</h1></div><div className="content">Загрузка…</div></div>

  return (
    <div className="page">
      <div className="toolbar">
        <h1>Админ-панель</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="promo-input" placeholder="Поиск…" value={q} onChange={e => setQ(e.target.value)} />
          <select className="promo-input" value={cat} onChange={e => setCat(e.target.value)}>
            <option value="">Все категории</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="secondary" onClick={addItem}>Добавить</button>
          <button className="primary" onClick={persist}>Сохранить</button>
        </div>
      </div>

      <div className="admin-grid">
        {view.map(p => (
          <div className="admin-card" key={p.id}>
            <div className="admin-row">
              <div className="admin-col">
                <label>ID</label>
                <input className="promo-input" value={p.id} onChange={e => updateField(p.id, 'id', Number(e.target.value)||0)} />
              </div>
              <div className="admin-col">
                <label>SKU</label>
                <input className="promo-input" value={p.sku} onChange={e => updateField(p.id, 'sku', e.target.value)} />
              </div>
              <div className="admin-col">
                <label>Цена</label>
                <input className="promo-input" type="number" value={p.price} onChange={e => updateField(p.id, 'price', Number(e.target.value)||0)} />
              </div>
              <div className="admin-col">
                <label>Старая цена</label>
                <input className="promo-input" type="number" value={p.oldPrice||0} onChange={e => updateField(p.id, 'oldPrice', Number(e.target.value)||0)} />
              </div>
            </div>
            <div className="admin-row">
              <div className="admin-col full">
                <label>Название</label>
                <input className="promo-input" value={p.title} onChange={e => updateField(p.id, 'title', e.target.value)} />
              </div>
            </div>
            <div className="admin-row">
              <div className="admin-col">
                <label>Объём</label>
                <input className="promo-input" value={p.volume||''} onChange={e => updateField(p.id, 'volume', e.target.value)} />
              </div>
              <div className="admin-col">
                <label>Страна</label>
                <input className="promo-input" value={p.country||''} onChange={e => updateField(p.id, 'country', e.target.value)} />
              </div>
              <div className="admin-col">
                <label>Категория</label>
                <input className="promo-input" value={p.category||''} onChange={e => updateField(p.id, 'category', e.target.value)} />
              </div>
            </div>
            <div className="admin-row">
              <div className="admin-col full">
                <label>Изображение (путь)</label>
                <input className="promo-input" value={p.image||''} onChange={e => updateField(p.id, 'image', e.target.value)} />
              </div>
            </div>
            <div className="admin-row end">
              <button className="link" onClick={() => removeItem(p.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


