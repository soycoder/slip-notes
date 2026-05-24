import { NoteView } from '@/types/note'

interface Props {
  view: NoteView
  searchQuery?: string
}

export default function EmptyState({ view, searchQuery }: Props) {
  if (searchQuery) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🔍</div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          No results for &ldquo;{searchQuery}&rdquo;
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Try a different keyword or check tags
        </div>
      </div>
    )
  }

  const config = {
    notes: {
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      title: 'No notes yet',
      subtitle: 'Click in the box above or press N to create your first note',
    },
    archive: {
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
          <polyline points="21 8 21 21 3 21 3 8"/>
          <rect x="1" y="3" width="22" height="5"/>
          <line x1="10" y1="12" x2="14" y2="12"/>
        </svg>
      ),
      title: 'Archive is empty',
      subtitle: 'Archived notes will appear here',
    },
    trash: {
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      ),
      title: 'Trash is empty',
      subtitle: 'Deleted notes will appear here for recovery',
    },
  }

  const { icon, title, subtitle } = config[view]

  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        {icon}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
        {subtitle}
      </div>
    </div>
  )
}
