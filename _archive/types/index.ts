import type { Database } from './supabase'

export type Public = Database['public']
export type Tables = Public['Tables']
export type Countries = Tables['countries']