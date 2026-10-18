import { useEffect, useState } from 'react'
import { mockMovies } from '../data/movies'
import type { Movie } from '../types'

const apiKey = import.meta.env.VITE_TMDB_API_KEY as string | undefined
const baseUrl = 'https://api.themoviedb.org/3'

interface TmdbMovie {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  genre_ids?: number[]
}

interface TmdbResponse {
  results: TmdbMovie[]
}

function mapMovie(item: TmdbMovie): Movie {
  return {
    id: item.id,
    title: item.title ?? item.name ?? 'Untitled',
    overview: item.overview,
    posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
    backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
    rating: item.vote_average,
    releaseDate: item.release_date ?? item.first_air_date ?? '',
    genreIds: item.genre_ids ?? [],
  }
}

async function fetchMovies(endpoint: string, signal: AbortSignal): Promise<Movie[]> {
  const response = await fetch(`${baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${encodeURIComponent(apiKey ?? '')}`, { signal })
  if (!response.ok) throw new Error(`TMDB request failed (${response.status}). Please check your API key and try again.`)
  const data = (await response.json()) as TmdbResponse
  return data.results.map(mapMovie)
}

export function useMovieCatalog(query: string) {
  const [movies, setMovies] = useState<Movie[]>(mockMovies)
  const [collections, setCollections] = useState<{
    popular: Movie[]
    topRated: Movie[]
    action: Movie[]
    comedy: Movie[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!apiKey) {
      const normalizedQuery = query.toLowerCase()
      setMovies(normalizedQuery
        ? mockMovies.filter((movie) =>
            `${movie.title} ${movie.overview}`.toLowerCase().includes(normalizedQuery),
          )
        : mockMovies)
      setCollections(null)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)
    const request = query
      ? fetchMovies(`/search/movie?query=${encodeURIComponent(query)}`, controller.signal)
          .then((results) => {
            setMovies(results)
            setCollections(null)
          })
      : Promise.all([
          fetchMovies('/trending/movie/week', controller.signal),
          fetchMovies('/movie/popular', controller.signal),
          fetchMovies('/movie/top_rated', controller.signal),
          fetchMovies('/discover/movie?with_genres=28', controller.signal),
          fetchMovies('/discover/movie?with_genres=35', controller.signal),
        ]).then(([trending, popular, topRated, action, comedy]) => {
          setMovies(trending)
          setCollections({ popular, topRated, action, comedy })
        })

    request
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== 'AbortError') {
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [query])

  return { movies, collections, loading, error, hasApiKey: Boolean(apiKey) }
}
