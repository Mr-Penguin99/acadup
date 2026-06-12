import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Students.css'
import TopNav from '../components/TopNav'
import { MonthPicker, DatePicker } from '../components/DatePicker'
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

const MENUS = [
  { id: 'students',    icon: '/icons/students.svg',    label: '수강생관리' },
  { id: 'payments',   icon: '/icons/payments.svg',    label: '수납관리' },
  { id: 'classes',    icon: '/icons/classes.svg',     label: '반관리' },
  { id: 'lessons',    icon: '/icons/lessons.svg',     label: '수업관리' },
  { id: 'consult',    icon: '/icons/consult.svg',     label: '상담관리' },
  { id: 'vehicle',    icon: '/icons/vehicle.svg',     label: '차량관리' },
  { id: 'staff',      icon: '/icons/staff.svg',       label: '직원관리' },
  { id: 'ledger',     icon: '/icons/ledger.svg',      label: '장부관리' },
  { id: 'management', icon: '/icons/management.svg',  label: '경영현황' },
  { id: 'ai',         icon: '/icons/ai.svg',          label: 'AI학원경영' },
  { id: 'salary',     icon: '/icons/salary.svg',      label: '급여관리' },
  { id: 'labor',      icon: '/icons/labor.svg',       label: '노무관리' },
  { id: 'accounting', icon: '/icons/acccounting.svg', label: '회계관리' },
  { id: 'shop',       icon: '/icons/shop.svg',        label: '회원전용몰' },
]

const SIDE_MENUS = [
  {
    id: 'students', label: '수강생관리',
    items: [
      { id: 'class-students', label: '반별 수강생' },
      { id: 'student-status', label: '수강생현황' },
    ]
  },
  {
    id: 'attendance', label: '등하원관리',
    items: [
      { id: 'attend-inout', label: '등원/하원' },
      { id: 'attend-ride',  label: '승차/하차' },
    ]
  },
  {
    id: 'notice', label: '학원공지',
    items: [
      { id: 'notice-board',    label: '공지사항' },
      { id: 'notice-talk',     label: '소통톡톡' },
      { id: 'notice-replace',  label: '문자치환 공지' },
      { id: 'notice-schedule', label: '전송예약 현황' },
    ]
  },
]

const REPLACE_DATA = [
  { id:13, title:'아카데미업 레벨테스트 결과 발표', hasFile:true,  target:3, sentStatus:'미전송',    writer:'장up다(원장)', date:'2026-04-13' },
  { id:12, title:'간단한 내용11',                  hasFile:false, target:2, sentStatus:'미전송',    writer:'장up다(원장)', date:'2026-04-10' },
  { id:11, title:'ㅎ ㅎ ㅎ ㅎ ㅎ ㅎ ㅎ ㅎ ㅎ ㅎ ㅎ ㅎ ㅎ ㅎ ㅎ', hasFile:true, target:2, sentStatus:'미전송', writer:'장up다(원장)', date:'2026-03-18' },
  { id:10, title:'2월 정기이사회 안건',             hasFile:true,  target:3, sentStatus:'전송완료',  writer:'장up다(원장)', date:'2026-02-06' },
  { id:9,  title:'새해인사 드립니다',               hasFile:true,  target:4, sentStatus:'3/4건 전송',writer:'장up다(원장)', date:'2026-02-02' },
  { id:8,  title:'월례회의 공지',                   hasFile:false, target:2, sentStatus:'전송완료',  writer:'장up다(원장)', date:'2026-01-28' },
  { id:7,  title:'발신자번호를 지우고 작성하는 학원공지', hasFile:false, target:1, sentStatus:'미전송', writer:'장up다(원장)', date:'2026-01-06' },
]
const TALK_DATA = [
  { id:1, title:'우리 아이 아랑이가 피아노를치고 있어요....', sentStatus:'전송완료', writer:'장해남', date:'2025-05-14' },
]
const NOTICE_DATA = [
  { id:3, type:'공지', title:'241203공지사항',    linked:true,  sentStatus:'전송완료', writer:'김관리자', date:'2024-12-03' },
  { id:2, type:'공지', title:'공자사항 제 001 호', linked:true,  sentStatus:'전송완료', writer:'김관리자', date:'2024-04-01' },
  { id:1, type:'',    title:'공지사항 제 002 호', linked:false, sentStatus:'미전송',   writer:'김관리자', date:'2024-04-01' },
]
const ATTEND_DATA = [
  { id:1, name:'@예비' }, { id:2, name:'@이순신' }, { id:3, name:'@하늘땅' },
  { id:4, name:'abc' },   { id:5, name:'가나다' },   { id:6, name:'교재수령수강생' },
  { id:7, name:'김학생AA' }, { id:8, name:'김학생CC' }, { id:9, name:'학생1' }, { id:10, name:'홍길동ab' },
]
const STUDENT_STATUS_DATA = [
  { id:1, name:'@예비',    birth:'20.01.01', photo:'X', status:'재원', classes:['to_반그룹 > to_반_AAA_배정'], keypad:'1234', dept:'', school:'', grade:'' },
  { id:2, name:'@이순신',  birth:'20.01.01', photo:'X', status:'재원', classes:['to_반그룹 > to_반_AAA_배정','to_반그룹 > from_반_CCC','to_반그룹 > to_반_001_배정','고등_AA > 고등_AA_기초반'], keypad:'2350', dept:'초등학교', school:'', grade:'1' },
  { id:3, name:'@하늘땅',  birth:'20.01.02', photo:'X', status:'재원', classes:['to_반그룹 > from_반_CCC'], keypad:'', dept:'중학교', school:'', grade:'' },
  { id:4, name:'abc',      birth:'14.01.01', photo:'X', status:'재원', classes:['고등_AA > 고등_AA_기초반'], keypad:'1709', dept:'', school:'', grade:'' },
  { id:5, name:'가나다',   birth:'20.01.01', photo:'X', status:'재원', classes:['to_반그룹 > to_반_AAA_배정'], keypad:'1111', dept:'', school:'', grade:'' },
  { id:6, name:'김길동',   birth:'23.01.01', photo:'X', status:'재원', classes:['no-use반모음 > 회 차반_333(사용안함)'], keypad:'', dept:'', school:'', grade:'' },
  { id:7, name:'김학생AA', birth:'23.01.01', photo:'X', status:'재원', classes:['to_반그룹 > to_반_001_배정','반그룹_01(기간반) > 01_국어(222개월)'], keypad:'', dept:'', school:'', grade:'' },
  { id:8, name:'김학생CC', birth:'20.10.12', photo:'O', status:'재원', classes:['to_반그룹 > to_반_001_배정','반그룹_01(기간반) > 01_국어(222개월)'], keypad:'', dept:'', school:'', grade:'' },
  { id:9, name:'학생1',    birth:'20.01.01', photo:'X', status:'재원', classes:['반그룹 수업1 > 수업1 영어(월화목토)'], keypad:'1234', dept:'고등학교', school:'', grade:'1' },
]
const INFO_TABS = ['가족','수강','수납','결제','상담','출결','학원성적','학교성적','알림내역','메모','진도','차량']
const LOCKED_TABS = ['상담','학원성적','학교성적','알림내역','메모','진도','차량']
const UNLOCKED_MENUS = ['students','payments','classes']

