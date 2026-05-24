import { useState, useRef } from 'react'
import { Note } from '@/types/note'
import { highlightText } from '@/hooks/useSearch'
import ColorPicker from './ColorPicker'

interface Props {
  note: Note
  searchQuery?: string
  onUpdate: (id: string, changes: Partial<Note>) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive?: (id: string) => void
  onTogglePin: (id: string) => void
  onRestore?: (id: string) => void
  isTrash?: boolean
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function NoteCard({
  note,
  searchQuery = '',
  onUpdate,
  onDelete,
  onArchive,
  onUnarchive,
  onTogglePin,
  onRestore,
  isTrash = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [editTitle, setEditTitle] = useState(note.title)
  const [editContent, setEditContent] = useState(note.content)
  const [tagInput, setTagInput] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  const saveEdit = () => {
    if (editTitle !== note.title || editContent !== note.content) {
      onUpdate(note.id, { title: editTitle, content: editContent })
    }
    setIsEditing(false)
    setShowColorPicker(false)
  }

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().replace(/,/g, '')
      if (!note.tags.includes(tag)) {
        onUpdate(note.id, { tags: [...note.tags, tag] })
      }
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    onUpdate(note.id, { tags: note.tags.filter((t) => t !== tag) })
  }

  const titleHtml = highlightText(note.title, searchQuery)
  const contentHtml = highlightText(note.content, searchQuery)

  if (isEditing) {
    return (
      <div
        ref={cardRef}
        className={`note-card note-${note.color} fade-in`}
        style={{ padding: '16px' }}
      >
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Title"
          style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4 }}
          autoFocus
        />
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="Note"
          rows={4}
          style={{ fontSize: '14px', lineHeight: 1.6, minHeight: '80px' }}
        />

        {/* Tags */}
        <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
          {note.tags.map((tag) => (
            <span key={tag} className="tag-chip" onClick={() => removeTag(tag)}>
              #{tag} <span style={{ fontSize: '10px', opacity: 0.7 }}>×</span>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            placeholder="Add tag..."
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              width: '80px',
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
            }}
          />
        </div>

        {showColorPicker && (
          <div style={{ marginTop: '10px' }}>
            <ColorPicker
              value={note.color}
              onChange={(color) => onUpdate(note.id, { color })}
            />
          </div>
        )}

        {/* Edit toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
        }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="btn-icon"
              title="Change color"
              onClick={() => setShowColorPicker((v) => !v)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r="2" fill="currentColor" stroke="none"/>
                <circle cx="17.5" cy="10.5" r="2" fill="#FBBF24" stroke="none"/>
                <circle cx="8.5" cy="7.5" r="2" fill="#34D399" stroke="none"/>
                <circle cx="6.5" cy="12.5" r="2" fill="#60A5FA" stroke="none"/>
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 2.21-1.79 4-4 4h-2c-.552 0-1 .448-1 1 0 .265.105.52.293.707A1 1 0 0115 18c0 2.21-1.343 4-3 4z"/>
              </svg>
            </button>
            <button
              className="btn-icon"
              title={note.isPinned ? 'Unpin' : 'Pin note'}
              onClick={() => onTogglePin(note.id)}
            >
              <PinIcon pinned={note.isPinned} />
            </button>
            {!isTrash && (
              <button
                className="btn-icon"
                title={note.isArchived ? 'Unarchive' : 'Archive'}
                onClick={() => note.isArchived ? onUnarchive?.(note.id) : onArchive(note.id)}
              >
                <ArchiveIcon />
              </button>
            )}
          </div>
          <button
            onClick={saveEdit}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`note-card note-${note.color}`}>
      {/* Pin badge */}
      {note.isPinned && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1,
        }}>
          <span className="pin-icon pinned">
            <PinIcon pinned />
          </span>
        </div>
      )}

      <div style={{ padding: '14px 16px' }}>
        {note.title && (
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              lineHeight: 1.4,
              marginBottom: '6px',
              color: 'var(--text-primary)',
              wordBreak: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        )}
        {note.content && (
          <div
            style={{
              fontSize: '13.5px',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              maxHeight: '240px',
              overflow: 'hidden',
            }}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
            {note.tags.map((tag) => (
              <span key={tag} className="tag-chip">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: date + actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px 10px',
        borderTop: '1px solid transparent',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {formatDate(note.updatedAt)}
        </span>

        <div className="note-actions" style={{ display: 'flex', gap: '2px' }}>
          {isTrash ? (
            <>
              <button className="btn-icon" title="Restore" onClick={() => onRestore?.(note.id)}>
                <RestoreIcon />
              </button>
              <button className="btn-icon" title="Delete forever" onClick={() => onDelete(note.id)}>
                <TrashIcon />
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-icon"
                title="Edit"
                onClick={() => {
                  setEditTitle(note.title)
                  setEditContent(note.content)
                  setIsEditing(true)
                }}
              >
                <EditIcon />
              </button>
              <button
                className="btn-icon"
                title={note.isPinned ? 'Unpin' : 'Pin'}
                onClick={() => onTogglePin(note.id)}
              >
                <PinIcon pinned={note.isPinned} />
              </button>
              {note.isArchived ? (
                <button className="btn-icon" title="Unarchive" onClick={() => onUnarchive?.(note.id)}>
                  <UnarchiveIcon />
                </button>
              ) : (
                <button className="btn-icon" title="Archive" onClick={() => onArchive(note.id)}>
                  <ArchiveIcon />
                </button>
              )}
              <button className="btn-icon" title="Delete" onClick={() => onDelete(note.id)}>
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PinIcon({ pinned }: { pinned?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: pinned ? '#F59E0B' : 'currentColor' }}>
      <line x1="12" y1="17" x2="12" y2="22"/>
      <path d="M5 17H19V15L17 9V5H7V9L5 15V17Z"/>
      <line x1="9" y1="5" x2="15" y2="5"/>
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"/>
      <rect x="1" y="3" width="22" height="5"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  )
}

function UnarchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"/>
      <rect x="1" y="3" width="22" height="5"/>
      <polyline points="10 14 12 12 14 14"/>
      <line x1="12" y1="12" x2="12" y2="17"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function RestoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 109-9M3 12V7m0 5H8"/>
    </svg>
  )
}
