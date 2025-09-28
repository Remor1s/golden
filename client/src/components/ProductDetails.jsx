import React, { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

function getSpecsFor(product) {
  const category = product.category || ''
  const map = {
    dav_shampoo: {
      type: 'шампунь',
      purpose: 'очищение, увлажнение',
      hair: 'для всех типов волос',
      area: 'волосы',
      daily: 'да'
    },
    dav_body: {
      type: 'гель для душа',
      purpose: 'очищение',
      hair: '—',
      area: 'тело',
      daily: 'да'
    },
    dav_cond: {
      type: 'кондиционер',
      purpose: 'мягкость, распутывание',
      hair: 'для всех типов волос',
      area: 'волосы',
      daily: 'да'
    },
    dav_mask_treat: {
      type: 'маска',
      purpose: 'восстановление, питание',
      hair: 'для сухих и ломких волос',
      area: 'волосы',
      daily: 'по необходимости'
    },
    dav_leave_in: {
      type: 'несмываемый уход',
      purpose: 'уход, защита',
      hair: 'для всех типов волос',
      area: 'волосы',
      daily: 'по необходимости'
    },
    dav_styling: {
      type: 'стайлинг',
      purpose: 'укладка, текстура',
      hair: 'для всех типов волос',
      area: 'волосы',
      daily: 'по необходимости'
    }
  }
  const base = map[category] || { type: 'средство ухода', purpose: 'уход', hair: 'для всех типов волос', area: 'волосы', daily: 'да' }
  return [
    { label: 'тип продукта', value: base.type },
    { label: 'для кого', value: 'универсально' },
    { label: 'назначение', value: base.purpose },
    { label: 'тип волос', value: base.hair },
    { label: 'область применения', value: base.area },
    { label: 'для ежедневного применения', value: base.daily },
    { label: 'объём', value: product.volume || '—' }
  ]
}

export default function ProductDetails({ product, onClose, onAdd, isFavorite = false, onToggleFavorite, allProducts = [], onAddProduct, onToggleFavoriteProduct, isFavoriteId }) {
  const [cur, setCur] = useState(product)
  const specs = useMemo(() => getSpecsFor(cur), [cur])
  const imageUrl = cur.image ? encodeURI(`${import.meta.env.BASE_URL}${cur.image.replace(/^\//, '')}`) : ''
  const [descOpen, setDescOpen] = useState(false)
  const [addedMain, setAddedMain] = useState(false)
  const [addedSet, setAddedSet] = useState(() => new Set())
  const isFavCur = isFavoriteId ? !!isFavoriteId(cur.id) : (isFavorite && cur.id === product.id)
  const similar = useMemo(() => {
    const list = Array.isArray(allProducts) ? allProducts : []
    return list.filter(p => p.category === cur.category && p.id !== cur.id).slice(0, 12)
  }, [allProducts, cur])

  const node = (
    <div className="fullscreen-overlay" role="dialog" aria-modal="true" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="fullscreen-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display:'grid', gridTemplateColumns:'84px 1fr auto', gap:12, alignItems:'center', marginBottom:6 }}>
          <div style={{ width:84, height:84, borderRadius:10, overflow:'hidden', background:'#f6f6f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {imageUrl ? <img src={imageUrl} alt={cur.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div className="placeholder">4:5</div>}
          </div>
          <div>
            <div style={{ fontWeight:700, marginBottom:6 }}>{cur.title}</div>
            <div style={{ display:'flex', gap:8, alignItems:'baseline' }}>
              <div className="price" style={{ fontSize:18 }}>{cur.price} ₽</div>
              {cur.oldPrice > 0 && <div className="old">{cur.oldPrice} ₽</div>}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', width:'100%', justifyContent:'flex-end' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginRight:'auto' }}>
                <button className="icon-btn" aria-label="Закрыть" title="Закрыть" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                {(onToggleFavorite || onToggleFavoriteProduct) && (
                  <button
                    className={"icon-like" + (isFavCur ? ' liked' : '')}
                    aria-label={isFavCur ? 'Убрать из избранного' : 'В избранное'}
                    title={isFavCur ? 'Убрать из избранного' : 'В избранное'}
                    onClick={(e) => { e.stopPropagation(); onToggleFavoriteProduct ? onToggleFavoriteProduct(cur.id) : onToggleFavorite(); }}
                    style={{ position:'static' }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.61C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <button className="primary" style={{ padding:'8px 10px', borderRadius:10 }} onClick={(e) => { e.stopPropagation(); onAdd(); setAddedMain(true); setTimeout(()=>setAddedMain(false), 1200); }}>
              {addedMain ? '✓ Добавлено' : 'В корзину'}
            </button>
          </div>
        </div>

        <div style={{ fontWeight:700, marginTop:6, marginBottom:6, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span>Описание</span>
          <button className="icon-btn" aria-label="Раскрыть описание" onClick={() => setDescOpen(v => !v)}>
            {descOpen ? '−' : '+'}
          </button>
        </div>
        {descOpen && (
          <div style={{ fontSize:14, color:'#333', lineHeight:1.5 }}>
            {cur.description || 'Аромат: свежий, чистый. Ощущения: комфортная текстура, легко смывается. Эффект: мягкость, блеск, лёгкость расчёсывания.'}
          </div>
        )}

        <div style={{ fontWeight:700, marginTop:10, marginBottom:6 }}>Подробные характеристики</div>
        <div className="specs">
          {specs.map(row => (
            <div key={row.label} className="spec-row">
              <span className="spec-label">{row.label}</span>
              <span className="spec-dots" aria-hidden="true" />
              <span className="spec-value">{row.value}</span>
            </div>
          ))}
        </div>

        

        {similar.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div className="sheet-title" style={{ marginBottom: 8 }}>Похожие товары</div>
            <div style={{ display:'flex', gap: 10, overflowX:'auto', paddingBottom: 6 }}>
              {similar.map(sp => {
                const simImg = sp.image ? encodeURI(`${import.meta.env.BASE_URL}${sp.image.replace(/^\//, '')}`) : ''
                return (
                  <div key={sp.id} style={{ minWidth: 160, border:'1px solid var(--border)', borderRadius: 12, overflow:'hidden', background:'#fff' }}>
                    <div style={{ position:'relative' }}>
                      <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCur(sp); setDescOpen(false); }} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
                        <div style={{ width:160, height:130, background:'#f6f6f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {simImg ? <img src={simImg} alt={sp.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div className="placeholder">4:5</div>}
                        </div>
                      </a>
                      {onToggleFavoriteProduct && (
                        <button
                          className={"icon-like" + (isFavoriteId && isFavoriteId(sp.id) ? ' liked' : '')}
                          aria-label={(isFavoriteId && isFavoriteId(sp.id)) ? 'Убрать из избранного' : 'В избранное'}
                          title={(isFavoriteId && isFavoriteId(sp.id)) ? 'Убрать из избранного' : 'В избранное'}
                          onClick={(e) => { e.stopPropagation(); onToggleFavoriteProduct(sp.id) }}
                          style={{ right: 8, top: 8 }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.61C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    <div style={{ padding:8 }}>
                      <div
                        style={{ fontSize:12, lineHeight:1.3, height:34, overflow:'hidden', cursor:'pointer' }}
                        title={sp.title}
                        onClick={(e) => { e.stopPropagation(); setCur(sp); setDescOpen(false); }}
                      >{sp.title}</div>
                      <div style={{ display:'flex', gap:6, alignItems:'baseline', margin:'6px 0' }}>
                        <div className="price" style={{ fontSize:13 }}>{sp.price} ₽</div>
                        {sp.oldPrice > 0 && <div className="old" style={{ fontSize:12 }}>{sp.oldPrice} ₽</div>}
                      </div>
                      <button className="secondary" style={{ width:'100%' }} onClick={(e) => { e.stopPropagation(); onAddProduct && onAddProduct(sp.id); setAddedSet(prev => new Set(prev).add(sp.id)); setTimeout(()=> setAddedSet(prev => { const n = new Set(prev); n.delete(sp.id); return n }), 1200); }}>
                        {addedSet.has(sp.id) ? '✓ Добавлено' : 'В корзину'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(node, document.body)
}
