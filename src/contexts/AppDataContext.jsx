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

export function AppDataProvider({ children }) {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    if (!user) {
      setClasses([]); setStudents([]); setEnrollments([])
      return
    }
    Promise.all([
      supabase.from('classes').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('students').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('enrollments').select('*').eq('user_id', user.id).order('created_at'),
    ]).then(([cr, sr, er]) => {
      if (cr.data) setClasses(cr.data.map(mapClass))
      if (sr.data) setStudents(sr.data.map(mapStudent))
      if (er.data) setEnrollments(er.data.map(mapEnrollment))
    })
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

  return (
    <AppDataContext.Provider value={{ classes, students, enrollments, addClass, addStudent, updateStudent, addEnrollment }}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  return useContext(AppDataContext)
}
