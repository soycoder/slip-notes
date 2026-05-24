import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { useNotes } from '@/hooks/useNotes'
import { useTheme } from '@/hooks/useTheme'
import { useSearch } from '@/hooks/useSearch'
import { Note, NoteView, SortOrder } from '@/types/note'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import NoteCard from '@/components/NoteCard'
import NoteEditor from '@/components/NoteEditor'
import EmptyState from '@/components/EmptyState'
import Toast, { useToast } from '@/components/Toast'

export default function App() {
  const {
    activeNotes,
    archivedNotes,
    trash,
    isLoaded,
    createNote,
    updateNote,
    deleteNote,
    archiveNote,
    unarchiveNote,
    togglePin,
    restoreFromTrash,
    deleteFromTrash,
    emptyTrash,
  } = useNotes()

  const { theme, toggle: toggleTheme } = useTheme()
  const { msg: toastMsg, key: toastKey, show: showToast, clear: clearToast } = useToast()

  const [view, setView] = useState<NoteView>('notes')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('updated')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTag, setActiveTag] = useState('')

  // Keyboard shortcut: N to focus editor
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (e.key === 'n' && tag !== 'input' && tag !== 'textarea') {
        const ta = document.querySelector<HTMLTextAreaElement>('.note-editor-wrapper textarea')
        ta?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Close sidebar on wider screens
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 768) setSidebarOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Gather all tags from active notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    activeNotes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [activeNotes])

  // Which notes to show
  const sourceNotes: Note[] = view === 'archive' ? archivedNotes : view === 'trash' ? trash : activeNotes

  // Tag filter
  const tagFilteredNotes = activeTag
    ? sourceNotes.filter((n) => n.tags.includes(activeTag))
    : sourceNotes

  // Search filter
  const searchedNotes = useSearch(tagFilteredNotes, searchQuery)

  // Sort
  const sortedNotes = useMemo(() => {
    const pinned = searchedNotes.filter((n) => n.isPinned && !n.isArchived)
    const rest = searchedNotes.filter((n) => !n.isPinned || n.isArchived)

    const sortFn = (a: Note, b: Note) => {
      if (sortOrder === 'title') return (a.title || a.content).localeCompare(b.title || b.content)
      if (sortOrder === 'created') return b.createdAt.localeCompare(a.createdAt)
      return b.updatedAt.localeCompare(a.updatedAt)
    }

    return view === 'notes' ? [...pinned.sort(sortFn), ...rest.sort(sortFn)] : searchedNotes.sort(sortFn)
  }, [searchedNotes, sortOrder, view])

  const handleCreateNote = (partial: { title: string; content: string; color: any; tags: string[] }) => {
    if (!partial.title.trim() && !partial.content.trim()) return
    createNote(partial)
    showToast('Note saved')
  }

  const handleDelete = (id: string) => {
    if (view === 'trash') {
      deleteFromTrash(id)
      showToast('Deleted permanently')
    } else {
      deleteNote(id)
      showToast('Moved to trash')
    }
  }

  const handleArchive = (id: string) => {
    archiveNote(id)
    showToast('Note archived')
  }

  const handleUnarchive = (id: string) => {
    unarchiveNote(id)
    showToast('Note unarchived')
  }

  const handleRestore = (id: string) => {
    restoreFromTrash(id)
    showToast('Note restored')
  }

  const viewTitle = view === 'archive' ? 'Archive' : view === 'trash' ? 'Trash' : 'Notes'

  return (
    <>
      <Head>
        <title>SlipNotes — Premium Slip Notes</title>
        <meta name="description" content="SlipNotes: A beautiful, fast, offline-ready note-taking app for your best ideas." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header
          view={view}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          theme={theme}
          onThemeToggle={toggleTheme}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />

        <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
          {/* Sidebar */}
          <div
            style={{
              width: sidebarOpen ? '220px' : '220px',
              flexShrink: 0,
              display: 'block',
            }}
            className="sidebar-container"
          >
            <Sidebar
              view={view}
              onViewChange={(v) => { setView(v); setSearchQuery(''); setActiveTag('') }}
              notesCount={activeNotes.length}
              archiveCount={archivedNotes.length}
              trashCount={trash.length}
              allTags={allTags}
              activeTag={activeTag}
              onTagFilter={setActiveTag}
              isOpen={sidebarOpen}
            />
          </div>

          {/* Main content */}
          <main style={{ flex: 1, padding: '24px 24px 80px', minWidth: 0 }}>
            {/* New note editor (only on notes view) */}
            {view === 'notes' && !searchQuery && (
              <NoteEditor onSave={handleCreateNote} />
            )}

            {/* View header */}
            <div style={{
              maxWidth: '680px',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {searchQuery ? (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {sortedNotes.length} result{sortedNotes.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                  </span>
                ) : (
                  <>
                    {activeTag && (
                      <span
                        className="tag-chip"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setActiveTag('')}
                      >
                        #{activeTag} ×
                      </span>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Sort selector */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="updated">Last edited</option>
                  <option value="created">Date created</option>
                  <option value="title">Title A–Z</option>
                </select>

                {/* Trash empty button */}
                {view === 'trash' && trash.length > 0 && (
                  <button
                    onClick={() => { emptyTrash(); showToast('Trash emptied') }}
                    style={{
                      fontSize: '12px',
                      color: '#EF4444',
                      background: 'transparent',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Empty trash
                  </button>
                )}
              </div>
            </div>

            {/* Notes grid */}
            {!isLoaded ? (
              <LoadingSkeleton />
            ) : sortedNotes.length === 0 ? (
              <EmptyState view={view} searchQuery={searchQuery} />
            ) : (
              <div className="notes-masonry" style={{ maxWidth: 'none' }}>
                {sortedNotes.map((note) => (
                  <div key={note.id} className="fade-in">
                    <NoteCard
                      note={note}
                      searchQuery={searchQuery}
                      onUpdate={updateNote}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                      onUnarchive={handleUnarchive}
                      onTogglePin={togglePin}
                      onRestore={handleRestore}
                      isTrash={view === 'trash'}
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Toast notification */}
      {toastMsg && <Toast key={toastKey} message={toastMsg} onDone={clearToast} />}

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar-container {
            position: fixed !important;
            top: 60px;
            left: 0;
            bottom: 0;
            z-index: 50;
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'};
            transition: transform 0.25s ease;
          }
        }
      `}</style>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="notes-masonry">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            borderRadius: '12px',
            background: 'var(--border-color)',
            height: i % 3 === 0 ? '160px' : i % 2 === 0 ? '100px' : '130px',
            marginBottom: '16px',
            opacity: 0.4,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}
