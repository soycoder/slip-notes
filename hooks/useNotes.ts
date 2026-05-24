import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Note, NoteColor, NoteType } from '@/types/note'
import type { SlipData } from '@/types/slip'
import { storage } from '@/lib/storage'
import { pushNoteToSupabase } from '@/lib/syncManager'
import { useAuth } from '@/context/AuthContext'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function now(): string {
  return new Date().toISOString()
}

export function useNotes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const load = useCallback(() => {
    storage.loadNotes().then((loaded) => {
      setNotes(loaded)
      setIsLoaded(true)
    })
  }, [])

  useEffect(() => { load() }, [])

  const persist = useCallback(async (updated: Note[], changed?: Note) => {
    setNotes(updated)
    await storage.saveNotes(updated)
    if (changed && user) {
      pushNoteToSupabase(changed, user.id).catch(() => {})
    }
  }, [user])

  const activeNotes = useMemo(() => notes.filter((n) => !n.isArchived && !n.isDeleted), [notes])
  const archivedNotes = useMemo(() => notes.filter((n) => n.isArchived && !n.isDeleted), [notes])
  const trashedNotes = useMemo(() => notes.filter((n) => n.isDeleted), [notes])

  const createNote = useCallback(
    (partial: {
      title?: string
      content?: string
      color?: NoteColor
      tags?: string[]
      type?: NoteType
      slipData?: SlipData
      slipImageUri?: string
    }): Note => {
      const note: Note = {
        id: generateId(),
        title: partial.title ?? '',
        content: partial.content ?? '',
        color: partial.color ?? 'default',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        deletedAt: null,
        tags: partial.tags ?? [],
        type: partial.type ?? 'note',
        slipData: partial.slipData,
        slipImageUri: partial.slipImageUri,
        userId: user?.id,
        createdAt: now(),
        updatedAt: now(),
      }
      const updated = [note, ...notes]
      persist(updated, note)
      return note
    },
    [notes, persist, user]
  )

  const updateNote = useCallback(
    (id: string, changes: Partial<Note>) => {
      const updated = notes.map((n) =>
        n.id === id ? { ...n, ...changes, updatedAt: now() } : n
      )
      const changed = updated.find((n) => n.id === id)
      persist(updated, changed)
    },
    [notes, persist]
  )

  const deleteNote = useCallback(
    (id: string) => {
      const updated = notes.map((n) =>
        n.id === id ? { ...n, isDeleted: true, deletedAt: now(), updatedAt: now() } : n
      )
      const changed = updated.find((n) => n.id === id)
      persist(updated, changed)
    },
    [notes, persist]
  )

  const archiveNote = useCallback(
    (id: string) => {
      updateNote(id, { isArchived: true, isPinned: false })
    },
    [updateNote]
  )

  const unarchiveNote = useCallback(
    (id: string) => {
      updateNote(id, { isArchived: false })
    },
    [updateNote]
  )

  const togglePin = useCallback(
    (id: string) => {
      const note = notes.find((n) => n.id === id)
      if (note) updateNote(id, { isPinned: !note.isPinned })
    },
    [notes, updateNote]
  )

  const restoreFromTrash = useCallback(
    (id: string) => {
      updateNote(id, { isDeleted: false, deletedAt: null })
    },
    [updateNote]
  )

  const deleteFromTrash = useCallback(
    (id: string) => {
      const updated = notes.filter((n) => n.id !== id)
      persist(updated)
    },
    [notes, persist]
  )

  const emptyTrash = useCallback(() => {
    const updated = notes.filter((n) => !n.isDeleted)
    persist(updated)
  }, [notes, persist])

  const reload = useCallback(() => { load() }, [load])

  return {
    notes,
    activeNotes,
    archivedNotes,
    trashedNotes,
    isLoaded,
    reload,
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
