import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // .single()은 row가 0개면 406을 던지는데, profile이 아직 없는 순간(생성 직후 등)에도
  // 조용히 null만 넘기고 넘어가야 하므로 .maybeSingle() 사용
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) console.error('프로필 조회 실패:', error)
    setProfile(data ?? null)
  }

  // 익명 세션은 profiles row가 아직 없을 수 있으므로 없으면 새로 만들어줌 (회원가입 시 만들던 것과 동일한 코드 채번)
  const ensureProfile = async (userId) => {
    const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
    if (existing) return
    const { data: lastProfile } = await supabase
      .from('profiles')
      .select('code')
      .order('code', { ascending: false })
      .limit(1)
      .maybeSingle()
    const nextSeq = lastProfile?.code ? parseInt(lastProfile.code.slice(5), 10) + 1 : 1
    const code = `10102${String(nextSeq).padStart(3, '0')}`
    // user_id(로그인 아이디)는 NOT NULL이라 익명 계정도 값이 필요함 - 사람이 직접 로그인할 일은
    // 없는 계정이므로 충돌 걱정 없이 본인 auth uuid를 그대로 씀
    const { error } = await supabase.from('profiles').insert({ id: userId, code, user_id: userId })
    if (error) console.error('프로필 생성 실패:', error)
  }

  // 로그인 화면 없이 새 익명 계정을 만들고 profile까지 준비함 - 최초 방문과 로그아웃 직후 둘 다 여기서 처리
  const startAnonymousSession = async () => {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) { console.error('익명 로그인 실패', error); setLoading(false); return }
    setUser(data.user)
    await ensureProfile(data.user.id)
    await fetchProfile(data.user.id)
    setLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { await startAnonymousSession(); return }
      setUser(session.user)
      await ensureProfile(session.user.id)
      await fetchProfile(session.user.id)
      setLoading(false)
    }
    init()
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
    setUser(null)
    setLoading(true)
    await startAnonymousSession()
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
