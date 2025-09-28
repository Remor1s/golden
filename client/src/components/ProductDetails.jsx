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
  const specs = useMemo(() => getSpecsFor(product), [product])
  const imageUrl = product.image ? encodeURI(`${import.meta.env.BASE_URL}${product.image.replace(/^\//, '')}`) : ''
  const [descOpen, setDescOpen] = useState(false)
  const similar = useMemo(() => {
    const list = Array.isArray(allProducts) ? allProducts : []
    return list.filter(p => p.category === product.category && p.id !== product.id).slice(0, 12)
  }, [allProducts, product])

  const node = (
    <div className="fullscreen-overlay" role="dialog" aria-modal="true" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="fullscreen-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display:'grid', gridTemplateColumns:'84px 1fr auto', gap:12, alignItems:'center', marginBottom:6 }}>
          <div style={{ width:84, height:84, borderRadius:10, overflow:'hidden', background:'#f6f6f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {imageUrl ? <img src={imageUrl} alt={product.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div className="placeholder">4:5</div>}
          </div>
          <div>
            <div style={{ fontWeight:700, marginBottom:6 }}>{product.title}</div>
            <div style={{ display:'flex', gap:8, alignItems:'baseline' }}>
              <div className="price" style={{ fontSize:18 }}>{product.price} ₽</div>
              {product.oldPrice > 0 && <div className="old">{product.oldPrice} ₽</div>}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button className="icon-btn" aria-label="Закрыть" title="Закрыть" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              {onToggleFavorite && (
                <button
                  className={"icon-like" + (isFavorite ? ' liked' : '')}
                  aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
                  title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.61C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              )}
            </div>
            <button className="primary" style={{ padding:'8px 10px', borderRadius:10 }} onClick={(e) => { e.stopPropagation(); onAdd(); }}>В корзину</button>
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
            {product.description || 'Аромат: свежий, чистый. Ощущения: комфортная текстура, легко смывается. Эффект: мягкость, блеск, лёгкость расчёсывания.'}
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
                      <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* открыть детально этот товар */ window.scrollTo(0,0); }} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
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
                      <div style={{ fontSize:12, lineHeight:1.3, height:34, overflow:'hidden' }} title={sp.title}>{sp.title}</div>
                      <div style={{ display:'flex', gap:6, alignItems:'baseline', margin:'6px 0' }}>
                        <div className="price" style={{ fontSize:13 }}>{sp.price} ₽</div>
                        {sp.oldPrice > 0 && <div className="old" style={{ fontSize:12 }}>{sp.oldPrice} ₽</div>}
                      </div>
                      <button className="secondary" style={{ width:'100%' }} onClick={() => onAddProduct && onAddProduct(sp.id)}>В корзину</button>
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
