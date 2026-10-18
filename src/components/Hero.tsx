import { useState } from 'react'
import type { Movie } from '../types'

interface HeroProps {
  movie: Movie
  onMoreInfo: (movie: Movie) => void
}

export function Hero({ movie, onMoreInfo }: HeroProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <section className="hero" aria-label="Featured movie">
      <div className="hero-art" />
      <div className="hero-vignette" />
      <div className="hero-content">
        <p className="eyebrow"><span className="eyebrow-mark">S</span> STREAMFLIX ORIGINAL</p>
        <h1>{movie.title}</h1>
        <p className="hero-description">{movie.overview}</p>
        <div className="hero-actions">
          <button className="button button-light" onClick={() => setPlaying((value) => !value)}>
            <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>{playing ? 'Playing preview' : 'Play'}
          </button>
          <button className="button button-muted" onClick={() => onMoreInfo(movie)}>
            <span className="info-icon" aria-hidden="true">i</span>More Info
          </button>
        </div>
      </div>
      <div className="hero-age"><span>16+</span></div>
      <div className="hero-bottom-fade" />
    </section>
  )
}
