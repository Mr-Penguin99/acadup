import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import './Classes.css'
import { DatePicker } from '../components/DatePicker'
import { useTutorial } from '../components/TutorialContext'
import { useAppData } from '../contexts/AppDataContext'
import TutorialOverlay from '../components/TutorialOverlay'
import TutorialSpotlight from '../components/TutorialSpotlight'
import ClassCreate from './ClassCreate'

const UNLOCKED_MENUS = ['students','payments','classes']
const MODAL_TUTORIAL_STEP_IDS = ['class-create-code-hint', 'class-create-required-fields', 'class-create-name-hint', 'class-create-subject-hint', 'class-create-paycycle-hint', 'class-create-optype-hint', 'class-create-payday-hint', 'class-create-period-hint', 'class-create-payment-hint', 'class-create-save-hint', 'class-create-new-register-hint', 'class-create-closing']
const FULL_OVERLAY_STEP_IDS = ['class-create-required-fields', 'class-create-name-hint', 'class-create-subject-hint', 'class-create-paycycle-hint', 'class-create-optype-hint', 'class-create-payday-hint', 'class-create-period-hint', 'class-create-payment-hint', 'class-create-save-hint', 'class-create-new-register-hint', 'class-create-closing']

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
  { id:'class-mgmt', label:'반 관리', items:[
    { id:'class-group',  label:'반 그룹' },
    { id:'class-status', label:'반 현황' },
  ]},
  { id:'class-assign', label:'반편성', items:[
    { id:'assign-enrolled', label:'재원생 반편성' },
    { id:'assign-prospect', label:'예비생 반배정' },
  ]},
]

