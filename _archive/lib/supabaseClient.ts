import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const URL: string = process.env.NEXT_PUBLIC_SUPABASE_DB_URL || ''
const KEY: string = process.env.NEXT_PUBLIC_SUPABASE_DB_KEY || ''
export const supabase = createClient<Database>(URL, KEY)

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const allOnlineUsers = await supabase
    .from('users')
    .select('*')
    .eq('status', 'ONLINE')
  res.status(200).json(allOnlineUsers)
}
