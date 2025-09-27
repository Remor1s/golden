import React, { useMemo } from 'react'

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

export default function ProductDetails({ product, onClose, onAdd }) {
  const specs = useMemo(() => getSpecsFor(product), [product])
  const imageUrl = product.image ? encodeURI(`${import.meta.env.BASE_URL}${product.image.replace(/^\//, '')}`) : ''

  return (
    <div className="filter-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="filter-popover" onClick={e => e.stopPropagation()}>
        <div style={{ display:'grid', gridTemplateColumns:'84px 1fr', gap:12, alignItems:'center', marginBottom:6 }}>
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
        </div>

        <div style={{ fontWeight:700, marginTop:6, marginBottom:6 }}>Подробные характеристики</div>
        <div className="specs">
          {specs.map(row => (
            <div key={row.label} className="spec-row">
              <span className="spec-label">{row.label}</span>
              <span className="spec-dots" aria-hidden="true" />
              <span className="spec-value">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="confirm-actions" style={{ marginTop:10 }}>
          <button className="link" onClick={onClose}>Закрыть</button>
          <button className="primary" onClick={onAdd}>В корзину</button>
        </div>
      </div>
    </div>
  )
}
