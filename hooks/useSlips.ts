import { useMemo } from 'react'
import type { Note } from '@/types/note'
import type { SlipData } from '@/types/slip'
import { useNotes } from './useNotes'

export function useSlips() {
  const notesApi = useNotes()

  const slips = useMemo(
    () => notesApi.notes.filter((n) => n.type === 'slip' && !n.isDeleted),
    [notesApi.notes]
  )

  function createSlip(partial: {
    title?: string
    slipData: SlipData
    slipImageUri?: string
    tags?: string[]
  }): Note {
    return notesApi.createNote({
      title: partial.title ?? `Slip ${new Date().toLocaleDateString('th-TH')}`,
      content: `฿${partial.slipData.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
      type: 'slip',
      slipData: partial.slipData,
      slipImageUri: partial.slipImageUri,
      tags: partial.tags ?? [],
    })
  }

  function updateSlip(id: string, changes: Partial<Note>) {
    notesApi.updateNote(id, changes)
  }

  return {
    slips,
    createSlip,
    updateSlip,
    deleteSlip: notesApi.deleteNote,
    restoreSlip: notesApi.restoreFromTrash,
  }
}
