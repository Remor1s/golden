import React from 'react'

export default function ProductCard({ product, onAdd }) {
  const { title, price, oldPrice, badges, volume, brand, country } = product
  return (
    <div className="card">
      <div className="media">
        <div className="placeholder">4:5</div>
        {badges?.map(b => <span key={b} className="badge">{b}</span>)}
      </div>
      <div className="info">
        <div className="title" title={title}>{title}</div>
        <div className="meta">{brand} • {volume} • {country}</div>
        <div className="price-row">
          <div className="price">{price} ₽</div>
          {oldPrice > 0 && <div className="old">{oldPrice} ₽</div>}
        </div>
        <button className="primary w-100" onClick={onAdd}>В корзину</button>
      </div>
    </div>
  )
}


