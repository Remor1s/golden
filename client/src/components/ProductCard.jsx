import React, { useRef, useState } from 'react'
import ProductDetails from './ProductDetails.jsx'

export default function ProductCard({ product, onAdd, isFavorite = false, onToggleFavorite }) {
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
        {onToggleFavorite && (
          <button
            className={"icon-like" + (isFavorite ? ' liked' : '')}
            aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
            title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21s-6.716-4.35-9.192-8.1C1.08 10.18 2.2 7 5.4 6.2c1.8-.46 3.6.3 4.6 1.8 1-1.5 2.8-2.26 4.6-1.8 3.2.8 4.32 3.98 2.592 6.7C18.716 16.65 12 21 12 21z"/>
            </svg>
          </button>
        )}
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
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
        />
      )}
    </div>
  )
}


