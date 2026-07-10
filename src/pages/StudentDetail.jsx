import { useEffect, useRef, useState } from 'react'
import './Students.css'
import { useAppData } from '../contexts/AppDataContext'
import { DatePicker } from '../components/DatePicker'
import FamilyTab from '../components/student/FamilyTab'
import ClassTab from '../components/student/ClassTab'
import PaymentTab from '../components/student/PaymentTab'
import BillingTab from '../components/student/BillingTab'
import ConsultTab from '../components/student/ConsultTab'
import AttendTab from '../components/student/AttendTab'
import AcademyScoreTab from '../components/student/AcademyScoreTab'
import SchoolScoreTab from '../components/student/SchoolScoreTab'
import NoticeTab from '../components/student/NoticeTab'
import MemoTab from '../components/student/MemoTab'
import ProgressTab from '../components/student/ProgressTab'
import VehicleTab from '../components/student/VehicleTab'

const INFO_TABS   = ['가족','수강','수납','결제','상담','출결','학원성적','학교성적','알림내역','메모','진도','차량']
const LOCKED_TABS = ['상담','출결','학원성적','학교성적','알림내역','메모','진도','차량']

export default function StudentDetail() {
  const { students, enrollments: contextEnrollments, updateStudent, deleteStudent } = useAppData()
  const [infoTab, setInfoTab] = useState('가족')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [studentDbId, setStudentDbId] = useState(null)
  const fileInputRef = useRef(null)

  const emptyForm = {
    studentNo:'', name:'', birth:'', gender:'남자',
    id:'', enrollDate:'', phone:'', homePhone:'',
    grade2:'', attendNo:'', email1:'', email2:'',
    status:'', hasClasses:false,
    address:'', zipcode:'', addressDetail:'', etc:'',
  }

  const [form, setForm] = useState({
    studentNo:'', name:'', birth:'', gender:'남자',
    id:'', enrollDate:'', phone:'', homePhone:'',
    grade2:'', attendNo:'', email1:'', email2:'',
    status:'', hasClasses:false, family:[],
    address:'', zipcode:'', addressDetail:'', etc:'',
  })

  // 반별 수강생 쪽 팝업(수강신청/수납등록 등)과 동일하게, 데이터 변경 후 이 창을 띄운 원래 창(수강생현황)의
  // useAppData를 새로고침해서 목록에 바로 반영되도록 함
  const reloadOpener = () => { try { if (window.opener && !window.opener.closed) window.opener.__refreshAppData?.() } catch {} }

  useEffect(() => {
    const data = sessionStorage.getItem('studentDetailData')
    if (!data) return
    const s = JSON.parse(data)
    setStudentDbId(s.id ?? null)
    setForm(f => ({
      ...f,
      name:      s.name    || '',
      birth:     s.birth   || '',
      status:    s.status  || '',
      attendNo:  s.keypad  || '',
      grade2:    s.dept    || '',
      hasClasses: s.classes && s.classes.length > 0,
    }))
  }, [])

  // 실제 DB 데이터(useAppData)가 로드되면, 반별 수강생 쪽처럼 학생 레코드 전체(가족정보 등 포함)로 폼을 채움
  useEffect(() => {
    if (studentDbId == null) return
    const s = students.find(s => s.id === studentDbId)
    if (s) setForm(f => ({ ...f, ...s }))
  }, [studentDbId, students])

  // 재원/예비는 hasClasses 플래그가 아니라 실제 수강 내역(contextEnrollments) 존재 여부로 판단 -
  // 플래그를 별도로 관리하면 수강신청/취소 시점에 따라 실제 데이터와 어긋날 수 있음
  const getDisplayStatus = () => {
    if (form.status === '퇴원') return '퇴원'
    if (form.status === '휴원') return '휴원'
    if (contextEnrollments.some(e => e.studentId === studentDbId)) return '재원'
    return '예비'
  }

  const handleUpdateStudent = async () => {
    if (!form.name)       { alert('성명을 입력해주세요.'); return }
    if (!form.birth)      { alert('생년월일을 입력해주세요.'); return }
    if (!form.enrollDate) { alert('입학일자를 입력해주세요.'); return }
    if (!form.phone)      { alert('학생 휴대폰을 입력해주세요.'); return }
    const { error } = await updateStudent(studentDbId, { ...form })
    if (error) { alert(error.message || '수정에 실패했습니다.'); return }
    reloadOpener()
    alert('정상적으로 처리되었습니다.')
  }

  const handleWithdraw = async () => {
    if (!window.confirm('퇴원하는 경우 수강 중인 반을 모두 중지해야 합니다.\n퇴원하려면 확인을 선택해 주세요.')) return
    const today = new Date().toISOString().slice(0, 10)
    const hasActiveClass = contextEnrollments.some(e => e.studentId === studentDbId && (!e.endDate || e.endDate > today))
    if (hasActiveClass) {
      alert('수강등록이 된 수강생은 퇴원할 수 없습니다. 먼저 수강 중지를 해야합니다.')
      return
    }
    const { error } = await updateStudent(studentDbId, { ...form, status: '퇴원' })
    if (error) { alert(error.message || '퇴원 처리에 실패했습니다.'); return }
    setForm(f => ({ ...f, status: '퇴원' }))
    reloadOpener()
    alert('정상적으로 처리되었습니다.')
  }

  const handleCancelWithdraw = async () => {
    const restoredStatus = contextEnrollments.some(e => e.studentId === studentDbId) ? '재원' : '예비'
    const { error } = await updateStudent(studentDbId, { ...form, status: restoredStatus })
    if (error) { alert(error.message || '퇴원취소 처리에 실패했습니다.'); return }
    setForm(f => ({ ...f, status: restoredStatus }))
    reloadOpener()
    alert('정상적으로 처리되었습니다.')
  }

  const handleSuspend = async () => {
    if (!window.confirm('휴원하는 경우 수강 중인 반을 모두 중지해야 합니다.\n휴원하려면 확인을 선택해 주세요.')) return
    const today = new Date().toISOString().slice(0, 10)
    const hasActiveClass = contextEnrollments.some(e => e.studentId === studentDbId && (!e.endDate || e.endDate > today))
    if (hasActiveClass) {
      alert('수강등록이 된 수강생은 휴원할 수 없습니다. 먼저 수강 중지를 해야합니다.')
      return
    }
    const { error } = await updateStudent(studentDbId, { ...form, status: '휴원' })
    if (error) { alert(error.message || '휴원 처리에 실패했습니다.'); return }
    setForm(f => ({ ...f, status: '휴원' }))
    reloadOpener()
    alert('정상적으로 처리되었습니다.')
  }

  const handleDeleteStudent = async () => {
    if (typeof studentDbId !== 'number') return
    if (!window.confirm('삭제하는 경우 자료를 복구할 수 없습니다. 삭제하려면 확인을 선택해 주세요.')) return
    const { error } = await deleteStudent(studentDbId)
    if (error) { alert('삭제에 실패했습니다.'); return }
    reloadOpener()
    alert('정상적으로 처리되었습니다.')
    window.close()
  }

  const handleFamilySaveClick = async (familyRows) => {
    if (typeof studentDbId === 'number') {
      const updated = { ...form, family: familyRows }
      await updateStudent(studentDbId, updated)
      setForm(updated)
      reloadOpener()
    }
    alert('처리완료.')
  }

  const openClassRegisterWindow = () => {
    const w = 650, h = 800
    const left = window.screenX + (window.outerWidth - w) / 2
    const top = window.screenY + (window.outerHeight - h) / 2
    window.open('/class-register', '_blank', `width=${w},height=${h},left=${left},top=${top},resizable=yes`)
  }

  const handleRegisterBtnClick = () => {
    sessionStorage.setItem('classRegisterContext', JSON.stringify({ studentId: studentDbId, studentName: form.name }))
    openClassRegisterWindow()
  }

  const handleEnrollmentClick = (enrollment) => {
    sessionStorage.setItem('classRegisterContext', JSON.stringify({ studentId: studentDbId, studentName: form.name, enrollmentId: enrollment.id }))
    openClassRegisterWindow()
  }

  return (
    <div style={{minHeight:'100vh', background:'#f0f2f5', fontFamily:'inherit'}}>

      {showUpgradeModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={()=>setShowUpgradeModal(false)}>
          <div style={{background:'#fff',borderRadius:8,padding:'20px 40px',textAlign:'center',boxShadow:'0 8px 32px rgba(0,0,0,0.2)',maxWidth:360,width:'90%'}}
            onClick={e=>e.stopPropagation()}>
            <div style={{marginBottom:16}}>
              <svg width="80" height="98" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{filter:'drop-shadow(0px 3px 6px rgba(0,0,0,0.18))'}}>
                <rect x="1" y="7" width="12" height="9" rx="1.5" fill="#f8f9fb"/>
                <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="#f8f9fb" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <circle cx="7" cy="11.5" r="1.5" fill="#e8eaed"/>
                <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="#e8eaed"/>
              </svg>
            </div>
            <p style={{fontSize:15,color:'#333',lineHeight:1.7,marginBottom:20}}>무료로 정식 계정으로 전환하고<br/>모든 기능을 제한없이 이용해보세요!</p>
            <button style={{padding:'10px 24px',background:'#F5841F',color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:400,cursor:'pointer',fontFamily:'inherit'}}
              onClick={()=>window.open('https://www.acadup.co.kr/home/member/signup_agree.asp','_blank')}>잠금 해제하러 가기</button>
          </div>
        </div>
      )}

      <div className="info-panel" style={{margin:0, minHeight:'100vh', borderRadius:0, padding:30}}>
        <div style={{display:'flex',flexDirection:'column',gap:0,marginBottom:12}}>
          <span className="info-title" style={{borderLeft:'none',paddingLeft:0,paddingBottom:12,fontSize:17,fontWeight:500}}>수강생 등록</span>
          <div style={{borderBottom:'1px solid #e0e0e0',marginBottom:10}}/>
          <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
            {isNew ? <>
              <button className="info-action-btn red narrow" onClick={()=>{ alert('저장되었습니다.'); setIsNew(false); }}>저장</button>
              <button className="info-action-btn blue" onClick={()=>{ setForm(emptyForm); setIsNew(true); }}>신규 수강생 등록</button>
            </> : <>
              <button className="info-action-btn blue narrow" onClick={handleUpdateStudent}>수정</button>
              {form.status === '퇴원'
                ? <button className="info-action-btn red narrow" onClick={handleCancelWithdraw}>퇴원취소</button>
                : <button className="info-action-btn red narrow" onClick={handleWithdraw}>퇴원</button>}
              <button className="info-action-btn red narrow" onClick={handleSuspend}>휴원</button>
              <button className="info-action-btn gray narrow" onClick={handleDeleteStudent}>삭제</button>
              <button className="info-action-btn blue" onClick={()=>{
                sessionStorage.setItem('studentFileData', JSON.stringify({ studentId: studentDbId, studentName: form.name, studentBirth: form.birth }))
                const w = 800, h = 760
                const left = window.screenX + (window.outerWidth - w) / 2
                const top = window.screenY + (window.outerHeight - h) / 2
                window.open('/student-file','_blank',`width=${w},height=${h},left=${left},top=${top},resizable=yes`)
              }}>수강생파일</button>
              <button className="info-action-btn teal talk-btn">
                <span className="talk-btn-text">알림톡전송</span>
                <span className="talk-btn-icon">
                  <svg width="13" height="15" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="7" width="12" height="9" rx="1.5" fill="#fff"/>
                    <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    <circle cx="7" cy="11.5" r="1.5" fill="rgba(0,0,0,0.35)"/>
                    <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="rgba(0,0,0,0.35)"/>
                  </svg>
                </span>
              </button>
              <button className="info-action-btn blue" onClick={()=>{ setForm(emptyForm); setIsNew(true); }}>신규 수강생 등록</button>
            </>}
          </div>
        </div>

        <div className="info-body">
          <div className="info-form-wrap">
            <div className="student-photo">
              <div className="photo-box"><span>👤</span></div>
              <button className="photo-btn">사진등록/수정</button>
            </div>
            <div className="info-form">
              <div className="if-row">
                <label className="if-label required">수강생번호</label>
                <div className="if-cell">
                  <input className="if-input" placeholder="미입력시 자동부여" value={form.studentNo} onChange={e=>setForm(f=>({...f,studentNo:e.target.value}))}/>
                  <button className="if-small-btn">중복체크</button>
                  <span className="if-hint">예) 년도(2)+순번(4)</span>
                </div>
                <label className="if-label">상태</label>
                <div className="if-cell">
                  <span style={{fontSize:13,color:getDisplayStatus()==='퇴원'?'#ff3c00':(getDisplayStatus()==='휴원'||getDisplayStatus()==='예비')?'#0100FF':'#333',minWidth:40,display:'inline-block'}}>{getDisplayStatus()}</span>
                </div>
              </div>
              <div className="if-row">
                <label className="if-label required">성명</label>
                <div className="if-cell">
                  <input className="if-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
                </div>
                <label className="if-label required">생년월일</label>
                <div className="if-cell">
                  <input className="if-input" placeholder="예) 901230" style={{width:120}} value={form.birth} onChange={e=>setForm(f=>({...f,birth:e.target.value}))}/>
                  <select className="if-input" style={{width:80}} value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}>
                    <option>남자</option><option>여자</option>
                  </select>
                </div>
              </div>
              <div className="if-row">
                <label className="if-label">아이디</label>
                <div className="if-cell">
                  <input className="if-input" value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))}/>
                  <button className="if-small-btn">중복체크</button>
                </div>
                <label className="if-label">비밀번호</label>
                <div className="if-cell">
                  <span className="if-hint">신규 수강생 비밀번호는 생년월일입니다.</span>
                </div>
              </div>
              <div className="if-row">
                <label className="if-label required">입학일자</label>
                <div className="if-cell">
                  <DatePicker value={form.enrollDate} onChange={v=>setForm(f=>({...f,enrollDate:v}))}/>
                </div>
                <label className="if-label">주 결제방법</label>
                <div className="if-cell">
                  <select className="if-input"><option>선택</option><option>현장결제</option><option>비대면(카드)</option><option>비대면(계좌)</option></select>
                </div>
              </div>
              <div className="if-row">
                <label className="if-label required">학생 휴대폰</label>
                <div className="if-cell">
                  <input className="if-input" placeholder="예) 010-1234-5678" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
                </div>
                <label className="if-label">집전화</label>
                <div className="if-cell">
                  <input className="if-input" placeholder="예) 010-1234-5678" value={form.homePhone} onChange={e=>setForm(f=>({...f,homePhone:e.target.value}))}/>
                </div>
              </div>
              <div className="if-row">
                <label className="if-label">학부/학년</label>
                <div className="if-cell">
                  <select className="if-input" style={{width:80}} value={form.grade2} onChange={e=>setForm(f=>({...f,grade2:e.target.value}))}>
                    <option>선택하기</option><option>초등학교</option><option>중학교</option><option>고등학교</option><option>대학교</option>
                  </select>
                  <input className="if-input" style={{width:80}}/>
                  <input className="if-input" style={{width:40}}/>
                  <span className="if-hint">학년 0</span>
                </div>
                <label className="if-label">출결번호</label>
                <div className="if-cell">
                  <input className="if-input" style={{width:60}} maxLength={4} value={form.attendNo} onChange={e=>setForm(f=>({...f,attendNo:e.target.value}))}/>
                  <span style={{fontSize:11,color:'#aaa'}}>숫자 4자리 입력</span>
                </div>
              </div>
              <div className="if-row" style={{gridTemplateColumns:'160px 1fr'}}>
                <label className="if-label">이메일</label>
                <div className="if-cell">
                  <input className="if-input" style={{width:180}} value={form.email1} onChange={e=>setForm(f=>({...f,email1:e.target.value}))}/>
                  <span>@</span>
                  <input className="if-input" style={{width:180}} value={form.email2} onChange={e=>setForm(f=>({...f,email2:e.target.value}))}/>
                  <select className="if-input" style={{width:90}}><option>직접입력</option><option>gmail.com</option><option>naver.com</option></select>
                </div>
              </div>
              <div className="if-row" style={{gridTemplateColumns:'160px 1fr'}}>
                <label className="if-label">주소</label>
                <div className="if-cell" style={{flexDirection:'column',alignItems:'flex-start',gap:6}}>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <input className="if-input" style={{width:120}} value={form.zipcode||''} onChange={e=>setForm(f=>({...f,zipcode:e.target.value}))}/>
                    <button className="if-small-btn">우편번호 찾기</button>
                  </div>
                  <input className="if-input" style={{width:'100%'}} value={form.address||''} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
                  <input className="if-input" style={{width:'100%'}} value={form.addressDetail||''} onChange={e=>setForm(f=>({...f,addressDetail:e.target.value}))} placeholder="상세주소를 입력해 주세요."/>
                </div>
              </div>
              <div className="if-row" style={{gridTemplateColumns:'160px 1fr'}}>
                <label className="if-label">기타사항</label>
                <div className="if-cell" style={{flexDirection:'column',alignItems:'flex-start',gap:4}}>
                  <textarea className="if-input" style={{width:'100%',height:102,resize:'vertical',fontFamily:'inherit',fontSize:12}} value={form.etc||''} onChange={e=>setForm(f=>({...f,etc:e.target.value}))}/>
                  <span style={{fontSize:11,color:'#888'}}>입력 문자수 : {(form.etc||'').length} (800자 이내로 입력해 주세요)</span>
                </div>
              </div>
              <div className="if-row" style={{gridTemplateColumns:'160px 1fr'}}>
                <label className="if-label">첨부파일</label>
                <div className="if-cell">
                </div>
              </div>
            </div>
          </div>

          <div className="info-tabs-wrap">
            <div className="info-tabs">
              <div className="info-tab-v">V</div>
              {INFO_TABS.map(t=>(
                <button key={t} className={`info-tab ${infoTab===t?'active':''}`}
                  onClick={()=>{ LOCKED_TABS.includes(t) ? setShowUpgradeModal(true) : setInfoTab(t) }}
                  style={{position:'relative', ...(LOCKED_TABS.includes(t)?{borderRadius:0}:{})}}>
                  {t}
                  {LOCKED_TABS.includes(t) && (
                    <span style={{position:'absolute',inset:0,background:'rgba(100,100,100,0.55)',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',borderRadius:'inherit'}}>
                      <svg width="18" height="22" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="7" width="12" height="9" rx="1.5" fill="white"/>
                        <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                        <circle cx="7" cy="11.5" r="1.5" fill="rgba(100,100,100,0.55)"/>
                        <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="rgba(100,100,100,0.55)"/>
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="info-tab-content">
              {infoTab==='가족'     && <FamilyTab key={studentDbId} onSaveClick={handleFamilySaveClick} initialRows={form.family} />}
              {infoTab==='수강'     && <ClassTab onRegisterClick={handleRegisterBtnClick} enrollments={contextEnrollments.filter(e => e.studentId === studentDbId)} onEnrollmentClick={handleEnrollmentClick} />}
              {infoTab==='수납'     && <PaymentTab studentId={studentDbId} studentName={form.name} />}
              {infoTab==='결제'     && <BillingTab studentId={studentDbId} studentName={form.name} />}
              {infoTab==='상담'     && <ConsultTab />}
              {infoTab==='출결'     && <AttendTab />}
              {infoTab==='학원성적' && <AcademyScoreTab />}
              {infoTab==='학교성적' && <SchoolScoreTab />}
              {infoTab==='알림내역' && <NoticeTab />}
              {infoTab==='메모'     && <MemoTab />}
              {infoTab==='진도'     && <ProgressTab />}
              {infoTab==='차량'     && <VehicleTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
