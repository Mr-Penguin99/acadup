import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Settings.css'
import TopNav from '../components/TopNav'
import FavStar from '../components/FavStar'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const UNLOCKED_MENUS = ['students','payments','classes']

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

const AUTH_GROUPS = [
  { no:1,  code:'UA10', name:'직원관리-등록',  desc:'직원정보 등록, 수정, 삭제 가능' },
  { no:2,  code:'UA11', name:'직원관리-조회',  desc:'직원 정보 조회만 가능' },
  { no:3,  code:'UA20', name:'반 관리-등록',   desc:'반 정보 등록, 수정, 삭제 가능' },
  { no:4,  code:'UA21', name:'반 관리-조회',   desc:'반 정보 조회만 가능' },
  { no:5,  code:'UA30', name:'수강생관리-등록', desc:'수강생 정보 등록, 수정, 삭제 가능' },
  { no:6,  code:'UA31', name:'수강생관리-조회', desc:'수강생 정보 조회만 가능' },
  { no:7,  code:'UA40', name:'청구수납-등록',  desc:'청구수납정보 등록, 수정, 삭제 가능' },
  { no:8,  code:'UA41', name:'청구수납-조회',  desc:'청구수납정보 조회만 가능' },
  { no:9,  code:'UA50', name:'수업관리-등록',  desc:'수업시간표, 출결/과제정보 등록, 수정, 삭제 가능' },
  { no:10, code:'UA51', name:'수업관리-조회',  desc:'수업시간표, 출결/과제정보 조회만 가능' },
  { no:11, code:'UA60', name:'상담관리-등록',  desc:'상담접수, 상담결과 등록, 수정, 삭제 가능' },
  { no:12, code:'UA61', name:'상담관리-조회',  desc:'상담접수, 상담결과 조회만 가능' },
  { no:13, code:'UA70', name:'경영현황-등록',  desc:'경영현황 정보 등록, 수정, 삭제 가능' },
  { no:14, code:'UA71', name:'경영현황-조회',  desc:'경영현황 정보 조회만 가능' },
  { no:15, code:'UA80', name:'교재관리-등록',  desc:'교재정보 등록, 수정, 삭제, 교재정보 문자전송' },
  { no:16, code:'UA81', name:'교재관리-조회',  desc:'교재정보 조회만 가능' },
  { no:17, code:'UA90', name:'환경설정-등록',  desc:'학원정보, 사용자코드 등을 등록, 수정, 삭제 가능' },
  { no:18, code:'UA91', name:'환경설정-조회',  desc:'학원정보, 사용자코드 등을 조회만 가능' },
  { no:19, code:'UL10', name:'노무관리-등록',  desc:'노무관리 정보 등록, 수정, 삭제 가능' },
  { no:20, code:'UL11', name:'노무관리-조회',  desc:'노무관리 정보 조회만 가능' },
  { no:21, code:'UP10', name:'급여관리-등록',  desc:'급여관리 정보 등록, 수정, 삭제 가능' },
  { no:22, code:'UP11', name:'급여관리-조회',  desc:'급여관리 정보 조회만 가능' },
  { no:23, code:'UR10', name:'회계관리-등록',  desc:'회계관리 정보 등록, 수정, 삭제 가능' },
  { no:24, code:'UR11', name:'회계관리-조회',  desc:'회계관리 정보 조회만 가능' },
  { no:25, code:'UZ10', name:'전송관리-등록',  desc:'문자서비스 전송 처리' },
  { no:26, code:'UZ20', name:'전송관리-조회',  desc:'문자서비스 전송 결과 조회' },
]

const AUTH_COLS = [
  '직원관리','반 관리','수강생관리','청구수납','수업관리',
  '상담관리','경영현황','교재관리','환경설정','노무관리',
  '급여관리','회계관리','전송관리',
]

