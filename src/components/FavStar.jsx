import useFavorites from '../hooks/useFavorites'

export default function FavStar({ label, path }) {
  const { toggle, isFav } = useFavorites()
  const active = isFav(path)

  return (
    <svg
      onClick={() => toggle({ label, path })}
      width="18" height="18" viewBox="0 0 24 24"
      fill={active ? '#FED400' : 'none'}
      stroke={active ? '#FED400' : '#aaaaaa'}
      strokeWidth="2"
      style={{ cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}
