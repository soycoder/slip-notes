import type { SlipData } from './slip'

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

export type NoteType = 'note' | 'slip'

export interface Note {
  id: string
  title: string
  content: string
  color: NoteColor
  isPinned: boolean
  isArchived: boolean
  isDeleted: boolean
  deletedAt: string | null
  tags: string[]
  type: NoteType
  slipData?: SlipData
  slipImageUri?: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export type SortOrder = 'updated' | 'created' | 'title'
