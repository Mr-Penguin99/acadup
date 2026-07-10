import { supabase } from './supabase'

export async function logConversionClick() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('conversion_clicks').insert({ user_id: user.id })
}
