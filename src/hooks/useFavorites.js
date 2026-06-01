import { useState, useEffect } from 'react'

export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites')) || []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const toggle = (item) => {
    setFavorites(prev =>
      prev.find(f => f.path === item.path)
        ? prev.filter(f => f.path !== item.path)
        : [...prev, item]
    )
  }

  const isFav = (path) => favorites.some(f => f.path === path)

  return { favorites, toggle, isFav }
}
