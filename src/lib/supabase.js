import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xhfluyouysudzmifoubd.supabase.co'
const SUPABASE_KEY = 'sb_publishable_DUv-OLv7CebkgoiA08_gFg_nD1HsH8z'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
