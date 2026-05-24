export type NoteColor =
  | 'default'
  | 'coral'
  | 'peach'
  | 'sage'
  | 'mint'
  | 'lavender'
  | 'pink'
  | 'sky'
  | 'stone'
  | 'rose'

export interface Note {
  id: string
  title: string
  content: string
  color: NoteColor
  isPinned: boolean
  isArchived: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type NoteView = 'notes' | 'archive' | 'trash'

export type SortOrder = 'updated' | 'created' | 'title'
