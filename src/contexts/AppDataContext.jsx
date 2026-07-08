import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const AppDataContext = createContext(null)

const mapClass = (c) => ({
  id: c.id,
  group: c.group_name || '',
  name: c.name || '',
  code: c.code || '',
  status: c.status || '개강',
  type: c.type || '',
  teacher: c.teacher || '',
  period: c.period || '',
  room: c.room || '',
  count: '재원: 0명',
  subject: c.subject || '',
  opFrom: c.op_from || '',
  opTo: c.op_to || '',
  payDay: c.pay_day || '1',
  opType: c.op_type || '기간반',
  payments: c.payments || [],
})

const mapStudent = (s) => ({
  id: s.id,
  name: s.name || '',
  birth: s.birth || '',
  gender: s.gender || '남자',
  status: s.status || '예비',
  enrollDate: s.enroll_date || '',
  phone: s.phone || '',
  homePhone: s.home_phone || '',
  grade1: s.grade1 || '',
  attendNo: s.attend_no || '',
  email1: s.email1 || '',
  email2: s.email2 || '',
  emailType: s.email_type || '직접입력',
  dept: s.dept || '',
  hasClasses: s.has_classes || false,
  family: s.family || [],
})

const mapEnrollment = (e) => ({
  id: e.id,
  studentId: e.student_id,
  className: e.class_name || '',
  group: e.group_name || '',
  startDate: e.start_date || '',
  endDate: e.end_date || '',
  payDay: e.pay_day || '',
  status: e.status || '수강',
  teacher: e.teacher || '',
  room: e.room || '',
  fee: e.fee || '',
})

// payments 테이블에 별도 취소 상태 컬럼이 없어서, memo 앞에 이 마커를 붙이는 방식으로
// "결제취소" 여부와 취소 사유를 함께 기록함 (레코드는 삭제하지 않고 그대로 남겨둠)
const CANCELLED_MARKER = '[결제취소]'

const mapPayment = (p) => {
  const memo = p.memo || ''
  const cancelled = memo.startsWith(CANCELLED_MARKER)
  return {
    id: p.id,
    studentId: p.student_id,
    enrollmentId: p.enrollment_id,
    className: p.class_name || '',
    month: p.month || '',
    item: p.item || '',
    payDate: p.pay_date || '',
    method: p.method || '',
    amount: Number(p.amount) || 0,
    memo,
    cancelled,
    cancelReason: cancelled ? memo.slice(CANCELLED_MARKER.length).trim() : '',
  }
}

