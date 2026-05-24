import { useMemo } from 'react'
import type { Note } from '@/types/note'

export interface MatchRange {
  start: number
  end: number
}

export function useSearch(notes: Note[], query: string): Note[] {
  return useMemo(() => {
    if (!query.trim()) return notes
    const q = query.toLowerCase().trim()
    return notes.filter((n) => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [notes, query])
}

export function getMatchRanges(text: string, query: string): MatchRange[] {
  if (!query.trim()) return []
  const ranges: MatchRange[] = []
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let index = 0
  while (index < t.length) {
    const pos = t.indexOf(q, index)
    if (pos === -1) break
    ranges.push({ start: pos, end: pos + q.length })
    index = pos + q.length
  }
  return ranges
}
