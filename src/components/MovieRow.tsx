import { useRef } from 'react'
import type { Movie } from '../types'
import { MovieCard } from './MovieCard'

interface MovieRowProps {
  id: string
  title: string
  movies: Movie[]
  watchlist: Movie[]
  onSelect: (movie: Movie) => void
  onToggleWatchlist: (movie: Movie) => void
}

export function MovieRow({ id, title, movies, watchlist, onSelect, onToggleWatchlist }: MovieRowProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: -1 | 1) => {
    if (!trackRef.current) return
    trackRef.current.scrollBy({ left: direction * trackRef.current.clientWidth * 0.82, behavior: 'smooth' })
  }

  if (movies.length === 0) return null

  return (
    <section className="movie-row" aria-labelledby={`${id}-title`}>
      <div className="row-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        <div className="row-controls">
          <button onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}>‹</button>
          <button onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}>›</button>
        </div>
      </div>
      <div className="movie-track" ref={trackRef}>
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isSaved={watchlist.some((saved) => saved.id === movie.id)}
            onSelect={onSelect}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))}
      </div>
    </section>
  )
}
