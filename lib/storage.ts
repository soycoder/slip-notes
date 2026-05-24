import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Note } from '@/types/note'

const NOTES_KEY = 'slipnotes_notes_v2'
const MIGRATED_KEY = 'slipnotes_migrated_v1'
const THEME_KEY = 'slipnotes_theme'
const LAST_SYNC_KEY = 'slipnotes_last_sync'

export const storage = {
  async loadNotes(): Promise<Note[]> {
    try {
      // Check for old keys on first load and migrate them
      const migrated = await AsyncStorage.getItem(MIGRATED_KEY)
      if (!migrated) {
        return this._migrateOldKeys()
      }
      const raw = await AsyncStorage.getItem(NOTES_KEY)
      return raw ? (JSON.parse(raw) as Note[]) : []
    } catch {
      return []
    }
  },

  async saveNotes(notes: Note[]): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes))
    } catch {
      // Silently fail — UI will still work from in-memory state
    }
  },

  async _migrateOldKeys(): Promise<Note[]> {
    try {
      const [rawNotes, rawTrash] = await Promise.all([
        AsyncStorage.getItem('slipnotes_v1'),
        AsyncStorage.getItem('slipnotes_trash_v1'),
      ])
      const oldNotes = rawNotes ? JSON.parse(rawNotes) : []
      const oldTrash = rawTrash ? JSON.parse(rawTrash) : []
      // Map old trash items: add isDeleted flag
      const trashNotes = oldTrash.map((n: Note) => ({
        ...n,
        isDeleted: true,
        deletedAt: n.updatedAt,
        type: n.type ?? 'note',
      }))
      const allNotes: Note[] = [
        ...oldNotes.map((n: Note) => ({ ...n, type: n.type ?? ('note' as const), isDeleted: false, deletedAt: null })),
        ...trashNotes,
      ]
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(allNotes))
      await AsyncStorage.setItem(MIGRATED_KEY, 'local')
      return allNotes
    } catch {
      await AsyncStorage.setItem(MIGRATED_KEY, 'local')
      return []
    }
  },

  async getTheme(): Promise<'light' | 'dark' | null> {
    try {
      return (await AsyncStorage.getItem(THEME_KEY)) as 'light' | 'dark' | null
    } catch {
      return null
    }
  },

  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme)
    } catch {}
  },

  async getLastSync(): Promise<string | null> {
    try {
      return AsyncStorage.getItem(LAST_SYNC_KEY)
    } catch {
      return null
    }
  },

  async setLastSync(iso: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_SYNC_KEY, iso)
    } catch {}
  },

  async getMigrationStatus(): Promise<string | null> {
    try {
      return AsyncStorage.getItem(MIGRATED_KEY)
    } catch {
      return null
    }
  },

  async setMigrationStatus(status: string): Promise<void> {
    try {
      await AsyncStorage.setItem(MIGRATED_KEY, status)
    } catch {}
  },
}
