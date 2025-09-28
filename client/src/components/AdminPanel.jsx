import React, { useEffect, useMemo, useState } from 'react'
import { getProducts, saveProducts, getPromoConfig, savePromoConfig } from '../api.js'

export default function AdminPanel() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoPercent, setPromoPercent] = useState(0)
  const [focusId, setFocusId] = useState(null)

  useEffect(() => {
    getProducts().then(r => setItems(r.items || [])).finally(() => setLoading(false))
    const cfg = getPromoConfig()
    setPromoCode(cfg.code || '')
    setPromoPercent(cfg.percent || 0)
  }, [])

  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category))).filter(Boolean), [items])
  const categoryOptions = useMemo(() => (
    [
      { value: 'dav_shampoo', title: 'Шампуни' },
      { value: 'dav_body', title: 'Гели/Body' },
      { value: 'dav_cond', title: 'Кондиционеры' },
      { value: 'dav_mask_treat', title: 'Маски/Уход' },
      { value: 'dav_leave_in', title: 'Несмываемый уход' },
      { value: 'dav_styling', title: 'Стайлинг' },
      { value: 'dav_refil', title: 'Рефил/Скрин' }
    ]
  ), [])

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
      image: '',
      description: ''
    }
    setItems(prev => [next, ...prev])
  }

  const persist = async () => {
    setLoading(true)
    try {
      await saveProducts(items)
      await savePromoConfig({ code: promoCode, percent: promoPercent })
      alert('Сохранено')
    } finally { setLoading(false) }
  }

  if (loading) return <div className="page"><div className="toolbar"><h1>Админ</h1></div><div className="content">Загрузка…</div></div>

  return (
    <div className="page">
      <div className="toolbar">
        <h1>Админ-панель</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap:'wrap' }}>
          <input className="promo-input" placeholder="Поиск…" value={q} onChange={e => setQ(e.target.value)} />
          <select className="promo-input" value={cat} onChange={e => setCat(e.target.value)}>
            <option value="">Все категории</option>
            {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.title}</option>)}
          </select>
          <button className="secondary" onClick={addItem}>Добавить</button>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input className="promo-input" placeholder="Промокод" value={promoCode} onChange={e=>setPromoCode(e.target.value)} />
            <input className="promo-input" type="number" placeholder="%" value={promoPercent} onChange={e=>setPromoPercent(Number(e.target.value)||0)} style={{ width:100 }} />
          </div>
          <button className="primary" onClick={persist}>Сохранить</button>
        </div>
      </div>

      <div className="admin-grid">
        {view.map(p => (
          <div className="admin-card" key={p.id} id={`adm-item-${p.id}`} style={{ outline: focusId===p.id?'2px solid #111':'none' }}>
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
                <select className="promo-input" value={p.category||''} onChange={e => updateField(p.id, 'category', e.target.value)}>
                  {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.title}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-row">
              <div className="admin-col full">
                <label>Изображение (путь)</label>
                <input className="promo-input" value={p.image||''} onChange={e => updateField(p.id, 'image', e.target.value)} />
              </div>
            </div>
            <div className="admin-row">
              <div className="admin-col full">
                <label>Бренд</label>
                <input className="promo-input" value={p.brand||''} onChange={e => updateField(p.id, 'brand', e.target.value)} />
              </div>
            </div>
            <div className="admin-row">
              <div className="admin-col full">
                <label>Описание (запах, ощущения, эффект)</label>
                <textarea className="promo-input" style={{ minHeight: 90 }} value={p.description||''} onChange={e => updateField(p.id, 'description', e.target.value)} />
              </div>
            </div>
            {!!p.image && (
              <div className="admin-row">
                <div className="admin-col full">
                  <label>Превью</label>
                  <div style={{ width: 120, height: 120, borderRadius: 12, overflow: 'hidden', background:'#f6f6f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <img src={encodeURI(`${import.meta.env.BASE_URL}${(p.image||'').replace(/^\//,'')}`)} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                </div>
              </div>
            )}
            <div className="admin-row end">
              <button className="link" onClick={() => removeItem(p.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>

      {/* Предпросмотр каталога (дубликат карточек) */}
      <div style={{ marginTop: 16 }}>
        <div className="sheet-title" style={{ marginBottom: 8 }}>Предпросмотр каталога</div>
        <div className="grid">
          {items.map(p => {
            const img = p.image ? encodeURI(`${import.meta.env.BASE_URL}${p.image.replace(/^\//,'')}`) : ''
            return (
              <div key={`preview-${p.id}`} className="card" style={{ position:'relative' }}>
                <div className="media">
                  {img ? <img className="media-img" src={img} alt={p.title} /> : <div className="placeholder">4:5</div>}
                  {!!(p.badges && p.badges.length) && <span className="badge">{p.badges[0]}</span>}
                </div>
                <div className="info">
                  <div className="title" title={p.title}>{p.title}</div>
                  <div className="meta">{[p.brand, p.volume].filter(Boolean).join(' · ')}</div>
                  <div className="price-row">
                    <div className="price">{p.price} ₽</div>
                    {p.oldPrice > 0 && <div className="old">{p.oldPrice} ₽</div>}
                  </div>
                </div>
                <button
                  className="icon-btn"
                  title="Редактировать"
                  aria-label="Редактировать"
                  onClick={() => { setFocusId(p.id); setTimeout(()=>{ try{ document.getElementById(`adm-item-${p.id}`)?.scrollIntoView({ behavior:'smooth', block:'start' }) } catch{} }, 0) }}
                  style={{ position:'absolute', right:8, top:8 }}
                >✎</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


