import React from 'react'

const categories = [
  { id: 1, title: 'Ароматы', color: '#e0f3ff' },
  { id: 2, title: 'Бренды', color: '#fbe0ff' },
  { id: 3, title: 'Промокоды', color: '#e5ff00' },
  { id: 4, title: 'Скидки', color: '#ffe0e0' },
  { id: 5, title: 'L`Oreal', color: '#ffdfba' },
  { id: 6, title: 'Уход', color: '#d1f7c4' },
  { id: 7, title: 'Косметика', color: '#e0f3ff' },
  { id: 8, title: 'Davines', color: '#ffe9f0', image: 'dav%20shampoo/davines_bestsellery_oi-shampoo.png' }
]

export default function PromoCategories() {
  return (
    <div className="promo-categories">
      {categories.map(cat => (
        <a href="#" key={cat.id} className="promo-item">
          <div className="promo-square" style={{ backgroundColor: cat.color }}>
            {cat.image && <img src={`${import.meta.env.BASE_URL}${cat.image}`} alt={cat.title} />}
          </div>
          <div className="promo-title">{cat.title}</div>
        </a>
      ))}
    </div>
  )
}
