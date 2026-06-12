import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Demo from './pages/Demo'
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Demo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/students" element={<Students />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/myinfo" element={<MyInfo />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route path="/resid-add" element={<ResidExceptionAdd />} />
        <Route path="/class-register" element={<ClassRegister />} />
        <Route path="/manual-register" element={<ManualRegister />} />
        <Route path="/payment-register" element={<PaymentRegister />} />
        <Route path="/payment-memo" element={<PaymentMemo />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App