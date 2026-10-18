import { useEffect } from 'react'
import { backdropUrl, posterUrl } from '../data/movies'
import type { Movie } from '../types'

interface MovieModalProps {
  movie: Movie
  isSaved: boolean
  onClose: () => void
  onToggleWatchlist: (movie: Movie) => void
}

export function MovieModal({ movie, isSaved, onClose, onToggleWatchlist }: MovieModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="movie-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-close" onClick={onClose} aria-label="Close movie details">×</button>
        <div className="modal-art" style={{ backgroundImage: `linear-gradient(0deg, #181818 4%, transparent 80%), url("${movie.backdropPath ? backdropUrl(movie.backdropPath) : posterUrl(movie.posterPath)}")` }} />
        <div className="modal-content">
          <p className="eyebrow"><span className="eyebrow-mark">S</span> STREAMFLIX</p>
          <h2 id="modal-title">{movie.title}</h2>
          <div className="modal-meta"><span>{movie.releaseDate.slice(0, 4) || 'New'}</span><span className="rating-star">★</span>{movie.rating.toFixed(1)}<span className="quality-tag">HD</span></div>
          <p className="modal-overview">{movie.overview || 'More details coming soon.'}</p>
          <button className="button button-outline" onClick={() => onToggleWatchlist(movie)}>
            {isSaved ? '✓  In My List' : '+  Add to My List'}
          </button>
        </div>
      </section>
    </div>
  )
}
