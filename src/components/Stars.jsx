import { Star } from 'lucide-react'
import { estrellasLlenas } from '../lib/resenas'

// Muestra 5 estrellas rellenas hasta `value` (0-5). Si `onSelect` se pasa,
// las estrellas son clicables (para calificar).
export default function Stars({ value = 0, size = 14, onSelect = null }) {
  const llenas = onSelect ? Math.round(value) : estrellasLlenas(value)
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => {
        const activa = i <= llenas
        const star = (
          <Star
            size={size}
            color={activa ? '#F59E0B' : '#D1CFC8'}
            fill={activa ? '#F59E0B' : 'none'}
          />
        )
        return onSelect ? (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
            aria-label={`${i} estrella${i > 1 ? 's' : ''}`}
          >
            {star}
          </button>
        ) : (
          <span key={i} style={{ display: 'flex' }}>{star}</span>
        )
      })}
    </span>
  )
}
