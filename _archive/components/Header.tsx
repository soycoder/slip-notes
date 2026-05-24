import { useState, useRef, useEffect } from 'react'
import { NoteView } from '@/types/note'

interface Props {
  view: NoteView
  searchQuery: string
  onSearch: (q: string) => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
  onMenuToggle: () => void
}

export default function Header({ view, searchQuery, onSearch, theme, onThemeToggle, onMenuToggle }: Props) {
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const viewLabel = view === 'archive' ? 'Archive' : view === 'trash' ? 'Trash' : 'Notes'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Menu toggle (mobile) */}
      <button className="btn-icon" onClick={onMenuToggle} aria-label="Menu">
        <HamburgerIcon />
      </button>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', flexShrink: 0 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '7px',
          background: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="2" fill="white" opacity="0.9"/>
            <rect x="13" y="3" width="8" height="8" rx="2" fill="#F59E0B"/>
            <rect x="3" y="13" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
            <rect x="13" y="13" width="8" height="8" rx="2" fill="white" opacity="0.4"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px', lineHeight: 1 }}>
          SlipNotes
        </span>
      </div>

      {/* View label (shown when not searching) */}
      {!searchFocused && !searchQuery && (
        <span style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontWeight: 500,
          flexShrink: 0,
        }}>
          / {viewLabel}
        </span>
      )}

      {/* Search bar */}
      <div style={{
        flex: 1,
        maxWidth: '480px',
        marginLeft: 'auto',
        position: 'relative',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface)',
          border: `1px solid ${searchFocused ? 'var(--text-muted)' : 'var(--border-color)'}`,
          borderRadius: '10px',
          padding: '7px 12px',
          transition: 'border-color 0.2s',
          boxShadow: searchFocused ? 'var(--shadow-sm)' : 'none',
        }}>
          <SearchIcon />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search notes…"
            style={{
              fontSize: '14px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 0,
                display: 'flex',
              }}
            >
              <CloseIcon />
            </button>
          )}
          {!searchFocused && !searchQuery && (
            <kbd>/</kbd>
          )}
        </div>
      </div>

      {/* Theme toggle */}
      <button className="btn-icon" onClick={onThemeToggle} aria-label="Toggle theme" title="Toggle dark mode">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  )
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