export function AppDataProvider({ children }) {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [payments, setPayments] = useState([])

  const refresh = async (userId) => {
    const [cr, sr, er, pr] = await Promise.all([
      supabase.from('classes').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('students').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('enrollments').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('payments').select('*').eq('user_id', userId).order('created_at'),
    ])
    if (cr.data) setClasses(cr.data.map(mapClass))
    if (sr.data) setStudents(sr.data.map(mapStudent))
    if (er.data) setEnrollments(er.data.map(mapEnrollment))
    if (pr.data) setPayments(pr.data.map(mapPayment))
  }

  useEffect(() => {
    if (!user) {
      setClasses([]); setStudents([]); setEnrollments([]); setPayments([])
      return
    }
    refresh(user.id)
  }, [user])

  // 반 등록/수강신청 등을 별도 팝업창에서 처리한 뒤, 페이지 전체 새로고침 없이
  // 이 창의 데이터만 갱신할 수 있도록 전역에 노출 (팝업에서 window.opener.__refreshAppData?.() 로 호출)
  useEffect(() => {
    if (!user) return
    window.__refreshAppData = () => refresh(user.id)
    return () => { delete window.__refreshAppData }
  }, [user])

  const addClass = async (row) => {
    if (classes.length >= 5) return { error: { message: '반은 최대 5개까지 등록 가능합니다.' } }
    const { data, error } = await supabase.from('classes').insert({
      user_id: user.id,
      name: row.name, group_name: row.group, code: row.code,
      status: row.status, type: row.type, teacher: row.teacher,
      period: row.period, room: row.room, subject: row.subject,
      op_from: row.opFrom, op_to: row.opTo, pay_day: row.payDay,
      op_type: row.opType, payments: row.payments,
    }).select().single()
    if (!error && data) setClasses(prev => [...prev, mapClass(data)])
    return { data: data ? mapClass(data) : null, error }
  }

  const updateClass = async (id, row) => {
    const { data, error } = await supabase.from('classes').update({
      name: row.name, group_name: row.group, code: row.code,
      type: row.subject, room: row.room, subject: row.subject,
      op_from: row.opFrom, op_to: row.opTo, pay_day: row.payDay,
      op_type: row.opType, payments: row.payments,
      period: `${row.opFrom || ''}~${row.opTo || ''}`,
    }).eq('id', id).eq('user_id', user.id).select().single()
    if (!error && data) setClasses(prev => prev.map(c => c.id === id ? mapClass(data) : c))
    return { data: data ? mapClass(data) : null, error }
  }

  const deleteClass = async (id) => {
    const { error } = await supabase.from('classes').delete().eq('id', id).eq('user_id', user.id)
    if (!error) setClasses(prev => prev.filter(c => c.id !== id))
    return { error }
  }

  const addStudent = async (row) => {
    if (students.length >= 5) return { error: { message: '수강생은 최대 5명까지 등록 가능합니다.' } }
    const { data, error } = await supabase.from('students').insert({
      user_id: user.id,
      name: row.name, birth: row.birth, gender: row.gender,
      status: row.status, enroll_date: row.enrollDate, phone: row.phone,
      home_phone: row.homePhone, grade1: row.grade1, attend_no: row.attendNo,
      email1: row.email1, email2: row.email2, email_type: row.emailType,
      dept: row.dept, has_classes: row.hasClasses || false,
      family: row.family || [],
    }).select().single()
    if (!error && data) setStudents(prev => [...prev, mapStudent(data)])
    return { data: data ? mapStudent(data) : null, error }
  }

  const updateStudent = async (id, row) => {
    const { data, error } = await supabase.from('students').update({
      name: row.name, birth: row.birth, gender: row.gender,
      status: row.status, enroll_date: row.enrollDate, phone: row.phone,
      home_phone: row.homePhone, grade1: row.grade1, attend_no: row.attendNo,
      email1: row.email1, email2: row.email2, email_type: row.emailType,
      dept: row.dept, has_classes: row.hasClasses || false,
      family: row.family || [],
    }).eq('id', id).eq('user_id', user.id).select().single()
    if (!error && data) setStudents(prev => prev.map(s => s.id === id ? mapStudent(data) : s))
    return { data: data ? mapStudent(data) : null, error }
  }

  const deleteStudent = async (id) => {
    const { error: enrollError } = await supabase.from('enrollments').delete().eq('student_id', id).eq('user_id', user.id)
    if (enrollError) return { error: enrollError }
    const { error } = await supabase.from('students').delete().eq('id', id).eq('user_id', user.id)
    if (!error) {
      setStudents(prev => prev.filter(s => s.id !== id))
      setEnrollments(prev => prev.filter(e => e.studentId !== id))
    }
    return { error }
  }

  const addEnrollment = async (row) => {
    const { data, error } = await supabase.from('enrollments').insert({
      user_id: user.id,
      student_id: row.studentId,
      class_name: row.className, group_name: row.group,
      start_date: row.startDate, end_date: row.endDate, pay_day: row.payDay,
      status: row.status, teacher: row.teacher, room: row.room, fee: row.fee,
    }).select().single()
    if (!error && data) setEnrollments(prev => [...prev, mapEnrollment(data)])
    return { data: data ? mapEnrollment(data) : null, error }
  }

  const updateEnrollment = async (id, row) => {
    const { data, error } = await supabase.from('enrollments').update({
      class_name: row.className, group_name: row.group,
      start_date: row.startDate, end_date: row.endDate, pay_day: row.payDay,
      status: row.status, teacher: row.teacher, room: row.room, fee: row.fee,
    }).eq('id', id).eq('user_id', user.id).select().single()
    if (!error && data) setEnrollments(prev => prev.map(e => e.id === id ? mapEnrollment(data) : e))
    return { data: data ? mapEnrollment(data) : null, error }
  }

  const deleteEnrollment = async (id) => {
    const { error } = await supabase.from('enrollments').delete().eq('id', id).eq('user_id', user.id)
    if (!error) setEnrollments(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  const addPayment = async (row) => {
    const { data, error } = await supabase.from('payments').insert({
      user_id: user.id,
      student_id: row.studentId,
      enrollment_id: row.enrollmentId,
      class_name: row.className,
      month: row.month,
      item: row.item,
      pay_date: row.payDate,
      method: row.method,
      amount: row.amount,
      memo: row.memo || '',
    }).select().single()
    if (!error && data) setPayments(prev => [...prev, mapPayment(data)])
    return { data: data ? mapPayment(data) : null, error }
  }

  // 결제취소: 실제로 레코드를 지우지 않고 memo에 취소 마커+사유를 남겨서
  // 결제내역의 "결제취소" 목록에 계속 남아있게 하고, 청구/미납내역 미납 계산에서는 제외되게 함
  const cancelPayment = async (id, reason) => {
    const { data, error } = await supabase.from('payments')
      .update({ memo: `${CANCELLED_MARKER} ${reason || ''}`.trim() })
      .eq('id', id).eq('user_id', user.id).select().single()
    if (!error && data) setPayments(prev => prev.map(p => p.id === id ? mapPayment(data) : p))
    return { data: data ? mapPayment(data) : null, error }
  }

  return (
    <AppDataContext.Provider value={{ classes, students, enrollments, payments, addClass, updateClass, deleteClass, addStudent, updateStudent, deleteStudent, addEnrollment, updateEnrollment, deleteEnrollment, addPayment, cancelPayment }}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  return useContext(AppDataContext)
}