export default function Students() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('students')
  const [activeSide, setActiveSide] = useState('class-students')
  const [expanded, setExpanded] = useState(['students'])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTab, setSearchTab] = useState('반')
  const [infoTab, setInfoTab] = useState('가족')
  const [search, setSearch] = useState({ group: '', className: '', name: '' })
  const [statusFilter, setStatusFilter] = useState({
    teacher:'전체', group:'전체', className:'전체', studentStatus:'재원',
    searchType:'수강생-성명', keyword:'', motive:'',
    dept:'', grade:'', school:'', gender:'', birthType:'생년월일', birthFrom:'', birthTo:''
  })
  const [statusChecked, setStatusChecked] = useState([])
  const [statusPageSize, setStatusPageSize] = useState('20')
  const [attendFilter, setAttendFilter] = useState({
    month:'2026-05', searchType:'반그룹', group:'전체', className:'', studentStatus:'전체', name:''
  })
  const [rideFilter, setRideFilter] = useState({
    month:'2026-05', group:'전체', className:'', studentStatus:'전체', name:''
  })
  const [noticeSearch, setNoticeSearch] = useState({ type:'제목+내용', keyword:'' })
  const [talkSearch, setTalkSearch] = useState({ type:'제목+내용', keyword:'' })
  const [replaceSearch, setReplaceSearch] = useState({ type:'제목+내용', keyword:'' })
  const [scheduleSearch, setScheduleSearch] = useState('')
  const [scheduleChecked, setScheduleChecked] = useState([])
  const [replaceChecked, setReplaceChecked] = useState([])
  const [talkChecked, setTalkChecked] = useState([])
  const [noticeChecked, setNoticeChecked] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState(null) // null | 'new' | number
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [lockedClickCount, setLockedClickCount] = useState(0)
  const [menuLockedClickCount, setMenuLockedClickCount] = useState(0)

  const emptyForm = {
    studentNo:'', status:'', name:'', birth:'', gender:'남자',
    id:'', pw:'', enrollDate:'', payMethod:'',
    phone:'', homePhone:'', grade1:'', grade2:'', attendNo:'',
    email1:'', email2:'', emailType:'직접입력', dept:'',
  }
  const [form, setForm] = useState(emptyForm)

  const handleNewStudent = () => {
    setSelectedStudentId('new')
    setForm(emptyForm)
    setInfoTab('가족')
  }

  const handleSelectStudent = (s) => {
    setSelectedStudentId(s.id)
    setForm(s)
    setInfoTab('가족')
  }

  const handleSave = () => {
    if (!form.name)       { alert('성명을 입력해주세요.'); return }
    if (!form.birth)      { alert('생년월일을 입력해주세요.'); return }
    if (!form.enrollDate) { alert('입학일자를 입력해주세요.'); return }
    if (!form.phone)      { alert('학생 휴대폰을 입력해주세요.'); return }
    if (selectedStudentId === 'new') {
      const newId = Date.now()
      setStudents(prev => [...prev, { ...form, id: newId }])
      setSelectedStudentId(newId)
    } else {
      setStudents(prev => prev.map(s => s.id === selectedStudentId ? { ...form, id: selectedStudentId } : s))
    }
  }

  const toggleGroup = id => setExpanded(e => e.includes(id) ? [] : [id])
  const toggleReplaceCheck = id => setReplaceChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id])
  const toggleTalkCheck    = id => setTalkChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id])
  const toggleNoticeCheck  = id => setNoticeChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id])
  const toggleStatusCheck  = id => setStatusChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id])
  const toggleStatusAll    = () => setStatusChecked(statusChecked.length===STUDENT_STATUS_DATA.length ? [] : STUDENT_STATUS_DATA.map(d=>d.id))

  return (
    <div className="students-wrap">
      <TopNav />
      <div className="menu-bar">
        <button className="hamburger-btn" onClick={()=>setSidebarOpen(s=>!s)}>☰</button>
        <div className="menu-list">
          {MENUS.map(m=>{
            const isLocked = !UNLOCKED_MENUS.includes(m.id)
            return (
              <div key={m.id} className={`menu-item ${activeMenu===m.id?'active':''} ${isLocked?'locked':''}`}
                style={{position:'relative'}}
                onClick={()=>{
                  if(isLocked){
                    const next = menuLockedClickCount + 1
                    if(next >= 2){ setShowUpgradeModal(true); setMenuLockedClickCount(0) }
                    else { setMenuLockedClickCount(next) }
                  } else {
                    setActiveMenu(m.id)
                    if(m.id==='students'){setActiveSide('class-students');setExpanded(['students'])}
                    if(m.id==='settings') navigate('/settings')
                    if(m.id==='dashboard') navigate('/dashboard')
                    if(m.id==='payments') navigate('/payments')
                    if(m.id==='classes') navigate('/classes')
                  }
                }}>
                <img src={m.icon} alt={m.label} className="menu-icon"/>
                <span className="menu-label">{m.label}</span>
                {isLocked && (
                  <span style={{
                    position:'absolute', inset:0,
                    background:'rgba(200,200,200,0.75)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    pointerEvents:'none',
                  }}>
                    <svg width="22" height="27" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="7" width="12" height="9" rx="1.5" fill="#fff"/>
                      <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/>
                      <circle cx="7" cy="11.5" r="1.5" fill="rgba(200,200,200,0.75)"/>
                      <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="rgba(200,200,200,0.75)"/>
                    </svg>
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <button className="menu-charge-btn">전송충전관리</button>
      </div>

      <div className="students-body">
        {sidebarOpen && (
          <div className="students-sidebar">
            <div className="ss-title">수강생관리</div>
            {SIDE_MENUS.map(group=>(
              <div key={group.id} className="ss-group-wrap">
                <div className="ss-group" onClick={()=>toggleGroup(group.id)}>
                  <span className="ss-toggle">{expanded.includes(group.id)?'∧':'∨'}</span>
                  <span>{group.label}</span>
                </div>
                {expanded.includes(group.id)&&group.items.map(item=>(
                  <div key={item.id} className={`ss-item ${activeSide===item.id?'active':''}`}
                    onClick={()=>setActiveSide(item.id)}>
                    <span className="ss-arrow">▶</span> {item.label}
                  </div>
                ))}
              </div>
            ))}
            <div className="ss-footer">
              <div className="ss-phone">1811-3435</div>
              <div className="ss-hours">평일 09:00~18:00</div>
            </div>
          </div>
        )}

        {showUpgradeModal && (
          <div style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
            zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center',
          }} onClick={()=>setShowUpgradeModal(false)}>
            <div style={{
              background:'#fff', borderRadius:8, padding:'36px 40px',
              textAlign:'center', boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
              maxWidth:360, width:'90%',
            }} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:36, marginBottom:16}}>🔒</div>
              <p style={{fontSize:15, color:'#333', lineHeight:1.7, marginBottom:24}}>
                정식 계정으로 전환 시 기능을<br/>제한 없이 이용하실 수 있습니다.
              </p>
              <button style={{
                padding:'10px 24px', background:'#F5841F', color:'#fff',
                border:'none', borderRadius:6, fontSize:14, fontWeight:700,
                cursor:'pointer', fontFamily:'inherit',
              }} onClick={()=>setShowUpgradeModal(false)}>
                정식 전환하러 가기
              </button>
            </div>
          </div>
        )}

        <div className="students-main">

          {/* 반별 수강생 */}
          {activeSide==='class-students'&&(
            <>
              <div className="sm-page-title"><span style={{color:'#F5C518'}}>⭐</span> 반별 수강생 (직원용)</div>
              <div className="students-content">
                <div className="search-panel">
                  <div className="sp-tabs">
                    {['반','강사'].map(t=>(
                      <button key={t} className={`sp-tab ${searchTab===t?'active':''}`}
                        onClick={()=>setSearchTab(t)}>{t}</button>
                    ))}
                  </div>
                  <div className="sp-form">
                    {searchTab==='반' ? <>
                      <div className="sp-field"><label className="sp-label">반그룹</label><select className="sp-input"><option>선택하기</option></select></div>
                    </> : <>
                      <div className="sp-field"><label className="sp-label">강사</label><select className="sp-input"><option>선택하기</option></select></div>
                    </>}
                    <div className="sp-field"><label className="sp-label">반명</label><select className="sp-input"><option>선택하기</option></select></div>
                    <div className="sp-field">
                      <label className="sp-label">수강생</label>
                      <input className="sp-input" placeholder="성명 또는 휴대폰 끝4자리" value={search.name}
                        onChange={e=>setSearch(s=>({...s,name:e.target.value}))}/>
                    </div>
                    <button className="sp-search-btn">검색</button>
                    <div className="sp-result">검색결과 : <strong>{students.length}명</strong></div>
                    <div className="sp-table">
                      <div className="sp-table-head"><span>이름</span><span>생년월일</span></div>
                      {students.length === 0
                        ? <div className="sp-table-empty">검색 결과가 없습니다.</div>
                        : students.map(s => (
                            <div key={s.id}
                              className={`sp-table-row ${selectedStudentId === s.id ? 'active' : ''}`}
                              onClick={() => handleSelectStudent(s)}>
                              <span>{s.name}</span><span>{s.birth}</span>
                            </div>
                          ))
                      }
                    </div>
                  </div>
                </div>
                <div className="info-panel">
                  <div className="info-header">
                    <span className="info-title">학생 정보자료</span>
                    <div style={{display:'flex',gap:8}}>
                      <button className="info-save-btn" style={{background:'#E8445A'}} onClick={handleSave}>저장</button>
                      <button className="info-new-btn" onClick={handleNewStudent}>신규 수강생 등록</button>
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
                            <select className="if-input" style={{width:120}} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value=''>선택하기</option><option>재원</option><option>예비</option><option>휴원</option><option>퇴원</option><option>예비+휴원+퇴원</option></select>
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
                            <select className="if-input" style={{width:80}}><option>선택하기</option><option>초등학교</option><option>중학교</option><option>고등학교</option><option>대학교</option></select>
                            <input className="if-input" style={{width:80}} value={form.grade2} onChange={e=>setForm(f=>({...f,grade2:e.target.value}))}/>
                            <input className="if-input" style={{width:40}}/>
                            <span className="if-hint">학년 0</span>
                          </div>
                          <label className="if-label">출결번호</label>
                          <div className="if-cell">
                            <input className="if-input" style={{width:60}} maxLength={4} value={form.attendNo} onChange={e=>setForm(f=>({...f,attendNo:e.target.value}))}/>
                            <span style={{fontSize:11, color:'#aaa'}}>숫자 4자리 입력</span>
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
                      </div>
                    </div>
                    <div className="info-tabs-wrap">
                      <div className="info-tabs">
                        <div className="info-tab-v">V</div>
                        {INFO_TABS.map(t=>(
                          <button key={t} className={`info-tab ${infoTab===t?'active':''}`}
                            onClick={()=>{
                              if(LOCKED_TABS.includes(t)){
                                const next = lockedClickCount + 1
                                if(next >= 2){ setShowUpgradeModal(true); setLockedClickCount(0) }
                                else { setLockedClickCount(next) }
                              } else {
                                setInfoTab(t)
                              }
                            }}
                            style={{position:'relative', ...(LOCKED_TABS.includes(t)?{borderRadius:0}:{})}}>
                            {t}
                            {LOCKED_TABS.includes(t) && (
                              <span style={{
                                position:'absolute', inset:0,
                                background:'rgba(100,100,100,0.55)',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                pointerEvents:'none', borderRadius:'inherit',
                              }}>
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
                      {selectedStudentId !== null && selectedStudentId !== 'new' && (
                        <div className="info-tab-content">
                          {infoTab==='가족'     && <FamilyTab />}
                          {infoTab==='수강'     && <ClassTab />}
                          {infoTab==='수납'     && <PaymentTab />}
                          {infoTab==='결제'     && <BillingTab />}
                          {infoTab==='상담'     && <ConsultTab />}
                          {infoTab==='출결'     && <AttendTab />}
                          {infoTab==='학원성적' && <AcademyScoreTab />}
                          {infoTab==='학교성적' && <SchoolScoreTab />}
                          {infoTab==='알림내역' && <NoticeTab />}
                          {infoTab==='메모'     && <MemoTab />}
                          {infoTab==='진도'     && <ProgressTab />}
                          {infoTab==='차량'     && <VehicleTab />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 수강생현황 */}
          {activeSide==='student-status'&&(
            <>
              <div className="sm-page-title"><span style={{color:'#F5C518'}}>⭐</span> 수강생 현황</div>
              <div className="sts-section">
                <div className="sts-sec-head">
                  <div className="sts-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="sts-search-btn">검색하기</button>
                    <button className="sts-export-btn">수강생내역출력</button>
                    <button className="sts-reset-btn">초기화</button>
                  </div>
                </div>
                <div className="sts-filter">
                  <div className="sts-filter-row">
                    <div className="sts-filter-item"><label className="sts-filter-label first">강사</label><select className="sts-input" value={statusFilter.teacher} onChange={e=>setStatusFilter(f=>({...f,teacher:e.target.value}))}><option>전체</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">반 그룹</label><select className="sts-input" value={statusFilter.group} onChange={e=>setStatusFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">반명</label><select className="sts-input" value={statusFilter.className} onChange={e=>setStatusFilter(f=>({...f,className:e.target.value}))}><option>전체</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">수강생상태</label><select className="sts-input" value={statusFilter.studentStatus} onChange={e=>setStatusFilter(f=>({...f,studentStatus:e.target.value}))}><option>선택하기</option><option>재원</option><option>예비</option><option>휴원</option><option>퇴원</option><option>예비+휴원+퇴원</option></select></div>
                    <div className="sts-filter-item">
                      <select className="sts-input" style={{width:120,marginLeft:14}} value={statusFilter.searchType} onChange={e=>setStatusFilter(f=>({...f,searchType:e.target.value}))}><option>수강생-성명</option><option>수강생-휴대폰</option><option>수강생-집전화</option></select>
                      <input className="sts-input" style={{width:150,marginLeft:14}} value={statusFilter.keyword} onChange={e=>setStatusFilter(f=>({...f,keyword:e.target.value}))}/>
                      <label className="sts-filter-label">수강동기</label>
                      <select className="sts-input" style={{width:120,marginLeft:14}} value={statusFilter.motive} onChange={e=>setStatusFilter(f=>({...f,motive:e.target.value}))}><option>선택하기</option></select>
                    </div>
                  </div>
                  <div className="sts-filter-row">
                    <div className="sts-filter-item"><label className="sts-filter-label first">학부</label><select className="sts-input" value={statusFilter.dept} onChange={e=>setStatusFilter(f=>({...f,dept:e.target.value}))}><option>선택하기</option><option>초등학교</option><option>중학교</option><option>고등학교</option><option>대학교</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">학년</label><input className="sts-input" value={statusFilter.grade} onChange={e=>setStatusFilter(f=>({...f,grade:e.target.value}))}/></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">학교</label><input className="sts-input" value={statusFilter.school} onChange={e=>setStatusFilter(f=>({...f,school:e.target.value}))}/></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">성별</label><select className="sts-input" value={statusFilter.gender} onChange={e=>setStatusFilter(f=>({...f,gender:e.target.value}))}><option>선택하기</option><option>남자</option><option>여자</option></select></div>
                    <div className="sts-filter-item">
                      <select className="sts-input" style={{width:120,marginLeft:14}} value={statusFilter.birthType} onChange={e=>setStatusFilter(f=>({...f,birthType:e.target.value}))}><option>생년월일</option><option>입학일자</option><option>퇴원일자</option></select>
                      <div style={{gridColumn:'span 3',display:'flex',gap:6,alignItems:'center',marginLeft:14}}>
                        <DatePicker value={statusFilter.birthFrom} onChange={v=>setStatusFilter(f=>({...f,birthFrom:v}))} style={{width:120}}/>
                        <span>~</span>
                        <DatePicker value={statusFilter.birthTo} onChange={v=>setStatusFilter(f=>({...f,birthTo:v}))} style={{width:120}}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sts-section">
                <div className="sts-list-head">
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <span className="sts-sec-title">수강생 목록</span>
                    <span className="sts-count-info">검색인원:12명 &nbsp;<span style={{color:'#555'}}>(전체수강생)</span>&nbsp;재원:<strong style={{color:'#333'}}>11명</strong>&nbsp;예비:<strong style={{color:'#29ABE2'}}>3명</strong>&nbsp;휴원:<strong>0명</strong>&nbsp;퇴원:<strong style={{color:'#E8445A'}}>33명</strong></span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:12,color:'#666'}}>페이지당 조회</span>
                    <select className="sts-input" style={{width:60}} value={statusPageSize} onChange={e=>setStatusPageSize(e.target.value)}><option>10</option><option>20</option><option>50</option></select>
                    <button className="sts-search-btn">수강생 등록</button>
                    <button className="sts-teal-btn">진도 등록</button>
                    <button className="sts-gray-btn">알림톡전송</button>
                    <button className="sts-gray-btn">알림톡전체전송</button>
                  </div>
                </div>
                <div className="sts-table-wrap">
                  <table className="sts-table">
                    <thead><tr>
                      <th><input type="checkbox" checked={statusChecked.length===STUDENT_STATUS_DATA.length} onChange={toggleStatusAll}/></th>
                      <th>성명</th><th>생년월일</th><th>사진</th><th>상태</th><th>반명</th><th>키패드</th><th>학부</th><th>학교명</th><th>학년</th>
                    </tr></thead>
                    <tbody>
                      {STUDENT_STATUS_DATA.map(d=>(
                        <tr key={d.id} className={statusChecked.includes(d.id)?'checked-row':''}>
                          <td><input type="checkbox" checked={statusChecked.includes(d.id)} onChange={()=>toggleStatusCheck(d.id)}/></td>
                          <td><div style={{display:'flex',alignItems:'center',gap:4}}><span>👤</span><span>{d.name}</span></div></td>
                          <td>{d.birth}</td>
                          <td style={{textAlign:'center'}}>{d.photo}</td>
                          <td style={{textAlign:'center'}}>{d.status}</td>
                          <td>{d.classes.map((c,i)=><div key={i} style={{fontSize:11,color:'#444',lineHeight:'1.6'}}>{c}</div>)}</td>
                          <td>{d.keypad}</td><td>{d.dept}</td><td>{d.school}</td>
                          <td style={{textAlign:'center'}}>{d.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sts-pagination">
                  <div className="sts-pages">{[1,2].map(p=><button key={p} className={`sts-page-btn ${p===1?'active':''}`}>{p}</button>)}</div>
                  <span className="sts-page-info">1 / 2 Pages</span>
                </div>
              </div>
            </>
          )}

          {/* 등원/하원 */}
          {activeSide==='attend-inout'&&(
            <>
              <div className="sm-page-title"><span style={{color:'#ccc'}}>☆</span> 등원/하원</div>
              <div className="sts-section">
                <div className="sts-sec-head">
                  <div className="sts-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="sts-search-btn">검색하기</button>
                    <button className="sts-export-btn">등원/하원 출력</button>
                    <button className="sts-reset-btn">초기화</button>
                  </div>
                </div>
                <div className="sts-filter">
                  <div className="sts-filter-row">
                    <div className="sts-filter-item">
                      <label className="sts-filter-label">수강월</label>
                      <MonthPicker value={attendFilter.month} onChange={v=>setAttendFilter(f=>({...f,month:v}))}/>
                    </div>
                    <div className="sts-filter-item"><label className="sts-filter-label">검색유형</label><select className="sts-input" value={attendFilter.searchType} onChange={e=>setAttendFilter(f=>({...f,searchType:e.target.value}))}><option>반그룹</option><option>강사</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">반 그룹</label><select className="sts-input" value={attendFilter.group} onChange={e=>setAttendFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">반명</label><select className="sts-input" value={attendFilter.className} onChange={e=>setAttendFilter(f=>({...f,className:e.target.value}))}><option>선택하기</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">수강생상태</label><select className="sts-input" value={attendFilter.studentStatus} onChange={e=>setAttendFilter(f=>({...f,studentStatus:e.target.value}))}><option>전체</option><option>재원</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">수강생 성명</label><input className="sts-input" value={attendFilter.name} onChange={e=>setAttendFilter(f=>({...f,name:e.target.value}))}/></div>
                  </div>
                </div>
              </div>
              <div className="sts-section">
                <div className="att-cal-head"><span className="sts-sec-title">등원/하원 현황</span></div>
                <div className="att-cal-wrap">
                  <table className="att-cal-table">
                    <thead><tr>
                      <th className="att-th-no">번호</th>
                      <th className="att-th-name">성명</th>
                      {(()=>{const[y,m]=attendFilter.month.split('-').map(Number);const days=new Date(y,m,0).getDate();const DOW=['일','월','화','수','목','금','토'];return Array.from({length:days},(_,i)=>{const d=i+1;const dow=new Date(y,m-1,d).getDay();return(<th key={d} className={`att-th-day ${dow===0?'att-sun':dow===6?'att-sat':''}`}><div>{d}일</div><div>{DOW[dow]}</div></th>)})})()}
                    </tr></thead>
                    <tbody>
                      {ATTEND_DATA.map(d=>(
                        <tr key={d.id}>
                          <td className="att-td-no">{d.id}</td>
                          <td className="att-td-name"><div style={{display:'flex',alignItems:'center',gap:4}}><span>👤</span><span>{d.name}</span></div></td>
                          {(()=>{const[y,m]=attendFilter.month.split('-').map(Number);const days=new Date(y,m,0).getDate();return Array.from({length:days},(_,i)=><td key={i} className="att-td-day"></td>)})()}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sts-pagination">
                  <div className="sts-pages">{[1,2].map(p=><button key={p} className={`sts-page-btn ${p===1?'active':''}`}>{p}</button>)}</div>
                  <span className="sts-page-info">1 / 2 Pages</span>
                </div>
              </div>
            </>
          )}

          {/* 승차/하차 */}
          {activeSide==='attend-ride'&&(
            <>
              <div className="sm-page-title"><span style={{color:'#ccc'}}>☆</span> 승차/하차</div>
              <div className="sts-section">
                <div className="sts-sec-head">
                  <div className="sts-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="sts-search-btn">검색하기</button>
                    <button className="sts-reset-btn">초기화</button>
                  </div>
                </div>
                <div className="sts-filter">
                  <div className="sts-filter-row">
                    <div className="sts-filter-item">
                      <label className="sts-filter-label">수강월</label>
                      <MonthPicker value={rideFilter.month} onChange={v=>setRideFilter(f=>({...f,month:v}))}/>
                    </div>
                    <div className="sts-filter-item"><label className="sts-filter-label">반 그룹</label><select className="sts-input" value={rideFilter.group} onChange={e=>setRideFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">반명</label><select className="sts-input" value={rideFilter.className} onChange={e=>setRideFilter(f=>({...f,className:e.target.value}))}><option>선택하기</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">수강생상태</label><select className="sts-input" value={rideFilter.studentStatus} onChange={e=>setRideFilter(f=>({...f,studentStatus:e.target.value}))}><option>전체</option><option>재원</option></select></div>
                    <div className="sts-filter-item"><label className="sts-filter-label">수강생 성명</label><input className="sts-input" value={rideFilter.name} onChange={e=>setRideFilter(f=>({...f,name:e.target.value}))}/></div>
                  </div>
                </div>
              </div>
              <div className="sts-section">
                <div className="att-cal-head"><span className="sts-sec-title">승차/하차 현황</span></div>
                <div className="att-cal-wrap">
                  <table className="att-cal-table">
                    <thead><tr>
                      <th className="att-th-no">번호</th>
                      <th className="att-th-name">성명</th>
                      {(()=>{const[y,m]=rideFilter.month.split('-').map(Number);const days=new Date(y,m,0).getDate();const DOW=['일','월','화','수','목','금','토'];return Array.from({length:days},(_,i)=>{const d=i+1;const dow=new Date(y,m-1,d).getDay();return(<th key={d} className={`att-th-day ${dow===0?'att-sun':dow===6?'att-sat':''}`}><div>{d}일</div><div>{DOW[dow]}</div></th>)})})()}
                    </tr></thead>
                    <tbody>
                      {ATTEND_DATA.map(d=>(
                        <tr key={d.id}>
                          <td className="att-td-no">{d.id}</td>
                          <td className="att-td-name"><div style={{display:'flex',alignItems:'center',gap:4}}><span>👤</span><span>{d.name}</span></div></td>
                          {(()=>{const[y,m]=rideFilter.month.split('-').map(Number);const days=new Date(y,m,0).getDate();return Array.from({length:days},(_,i)=><td key={i} className="att-td-day"></td>)})()}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sts-pagination">
                  <div className="sts-pages">{[1,2].map(p=><button key={p} className={`sts-page-btn ${p===1?'active':''}`}>{p}</button>)}</div>
                  <span className="sts-page-info">1 / 2 Pages</span>
                </div>
              </div>
            </>
          )}

          {/* 학원공지 미리보기 배너 */}
          {['notice-board','notice-talk','notice-replace','notice-schedule'].includes(activeSide)&&(
            <div style={{background:'#FFF8F0',border:'1px solid #F5C49A',borderRadius:4,padding:'9px 16px',marginBottom:12,fontSize:13,color:'#b85c00',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span>이 화면은 미리보기입니다. 정식 전환하시면 지금 보이는 기능을 바로 사용하실 수 있어요.</span>
              <button style={{flexShrink:0,marginLeft:16,padding:'5px 14px',background:'#F5841F',color:'#fff',border:'none',borderRadius:4,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                정식전환 요청하기
              </button>
            </div>
          )}

          {/* 공지사항 */}
          {activeSide==='notice-board'&&(
            <>
              <div className="sm-page-title"><span style={{color:'#ccc'}}>☆</span> 공지사항</div>
              <div className="notice-subtitle">수강생 및 학부모에게 안내하는 경리up다(학원)ㄱㄱ 소식입니다.</div>
              <div className="notice-search-wrap">
                <select className="sts-input" style={{width:120}} value={noticeSearch.type} onChange={e=>setNoticeSearch(f=>({...f,type:e.target.value}))}><option>제목+내용</option><option>제목</option><option>내용</option></select>
                <div className="notice-search-box"><input className="notice-search-input" value={noticeSearch.keyword} onChange={e=>setNoticeSearch(f=>({...f,keyword:e.target.value}))}/><button className="notice-search-icon">🔍</button></div>
              </div>
              <div className="sts-section">
                <div className="notice-list-head">
                  <span className="sts-sec-title">공지사항 목록</span>
                  <div style={{display:'flex',gap:6}}><button className="sts-teal-btn">공지사항 등록</button><button className="sts-export-btn">알림톡전송</button></div>
                </div>
                <table className="notice-table">
                  <thead><tr><th>번호</th><th>선택</th><th>제목</th><th>문자전송</th><th>작성자</th><th>작성일</th></tr></thead>
                  <tbody>
                    {NOTICE_DATA.map(d=>(
                      <tr key={d.id}>
                        <td style={{textAlign:'center'}}>{d.id}</td>
                        <td style={{textAlign:'center'}}><input type="checkbox" checked={noticeChecked.includes(d.id)} onChange={()=>toggleNoticeCheck(d.id)}/></td>
                        <td><div style={{display:'flex',alignItems:'center',gap:6}}>{d.type&&<span className="notice-badge">{d.type}</span>}<span className="notice-file-icon">📄</span>{d.linked?<span className="notice-title-link">{d.title}</span>:<span>{d.title}</span>}</div></td>
                        <td style={{textAlign:'center'}}><span className={d.sentStatus==='미전송'?'notice-unsent':'notice-sent'}>{d.sentStatus}</span></td>
                        <td style={{textAlign:'center'}}>{d.writer}</td>
                        <td style={{textAlign:'center'}}>{d.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* 소통톡톡 */}
          {activeSide==='notice-talk'&&(
            <>
              <div className="sm-page-title"><span style={{color:'#ccc'}}>☆</span> 소통톡톡</div>
              <div className="notice-subtitle">수강생의 멋진 작품과 성장 이야기, 학원 생활에서의 소중한 순간들을 전합니다.</div>
              <div className="notice-search-wrap">
                <select className="sts-input" style={{width:120}} value={talkSearch.type} onChange={e=>setTalkSearch(f=>({...f,type:e.target.value}))}><option>제목+내용</option><option>제목</option><option>내용</option></select>
                <div className="notice-search-box"><input className="notice-search-input" value={talkSearch.keyword} onChange={e=>setTalkSearch(f=>({...f,keyword:e.target.value}))}/><button className="notice-search-icon">🔍</button></div>
              </div>
              <div className="sts-section">
                <div className="notice-list-head">
                  <span className="sts-sec-title">소통톡톡 목록</span>
                  <div style={{display:'flex',gap:6}}><button className="sts-teal-btn">소통톡톡 등록</button><button className="sts-export-btn">알림톡전송</button></div>
                </div>
                <table className="notice-table">
                  <thead><tr><th>번호</th><th>선택</th><th>제목</th><th>문자전송</th><th>작성자</th><th>작성일</th></tr></thead>
                  <tbody>
                    {TALK_DATA.map(d=>(
                      <tr key={d.id}>
                        <td style={{textAlign:'center'}}>{d.id}</td>
                        <td style={{textAlign:'center'}}><input type="checkbox" checked={talkChecked.includes(d.id)} onChange={()=>toggleTalkCheck(d.id)}/></td>
                        <td>{d.title}</td>
                        <td style={{textAlign:'center'}}><span className={d.sentStatus==='미전송'?'notice-unsent':'notice-sent'}>{d.sentStatus}</span></td>
                        <td style={{textAlign:'center'}}>{d.writer}</td>
                        <td style={{textAlign:'center'}}>{d.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* 문자치환 공지 */}
          {activeSide==='notice-replace'&&(
            <>
              <div className="sm-page-title"><span style={{color:'#ccc'}}>☆</span> 문자치환 공지</div>
              <div className="notice-subtitle" style={{lineHeight:'1.8'}}>
                문자치환 알림톡은 고객이 신청하거나 계약관계(수강신청 등)가 있을 때만 발송할 수 있습니다.<br/>
                불특정 다수에게 발송하여 스팸신고가 접수되는 경우, 카카오 채널이 차단될 수 있습니다.&nbsp;
                <span style={{color:'#E8445A',fontWeight:400,cursor:'pointer'}}>( 카카오 알림톡 방침 )</span>
              </div>
              <div className="notice-search-wrap">
                <select className="sts-input" style={{width:120}} value={replaceSearch.type} onChange={e=>setReplaceSearch(f=>({...f,type:e.target.value}))}><option>제목+내용</option><option>제목</option><option>내용</option></select>
                <div className="notice-search-box"><input className="notice-search-input" value={replaceSearch.keyword} onChange={e=>setReplaceSearch(f=>({...f,keyword:e.target.value}))}/><button className="notice-search-icon">🔍</button></div>
              </div>
              <div className="sts-section">
                <div className="notice-list-head"><span className="sts-sec-title">문자치환 공지목록</span><button className="sts-export-btn">신규 등록</button></div>
                <table className="notice-table">
                  <thead><tr><th>번호</th><th>선택</th><th>제목</th><th>전송대상자</th><th>문자전송</th><th>작성자</th><th>작성일</th></tr></thead>
                  <tbody>
                    {REPLACE_DATA.map(d=>(
                      <tr key={d.id}>
                        <td style={{textAlign:'center'}}>{d.id}</td>
                        <td style={{textAlign:'center'}}><input type="checkbox" checked={replaceChecked.includes(d.id)} onChange={()=>toggleReplaceCheck(d.id)}/></td>
                        <td><div style={{display:'flex',alignItems:'center',gap:6}}>{d.hasFile&&<span className="notice-file-icon">📄</span>}<span>{d.title}</span></div></td>
                        <td style={{textAlign:'center'}}>{d.target}</td>
                        <td style={{textAlign:'center'}}><span className={d.sentStatus==='미전송'?'notice-unsent':'notice-sent'}>{d.sentStatus}</span></td>
                        <td style={{textAlign:'center'}}>{d.writer}</td>
                        <td style={{textAlign:'center'}}>{d.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* 전송예약 현황 */}
          {activeSide==='notice-schedule'&&(
            <>
              <div className="sm-page-title"><span style={{color:'#ccc'}}>☆</span> 전송예약 현황</div>
              <div className="sts-section">
                <div className="sts-sec-head"><div className="sts-sec-title">조건검색</div></div>
                <div className="sts-filter">
                  <div className="sts-filter-row">
                    <div className="sts-filter-item" style={{flex:'none'}}>
                      <label className="sts-filter-label">검색 문구</label>
                      <div style={{display:'flex',gap:6}}>
                        <input className="sts-input" style={{width:200}} value={scheduleSearch} onChange={e=>setScheduleSearch(e.target.value)}/>
                        <button className="schedule-search-btn">검색</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sts-section">
                <div className="notice-list-head"><span className="sts-sec-title">예약 목록</span><button className="sts-search-btn" style={{background:'#E8445A'}}>전송 취소</button></div>
                <table className="notice-table">
                  <thead><tr><th><input type="checkbox" onChange={e=>setScheduleChecked(e.target.checked?['all']:[])}/></th><th>수신번호</th><th>예약시간</th><th>메세지</th><th>등록자</th><th>등록시간</th></tr></thead>
                  <tbody><tr><td colSpan={6} style={{textAlign:'center',padding:'40px',color:'#bbb',fontSize:13}}>검색된 데이터가 없습니다.</td></tr></tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