const AUTH_USERS = [
  { dept:'교육 부문', name:'강사01',  perms:[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1] },
  { dept:'관리 부문', name:'원장',    perms:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { dept:'관리 부문', name:'직원01',  perms:[0,1,0,1,0,1,0,0,1,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1] },
]

const SIDE_MENUS = [
  {
    id: 'academy', label: '학원정보 설정',
    items: [{ id: 'basic', label: '학원 기본정보' }]
  },
  {
    id: 'auth', label: '권한 관리',
    items: [
      { id: 'auth-group', label: '권한그룹명 변경' },
      { id: 'auth-user',  label: '사용자별 권한관리' },
      { id: 'auth-mgmt',  label: '그룹별 사용자관리' },
    ]
  },
  {
    id: 'code', label: '코드 관리',
    items: [{ id: 'code-status', label: '코드 현황' }]
  },
  {
    id: 'resid', label: '주민번호 예외처리',
    items: [{ id: 'resid-status', label: '주민번호 예외 현황' }]
  },
]

export default function Settings() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [activeMenu, setActiveMenu] = useState('')
  const [activeSide, setActiveSide] = useState('basic')
  const [expanded, setExpanded] = useState(['academy'])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [authNames, setAuthNames] = useState(
    Object.fromEntries(AUTH_GROUPS.map(g => [g.code, '']))
  )
  const [form, setForm] = useState({
    name: profile?.biz_name || localStorage.getItem('academyName') || 'OO학원', bizNo: profile?.biz_num || '123-45-67891',
    code: profile?.code || '10102093', taxType: '면세',
    region1: '서울', region2: '중구',
    regNo: '000000', tel: profile?.tel || '010-0000-0000',
    adminTel: '010-0000-0000',
    email1: '', email2: '', emailType: '직접입력',
    fax: '', zip: '', addr: '', addrDetail: '',
    ownerName: profile?.owner_name || '홍길동', nationality: '내국인',
    resId1: '000000', resId2: '1111111',
    classroom: '', classroomCnt: '', office: '', deskCnt: '', lounge: '', bus: '',
    billDay: '25', lessonStart: '6', lessonInterval: '3',
    notifyEnroll: true, notifyLeave: true, notifyDuplicate: false, notifyUpgrade: false, notifyDowngrade: false,
    preBillEnabled: false, preBillDay: '당일', preBillTime: '전송시간',
    preConsultEnabled: false, preConsultDay: '당일', preConsultTime: '전송시간',
    postPayEnabled: false, postPayDay: '당일', postPayTime: '전송시간',
    postHomeworkEnabled: false, postHomeworkDay: '당일', postHomeworkTime: '전송시간',
    postAlarmEnabled: false, postAlarmDay: '당일', postAlarmTime: '전송시간',
    pointAlertEnabled: true, pointMin: '5000',
    nonMemberEnabled: false, nonMemberTime: '선택',
    chHomepage: '', chKakao: '', chBlog: '', chInsta: '', chYoutube: '', chNaverCafe: '', chNaverBand: '',
    posDevice: 'none', pgPayment: false,
    excelDownload: 'approve', msgMethod: '알림톡 (+메세지)',
    loginInput: 'phone4', loginOrder: 'enrollOnly',
  })

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [menuLockedClickCount, setMenuLockedClickCount] = useState(0)

  useEffect(() => {
    if (!profile) return
    setForm(f => ({
      ...f,
      name: profile.biz_name || f.name,
      bizNo: profile.biz_num || f.bizNo,
      code: profile.code || f.code,
      ownerName: profile.owner_name || f.ownerName,
      tel: profile.tel || f.tel,
    }))
  }, [profile])

  const toggleGroup = id => setExpanded(e => e.includes(id) ? [] : [id])

  return (
    <div className="settings-wrap">
      <TopNav />

      {/* 메뉴 바 */}
      <div className="menu-bar">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(s => !s)}>☰</button>
        <div className="menu-list">
          {MENUS.map(m => {
            const isLocked = !UNLOCKED_MENUS.includes(m.id)
            return (
              <div key={m.id}
                className={`menu-item ${activeMenu === m.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                style={{position:'relative'}}
                onClick={() => {
                  if(isLocked){
                    const next = menuLockedClickCount + 1
                    if(next >= 2){ setShowUpgradeModal(true); setMenuLockedClickCount(0) }
                    else { setMenuLockedClickCount(next) }
                  } else {
                    setActiveMenu(m.id)
                    if(m.id === 'students') navigate('/students')
                    if(m.id === 'payments') navigate('/payments')
                    if(m.id === 'classes') navigate('/classes')
                  }
                }}>
                <img src={m.icon} alt={m.label} className="menu-icon"/>
                <span className="menu-label">{m.label}</span>
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
            <button style={{padding:'10px 24px',background:'#F5841F',color:'#fff',border:'none',borderRadius:6,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}} onClick={()=>setShowUpgradeModal(false)}>
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

{/* 바디 */}
      <div className="settings-body">

        {/* 사이드바 */}
        {sidebarOpen && (
          <div className="settings-sidebar">
            <div className="ss-title">환경설정</div>
            {SIDE_MENUS.map(group => (
              <div key={group.id} className="ss-group-wrap">
                <div className="ss-group" onClick={() => toggleGroup(group.id)}>
                  <span className="ss-toggle">{expanded.includes(group.id) ? '∧' : '∨'}</span>
                  <span>{group.label}</span>
                </div>
                {expanded.includes(group.id) && group.items.map(item => (
                  <div key={item.id}
                    className={`ss-item ${activeSide === item.id ? 'active' : ''}`}
                    onClick={() => setActiveSide(item.id)}>
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

        {/* 콘텐츠 */}
        <div className="settings-main">

          {/* 미리보기 배너 */}
          <div style={{background:'#f8f9fb',borderRadius:4,padding:'6px 16px',marginBottom:12,fontSize:14,color:'#ff9000',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>이 화면은 미리보기입니다. 정식 버전으로 전환하시면 지금 보이는 기능을 바로 사용하실 수 있습니다.</span>
            <button style={{flexShrink:0,marginLeft:16,padding:'3px 20px',background:'#ff9000',color:'#fff',border:'none',borderRadius:4,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}} onClick={()=>window.open('/conversion-request','_blank','width=560,height=780')}>
              <svg width="13" height="15" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block',verticalAlign:'middle',marginRight:6,marginTop:-2}}>
                <rect x="1" y="7" width="12" height="9" rx="1.5" fill="white"/>
                <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <circle cx="7" cy="11.5" r="1.5" fill="rgba(255,144,0,0.8)"/>
                <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="rgba(255,144,0,0.8)"/>
              </svg>
              지금 바로 시작하기
            </button>
          </div>

          {/* ===== 학원 기본정보 ===== */}
          {activeSide === 'basic' && (
            <>
              <div className="sm-page-title"><FavStar label="학원 기본정보" path="/settings?page=basic" /> 학원 기본정보</div>

              <div className="sm-section-flat" style={{marginTop:40}}>
                <div className="sm-sec-head" style={{borderBottomColor:'#00B5A9'}}>
                  <div className="sm-sec-title">기본정보</div>
                  <button className="sm-edit-btn sm-basic-edit-btn" disabled={saving} onClick={async () => {
                    setSaving(true)
                    const { error } = await supabase.from('profiles').update({
                      biz_name: form.name,
                      biz_num: form.bizNo,
                      owner_name: form.ownerName,
                      tel: form.tel,
                      address: form.addr,
                      address_detail: form.addrDetail,
                    }).eq('id', user.id)
                    setSaving(false)
                    if (error) { alert('저장에 실패했습니다.'); return }
                    refreshProfile()
                  }}> 수정 </button>
                </div>
               <div className="sm-form" style={{padding: 0}}>

                  {/* 행 1: 학원명 | 사업자번호 */}
                  <div className="sm-table-row">
                    <div className="sm-table-label required">학원명</div>
                    <div className="sm-table-cell">
                      <input className="sm-input" value={form.name}
                        onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                    </div>
                    <div className="sm-table-label required">사업자번호</div>
                    <div className="sm-table-cell">
                      <input className="sm-input" value={form.bizNo}
                        onChange={e=>setForm(f=>({...f,bizNo:e.target.value}))} />
                      <span style={{fontSize:12,color:'#aaa',whiteSpace:'nowrap'}}>예: 123-45-67890</span>
                    </div>
                  </div>

                  {/* 행 2: 학원코드 | 과세유형 */}
                  <div className="sm-table-row">
                    <div className="sm-table-label required">학원코드</div>
                    <div className="sm-table-cell">
                      <input className="sm-input" value={form.code} readOnly />
                    </div>
                    <div className="sm-table-label required">과세유형</div>
                    <div className="sm-table-cell">
                      <select className="sm-input" value={form.taxType}
                        onChange={e=>setForm(f=>({...f,taxType:e.target.value}))}>
                        <option>선택</option><option>일반과세</option>
                        <option>간이과세</option><option>면세</option><option>비영리</option>
                      </select>
                    </div>
                  </div>

                  {/* 행 3: 관할교육청 | 학원등록번호 */}
                  <div className="sm-table-row">
                    <div className="sm-table-label required">관할교육청/지청</div>
                    <div className="sm-table-cell">
                      <select className="sm-input" style={{width:80}} value={form.region1}
                        onChange={e=>setForm(f=>({...f,region1:e.target.value}))}>
                        {['서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충북','충남','전북','전남','경북','경남','제주'].map(r=><option key={r}>{r}</option>)}
                      </select>
                      <input className="sm-input" style={{width:80}} value={form.region2}
                        onChange={e=>setForm(f=>({...f,region2:e.target.value}))} />
                      <span style={{fontSize:12,color:'#aaa',whiteSpace:'nowrap'}}>* 동부,서부,남부,북부,중부,강남서초</span>
                    </div>
                    <div className="sm-table-label required">학원등록번호</div>
                    <div className="sm-table-cell">
                      <input className="sm-input" value={form.regNo}
                        onChange={e=>setForm(f=>({...f,regNo:e.target.value}))} />
                    </div>
                  </div>

                  {/* 행 4: 전화번호 | 관리자 휴대폰 */}
                  <div className="sm-table-row">
                    <div className="sm-table-label required">전화번호</div>
                    <div className="sm-table-cell">
                      <input className="sm-input" value={form.tel}
                        onChange={e=>setForm(f=>({...f,tel:e.target.value}))} />
                      <span style={{fontSize:12,color:'#aaa',whiteSpace:'nowrap'}}>* 알림전송 발신번호</span>
                    </div>
                    <div className="sm-table-label required">관리자 휴대폰</div>
                    <div className="sm-table-cell">
                      <input className="sm-input" value={form.adminTel}
                        onChange={e=>setForm(f=>({...f,adminTel:e.target.value}))} />
                      <span style={{fontSize:12,color:'#aaa',whiteSpace:'nowrap'}}>* 청구서 안내문자 발송</span>
                    </div>
                  </div>

                  {/* 행 5: 이메일 | 팩스번호 */}
                  <div className="sm-table-row">
                    <div className="sm-table-label">이메일</div>
                    <div className="sm-table-cell">
                      <input className="sm-input" style={{width:110}} value={form.email1}
                        onChange={e=>setForm(f=>({...f,email1:e.target.value}))} />
                      <span>@</span>
                      <input className="sm-input" style={{width:110}} value={form.email2}
                        onChange={e=>setForm(f=>({...f,email2:e.target.value}))} />
                      <select className="sm-input" style={{width:110}} value={form.emailType}
                        onChange={e=>setForm(f=>({...f,emailType:e.target.value}))}>
                        <option>직접입력</option><option>gmail.com</option>
                        <option>naver.com</option><option>kakao.com</option>
                        <option>daum.net</option><option>hanmail.net</option>
                      </select>
                    </div>
                    <div className="sm-table-label">팩스번호</div>
                    <div className="sm-table-cell">
                      <input className="sm-input" value={form.fax}
                        onChange={e=>setForm(f=>({...f,fax:e.target.value}))} />
                      <span style={{fontSize:12,color:'#aaa',whiteSpace:'nowrap'}}>예: 02-1234-5678</span>
                    </div>
                  </div>

                  {/* 행 6: 주소 */}
                  <div className="sm-table-row">
                    <div className="sm-table-label">주소</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5', flexDirection:'column', alignItems:'flex-start', gap:6}}>
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        <input className="sm-input" style={{width:100}} value={form.zip}
                          placeholder="우편번호"
                          onChange={e=>setForm(f=>({...f,zip:e.target.value}))} />
                        <button className="sm-zip-btn">우편번호 찾기</button>
                      </div>
                      <input className="sm-input" style={{width:'100%'}} value={form.addr}
                        onChange={e=>setForm(f=>({...f,addr:e.target.value}))} />
                      <input className="sm-input" style={{width:'100%'}} value={form.addrDetail}
                        placeholder="상세주소를 입력해 주세요."
                        onChange={e=>setForm(f=>({...f,addrDetail:e.target.value}))} />
                    </div>
                  </div>

                </div>
              </div>
              <div className="sm-section-flat">
                <div className="sm-sec-head"><div className="sm-sec-title">대표자</div></div>
                <div className="sm-form" style={{padding:0}}>
                  <div className="sm-table-row">
                    <div className="sm-table-label required">대표자명</div>
                    <div className="sm-table-cell">
                      <input className="sm-input" value={form.ownerName} onChange={e=>setForm(f=>({...f,ownerName:e.target.value}))} />
                    </div>
                    <div className="sm-table-label required">내/외국인선택</div>
                    <div className="sm-table-cell">
                      {['내국인','외국인'].map(n=>(
                        <label key={n} style={{display:'flex',alignItems:'center',gap:4,fontSize:14,cursor:'pointer',marginRight:16}}>
                          <input type="radio" name="nationality" value={n} checked={form.nationality===n} onChange={e=>setForm(f=>({...f,nationality:e.target.value}))} />{n}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="sm-table-row">
                    <div className="sm-table-label required">주민등록번호</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5'}}>
                      <input className="sm-input" style={{width:110}} value={form.resId1} maxLength={6} onChange={e=>setForm(f=>({...f,resId1:e.target.value}))} />
                      <span>-</span>
                      <input className="sm-input" style={{width:110}} value={form.resId2} maxLength={7} type="password" onChange={e=>setForm(f=>({...f,resId2:e.target.value}))} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm-section-flat">
                <div className="sm-sec-head"><div className="sm-sec-title">사업장 시설</div></div>
                <div className="sm-form" style={{padding:0}}>
                  <div style={{display:'grid',gridTemplateColumns:'140px 1fr',alignItems:'stretch'}}>
                    <div className="sm-table-label">사업장시설</div>
                    <div>
                      {[
                        {l:'강의실',k:'classroom',u:'㎡',l2:'강의실수',k2:'classroomCnt',u2:'개'},
                        {l:'사무실',k:'office',u:'㎡',l2:'책상수',k2:'deskCnt',u2:'개'},
                        {l:'휴게실외',k:'lounge',u:'㎡',l2:'통학 버스',k2:'bus',u2:'대'},
                      ].map(({l,k,u,l2,k2,u2},i)=>(
                        <div key={k} style={{display:'grid',gridTemplateColumns:'110px 1fr 110px 1fr',minHeight:38,borderBottom:i<2?'1px solid #f0f0f0':'none'}}>
                          <div style={{fontSize:12,color:'#555',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8f9fb',borderRight:'1px solid #eee',padding:'6px 8px'}}>{l}</div>
                          <div style={{padding:'6px 10px',display:'flex',alignItems:'center',gap:6,borderRight:'1px solid #eee'}}>
                            <input className="sm-input" style={{width:60}} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
                            <span style={{fontSize:13}}>{u}</span>
                          </div>
                          <div style={{fontSize:12,color:'#555',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8f9fb',borderRight:'1px solid #eee',padding:'6px 8px'}}>{l2}</div>
                          <div style={{padding:'6px 10px',display:'flex',alignItems:'center',gap:6}}>
                            <input className="sm-input" style={{width:60}} value={form[k2]} onChange={e=>setForm(f=>({...f,[k2]:e.target.value}))} />
                            <span style={{fontSize:13}}>{u2}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm-section-flat">
                <div className="sm-sec-head"><div className="sm-sec-title">청구 설정</div></div>
                <div className="sm-form" style={{padding:0}}>
                  <div className="sm-table-row">
                    <div className="sm-table-label">자동 청구 생성일</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5'}}>
                      <select className="sm-input" style={{width:150}} value={form.billDay} onChange={e=>setForm(f=>({...f,billDay:e.target.value}))}>
                        <option value="">자동청구생성없음</option>
                        {Array.from({length:31},(_,i)=>`${i+1}`).map(d=><option key={d} value={d}>매월 {d}일</option>)}
                      </select>
                      <span style={{fontSize:12,color:'#555'}}>* 자동청구 생성일에 <strong style={{color:'#e05c2a'}}>다음 달 수강할 청구서</strong>가 생성됩니다.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm-section-flat">
                <div className="sm-sec-head"><div className="sm-sec-title">수업시간표 설정</div></div>
                <div className="sm-form" style={{padding:0}}>
                  <div className="sm-table-row">
                    <div className="sm-table-label">최초수업시간</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5'}}>
                      <select className="sm-input" style={{width:100}} value={form.lessonStart} onChange={e=>setForm(f=>({...f,lessonStart:e.target.value}))}>
                        <option value="">선택</option>
                        {Array.from({length:24},(_,i)=>`${i+1}`).map(h=><option key={h} value={h}>{h}시</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="sm-table-row">
                    <div className="sm-table-label">수업시간표 간격</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5'}}>
                      <select className="sm-input" style={{width:100}} value={form.lessonInterval} onChange={e=>setForm(f=>({...f,lessonInterval:e.target.value}))}>
                        <option value="">선택</option>
                        {Array.from({length:24},(_,i)=>i+1).map(h=><option key={h} value={h}>{h}시간</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm-section-flat">
                <div className="sm-sec-head"><div className="sm-sec-title">알림톡 자동 전송</div></div>
                <div className="sm-form" style={{padding:0}}>
                  <div className="sm-table-row">
                    <div className="sm-table-label">즉시 전송</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5',gap:16,flexWrap:'wrap'}}>
                      {[{k:'notifyEnroll',l:'등원'},{k:'notifyLeave',l:'하원'},{k:'notifyDuplicate',l:'등원중복'},{k:'notifyUpgrade',l:'승차'},{k:'notifyDowngrade',l:'하차'}].map(({k,l})=>(
                        <label key={k} style={{display:'flex',alignItems:'center',gap:4,fontSize:14,cursor:'pointer'}}>
                          <input type="checkbox" checked={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.checked}))} />{l}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="sm-table-row">
                    <div className="sm-table-label">사전 예약 전송</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5',gap:24,flexWrap:'wrap'}}>
                      {[{ek:'preBillEnabled',dk:'preBillDay',tk:'preBillTime',l:'청구'},{ek:'preConsultEnabled',dk:'preConsultDay',tk:'preConsultTime',l:'상담예약'}].map(({ek,dk,tk,l})=>(
                        <div key={ek} style={{display:'flex',alignItems:'center',gap:6}}>
                          <input type="checkbox" checked={form[ek]} onChange={e=>setForm(f=>({...f,[ek]:e.target.checked}))} />
                          <span style={{fontSize:14,minWidth:36}}>{l}</span>
                          <select className="sm-input" style={{width:80}} value={form[dk]} onChange={e=>setForm(f=>({...f,[dk]:e.target.value}))}>
                            {['당일','1일전','2일전','3일전'].map(d=><option key={d}>{d}</option>)}
                          </select>
                          <select className="sm-input" style={{width:90}} value={form[tk]} onChange={e=>setForm(f=>({...f,[tk]:e.target.value}))}>
                            <option>전송시간</option>
                            {Array.from({length:13},(_,i)=>i+8).map(t=><option key={t}>{t}시</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sm-table-row">
                    <div className="sm-table-label">사후 예약 전송</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5',gap:16,flexWrap:'wrap'}}>
                      {[{ek:'postPayEnabled',dk:'postPayDay',tk:'postPayTime',l:'수납'},{ek:'postHomeworkEnabled',dk:'postHomeworkDay',tk:'postHomeworkTime',l:'과제/퀴즈'},{ek:'postAlarmEnabled',dk:'postAlarmDay',tk:'postAlarmTime',l:'알림장'}].map(({ek,dk,tk,l})=>(
                        <div key={ek} style={{display:'flex',alignItems:'center',gap:6}}>
                          <input type="checkbox" checked={form[ek]} onChange={e=>setForm(f=>({...f,[ek]:e.target.checked}))} />
                          <span style={{fontSize:14,minWidth:48}}>{l}</span>
                          <select className="sm-input" style={{width:80}} value={form[dk]} onChange={e=>setForm(f=>({...f,[dk]:e.target.value}))}>
                            {['당일','1일후','2일후','3일후'].map(d=><option key={d}>{d}</option>)}
                          </select>
                          <select className="sm-input" style={{width:90}} value={form[tk]} onChange={e=>setForm(f=>({...f,[tk]:e.target.value}))}>
                            <option>전송시간</option>
                            {Array.from({length:13},(_,i)=>i+8).map(t=><option key={t}>{t}시</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sm-table-row">
                    <div className="sm-table-label">포인트 부족 알림</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5',gap:8}}>
                      <input type="checkbox" checked={form.pointAlertEnabled} onChange={e=>setForm(f=>({...f,pointAlertEnabled:e.target.checked}))} />
                      <span style={{fontSize:14}}>포인트부족</span>
                      <select className="sm-input" style={{width:100}} value={form.pointMin} onChange={e=>setForm(f=>({...f,pointMin:e.target.value}))}>
                        {['1000','2000','3000','4000','5000'].map(p=><option key={p} value={p}>{Number(p).toLocaleString()}</option>)}
                      </select>
                      <span style={{fontSize:12,color:'#555'}}>포인트 미만 시 관리자 휴대폰으로 자동 알림</span>
                    </div>
                  </div>
                  <div className="sm-table-row">
                    <div className="sm-table-label">미등원 알림</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5',gap:8}}>
                      <input type="checkbox" checked={form.nonMemberEnabled} onChange={e=>setForm(f=>({...f,nonMemberEnabled:e.target.checked}))} />
                      <span style={{fontSize:14}}>미등원알림</span>
                      <select className="sm-input" style={{width:90}} value={form.nonMemberTime} onChange={e=>setForm(f=>({...f,nonMemberTime:e.target.value}))}>
                        <option>선택</option>
                        <option>5분</option>
                        <option>10분</option>
                      </select>
                      <span style={{fontSize:12,color:'#555'}}>반별 시작시간에서 해당 시간 경과 시 미등원 알림 전송</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm-section-flat">
                <div className="sm-sec-head"><div className="sm-sec-title">소통 채널 설정</div></div>
                <div className="sm-form" style={{padding:0}}>
                  {[{l:'홈페이지',k:'chHomepage'},{l:'카카오채널',k:'chKakao'},{l:'블로그',k:'chBlog'},{l:'인스타그램',k:'chInsta'},{l:'유튜브',k:'chYoutube'},{l:'네이버카페',k:'chNaverCafe'},{l:'네이버밴드',k:'chNaverBand'}].map(({l,k})=>(
                    <div key={k} className="sm-table-row">
                      <div className="sm-table-label">{l}</div>
                      <div className="sm-table-cell" style={{gridColumn:'2/5'}}>
                        <input className="sm-input" style={{width:360}} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
                        <button className="sm-preview-btn" onClick={()=>form[k]&&window.open(form[k],'_blank')}>미리보기</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm-section-flat" style={{paddingBottom:60, borderBottom:'none'}}>
                <div className="sm-sec-head"><div className="sm-sec-title">기타 설정</div></div>
                <div className="sm-form" style={{padding:0}}>
                  <div className="sm-table-row">
                    <div className="sm-table-label required">POS 단말기</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5',gap:16}}>
                      {[{v:'toss',l:'TOSS프론트'},{v:'none',l:'사용안함'}].map(({v,l})=>(
                        <label key={v} style={{display:'flex',alignItems:'center',gap:4,fontSize:13,cursor:'pointer'}}>
                          <input type="radio" name="posDevice" value={v} checked={form.posDevice===v} onChange={e=>setForm(f=>({...f,posDevice:e.target.value}))} />{l}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="sm-table-row">
                    <div className="sm-table-label required">PG 결제</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5'}}>
                      <span style={{fontSize:13,color:'#e05c2a',fontWeight:500}}>사용안함</span>
                    </div>
                  </div>
                  <div className="sm-table-row">
                    <div className="sm-table-label">엑셀다운로드</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5',gap:16}}>
                      {[{v:'allow',l:'허용'},{v:'approve',l:'승인'}].map(({v,l})=>(
                        <label key={v} style={{display:'flex',alignItems:'center',gap:4,fontSize:13,cursor:'pointer'}}>
                          <input type="radio" name="excelDownload" value={v} checked={form.excelDownload===v} onChange={e=>setForm(f=>({...f,excelDownload:e.target.value}))} />{l}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="sm-table-row">
                    <div className="sm-table-label required">메세지전송방법</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5'}}>
                      <select className="sm-input" style={{width:160}} value={form.msgMethod} onChange={e=>setForm(f=>({...f,msgMethod:e.target.value}))}>
                        <option>알림톡만 전송</option>
                        <option>알림톡 (+메세지)</option>
                      </select>
                    </div>
                  </div>
                  <div className="sm-table-row" style={{borderBottom:'1px solid #e0e0e0'}}>
                    <div className="sm-table-label">등하원</div>
                    <div className="sm-table-cell" style={{gridColumn:'2/5',gap:32,flexWrap:'wrap'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:13,color:'#555',marginRight:4}}>등하원 입력</span>
                        {[{v:'phone4',l:'휴대폰 4자리'},{v:'exitNo',l:'출결번호'}].map(({v,l})=>(
                          <label key={v} style={{display:'flex',alignItems:'center',gap:4,fontSize:13,cursor:'pointer'}}>
                            <input type="radio" name="loginInput" value={v} checked={form.loginInput===v} onChange={e=>setForm(f=>({...f,loginInput:e.target.value}))} />{l}
                          </label>
                        ))}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:13,color:'#555',marginRight:4}}>등하원 순서</span>
                        {[{v:'none',l:'없음'},{v:'enrollOnly',l:'등원해야만 하원 가능'}].map(({v,l})=>(
                          <label key={v} style={{display:'flex',alignItems:'center',gap:4,fontSize:13,cursor:'pointer'}}>
                            <input type="radio" name="loginOrder" value={v} checked={form.loginOrder===v} onChange={e=>setForm(f=>({...f,loginOrder:e.target.value}))} />{l}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===== 권한그룹명 변경 ===== */}
          {activeSide === 'auth-group' && (
            <>
              <div className="sm-page-title"><FavStar label="권한그룹명 변경" path="/settings?page=auth-group" /> 권한그룹명 변경</div>
              <div className="sm-section-flat" style={{marginTop:40, borderBottom:'none', paddingBottom:60}}>
                <div className="sm-form">
                  <table className="auth-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>권한그룹코드</th>
                        <th>권한그룹명</th>
                        <th>학원정의권한그룹명</th>
                        <th>권한그룹설명</th>
                      </tr>
                    </thead>
                    <tbody>
                      {AUTH_GROUPS.map(g => (
                        <tr key={g.code}>
                          <td className="auth-td-center">{g.no}</td>
                          <td className="auth-td-center">{g.code}</td>
                          <td className="auth-td-center">{g.name}</td>
                          <td className="auth-td-center">
                            <input className="auth-name-input" value={authNames[g.code]}
                              onChange={e=>setAuthNames(n=>({...n,[g.code]:e.target.value}))} />
                          </td>
                          <td className="auth-td-right">{g.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ===== 사용자별 권한관리 ===== */}
          {activeSide === 'auth-user' && (
            <>
              <div className="sm-page-title"><FavStar label="사용자별 권한관리" path="/settings?page=auth-user" /> 사용자별 권한관리</div>

              <div className="sm-section-flat" style={{marginTop:40}}>
                <div className="sm-sec-head">
                  <div className="sm-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="sm-edit-btn">검색하기</button>
                    <button className="au-reset-btn">초기화</button>
                  </div>
                </div>
                <div className="sm-form">
                  <div style={{display:'flex',alignItems:'center',gap:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <label style={{fontSize:13,color:'#444',minWidth:24}}>부서</label>
                      <select className="sm-input" style={{width:120, background:'#fff'}}>
                        <option>선택하기</option>
                        <option>관리 부문</option>
                        <option>행정 부문</option>
                        <option>교육 부문</option>
                        <option>기타</option>
                      </select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <label style={{fontSize:13,color:'#444',minWidth:40}}>성명검색</label>
                      <input className="sm-input" style={{width:160}} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm-section-flat" style={{borderBottom:'none', paddingBottom:60}}>
                <div style={{overflowX:'auto'}}>
                  <table className="au-table">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="au-th-fix">부서</th>
                        <th rowSpan={2} className="au-th-fix">성명(사번)</th>
                        {AUTH_COLS.map(g=>(
                          <th key={g} colSpan={2} className="au-th-group">{g}</th>
                        ))}
                      </tr>
                      <tr>
                        {AUTH_COLS.flatMap((_,i)=>[
                          <th key={`reg${i}`} className="au-th-sub">등록</th>,
                          <th key={`chk${i}`} className="au-th-sub">조회</th>,
                        ])}
                      </tr>
                    </thead>
                    <tbody>
                      {AUTH_USERS.map((row,ri)=>(
                        <tr key={ri} className={ri%2===0?'au-tr-even':''}>
                          <td className="au-td-center">{row.dept}</td>
                          <td className="au-td-center">{row.name}</td>
                          {row.perms.map((p,pi)=>(
                            <td key={pi} className="au-td-center">
                              <span className={p ? 'au-o' : 'au-x'}>{p ? 'O' : 'X'}</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ===== 그룹별 사용자관리 ===== */}
          {activeSide === 'auth-mgmt' && (
            <>
              <div className="sm-page-title"><FavStar label="권한그룹별 사용자" path="/settings?page=auth-mgmt" /> 권한그룹별 사용자</div>

              {/* 조건검색 */}
              <div className="sm-section" style={{borderTop:'none', marginTop:40}}>
                <div className="sm-sec-head">
                  <div className="sm-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="sm-edit-btn">검색하기</button>
                    <button className="au-reset-btn">초기화</button>
                  </div>
                </div>
                <div className="sm-form">
                  <div style={{display:'flex',alignItems:'center',gap:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <label style={{fontSize:13,color:'#444',minWidth:40}}>권한그룹</label>
                      <select className="sm-input" style={{width:140}}>
                        <option>선택하기</option>
                        {AUTH_GROUPS.map(g=>(
                          <option key={g.code} value={g.code}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <label style={{fontSize:13,color:'#444',minWidth:40}}>사용자구분</label>
                      <select className="sm-input" style={{width:140}}>
                        <option>전체사용자</option>
                        <option>권한사용자</option>
                        <option>사용권한없음</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 직원 목록 */}
              <div className="sm-section" style={{borderTop:'none'}}>
                <div className="sm-sec-head" style={{borderBottom:'none'}}>
                  <div className="sm-sec-title">직원 목록</div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="sm-edit-btn">권한등록</button>
                    <button className="au-delete-btn">권한삭제</button>
                  </div>
                </div>
                <div className="sm-form" style={{padding:0}}>
                  <table className="auth-table">
                    <thead>
                      <tr style={{borderTop:'2px solid #666666'}}>
                        <th style={{width:40}}>
                          <input type="checkbox" />
                        </th>
                        <th>부서</th>
                        <th>성명(사번)</th>
                        <th>사용권한</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} style={{textAlign:'center',padding:'60px 0',color:'#888',fontSize:13}}>
                          권한그룹을 먼저 선택해 주세요.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ===== 코드 현황 ===== */}
          {activeSide === 'code-status' && (
            <>
              <div className="sm-page-title"><FavStar label="코드 현황" path="/settings?page=code-status" /> 코드 현황</div>

              {/* 조건검색 */}
              <div className="sm-section" style={{borderTop:'none', marginTop:40}}>
                <div className="sm-sec-head">
                  <div className="sm-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="sm-edit-btn">검색하기</button>
                    <button className="au-reset-btn">초기화</button>
                  </div>
                </div>
                <div className="sm-form">
                  <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <label style={{fontSize:13,color:'#444',minWidth:40}}>코드구분</label>
                      <select className="sm-input" style={{width:130}}>
                        <option>선택하기</option>
                        <option>강의실</option>
                        <option>과목</option>
                        <option>담당부서</option>
                        <option>담당업무</option>
                        <option>수납항목</option>
                        <option>시험그룹</option>
                        <option>시험종류</option>
                        <option>입학동기</option>
                        <option>직급</option>
                        <option>평가등급</option>
                        <option>평가항목</option>
                      </select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <label style={{fontSize:13,color:'#444',minWidth:40}}>코드상태</label>
                      <select className="sm-input" style={{width:110}}>
                        <option>전체</option>
                        <option>사용</option>
                        <option>미사용</option>
                      </select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <label style={{fontSize:13,color:'#444',minWidth:30}}>코드명</label>
                      <input className="sm-input" style={{width:180}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 코드 목록 */}
              <div className="sm-section" style={{borderTop:'none'}}>
                <div className="sm-sec-head" style={{borderBottom:'none'}}>
                  <div className="sm-sec-title" style={{visibility:'hidden'}}>-</div>
                  <button className="sm-preview-btn" style={{background:'#29b6f6'}}>코드 등록</button>
                </div>
                <div style={{padding:0}}>
                  <table className="auth-table">
                    <thead>
                      <tr style={{borderTop:'2px solid #666666'}}>
                        <th>출력순서</th>
                        <th>코드</th>
                        <th>명</th>
                        <th>사용유무</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} style={{textAlign:'center',padding:'60px 0',color:'#888',fontSize:13}}>
                          코드구분을 선택해 주세요
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ===== 주민번호 예외 현황 ===== */}
          {activeSide === 'resid-status' && (
            <>
              <div className="sm-page-title"><FavStar label="주민번호 예외 현황" path="/settings?page=resid-status" /> 주민번호 예외 현황</div>

              {/* 조건검색 */}
              <div className="sm-section" style={{borderTop:'none', marginTop:40}}>
                <div className="sm-sec-head">
                  <div className="sm-sec-title">조건검색</div>
                  <button className="sm-edit-btn">검색하기</button>
                </div>
                <div className="sm-form">
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <label style={{fontSize:13,color:'#444',minWidth:40}}>주민번호</label>
                    <input className="sm-input" style={{width:200}} />
                  </div>
                </div>
              </div>

              {/* 목록 */}
              <div className="sm-section" style={{borderTop:'none'}}>
                <div className="sm-sec-head" style={{borderBottom:'none'}}>
                  <div className="sm-sec-title" style={{visibility:'hidden'}}>-</div>
                  <button className="sm-preview-btn" style={{background:'#29b6f6'}}
                    onClick={() => window.open('/resid-add', '_blank', 'width=500,height=600')}>
                    주민번호 예외 등록
                  </button>
                </div>
                <div style={{padding:0}}>
                  <table className="auth-table">
                    <thead>
                      <tr style={{borderTop:'2px solid #666666'}}>
                        <th>순번</th>
                        <th>주민등록번호</th>
                        <th>등록사유</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="auth-td-center">1</td>
                        <td className="auth-td-center">000000-1111111</td>
                        <td className="auth-td-center">기타</td>
                      </tr>
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
