import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TutorialProvider } from './components/TutorialContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppDataProvider } from './contexts/AppDataContext'
import TutorialFloatingButton from './components/TutorialFloatingButton'
import TutorialDevNav from './components/TutorialDevNav'
import Signup from './pages/Signup'
import Demo from './pages/Demo'
import ConversionRequest from './pages/ConversionRequest'
import Login from './pages/Login'
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
    <AppDataProvider>
    <TutorialProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Demo />} />
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <TutorialFloatingButton />
        <TutorialDevNav />
      </BrowserRouter>
    </TutorialProvider>
    </AppDataProvider>
    </AuthProvider>
  )
}

export default App