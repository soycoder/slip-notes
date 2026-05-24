import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useAuth } from '@/context/AuthContext'
import { migrateToSupabase, pullFromSupabase } from '@/lib/syncManager'
import type { Note } from '@/types/note'

interface SyncState {
  isSyncing: boolean
  lastSyncedAt: Date | null
  error: string | null
}

export function useSync(onSyncComplete: (notes: Note[]) => void) {
  const { user } = useAuth()
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
  })
  const hasRunMigration = useRef(false)

  useEffect(() => {
    if (!user || hasRunMigration.current) return
    hasRunMigration.current = true

    setState((s) => ({ ...s, isSyncing: true, error: null }))
    migrateToSupabase(user.id)
      .then(() => pullFromSupabase(user.id))
      .then((notes) => {
        if (notes) onSyncComplete(notes)
        setState({ isSyncing: false, lastSyncedAt: new Date(), error: null })
      })
      .catch((e) => {
        setState({ isSyncing: false, lastSyncedAt: null, error: e?.message ?? 'Sync failed' })
      })
  }, [user])

  // Re-sync when app returns to foreground
  useEffect(() => {
    if (!user) return
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        pullFromSupabase(user.id)
          .then((notes) => {
            if (notes) onSyncComplete(notes)
          })
          .catch(() => {})
      }
    })
    return () => sub.remove()
  }, [user])

  return state
}