export default function Classes() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('classes')
  const [activeSide, setActiveSide] = useState('class-status')
  const [expanded, setExpanded] = useState(['class-mgmt'])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState({ group:'전체', status:'개강', name:'' })
  const [groupFilter, setGroupFilter] = useState({ use:'사용' })
  const [prospectLeftFilter, setProspectLeftFilter]   = useState({ status:'', dateFrom:'', dateTo:'' })
  const [enrolledLeftFilter, setEnrolledLeftFilter]   = useState({ group:'전체', className:'', name:'' })
  const [enrolledRightFilter, setEnrolledRightFilter] = useState({ group:'전체', className:'선택', name:'', dateFrom:'', dateTo:'' })
  const [enrolledSubFilter, setEnrolledSubFilter]     = useState({ type:'', dateFrom:'', dateTo:'' })
  const [prospectRightFilter, setProspectRightFilter] = useState({ group:'전체', className:'선택', name:'', dateFrom:'', dateTo:'' })

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [menuLockedClickCount, setMenuLockedClickCount] = useState(0)
  const [showClassCreateModal, setShowClassCreateModal] = useState(false)
  const [newClassId, setNewClassId] = useState(null)

  const { classes, addClass } = useAppData()

  const handleClassSave = async (form) => {
    const { data, error } = await addClass({
      group: form.group || '',
      name: form.name || '(이름 없음)',
      code: form.code || `CLASS${String(classes.length + 1).padStart(5, '0')}`,
      status: '개강',
      type: form.subject || '',
      teacher: '',
      period: `${form.opFrom || ''}~${form.opTo || ''}`,
      room: form.room || '',
      subject: form.subject || '',
      opFrom: form.opFrom || '',
      opTo: form.opTo || '',
      payDay: form.payDay || '1',
      opType: form.opType || '기간반',
      payments: form.payments || [],
    })
    if (error) { alert(error.message || '반 등록에 실패했습니다.'); return }
    if (data) setNewClassId(data.id)
  }

  const { activeStep, isOpen, autoStart, advance } = useTutorial()
  const registerBtnRef = useRef(null)
  const [registerBtnRect, setRegisterBtnRect] = useState(null)
  const newRowRef = useRef(null)
  const [newRowRect, setNewRowRect] = useState(null)
  const modalBoxRef = useRef(null)
  const studentsMenuRef = useRef(null)
  const [studentsMenuRect, setStudentsMenuRect] = useState(null)

  useEffect(() => {
    autoStart('tutorial-welcome')
  }, [])

  const showTutorialWelcome = isOpen && activeStep?.id === 'tutorial-welcome'
  const showClassStatusIntro = isOpen && activeStep?.id === 'class-status-intro'
  const showRegisterBtnSpotlight = isOpen && activeStep?.id === 'class-status-register-btn' && activeSide === 'class-status'
  const showCompleteHint = isOpen && activeStep?.id === 'class-status-complete-hint' && activeSide === 'class-status'
  const showStudentMenuHint = isOpen && activeStep?.id === 'class-status-student-menu-hint'

  // 모달 안에서 보여줄 단계인데 모달이 닫혀있으면(예: 플로팅 박스로 이어보기) 자동으로 모달을 열어줌
  // 반대로 (개발용 이전/다음 버튼 등으로) 튜토리얼 진행 중 모달 단계를 벗어나면 자동으로 닫아줌
  // (튜토리얼이 꺼져있을 때는 반 등록 버튼 등으로 수동 열고 닫는 기존 동작을 건드리지 않음)
  useEffect(() => {
    if (!isOpen) return
    const isModalStep = MODAL_TUTORIAL_STEP_IDS.includes(activeStep?.id)
    if (isModalStep && !showClassCreateModal) setShowClassCreateModal(true)
    else if (!isModalStep && showClassCreateModal) setShowClassCreateModal(false)
  }, [isOpen, activeStep, showClassCreateModal])

  useEffect(() => {
    if (!showRegisterBtnSpotlight) return
    const measure = () => {
      if (registerBtnRef.current) setRegisterBtnRect(registerBtnRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showRegisterBtnSpotlight])

  useEffect(() => {
    if (!showCompleteHint) return
    const measure = () => {
      if (newRowRef.current) setNewRowRect(newRowRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showCompleteHint])

  useEffect(() => {
    if (!showCompleteHint) return
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      advance()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCompleteHint])

  useEffect(() => {
    if (!showStudentMenuHint) return
    const measure = () => {
      if (studentsMenuRef.current) setStudentsMenuRect(studentsMenuRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showStudentMenuHint])

  const toggleGroup = id => setExpanded(e=>e.includes(id)?[]:  [id])

  return (
    <div
      className="classes-wrap"
      onClick={()=>{
        if(showCompleteHint) advance()
      }}
    >
      {showTutorialWelcome && (
        <TutorialOverlay
          title="반갑습니다. 아카데미업입니다."
          description={'현재 가입하신 곳은 데모 버전이며, 정식 전환 신청을 통해 아카데미업 정식 버전을 이용하실 수 있습니다. 또한, 아카데미업 서비스는 무료이며 정식 버전 전환에 발생하는 비용은 없습니다.\n\n그럼 기본적인 기능 튜토리얼을 시작하겠습니다. (약 5분 소요)'}
          nextLabel="시작하기"
          onNext={advance}
        />
      )}
      {showClassStatusIntro && (
        <TutorialOverlay
          title="반 현황 페이지입니다"
          description={'이곳에서 우리 학원의 모든 반을 한 눈에 볼 수 있고 등록할 수 있어요. 반을 직접 생성해보겠습니다.'}
          onNext={advance}
        />
      )}
      {showRegisterBtnSpotlight && (
        <TutorialSpotlight
          rect={registerBtnRect}
          rightAlign
          message="반 등록 버튼을 눌러 반을 생성해보세요."
        />
      )}
      {showCompleteHint && (
        <TutorialSpotlight
          rect={newRowRect}
          message="반 등록이 완료되었습니다."
          onConfirm={advance}
        />
      )}
      {showStudentMenuHint && (
        <TutorialSpotlight
          rect={studentsMenuRect}
          message="수강생관리 메뉴를 클릭해 주세요."
        />
      )}
      {showClassCreateModal && (
        <div
          style={{
            position:'fixed',inset:0,zIndex:3500,display:'flex',alignItems:'center',justifyContent:'center',
            // 자체 전체화면 스포트라이트를 그리는 단계에서는 모달 배경을 중복 적용하지 않음
            background: FULL_OVERLAY_STEP_IDS.includes(activeStep?.id) ? 'transparent' : 'rgba(0,0,0,0.6)',
          }}
        >
          <div ref={modalBoxRef} style={{width:960,maxWidth:'90vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 12px 40px rgba(0,0,0,0.3)'}}>
            <ClassCreate embedded onSave={handleClassSave} modalBoxRef={modalBoxRef} />
          </div>
        </div>
      )}
      <TopNav/>
      <div className="menu-bar">
        <button className="hamburger-btn" onClick={()=>setSidebarOpen(s=>!s)}>☰</button>
        <div className="menu-list">
          {MENUS.map(m=>{
            const isLocked = !UNLOCKED_MENUS.includes(m.id)
            return (
              <div key={m.id} ref={m.id==='students' ? studentsMenuRef : null}
                className={`menu-item ${activeMenu===m.id?'active':''} ${isLocked?'locked':''}`}
                style={{position:'relative'}}
                onClick={()=>{
                  if(isLocked){
                    const next = menuLockedClickCount + 1
                    if(next >= 2){ setShowUpgradeModal(true); setMenuLockedClickCount(0) }
                    else { setMenuLockedClickCount(next) }
                  } else {
                    setActiveMenu(m.id)
                    if(m.id==='students'){
                      navigate('/students')
                      if(showStudentMenuHint) advance()
                    }
                    if(m.id==='payments')navigate('/payments')
                    if(m.id==='settings')navigate('/settings')
                    if(m.id==='dashboard')navigate('/dashboard')
                  }
                }}>
                <img src={m.icon} alt={m.label} className="menu-icon"/><span className="menu-label">{m.label}</span>
                {isLocked && (
                  <span style={{position:'absolute',inset:0,background:'rgba(200,200,200,0.75)',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
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
        <div style={{position:'relative',display:'inline-flex',margin:'10px 0',overflow:'hidden',borderRadius:4}}>
          <button className="menu-charge-btn" style={{margin:0}}>전송충전관리</button>
          <span style={{position:'absolute',inset:0,background:'rgba(200,200,200,0.75)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
            onClick={()=>{
              const next = menuLockedClickCount + 1
              if(next >= 2){ setShowUpgradeModal(true); setMenuLockedClickCount(0) }
              else { setMenuLockedClickCount(next) }
            }}>
            <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="7" width="12" height="9" rx="1.5" fill="#fff"/>
              <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <circle cx="7" cy="11.5" r="1.5" fill="rgba(200,200,200,0.75)"/>
              <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="rgba(200,200,200,0.75)"/>
            </svg>
          </span>
        </div>
      </div>

      {showUpgradeModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowUpgradeModal(false)}>
          <div style={{background:'#fff',borderRadius:8,padding:'20px 40px',textAlign:'center',boxShadow:'0 8px 32px rgba(0,0,0,0.2)',maxWidth:360,width:'90%'}} onClick={e=>e.stopPropagation()}>
            <div style={{marginBottom:16}}>
              <svg width="80" height="98" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{filter:'drop-shadow(0px 3px 6px rgba(0,0,0,0.18))'}}>
                <defs>
                  <filter id="inset-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feComponentTransfer in="SourceAlpha" result="alphaInv"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>
                    <feOffset dx="0" dy="0.4" in="alphaInv" result="offset"/>
                    <feGaussianBlur stdDeviation="0.35" in="offset" result="blurred"/>
                    <feComposite in="blurred" in2="SourceAlpha" operator="in" result="innerShadow"/>
                    <feFlood floodColor="rgba(0,0,0,0.25)" result="color"/>
                    <feComposite in="color" in2="innerShadow" operator="in" result="coloredShadow"/>
                    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="coloredShadow"/></feMerge>
                  </filter>
                </defs>
                <rect x="1" y="7" width="12" height="9" rx="1.5" fill="#f8f9fb"/>
                <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="#f8f9fb" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <circle cx="7" cy="11.5" r="1.5" fill="#e8eaed" filter="url(#inset-shadow)"/>
                <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="#e8eaed" filter="url(#inset-shadow)"/>
              </svg>
            </div>
            <p style={{fontSize:15,color:'#333',lineHeight:1.7,marginBottom:20}}>무료로 정식 계정으로 전환하고<br/>모든 기능을 제한없이 이용해보세요!</p>
            <button style={{padding:'10px 24px',background:'#F5841F',color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:400,cursor:'pointer',fontFamily:'inherit'}} onClick={()=>setShowUpgradeModal(false)}>
                <svg width="13" height="15" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block',verticalAlign:'middle',marginRight:6,marginTop:-2}}>
                  <rect x="1" y="7" width="12" height="9" rx="1.5" fill="white"/>
                  <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <circle cx="7" cy="11.5" r="1.5" fill="rgba(245,132,31,0.8)"/>
                  <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="rgba(245,132,31,0.8)"/>
                </svg>
                잠금 해제하러 가기</button>
          </div>
        </div>
      )}

<div className="classes-body">
        {sidebarOpen&&(
          <div className="classes-sidebar">
            <div className="ss-title">반관리</div>
            {SIDE_MENUS.map(group=>(
              <div key={group.id} className="ss-group-wrap">
                <div className="ss-group" onClick={()=>toggleGroup(group.id)}>
                  <span className="ss-toggle">{expanded.includes(group.id)?'∧':'∨'}</span><span>{group.label}</span>
                </div>
                {expanded.includes(group.id)&&group.items.map(item=>(
                  <div key={item.id} className={`ss-item ${activeSide===item.id?'active':''}`} onClick={()=>setActiveSide(item.id)}>
                    <span className="ss-arrow">▶</span> {item.label}
                  </div>
                ))}
              </div>
            ))}
            <div className="ss-footer"><div className="ss-phone">1811-3435</div><div className="ss-hours">평일 09:00~18:00</div></div>
          </div>
        )}

        <div className="classes-main">

          {/* 미리보기 배너 */}
          {['assign-enrolled','assign-prospect'].includes(activeSide)&&(
            <div style={{background:'#f8f9fb',borderRadius:4,padding:'6px 16px',marginBottom:12,fontSize:14,color:'#ff9000',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span>이 화면은 미리보기입니다. 정식 버전으로 전환하시면 지금 보이는 기능을 바로 사용하실 수 있습니다.</span>
              <button style={{flexShrink:0,marginLeft:16,padding:'3px 20px',background:'#ff9000',color:'#fff',border:'none',borderRadius:4,fontSize:13,fontWeight:400,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}} onClick={()=>window.open('/conversion-request','_blank','width=560,height=780')}>
                <svg width="13" height="15" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block',verticalAlign:'middle',marginRight:6,marginTop:-2}}>
                  <rect x="1" y="7" width="12" height="9" rx="1.5" fill="white"/>
                  <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <circle cx="7" cy="11.5" r="1.5" fill="rgba(255,144,0,0.8)"/>
                  <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="rgba(255,144,0,0.8)"/>
                </svg>
                지금 바로 시작하기
              </button>
            </div>
          )}

          {/* 반 그룹 */}
          {activeSide==='class-group'&&(
            <>
              <div className="cl-page-title"><span style={{color:'#ccc'}}>☆</span> 반 그룹</div>
              <div className="cl-section" style={{borderTop:'none',borderBottom:'none',background:'#f8f9fb',borderRadius:5}}>
                <div className="cl-sec-head" style={{borderBottom:'none'}}>
                  <div className="cl-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}><button className="cl-search-btn">검색하기</button><button className="cl-reset-btn">초기화</button></div>
                </div>
                <div className="cl-filter">
                  <div className="cl-filter-row">
                    <div className="cl-filter-item">
                      <label className="cl-filter-label">사용유무</label>
                      <select className="cl-input" value={groupFilter.use} onChange={e=>setGroupFilter(f=>({...f,use:e.target.value}))}><option>전체</option><option>사용</option><option>미사용</option><option>삭제</option></select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="cl-section" style={{borderTop:'none'}}>
                <div className="cl-table-header"><button className="cl-reg-btn">반그룹 등록</button></div>
                <div className="cl-table-wrap">
                  <table className="cl-table">
                    <thead><tr><th>출력순서</th><th>반그룹 코드</th><th>반 그룹 명</th><th>사용유무</th></tr></thead>
                    <tbody>
                      {classes.length === 0 && (
                        <tr className="cl-empty-row"><td colSpan={4} style={{textAlign:'center',padding:'32px 0',color:'#aaa',fontSize:13}}>검색된 자료가 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 재원생 반편성 */}
          {activeSide==='assign-enrolled'&&(
            <>
              <div className="cl-page-title"><span style={{color:'#ccc'}}>☆</span> 재원생 반편성</div>
              <div className="assign-wrap">

                {/* 왼쪽 패널 */}
                <div className="assign-panel">
                  <div className="assign-head">
                    <span className="assign-head-title" style={{fontWeight:700,fontSize:14,paddingLeft:8,borderLeft:'3px solid #333'}}>반 검색</span>
                    <button className="cl-assign-search-btn">검색하기</button>
                  </div>
                  <div style={{padding:'10px 14px',display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',background:'#f8f9fb',borderRadius:5}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 그룹</label>
                      <select className="cl-input" value={enrolledLeftFilter.group} onChange={e=>setEnrolledLeftFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반명</label>
                      <select className="cl-input" value={enrolledLeftFilter.className} onChange={e=>setEnrolledLeftFilter(f=>({...f,className:e.target.value}))}><option>선택</option></select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수강생명</label>
                      <input className="cl-input" value={enrolledLeftFilter.name} onChange={e=>setEnrolledLeftFilter(f=>({...f,name:e.target.value}))}/>
                    </div>
                  </div>
                  <div className="assign-head" style={{marginTop:60}}>
                    <span className="assign-head-title" style={{fontWeight:700,fontSize:14,paddingLeft:8,borderLeft:'3px solid #333'}}>수강생목록 <span style={{fontWeight:400,fontSize:12,color:'#888'}}>재원 : 0명</span></span>
                    <button className="cl-reg-btn">반편성처리</button>
                  </div>
                  <div style={{padding:'10px 14px',background:'#f8f9fb',borderRadius:5}}>
                    <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반편성 유형</label>
                        <select className="cl-input" value={enrolledSubFilter.type} onChange={e=>setEnrolledSubFilter(f=>({...f,type:e.target.value}))}><option>선택</option><option>반배정</option><option>반이동</option></select>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반편성 수강기간</label>
                        <DatePicker value={enrolledSubFilter.dateFrom} onChange={v=>setEnrolledSubFilter(f=>({...f,dateFrom:v}))}/>
                        <span>~</span>
                        <DatePicker value={enrolledSubFilter.dateTo} onChange={v=>setEnrolledSubFilter(f=>({...f,dateTo:v}))}/>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:'#888',marginTop:6}}>반배정, 반이동을 정확하게 확인해서 작업해 주세요.</div>
                  </div>
                  <table className="assign-table" style={{marginTop:20}}>
                    <thead><tr><th><input type="checkbox"/></th><th>성명</th><th>생년월일</th><th>수강기간</th><th>전화번호</th></tr></thead>
                    <tbody><tr><td colSpan={5} className="assign-empty">검색된 데이터가 없습니다.</td></tr></tbody>
                  </table>
                </div>

                {/* 오른쪽 패널 */}
                <div className="assign-panel">
                  <div className="assign-head">
                    <span className="assign-head-title" style={{fontWeight:700,fontSize:14,paddingLeft:8,borderLeft:'3px solid #333'}}>배정/이동 대상반</span>
                    <button className="cl-assign-search-btn">검색하기</button>
                  </div>
                  <div style={{padding:'10px 14px',display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',background:'#f8f9fb',borderRadius:5}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 그룹</label>
                      <select className="cl-input" value={enrolledRightFilter.group} onChange={e=>setEnrolledRightFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반명</label>
                      <select className="cl-input" value={enrolledRightFilter.className} onChange={e=>setEnrolledRightFilter(f=>({...f,className:e.target.value}))}><option>선택</option></select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수강생명</label>
                      <input className="cl-input" value={enrolledRightFilter.name} onChange={e=>setEnrolledRightFilter(f=>({...f,name:e.target.value}))}/>
                    </div>
                  </div>
                  <div className="assign-head" style={{marginTop:60}}>
                    <span className="assign-head-title" style={{fontWeight:700,fontSize:14,paddingLeft:8,borderLeft:'3px solid #333'}}>수강생목록 <span style={{fontWeight:400,fontSize:12,color:'#888'}}>배정/이동 : 0명 (재원 : 0명)</span></span>
                    <button className="pm-red-btn">반편성취소</button>
                  </div>
                  <div style={{padding:'10px 14px',background:'#f8f9fb',borderRadius:5}}>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수강시작일</label>
                      <DatePicker value={enrolledRightFilter.dateFrom} onChange={v=>setEnrolledRightFilter(f=>({...f,dateFrom:v}))}/>
                      <span>~</span>
                      <DatePicker value={enrolledRightFilter.dateTo} onChange={v=>setEnrolledRightFilter(f=>({...f,dateTo:v}))}/>
                    </div>
                    <div style={{fontSize:11,color:'#F5841F',marginTop:6}}>
                      반배정 취소하면 <span style={{color:'#E8445A',fontWeight:700}}>배정된 반에서만 수강취소</span>되고 반이동 취소하면 <span style={{color:'#E8445A',fontWeight:700}}>배정된 반에서 수강취소, 이전 반으로 복원</span>됩니다.
                    </div>
                  </div>
                  <table className="assign-table" style={{marginTop:20}}>
                    <thead><tr><th><input type="checkbox"/></th><th>구분</th><th>성명</th><th>생년월일</th><th>수강기간</th><th>전화번호</th></tr></thead>
                    <tbody><tr><td colSpan={6} className="assign-empty">검색된 데이터가 없습니다.</td></tr></tbody>
                  </table>
                </div>

              </div>
            </>
          )}

          {/* 예비생 반배정 */}
          {activeSide==='assign-prospect'&&(
            <>
              <div className="cl-page-title"><span style={{color:'#ccc'}}>☆</span> 예비생 반배정</div>
              <div className="assign-wrap">

                {/* 왼쪽 패널 */}
                <div className="assign-panel">
                  <div className="assign-head">
                    <span className="assign-head-title" style={{fontWeight:700,fontSize:14,paddingLeft:8,borderLeft:'3px solid #333'}}>수강생목록 <span style={{fontWeight:400,fontSize:12,color:'#888'}}>인원 : 0명</span></span>
                    <button className="cl-reg-btn">반배정처리</button>
                  </div>
                  <div style={{padding:'10px 14px',display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',background:'#f8f9fb',borderRadius:5}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수강생 상태</label>
                      <select className="cl-input" style={{width:90}} value={prospectLeftFilter.status} onChange={e=>setProspectLeftFilter(f=>({...f,status:e.target.value}))}><option>선택</option><option>예비</option><option>퇴원</option></select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반편성 수강기간</label>
                      <DatePicker value={prospectLeftFilter.dateFrom} onChange={v=>setProspectLeftFilter(f=>({...f,dateFrom:v}))}/>
                      <span>~</span>
                      <DatePicker value={prospectLeftFilter.dateTo} onChange={v=>setProspectLeftFilter(f=>({...f,dateTo:v}))}/>
                    </div>
                  </div>
                  <table className="assign-table" style={{marginTop:20}}>
                    <thead><tr><th><input type="checkbox"/></th><th>성명</th><th>생년월일</th><th>전화번호</th></tr></thead>
                    <tbody><tr><td colSpan={4} className="assign-empty">검색된 데이터가 없습니다.</td></tr></tbody>
                  </table>
                </div>

                {/* 오른쪽 패널 */}
                <div className="assign-panel">
                  <div className="assign-head">
                    <span className="assign-head-title" style={{fontWeight:700,fontSize:14,paddingLeft:8,borderLeft:'3px solid #333'}}>수강생목록 <span style={{fontWeight:400,fontSize:12,color:'#888'}}>배정 : 0명 (재원 : 0명)</span></span>
                    <div style={{display:'flex',gap:6}}>
                      <button className="cl-search-gray-btn">검색하기</button>
                      <button className="pm-red-btn">반배정취소</button>
                    </div>
                  </div>
                  <div style={{padding:'10px 14px',display:'flex',gap:8,alignItems:'center',flexWrap:'nowrap',background:'#f8f9fb',borderRadius:5}}>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 그룹</label>
                      <select className="cl-input" style={{width:70}} value={prospectRightFilter.group} onChange={e=>setProspectRightFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반명</label>
                      <select className="cl-input" style={{width:70}} value={prospectRightFilter.className} onChange={e=>setProspectRightFilter(f=>({...f,className:e.target.value}))}><option>선택</option></select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수강생명</label>
                      <input className="cl-input" style={{width:70}} value={prospectRightFilter.name} onChange={e=>setProspectRightFilter(f=>({...f,name:e.target.value}))}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수강시작일</label>
                      <DatePicker value={prospectRightFilter.dateFrom} onChange={v=>setProspectRightFilter(f=>({...f,dateFrom:v}))}/>
                      <span>~</span>
                      <DatePicker value={prospectRightFilter.dateTo} onChange={v=>setProspectRightFilter(f=>({...f,dateTo:v}))}/>
                    </div>
                  </div>
                  <table className="assign-table" style={{marginTop:20}}>
                    <thead><tr><th><input type="checkbox"/></th><th>성명</th><th>생년월일</th><th>수강기간</th><th>전화번호</th></tr></thead>
                    <tbody><tr><td colSpan={5} className="assign-empty">검색된 데이터가 없습니다.</td></tr></tbody>
                  </table>
                </div>

              </div>
            </>
          )}

          {/* 반 현황 */}
          {activeSide==='class-status'&&(
            <>
              <div className="cl-page-title"><span style={{color:'#F5C518'}}>⭐</span> 반 현황</div>
              <div className="cl-section" style={{borderTop:'none',borderBottom:'none',background:'#f8f9fb',borderRadius:5}}>
                <div className="cl-sec-head" style={{borderBottom:'none'}}>
                  <div className="cl-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}><button className="cl-search-btn">검색하기</button><button className="cl-reset-btn">초기화</button></div>
                </div>
                <div className="cl-filter">
                  <div className="cl-filter-row">
                    <div className="cl-filter-item"><label className="cl-filter-label">반 그룹</label><select className="cl-input" value={filter.group} onChange={e=>setFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select></div>
                    <div className="cl-filter-item"><label className="cl-filter-label">반 상태</label><select className="cl-input" value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))}><option>전체</option><option>개강</option><option>미개강</option><option>종강</option></select></div>
                    <div className="cl-filter-item"><label className="cl-filter-label">반 명</label><input className="cl-input" value={filter.name} onChange={e=>setFilter(f=>({...f,name:e.target.value}))}/></div>
                  </div>
                </div>
              </div>
              <div className="cl-section" style={{borderTop:'none'}}>
                <div className="cl-table-header">
                  <button
                    ref={registerBtnRef}
                    className="cl-reg-btn"
                    onClick={()=>{
                      if(activeStep?.id==='class-status-register-btn'){
                        setShowClassCreateModal(true)
                        advance()
                      } else {
                        sessionStorage.removeItem('editingClassData')
                        const w = 960, h = 900
                        const left = window.screenX + (window.outerWidth - w) / 2
                        const top = window.screenY + (window.outerHeight - h) / 2
                        window.open('/class-create','_blank',`width=${w},height=${h},left=${left},top=${top},resizable=yes`)
                      }
                    }}
                  >반 등록</button>
                </div>
                <div className="cl-table-wrap">
                  <table className="cl-table">
                    <thead><tr><th>출력순서</th><th>반 그룹</th><th>반 명</th><th>반 코드</th><th>상태</th><th>중분류</th><th>담임</th><th>수강기간</th><th>강의실</th><th>수강생수</th><th>기능</th></tr></thead>
                    <tbody>
                      {classes.length === 0 && (
                        <tr className="cl-empty-row"><td colSpan={11} style={{textAlign:'center',padding:'32px 0',color:'#aaa',fontSize:13}}>검색된 자료가 없습니다.</td></tr>
                      )}
                      {classes.map(d=>(
                        <tr key={d.id} ref={d.id===newClassId ? newRowRef : null}>
                          <td className="td-center">{d.id}</td><td>{d.group}</td><td>{d.name}</td><td>{d.code}</td>
                          <td className="td-center">{d.status}</td><td className="td-center">{d.type}</td>
                          <td>{d.teacher}</td><td>{d.period}</td><td>{d.room}</td><td>{d.count}</td>
                          <td className="td-center"><button className="cl-edit-btn" onClick={()=>{
                            sessionStorage.setItem('editingClassData', JSON.stringify(d))
                            const w = 960, h = 900
                            const left = window.screenX + (window.outerWidth - w) / 2
                            const top = window.screenY + (window.outerHeight - h) / 2
                            window.open('/class-create','_blank',`width=${w},height=${h},left=${left},top=${top},resizable=yes`)
                          }}>반 수정</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
