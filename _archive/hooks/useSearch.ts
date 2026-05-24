import { useMemo } from 'react'
import { Note } from '@/types/note'

export function useSearch(notes: Note[], query: string): Note[] {
  return useMemo(() => {
    if (!query.trim()) return notes
    const q = query.toLowerCase()
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [notes, query])
}

export function highlightText(text: string, query: string): string {
  if (!query.trim() || !text) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="search-highlight">$1</mark>',
  )
}
