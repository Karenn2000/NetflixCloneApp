export interface Movie {
  id: number
  title: string
  overview: string
  posterPath: string
  backdropPath: string
  rating: number
  releaseDate: string
  genreIds: number[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
}

export interface MovieSection {
  id: string
  title: string
  movies: Movie[]
}
