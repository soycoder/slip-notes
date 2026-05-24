export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          color: string
          is_pinned: boolean
          is_archived: boolean
          is_deleted: boolean
          deleted_at: string | null
          tags: Json
          type: string
          slip_data: Json | null
          slip_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          title?: string
          content?: string
          color?: string
          is_pinned?: boolean
          is_archived?: boolean
          is_deleted?: boolean
          deleted_at?: string | null
          tags?: Json
          type?: string
          slip_data?: Json | null
          slip_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          color?: string
          is_pinned?: boolean
          is_archived?: boolean
          is_deleted?: boolean
          deleted_at?: string | null
          tags?: Json
          type?: string
          slip_data?: Json | null
          slip_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
