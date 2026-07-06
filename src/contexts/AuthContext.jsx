import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async ({ email, password, ...profileData }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }
    if (data.user) {
      const { data: lastProfile } = await supabase
        .from('profiles')
        .select('code')
        .order('code', { ascending: false })
        .limit(1)
        .maybeSingle()
      const nextSeq = lastProfile?.code ? parseInt(lastProfile.code.slice(5), 10) + 1 : 1
      const code = `10102${String(nextSeq).padStart(3, '0')}`
      const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, email, code, ...profileData })
      if (profileError) return { error: profileError }
    }
    return { data, error: null }
  }

  const signIn = async (userId, password) => {
    const { data: email, error: lookupError } = await supabase.rpc('get_email_by_user_id', { p_user_id: userId })
    if (lookupError || !email) return { error: { message: '존재하지 않는 아이디입니다.' } }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const refreshProfile = () => user && fetchProfile(user.id)

  const isAdmin = profile?.user_id === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
