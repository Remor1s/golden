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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.61C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
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


