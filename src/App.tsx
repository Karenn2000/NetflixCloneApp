import { useCallback, useEffect, useMemo, useState } from 'react'
import { backdropUrl, mockMovies } from './data/movies'
import { Hero } from './components/Hero'
import { MovieModal } from './components/MovieModal'
import { MovieRow } from './components/MovieRow'
import { Navbar, type AuthForm, type AuthMode } from './components/Navbar'
import { useMovieCatalog } from './hooks/useMovieCatalog'
import { getSupabaseConfigMessage, supabase, supabaseConfigured } from './lib/supabase'
import type { Movie, MovieSection, UserProfile } from './types'

type Page = 'home' | 'watchlist'
const heroMovie = mockMovies[0]
const genreIds = { action: 28, comedy: 35 }

function getWatchlistKey(userId?: string) {
  return userId ? `streamflix-watchlist-${userId}` : 'streamflix-watchlist-guest'
}

function readWatchlist(userId?: string): Movie[] {
  try {
    const key = getWatchlistKey(userId)
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value as Movie[] : []
  } catch {
    return []
  }
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [watchlist, setWatchlist] = useState<Movie[]>(() => readWatchlist())
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const { movies, collections, loading, error, hasApiKey } = useMovieCatalog(debouncedSearch)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!supabase) {
      setCurrentUser(null)
      return
    }

    let active = true

    const syncUser = async () => {
      const s = supabase
      if (!s) return
      const { data: { session } } = await s.auth.getSession()
      if (!active) return

      setCurrentUser(session?.user
        ? {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
          }
        : null)
    }

    void syncUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setCurrentUser(session?.user
        ? {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
          }
        : null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setWatchlist(readWatchlist(currentUser?.id))
  }, [currentUser?.id])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const saveWatchlist = useCallback((nextList: Movie[]) => {
    const key = getWatchlistKey(currentUser?.id)
    localStorage.setItem(key, JSON.stringify(nextList))
  }, [currentUser?.id])

  const toggleWatchlist = useCallback((movie: Movie) => {
    if (!currentUser) {
      setNotice('Please sign in to save movies to your watchlist.')
      return
    }

    const exists = watchlist.some((saved) => saved.id === movie.id)
    const nextList = exists ? watchlist.filter((saved) => saved.id !== movie.id) : [...watchlist, movie]
    setWatchlist(nextList)
    saveWatchlist(nextList)
    setNotice(exists ? 'Removed from your watchlist' : 'Added to your watchlist')
  }, [currentUser, saveWatchlist, watchlist])

  const handleAuthSubmit = useCallback(async (mode: AuthMode, form: AuthForm) => {
    if (!supabaseConfigured || !supabase) {
      return {
        success: false,
        message: getSupabaseConfigMessage() ?? 'Supabase is not configured.',
      }
    }

    const email = form.email.trim()
    const password = form.password
    const name = form.name?.trim() ?? ''

    if (mode === 'signup') {
      if (!name) {
        return { success: false, message: 'Please add your name to create an account.' }
      }
      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' }
      }
      if (form.confirmPassword !== password) {
        return { success: false, message: 'Passwords do not match.' }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        const message = error.message.toLowerCase()
        if (message.includes('already') || message.includes('registered')) {
          return { success: false, message: 'An account with this email already exists.' }
        }
        if (message.includes('password')) {
          return { success: false, message: 'Choose a stronger password with at least 6 characters.' }
        }
        return { success: false, message: error.message }
      }

      if (data.user && !data.session) {
        return {
          success: true,
          message: 'Account created. Check your email to confirm before signing in.',
        }
      }

      return { success: true, message: 'Account created successfully.' }
    }

    if (!email || !password) {
      return { success: false, message: 'Please enter your email and password.' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const message = error.message.toLowerCase()
      if (message.includes('invalid login') || message.includes('invalid credentials') || message.includes('not found')) {
        return { success: false, message: 'Invalid email or password.' }
      }
      if (message.includes('email not confirmed')) {
        return { success: false, message: 'Please confirm your email before signing in.' }
      }
      return { success: false, message: error.message }
    }

    const userName = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'Viewer'
    setNotice(`Welcome back, ${userName}!`)
    return { success: true, message: `Welcome back, ${userName}!` }
  }, [])

  const handleLogout = useCallback(async () => {
    if (!supabase) {
      setNotice('Supabase is not configured, so logout is unavailable.')
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      setNotice(error.message)
      return
    }

    setNotice('You have been signed out successfully.')
    setCurrentUser(null)
  }, [])

  const sections = useMemo<MovieSection[]>(() => {
    if (debouncedSearch) return [{ id: 'search-results', title: `Results for “${debouncedSearch}”`, movies }]
    const order = (values: Movie[]) => [...values].sort((a, b) => b.rating - a.rating)
    return [
      { id: 'trending', title: 'Trending', movies },
      { id: 'popular', title: 'Popular', movies: collections?.popular ?? [...movies].reverse() },
      { id: 'top-rated', title: 'Top Rated', movies: collections?.topRated ?? order(movies) },
      { id: 'action', title: 'Action', movies: collections?.action ?? movies.filter((movie) => movie.genreIds.includes(genreIds.action)) },
      { id: 'comedy', title: 'Comedy', movies: collections?.comedy ?? movies.filter((movie) => movie.genreIds.includes(genreIds.comedy)) },
    ]
  }, [collections, debouncedSearch, movies])

  const navigate = (nextPage: Page) => {
    setPage(nextPage)
    setSearchInput('')
    setDebouncedSearch('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const featured = hasApiKey && movies.length > 0 && !debouncedSearch ? movies[0] : heroMovie
  const visibleSections = page === 'watchlist'
    ? [{ id: 'watchlist', title: 'My Watchlist', movies: watchlist }]
    : sections

  return (
    <div className="app-shell">
      <Navbar
        activePage={page}
        onNavigate={navigate}
        onSearch={setSearchInput}
        watchlistCount={watchlist.length}
        currentUser={currentUser}
        supabaseConfigured={supabaseConfigured}
        onAuthSubmit={handleAuthSubmit}
        onLogout={handleLogout}
      />
      {page === 'home' && !debouncedSearch && <Hero movie={featured} onMoreInfo={setSelectedMovie} />}
      <main className={page === 'home' && !debouncedSearch ? 'catalog catalog-over-hero' : 'catalog'}>
        {error && <div className="status-message error-message" role="alert">{error}</div>}
        {loading && <div className="status-message">Finding something good to watch…</div>}
        {visibleSections.map((section) => (
          <MovieRow
            key={section.id}
            id={section.id}
            title={section.title}
            movies={section.movies}
            watchlist={watchlist}
            onSelect={setSelectedMovie}
            onToggleWatchlist={toggleWatchlist}
          />
        ))}
        {page === 'watchlist' && !currentUser && (
          <div className="empty-state">
            <span className="empty-icon">＋</span>
            <h2>Sign in to access your watchlist</h2>
            <p>Log in to save movies and keep your personal list available after refresh.</p>
            <button className="button button-light" onClick={() => navigate('home')}>Explore movies</button>
          </div>
        )}
        {page === 'watchlist' && currentUser && watchlist.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">＋</span>
            <h2>Your list is waiting</h2>
            <p>Save movies you want to watch later and they’ll show up here.</p>
            <button className="button button-light" onClick={() => navigate('home')}>Explore movies</button>
          </div>
        )}
        {debouncedSearch && !loading && movies.length === 0 && !error && (
          <div className="empty-state"><h2>No matches found</h2><p>Try another title or check the spelling.</p></div>
        )}
      </main>
      <footer className="site-footer">
        <span className="footer-brand">STREAM<span>FLIX</span></span>
        <p>Stories worth staying in for.</p>
        <span>© 2025 StreamFlix</span>
      </footer>
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          isSaved={watchlist.some((saved) => saved.id === selectedMovie.id)}
          onClose={() => setSelectedMovie(null)}
          onToggleWatchlist={toggleWatchlist}
        />
      )}
      {notice && <div className="toast" role="status">{notice}</div>}
      <div className="preload-image" style={{ backgroundImage: `url("${backdropUrl(heroMovie.backdropPath)}")` }} aria-hidden="true" />
    </div>
  )
}

export default App
