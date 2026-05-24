import React, { createContext, useCallback, useContext } from 'react'
import { useNotes } from '@/hooks/useNotes'
import { useSync } from '@/hooks/useSync'
import type { Note } from '@/types/note'

type NotesContextValue = ReturnType<typeof useNotes>

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const notesApi = useNotes()

  // When Supabase sync returns a merged set, apply it directly to in-memory state
  const onSyncComplete = useCallback((synced: Note[]) => {
    notesApi.reload()
  }, [notesApi.reload])

  useSync(onSyncComplete)

  return <NotesContext.Provider value={notesApi}>{children}</NotesContext.Provider>
}

export function useNotesContext(): NotesContextValue {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotesContext must be used inside NotesProvider')
  return ctx
}
