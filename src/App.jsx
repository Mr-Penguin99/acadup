import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TutorialProvider } from './components/TutorialContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppDataProvider } from './contexts/AppDataContext'
import { supabaseAdmin } from './lib/supabaseAdmin'
import TutorialFloatingButton from './components/TutorialFloatingButton'
import TutorialReplayNav from './components/TutorialReplayNav'
import ConversionRequest from './pages/ConversionRequest'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Students from './pages/Students'
import Payments from './pages/Payments'
import Classes from './pages/Classes'
import MyInfo from './pages/MyInfo'
import ChangePassword from './pages/ChangePassword'
import ResidExceptionAdd from './pages/ResidExceptionAdd'
import ClassRegister from './pages/ClassRegister'
import ManualRegister from './pages/ManualRegister'
import PaymentRegister from './pages/PaymentRegister'
import PaymentMemo from './pages/PaymentMemo'
import Admin from './pages/Admin'
import ClassCreate from './pages/ClassCreate'
import StudentDetail from './pages/StudentDetail'
import PaymentCancel from './pages/PaymentCancel'
import StudentFile from './pages/StudentFile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

// /admin은 별도 로그인 페이지로 보내지 않고, 그 자리에서 바로 로그인 폼을 보여주고
// 관리자 인증되면 그대로 대시보드로 전환됨.
// 메인 앱(익명 방문자)이 쓰는 useAuth/supabase 세션과는 완전히 분리된 supabaseAdmin 클라이언트를 써서,
// 관리자 로그인이 메인 세션을 덮어쓰지 않고, 세션도 저장소에 남기지 않아 탭/창을 닫으면 재로그인이 필요함
function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'authed' | 'guest'
  const [form, setForm] = useState({ id: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const checkAdmin = async (userId) => {
    const { data: profile } = await supabaseAdmin.from('profiles').select('user_id').eq('id', userId).maybeSingle()
    setStatus(profile?.user_id === 'admin' ? 'authed' : 'guest')
  }

  useEffect(() => {
    supabaseAdmin.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) checkAdmin(session.user.id)
      else setStatus('guest')
    })
    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange((_event, session) => {
      if (session?.user) checkAdmin(session.user.id)
      else setStatus('guest')
    })
    return () => subscription.unsubscribe()
  }, [])

  if (status === 'loading') return null
  if (status === 'authed') return children

  const handleSubmit = async () => {
    if (!form.id || !form.password) { setError('아이디와 비밀번호를 입력해주세요.'); return }
    setError('')
    setSubmitting(true)
    const { data: email, error: lookupError } = await supabaseAdmin.rpc('get_email_by_user_id', { p_user_id: form.id })
    if (lookupError || !email) { setSubmitting(false); setError('존재하지 않는 아이디입니다.'); return }
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({ email, password: form.password })
    setSubmitting(false)
    if (signInError) setError('로그인에 실패했습니다.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6f8' }}>
      <div style={{ background: '#fff', padding: '40px 36px', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', width: 320, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: 'center', color: '#192a3c' }}>관리자 로그인</div>
        <input
          placeholder="아이디"
          value={form.id}
          onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
          style={{ width: '100%', padding: '10px 12px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box', fontSize: 14 }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', padding: '10px 12px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box', fontSize: 14 }}
        />
        {error && <p style={{ color: '#e53e3e', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: '100%', padding: '10px', background: '#192a3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
    <AppDataProvider>
    <TutorialProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/classes" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/conversion-request" element={<ConversionRequest />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
          <Route path="/myinfo" element={<ProtectedRoute><MyInfo /></ProtectedRoute>} />
          <Route path="/changepassword" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/resid-add" element={<ProtectedRoute><ResidExceptionAdd /></ProtectedRoute>} />
          <Route path="/class-register" element={<ProtectedRoute><ClassRegister /></ProtectedRoute>} />
          <Route path="/manual-register" element={<ProtectedRoute><ManualRegister /></ProtectedRoute>} />
          <Route path="/payment-register" element={<ProtectedRoute><PaymentRegister /></ProtectedRoute>} />
          <Route path="/payment-memo" element={<ProtectedRoute><PaymentMemo /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/class-create" element={<ProtectedRoute><ClassCreate /></ProtectedRoute>} />
          <Route path="/student-detail" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
          <Route path="/payment-cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />
          <Route path="/student-file" element={<ProtectedRoute><StudentFile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <TutorialFloatingButton />
        <TutorialReplayNav />
      </BrowserRouter>
    </TutorialProvider>
    </AppDataProvider>
    </AuthProvider>
  )
}

export default App