import { useState, useEffect, useCallback } from 'react'
import { Note, NoteColor } from '@/types/note'

const STORAGE_KEY = 'slipnotes_v1'
const TRASH_KEY = 'slipnotes_trash_v1'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function loadNotes(): Note[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadTrash(): Note[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(TRASH_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

function saveTrash(notes: Note[]) {
  localStorage.setItem(TRASH_KEY, JSON.stringify(notes))
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [trash, setTrash] = useState<Note[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setNotes(loadNotes())
    setTrash(loadTrash())
    setIsLoaded(true)
  }, [])

  const persist = useCallback((updated: Note[]) => {
    setNotes(updated)
    saveNotes(updated)
  }, [])

  const persistTrash = useCallback((updated: Note[]) => {
    setTrash(updated)
    saveTrash(updated)
  }, [])

  const createNote = useCallback(
    (partial: { title?: string; content?: string; color?: NoteColor; tags?: string[] }) => {
      const note: Note = {
        id: generateId(),
        title: partial.title ?? '',
        content: partial.content ?? '',
        color: partial.color ?? 'default',
        isPinned: false,
        isArchived: false,
        tags: partial.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      persist([note, ...notes])
      return note
    },
    [notes, persist],
  )

  const updateNote = useCallback(
    (id: string, changes: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
      persist(
        notes.map((n) =>
          n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n,
        ),
      )
    },
    [notes, persist],
  )

  const deleteNote = useCallback(
    (id: string) => {
      const note = notes.find((n) => n.id === id)
      if (note) {
        persist(notes.filter((n) => n.id !== id))
        persistTrash([{ ...note, updatedAt: new Date().toISOString() }, ...trash])
      }
    },
    [notes, trash, persist, persistTrash],
  )

  const archiveNote = useCallback(
    (id: string) => {
      persist(notes.map((n) => (n.id === id ? { ...n, isArchived: true, isPinned: false } : n)))
    },
    [notes, persist],
  )

  const unarchiveNote = useCallback(
    (id: string) => {
      persist(notes.map((n) => (n.id === id ? { ...n, isArchived: false } : n)))
    },
    [notes, persist],
  )

  const togglePin = useCallback(
    (id: string) => {
      persist(notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)))
    },
    [notes, persist],
  )

  const restoreFromTrash = useCallback(
    (id: string) => {
      const note = trash.find((n) => n.id === id)
      if (note) {
        persistTrash(trash.filter((n) => n.id !== id))
        persist([{ ...note, isArchived: false }, ...notes])
      }
    },
    [notes, trash, persist, persistTrash],
  )

  const deleteFromTrash = useCallback(
    (id: string) => {
      persistTrash(trash.filter((n) => n.id !== id))
    },
    [trash, persistTrash],
  )

  const emptyTrash = useCallback(() => {
    persistTrash([])
  }, [persistTrash])

  const activeNotes = notes.filter((n) => !n.isArchived)
  const archivedNotes = notes.filter((n) => n.isArchived)

  return {
    notes,
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
  }
}
