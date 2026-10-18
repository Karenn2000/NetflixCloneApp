import { useEffect, useState, type FormEvent } from 'react'
import type { UserProfile } from '../types'

export type AuthMode = 'signin' | 'signup'

export type AuthForm = {
  name?: string
  email: string
  password: string
  confirmPassword: string
}

export interface NavbarProps {
  activePage: 'home' | 'watchlist'
  onNavigate: (page: 'home' | 'watchlist') => void
  onSearch: (query: string) => void
  watchlistCount: number
  currentUser: UserProfile | null
  supabaseConfigured: boolean
  onAuthSubmit: (mode: AuthMode, form: AuthForm) => Promise<{ success: boolean; message: string }>
  onLogout: () => Promise<void>
}

const initialAuthForm: AuthForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function Navbar({
  activePage,
  onNavigate,
  onSearch,
  watchlistCount,
  currentUser,
  supabaseConfigured,
  onAuthSubmit,
  onLogout,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [authForm, setAuthForm] = useState<AuthForm>(initialAuthForm)
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authNotice, setAuthNotice] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!authOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAuthOpen(false)
        setAuthError('')
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('modal-open')

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('modal-open')
    }
  }, [authOpen])

  useEffect(() => {
    if (!isMenuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  const openAuth = (mode: AuthMode) => {
    setIsMenuOpen(false)
    setAuthMode(mode)
    setAuthForm(initialAuthForm)
    setAuthError('')
    setAuthOpen(true)
  }

  const closeAuth = () => {
    setAuthOpen(false)
    setAuthError('')
    setAuthNotice('')
    setIsSubmitting(false)
    setAuthForm(initialAuthForm)
  }

  const handleAuthInput = (field: keyof AuthForm, value: string) => {
    setAuthForm((current) => ({ ...current, [field]: value }))
    if (authError) setAuthError('')
    if (authNotice) setAuthNotice('')
  }

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!supabaseConfigured) {
      setAuthError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
      return
    }

    if (!authForm.email || !authForm.password || (authMode === 'signup' && (!authForm.confirmPassword || !authForm.name))) {
      setAuthError('Please fill in all required fields.')
      return
    }

    if (authMode === 'signup' && authForm.password !== authForm.confirmPassword) {
      setAuthError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setAuthError('')
    setAuthNotice('')

    const result = await onAuthSubmit(authMode, authForm)

    setIsSubmitting(false)

    if (!result.success) {
      setAuthError(result.message)
      return
    }

    setAuthNotice(result.message)
    if (authMode === 'signin') {
      setAuthOpen(false)
      setAuthForm(initialAuthForm)
    } else {
      setAuthMode('signin')
      setAuthForm({ ...initialAuthForm, email: authForm.email })
    }
  }

  const navigate = (page: 'home' | 'watchlist') => {
    setIsMenuOpen(false)
    onNavigate(page)
  }

  const toggleSearch = () => {
    setIsMenuOpen(false)
    setSearchOpen((open) => !open)
  }

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar-solid' : ''}`}>
        <div className="navbar-inner">
          <button className="brand" onClick={() => navigate('home')} aria-label="StreamFlix home">
            STREAM<span>FLIX</span>
          </button>
          <nav id="primary-navigation" className={`nav-links ${isMenuOpen ? 'nav-links-open' : ''}`} aria-label="Main navigation">
            <button className={activePage === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('home')}>Home</button>
            <button className="nav-link" onClick={() => navigate('home')}>Browse</button>
            <button className="nav-link nav-search-link" onClick={toggleSearch}>Search</button>
            <button className={activePage === 'watchlist' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('watchlist')}>
              Watchlist{watchlistCount > 0 && <span className="watchlist-count">{watchlistCount}</span>}
            </button>
            {currentUser ? (
              <button className="nav-link login-link" onClick={async () => { await onLogout() }}>Logout</button>
            ) : (
              <button className="nav-link login-link" onClick={() => openAuth('signin')}>Login</button>
            )}
          </nav>
          {currentUser && (
            <div className="user-chip" aria-label={`Signed in as ${currentUser.name}`}>
              <span className="user-chip-dot" />
              <span>{currentUser.name}</span>
            </div>
          )}
          <button
            type="button"
            className={`mobile-menu-toggle ${isMenuOpen ? 'mobile-menu-toggle-open' : ''}`}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <form
            className={`search-box ${searchOpen ? 'search-box-open' : ''}`}
            onSubmit={(event) => event.preventDefault()}
            role="search"
          >
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              aria-label="Search movies"
              placeholder="Titles, people, genres"
              onChange={(event) => onSearch(event.target.value)}
            />
            <button type="button" className="search-close" onClick={() => { setSearchOpen(false); onSearch('') }} aria-label="Close search">×</button>
          </form>
        </div>
      </header>

      {authOpen && (
        <div className="auth-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAuth() }}>
          <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button className="modal-close auth-close" onClick={closeAuth} aria-label="Close authentication">×</button>
            <div className="auth-brand-row">
              <span className="eyebrow-mark auth-mark">S</span>
              <span className="auth-brand-word">StreamFlix</span>
            </div>
            <div className="auth-header">
              <h2 id="auth-title">{authMode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
              <p>{authMode === 'signin' ? 'Sign in to continue watching.' : 'Join to build your watchlist.'}</p>
            </div>

            <div className="auth-tabs" aria-label="Authentication mode selector">
              <button
                type="button"
                className={authMode === 'signin' ? 'auth-tab active' : 'auth-tab'}
                onClick={() => {
                  setAuthMode('signin')
                  setAuthError('')
                  setAuthNotice('')
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={authMode === 'signup' ? 'auth-tab active' : 'auth-tab'}
                onClick={() => {
                  setAuthMode('signup')
                  setAuthError('')
                  setAuthNotice('')
                }}
              >
                Sign Up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <label className="auth-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={authForm.name ?? ''}
                    onChange={(event) => handleAuthInput('name', event.target.value)}
                    autoComplete="name"
                    placeholder="Your full name"
                  />
                </label>
              )}

              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => handleAuthInput('email', event.target.value)}
                  autoComplete="email"
                  placeholder="name@example.com"
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => handleAuthInput('password', event.target.value)}
                  autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="Enter your password"
                />
              </label>

              {authMode === 'signup' && (
                <label className="auth-field">
                  <span>Confirm Password</span>
                  <input
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={(event) => handleAuthInput('confirmPassword', event.target.value)}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                  />
                </label>
              )}

              {authError && <p className="auth-error">{authError}</p>}
              {authNotice && <p className="auth-success">{authNotice}</p>}

              <button className="button auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
