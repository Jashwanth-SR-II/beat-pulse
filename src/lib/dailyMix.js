import { supabase } from './supabaseClient'

export async function refreshDailyMixes(userId) {
  const { data, error } = await supabase.functions.invoke('build-daily-mix', {
    body: { userId },
  })
  if (error) throw new Error(error.message)
  return data?.mixes?.[userId] || []
}