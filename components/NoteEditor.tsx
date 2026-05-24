import { useState, useRef, useEffect, useCallback } from 'react'
import { NoteColor } from '@/types/note'
import ColorPicker from './ColorPicker'

interface Props {
  onSave: (note: { title: string; content: string; color: NoteColor; tags: string[] }) => void
}

export default function NoteEditor({ onSave }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState<NoteColor>('default')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    if (title.trim() || content.trim()) {
      onSave({ title: title.trim(), content: content.trim(), color, tags })
    }
    setTitle('')
    setContent('')
    setColor('default')
    setTags([])
    setTagInput('')
    setShowColorPicker(false)
    setExpanded(false)
  }, [title, content, color, tags, onSave])

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase().replace(/,/g, '')
      if (!tags.includes(tag)) setTags([...tags, tag])
      setTagInput('')
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  // Click outside to save+close
  useEffect(() => {
    if (!expanded) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [expanded, handleClose])

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expanded) handleClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [expanded, handleClose])

  return (
    <div
      ref={wrapperRef}
      className={`note-editor-wrapper note-${color}`}
      style={{ maxWidth: '680px', margin: '0 auto 32px', padding: expanded ? '16px' : '14px 16px' }}
    >
      {expanded && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4 }}
        />
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setExpanded(true)}
        placeholder={expanded ? 'Take a note…' : 'Take a note…'}
        rows={expanded ? 4 : 1}
        style={{
          fontSize: '14px',
          lineHeight: 1.6,
          resize: 'none',
          overflow: expanded ? 'auto' : 'hidden',
          transition: 'rows 0.15s',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleClose()
        }}
      />

      {expanded && (
        <>
          {/* Tags row */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center', minHeight: '28px', marginTop: '6px' }}>
            {tags.map((tag) => (
              <span key={tag} className="tag-chip" onClick={() => removeTag(tag)}>
                #{tag} <span style={{ fontSize: '10px', opacity: 0.7 }}>×</span>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag…"
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
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <ColorPicker value={color} onChange={setColor} />
            </div>
          )}

          {/* Toolbar */}
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
                <PaletteIcon />
              </button>
            </div>
            <button
              onClick={handleClose}
              style={{
                padding: '6px 18px',
                borderRadius: '8px',
                background: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              {title.trim() || content.trim() ? 'Save' : 'Close'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function PaletteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.477-1.125-.29-.289-.484-.68-.484-1.187 0-.926.78-1.688 1.709-1.688h2.039c3.2 0 5.563-2.442 5.563-5.547C22 6.8 17.5 2 12 2z"/>
    </svg>
  )
}
