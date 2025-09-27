import React, { useRef, useState } from 'react'
import ProductDetails from './ProductDetails.jsx'

export default function ProductCard({ product, onAdd }) {
  const { title, price, oldPrice, badges, volume, brand, country, image } = product
  const [open, setOpen] = useState(false)
  const lastCloseAtRef = useRef(0)

  const imgUrl = image ? encodeURI(`${import.meta.env.BASE_URL}${image.replace(/^\//, '')}`) : ''

  const handleCardClick = () => {
    // Prevent immediate reopen right after closing overlay (click-through)
    if (Date.now() - lastCloseAtRef.current < 200) return
    setOpen(true)
  }

  const handleClose = () => {
    lastCloseAtRef.current = Date.now()
    setOpen(false)
  }

  return (
    <div className="card" onClick={handleCardClick} style={{ cursor:'pointer' }}>
      <div className="media">
        {imgUrl ? (
          <img src={imgUrl} alt={title} className="media-img" loading="lazy" />
        ) : (
          <div className="placeholder">4:5</div>
        )}
        {badges?.map(b => <span key={b} className="badge">{b}</span>)}
      </div>
      <div className="info">
        <div className="title" title={title}>{title}</div>
        <div className="meta">{brand} • {volume} • {country}</div>
        <div className="price-row">
          <div className="price">{price} ₽</div>
          {oldPrice > 0 && <div className="old">{oldPrice} ₽</div>}
        </div>
        <button className="primary w-100" onClick={(e) => { e.stopPropagation(); onAdd(); }}>В корзину</button>
      </div>

      {open && (
        <ProductDetails
          product={product}
          onClose={handleClose}
          onAdd={() => { onAdd(); handleClose() }}
        />
      )}
    </div>
  )
}


