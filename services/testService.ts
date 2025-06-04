// services/testService.ts
import { supabase } from '../lib/supabase'

export async function fetchTestRows() {
  const { data, error } = await supabase
    .from('test')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching test rows:', error)
    throw error
  }

  return data
}