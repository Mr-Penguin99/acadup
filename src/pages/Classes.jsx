import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import './Classes.css'
import { DatePicker } from '../components/DatePicker'

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
const GROUP_DATA = [
  { id:1,  code:'GROUP00007', name:'반그룹_02(회차반)', use:'사용' },
  { id:2,  code:'GROUP00013', name:'to_반그룹',         use:'사용' },
  { id:3,  code:'GROUP00006', name:'반그룹_01(기간반)', use:'사용' },
  { id:4,  code:'GROUP00001', name:'그룹01',            use:'사용' },
  { id:5,  code:'33_02',      name:'고등_BB',           use:'사용' },
  { id:6,  code:'33_01',      name:'고등_AA',           use:'사용' },
  { id:7,  code:'33_03',      name:'고등_CC',           use:'사용' },
  { id:8,  code:'11_A',       name:'초등_A',            use:'사용' },
  { id:9,  code:'11_B',       name:'초등_B',            use:'사용' },
  { id:10, code:'11_C',       name:'초등_C',            use:'사용' },
]
const SAMPLE_DATA = [
  { id:1,  group:'',               name:'수업2_영어',       code:'CLASS00014', status:'개강', type:'국어', teacher:'김일희(강사)',   period:'2015.09.01~2026.12.31', room:'', count:'재원: 0명' },
  { id:2,  group:'',               name:'test02',           code:'CLASS00018', status:'개강', type:'국어', teacher:'',              period:'2016.09.01~2027.09.30', room:'', count:'재원: 1명' },
  { id:3,  group:'',               name:'test03',           code:'CLASS00020', status:'개강', type:'국어', teacher:'김부원장1',      period:'2015.11.06~2028.11.03', room:'', count:'재원: 0명' },
  { id:4,  group:'반그룹_02(회차반)', name:'회차반_001',    code:'CLASS00050', status:'개강', type:'국어', teacher:'장원장(기간반)', period:'2026.03.01~2026.12.31', room:'', count:'재원: 1명' },
  { id:5,  group:'반그룹_02(회차반)', name:'회차반_002',    code:'CLASS00051', status:'개강', type:'국어', teacher:'장원장(기간반)', period:'2026.01.01~2026.12.31', room:'', count:'재원: 0명' },
  { id:6,  group:'반그룹_02(회차반)', name:'회차반_003',    code:'CLASS00052', status:'개강', type:'수학', teacher:'장원장(기간반)', period:'2026.03.01~2026.12.31', room:'', count:'재원: 0명' },
  { id:7,  group:'to_반그룹',      name:'to_반_AAA_배정',   code:'CLASS00030', status:'개강', type:'국어', teacher:'장원장(기간반)', period:'2025.01.01~2026.12.31', room:'', count:'재원: 4명' },
  { id:8,  group:'to_반그룹',      name:'to_반_AAA_이동',   code:'CLASS00031', status:'개강', type:'국어', teacher:'',              period:'2026.01.01~2026.12.31', room:'', count:'재원: 0명' },
  { id:9,  group:'to_반그룹',      name:'to_반_AAA_미개강', code:'CLASS00032', status:'개강', type:'국어', teacher:'장원장(기간반)', period:'2026.04.01~2026.12.31', room:'', count:'재원: 0명' },
  { id:10, group:'to_반그룹',      name:'to_반_XXX_배정',   code:'CLASS00040', status:'개강', type:'국어', teacher:'',              period:'2026.01.01~2026.12.31', room:'', count:'재원: 0명' },
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

  const toggleGroup = id => setExpanded(e=>e.includes(id)?[]:  [id])

  return (
    <div className="classes-wrap">
      <TopNav/>
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
                    if(m.id==='students')navigate('/students')
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
            <button style={{padding:'10px 24px',background:'#F5841F',color:'#fff',border:'none',borderRadius:6,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}} onClick={()=>setShowUpgradeModal(false)}>무료로 정식 전환하러 가기</button>
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
              <span>이 화면은 미리보기입니다. 정식 전환하시면 지금 보이는 기능을 바로 사용하실 수 있어요.</span>
              <button style={{flexShrink:0,marginLeft:16,padding:'3px 20px',background:'#ff9000',color:'#fff',border:'none',borderRadius:4,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}} onClick={()=>window.open('/conversion-request','_blank','width=560,height=780')}>
                정식전환 요청하기
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
                      {GROUP_DATA.map(d=>(
                        <tr key={d.id}>
                          <td style={{textAlign:'center'}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                              <span style={{fontSize:12,color:'#666'}}>{d.id}</span>
                              <button className="order-btn up">↑</button>
                              <button className="order-btn down">↓</button>
                            </div>
                          </td>
                          <td style={{textAlign:'center'}}>{d.code}</td>
                          <td style={{textAlign:'center'}}>{d.name}</td>
                          <td style={{textAlign:'center'}}>{d.use}</td>
                        </tr>
                      ))}
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
                    <button className="cl-search-btn">검색하기</button>
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
                    <button className="cl-search-btn">검색하기</button>
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
                <div className="cl-table-header"><button className="cl-reg-btn">반 등록</button></div>
                <div className="cl-table-wrap">
                  <table className="cl-table">
                    <thead><tr><th>출력순서</th><th>반 그룹</th><th>반 명</th><th>반 코드</th><th>상태</th><th>중분류</th><th>담임</th><th>수강기간</th><th>강의실</th><th>수강생수</th><th>기능</th></tr></thead>
                    <tbody>
                      {SAMPLE_DATA.map(d=>(
                        <tr key={d.id}>
                          <td className="td-center">{d.id}</td><td>{d.group}</td><td>{d.name}</td><td>{d.code}</td>
                          <td className="td-center">{d.status}</td><td className="td-center">{d.type}</td>
                          <td>{d.teacher}</td><td>{d.period}</td><td>{d.room}</td><td>{d.count}</td>
                          <td className="td-center"><button className="cl-edit-btn">반 수정</button></td>
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
