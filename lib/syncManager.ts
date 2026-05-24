import { supabase } from './supabaseClient'
import { storage } from './storage'
import type { Note } from '@/types/note'
import type { Database } from '@/types/supabase'

type NoteRow = Database['public']['Tables']['notes']['Row']

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    color: row.color as Note['color'],
    isPinned: row.is_pinned,
    isArchived: row.is_archived,
    isDeleted: row.is_deleted,
    deletedAt: row.deleted_at,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    type: (row.type as Note['type']) ?? 'note',
    slipData: row.slip_data as Note['slipData'],
    slipImageUri: row.slip_image_url ?? undefined,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function noteToRow(note: Note, userId: string): Database['public']['Tables']['notes']['Insert'] {
  return {
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content,
    color: note.color,
    is_pinned: note.isPinned,
    is_archived: note.isArchived,
    is_deleted: note.isDeleted,
    deleted_at: note.deletedAt,
    tags: note.tags,
    type: note.type,
    slip_data: note.slipData ?? null,
    slip_image_url: note.slipImageUri ?? null,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  }
}

function mergeByUpdatedAt(local: Note[], remote: Note[]): Note[] {
  const map = new Map<string, Note>()
  for (const note of local) map.set(note.id, note)
  for (const note of remote) {
    const existing = map.get(note.id)
    if (!existing || note.updatedAt > existing.updatedAt) {
      map.set(note.id, note)
    }
  }
  return Array.from(map.values())
}

export async function migrateToSupabase(userId: string): Promise<void> {
  const status = await storage.getMigrationStatus()
  if (status === 'supabase') return

  const localNotes = await storage.loadNotes()
  const { data: remoteRows } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)

  const remoteNotes = (remoteRows ?? []).map(rowToNote)
  const merged = mergeByUpdatedAt(localNotes, remoteNotes)

  const { error } = await supabase
    .from('notes')
    .upsert(
      merged.map((n) => noteToRow(n, userId)),
      { onConflict: 'id' }
    )

  if (!error) {
    await storage.saveNotes(merged)
    await storage.setMigrationStatus('supabase')
    await storage.setLastSync(new Date().toISOString())
  }
}

export async function pullFromSupabase(userId: string): Promise<Note[] | null> {
  const lastSync = await storage.getLastSync()
  let query = supabase.from('notes').select('*').eq('user_id', userId)
  if (lastSync) query = query.gt('updated_at', lastSync)

  const { data, error } = await query
  if (error || !data || data.length === 0) return null

  const remote = data.map(rowToNote)
  const local = await storage.loadNotes()
  const merged = mergeByUpdatedAt(local, remote)
  await storage.saveNotes(merged)
  await storage.setLastSync(new Date().toISOString())
  return merged
}

export async function pushNoteToSupabase(note: Note, userId: string): Promise<void> {
  await supabase
    .from('notes')
    .upsert(noteToRow(note, userId), { onConflict: 'id' })
}
