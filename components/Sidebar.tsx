import { NoteView } from '@/types/note'

interface Props {
  view: NoteView
  onViewChange: (v: NoteView) => void
  notesCount: number
  archiveCount: number
  trashCount: number
  allTags: string[]
  activeTag: string
  onTagFilter: (tag: string) => void
  isOpen: boolean
}

export default function Sidebar({
  view,
  onViewChange,
  notesCount,
  archiveCount,
  trashCount,
  allTags,
  activeTag,
  onTagFilter,
  isOpen,
}: Props) {
  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            display: 'block',
          }}
          onClick={() => {}}
        />
      )}

      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          padding: '16px 12px',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'var(--bg-primary)',
          overflowY: 'auto',
          position: 'sticky',
          top: '60px',
          height: 'calc(100vh - 60px)',
          transition: 'transform 0.25s ease',
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        <div
          className={`sidebar-item ${view === 'notes' ? 'active' : ''}`}
          onClick={() => onViewChange('notes')}
        >
          <NotesIcon />
          <span>Notes</span>
          {notesCount > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
              {notesCount}
            </span>
          )}
        </div>

        <div
          className={`sidebar-item ${view === 'archive' ? 'active' : ''}`}
          onClick={() => onViewChange('archive')}
        >
          <ArchiveIcon />
          <span>Archive</span>
          {archiveCount > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
              {archiveCount}
            </span>
          )}
        </div>

        <div
          className={`sidebar-item ${view === 'trash' ? 'active' : ''}`}
          onClick={() => onViewChange('trash')}
        >
          <TrashIcon />
          <span>Trash</span>
          {trashCount > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
              {trashCount}
            </span>
          )}
        </div>

        {/* Tags section */}
        {allTags.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ padding: '4px 12px 8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Tags
            </div>
            <div
              className={`sidebar-item ${activeTag === '' ? '' : ''}`}
              style={{ opacity: activeTag === '' ? 1 : 0.5 }}
              onClick={() => onTagFilter('')}
            >
              <TagIcon />
              <span>All tags</span>
            </div>
            {allTags.map((tag) => (
              <div
                key={tag}
                className={`sidebar-item ${activeTag === tag ? 'active' : ''}`}
                onClick={() => onTagFilter(activeTag === tag ? '' : tag)}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>#</span>
                <span>{tag}</span>
              </div>
            ))}
          </div>
        )}

        {/* Keyboard shortcuts */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ padding: '4px 12px 8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Shortcuts
          </div>
          <div style={{ padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <ShortcutRow keys={['/']} label="Search" />
            <ShortcutRow keys={['N']} label="New note" />
            <ShortcutRow keys={['Esc']} label="Close" />
          </div>
        </div>
      </aside>
    </>
  )
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ display: 'flex', gap: '2px' }}>
        {keys.map((k) => <kbd key={k}>{k}</kbd>)}
      </div>
    </div>
  )
}

function NotesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"/>
      <rect x="1" y="3" width="22" height="5"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}
