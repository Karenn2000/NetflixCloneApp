import type { Movie } from '../types'
import { posterUrl } from '../data/movies'

interface MovieCardProps {
  movie: Movie
  isSaved: boolean
  onSelect: (movie: Movie) => void
  onToggleWatchlist: (movie: Movie) => void
}

export function MovieCard({ movie, isSaved, onSelect, onToggleWatchlist }: MovieCardProps) {
  const rating = movie.rating.toFixed(1)

  return (
    <article className="movie-card">
      <button className="poster-button" onClick={() => onSelect(movie)} aria-label={`View details for ${movie.title}`}>
        <img src={posterUrl(movie.posterPath)} alt={`${movie.title} poster`} loading="lazy" />
        <span className="card-play" aria-hidden="true">▶</span>
      </button>
      <div className="card-details">
        <div className="card-heading">
          <button className="card-title" onClick={() => onSelect(movie)}>{movie.title}</button>
          <button
            className={`save-button ${isSaved ? 'saved' : ''}`}
            onClick={() => onToggleWatchlist(movie)}
            aria-label={isSaved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
          >{isSaved ? '✓' : '+'}</button>
        </div>
        <div className="card-meta"><span className="rating-star">★</span>{rating}<span className="meta-dot">•</span>{movie.releaseDate.slice(0, 4) || 'New'}</div>
      </div>
    </article>
  )
}
