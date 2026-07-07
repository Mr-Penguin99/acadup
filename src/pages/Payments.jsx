import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Payments.css'
import TopNav from '../components/TopNav'
import { MonthPicker, DatePicker } from '../components/DatePicker'
import BillingTab from '../components/student/BillingTab'
import PaymentTab from '../components/student/PaymentTab'
import TutorialMultiSpotlight from '../components/TutorialMultiSpotlight'
import TutorialTooltip from '../components/TutorialTooltip'
import { useTutorial } from '../components/TutorialContext'
import { useAppData } from '../contexts/AppDataContext'

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
  { id:'payment-mgmt', label:'수납관리', items:[
    { id:'bulk-bill',   label:'일괄청구' },
    { id:'class-bill',  label:'회차반 일괄청구', locked:true },
    { id:'unpaid',      label:'청구/미납내역' },
    { id:'monthly-pay', label:'수강월 청구/수납' },
    { id:'pay-history', label:'결제내역' },
  ]},
  { id:'pay-status', label:'수납현황', items:[
    { id:'daily-status',   label:'일별 수납현황' },
    { id:'monthly-status', label:'월별 수납현황' },
    { id:'class-status',   label:'반별 수납현황' },
  ]},
]
const MONTHLY_PAY_DATA = [
  { id:1,  name:'@이순신',    cls:'to_반그룹 > from_반_CCC',    billAmt:'222',     tradeDate:'', payMethod:'', status:'미납', payAmt:'',  unpaid:'222',     created:'일괄수동' },
  { id:2,  name:'@하늘땅',    cls:'to_반그룹 > from_반_CCC',    billAmt:'222',     tradeDate:'', payMethod:'', status:'미납', payAmt:'',  unpaid:'222',     created:'일괄수동' },
  { id:3,  name:'회차_김333', cls:'to_반그룹 > from_반_CCC',    billAmt:'222',     tradeDate:'', payMethod:'', status:'미납', payAmt:'',  unpaid:'222',     created:'일괄수동' },
  { id:4,  name:'@이순신',    cls:'to_반그룹 > to_반_001_배정', billAmt:'100,000', tradeDate:'', payMethod:'', status:'미납', payAmt:'',  unpaid:'100,000', created:'일괄수동' },
  { id:5,  name:'김학생AA',   cls:'to_반그룹 > to_반_001_배정', billAmt:'100,000', tradeDate:'', payMethod:'', status:'미납', payAmt:'',  unpaid:'100,000', created:'일괄수동' },
  { id:6,  name:'김학생CC',   cls:'to_반그룹 > to_반_001_배정', billAmt:'100,000', tradeDate:'', payMethod:'', status:'미납', payAmt:'',  unpaid:'100,000', created:'일괄수동' },
  { id:7,  name:'@예비',      cls:'to_반그룹 > to_반_AAA_배정', billAmt:'100',     tradeDate:'', payMethod:'', status:'미납', payAmt:'',  unpaid:'100',     created:'수기등록' },
  { id:8,  name:'@이순신',    cls:'to_반그룹 > to_반_AAA_배정', billAmt:'',        tradeDate:'', payMethod:'', status:'완납', payAmt:'0', unpaid:'',        created:'수기등록' },
  { id:9,  name:'가나다',     cls:'to_반그룹 > to_반_AAA_배정', billAmt:'10,000',  tradeDate:'', payMethod:'', status:'미납', payAmt:'',  unpaid:'10,000',  created:'수기등록' },
  { id:10, name:'홍길동ab',   cls:'to_반그룹 > to_반_AAA_배정', billAmt:'5,000',   tradeDate:'', payMethod:'', status:'미납', payAmt:'',  unpaid:'5,000',   created:'일괄수동' },
]
const CLASS_BILL_DATA = [
  { group:'반그룹_02(회차반)', name:'회차반_001', code:'CLASS00050', status:'개강', count:'2 명', period:'2026.03.01~2026.12.31' },
  { group:'반그룹_02(회차반)', name:'회차반_002', code:'CLASS00051', status:'개강', count:'1 명', period:'2026.01.01~2026.12.31' },
  { group:'반그룹_02(회차반)', name:'회차반_003', code:'CLASS00052', status:'개강', count:'0 명', period:'2026.03.01~2026.12.31' },
  { group:'no-use반모음', name:'회 차반_333(사용안함)', code:'CLASS00008', status:'개강', count:'1 명', period:'2025.01.01~2031.12.31' },
  { group:'no-use반모음', name:'02_피아노(2개월)_일시납', code:'CLASS00013', status:'개강', count:'1 명', period:'2016.03.01~2029.03.31' },
]
const BULK_DATA = [
  { id:1,  group:'',         name:'수업2_영어',        code:'CLASS00014', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2015.09.01~2026.12.31' },
  { id:2,  group:'',         name:'test02',            code:'CLASS00018', status:'개강', count:'1 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2016.09.01~2027.09.30' },
  { id:3,  group:'',         name:'test03',            code:'CLASS00020', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2015.11.06~2028.11.03' },
  { id:4,  group:'to_반그룹', name:'to_반_AAA_배정',   code:'CLASS00030', status:'개강', count:'4 명', billRound:'1차',   billCnt:'4', amount:'15,100', unpaid:'15,100', period:'2025.01.01~2026.12.31' },
  { id:5,  group:'to_반그룹', name:'to_반_AAA_이동',   code:'CLASS00031', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2026.01.01~2026.12.31' },
  { id:6,  group:'to_반그룹', name:'to_반_AAA_미개강', code:'CLASS00032', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2026.04.01~2026.12.31' },
  { id:7,  group:'to_반그룹', name:'to_반_XXX_배정',   code:'CLASS00040', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2026.01.01~2026.12.31' },
  { id:8,  group:'to_반그룹', name:'to_반_XXX_이동',   code:'CLASS00041', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2026.01.01~2026.12.31' },
  { id:9,  group:'to_반그룹', name:'to_반_XXX_미개강', code:'CLASS00042', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2026.05.01~2026.12.31' },
  { id:10, group:'to_반그룹', name:'from_반_AAA',       code:'CLASS00033', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2025.01.01~2026.12.31' },
]
const CLASS_STATUS_DATA = [
  { id:1, cls:'고등_AA > 고등_AA_기초반',            month:'2026-05', billCnt:2, billAmt:'200,000', payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:2, unpaidAmt:'200,000' },
  { id:2, cls:'반그룹_수업1 > 수업1_영어(일화목토)', month:'2026-05', billCnt:1, billAmt:'10,000',  payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:1, unpaidAmt:'10,000' },
  { id:3, cls:'반그룹_01(기간반) > 01_국어(222개월)', month:'2026-05', billCnt:2, billAmt:'19,000', payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:2, unpaidAmt:'19,000' },
  { id:4, cls:'to_반그룹 > to_반_001_배정',           month:'2026-05', billCnt:3, billAmt:'300,000',payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:3, unpaidAmt:'300,000' },
  { id:5, cls:'to_반그룹 > to_반_AAA_배정',           month:'2026-05', billCnt:3, billAmt:'15,100', payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:3, unpaidAmt:'15,100' },
  { id:6, cls:'to_반그룹 > from_반_CCC',              month:'2026-05', billCnt:3, billAmt:'666',    payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:3, unpaidAmt:'666' },
]

export default function Payments() {
  const navigate = useNavigate()
  const { activeStep, isOpen, advance } = useTutorial()
  const { students, enrollments, payments: paymentRecords } = useAppData()
  const [activeMenu, setActiveMenu] = useState('payments')
  const [activeSide, setActiveSide] = useState('unpaid')
  const [expanded, setExpanded] = useState(['payment-mgmt'])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [checked, setChecked] = useState([])
  const [bulkFilter, setBulkFilter] = useState({ month:'2026-05', group:'전체', status:'개강', name:'' })
  const [classBillFilter, setClassBillFilter] = useState({ searchType:'반별', group:'전체', className:'', remaining:'3회 이하', student:'' })
  const [monthlyPayFilter, setMonthlyPayFilter] = useState({ month:'2026-05', group:'전체', className:'', searchType:'수강생-성명', keyword:'' })
  const [payHistoryFilter, setPayHistoryFilter] = useState({ dateFrom:'2026-01-01', dateTo:'2026-05-26', group:'전체', className:'', searchType:'수강생-성명', keyword:'' })
  const [dailyFilter, setDailyFilter] = useState({ date:'2026-05-01', group:'전체', className:'', searchType:'수강생-성명', keyword:'' })
  const [monthlyFilter, setMonthlyFilter] = useState({ searchType:'수납월', month:'2026-05', group:'전체', className:'' })
  const [classStatusFilter, setClassStatusFilter] = useState({ month:'2026-05', group:'전체', className:'' })
  const [bulkChecked, setBulkChecked] = useState([])
  const [pageSize, setPageSize] = useState('20')
  const [filter, setFilter] = useState({ month:'2026-05', group:'전체', className:'', type:'수강생-성명', keyword:'' })

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [expandedPayId, setExpandedPayId] = useState(null)
  const [expandedUnpaidId, setExpandedUnpaidId] = useState(null)
  const [menuLockedClickCount, setMenuLockedClickCount] = useState(0)

  const paymentsMainRef = useRef(null)
  const paymentsPageTitleRef = useRef(null)
  const [paymentsMainRect, setPaymentsMainRect] = useState(null)
  const [paymentsPageTitleRect, setPaymentsPageTitleRect] = useState(null)
  const showPaymentPageHint = isOpen && activeStep?.id === 'payment-page-hint'
  const showPaymentPageDetailHint = isOpen && activeStep?.id === 'payment-page-detail-hint'

  useEffect(() => {
    if (!showPaymentPageHint && !showPaymentPageDetailHint) return
    const measure = () => {
      if (paymentsMainRef.current) setPaymentsMainRect(paymentsMainRef.current.getBoundingClientRect())
      if (paymentsPageTitleRef.current) setPaymentsPageTitleRect(paymentsPageTitleRef.current.getBoundingClientRect())
    }
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showPaymentPageHint, showPaymentPageDetailHint])

  const handlePaymentPageConfirm = () => advance()
  useEffect(() => {
    if (!showPaymentPageHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handlePaymentPageConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPaymentPageHint])

  const handlePaymentPageDetailConfirm = () => advance()
  useEffect(() => {
    if (!showPaymentPageDetailHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handlePaymentPageDetailConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPaymentPageDetailHint])

  const toggleGroup   = id => setExpanded(e=>e.includes(id)?[]:  [id])
  const toggleBulkCheck = id => setBulkChecked(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id])
  const toggleBulkAll   = () => setBulkChecked(bulkChecked.length===BULK_DATA.length?[]:BULK_DATA.map(d=>d.id))
  const toggleCheck   = id => setChecked(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id])

  const unpaidData = students.map(s => {
    const rows = enrollments
      .filter(e => e.studentId === s.id)
      .map(e => {
        const fee = parseInt(String(e.fee).replace(/[^0-9]/g, ''), 10) || 0
        const paid = paymentRecords.filter(p => p.enrollmentId === e.id).reduce((sum, p) => sum + p.amount, 0)
        return { ...e, remaining: Math.max(fee - paid, 0) }
      })
      .filter(e => e.remaining > 0)
    if (rows.length === 0) return null
    const guardian = s.family?.find(f => f.isPrimary) || s.family?.[0]
    const unpaid = rows.reduce((sum, e) => sum + e.remaining, 0)
    return {
      id: s.id,
      name: s.name,
      method: '-',
      classes: rows.map(e => ({ cls: e.className, day: `매월 ${e.payDay || '1'}일` })),
      unpaid,
      phone: s.phone,
      sentDate: '',
      rel: guardian?.relation || '',
      guardPhone: guardian?.phone || '',
      guardSent: '',
    }
  }).filter(Boolean)

  const payHistoryData = students.map(s => {
    const studentPayments = paymentRecords.filter(p => p.studentId === s.id)
    if (studentPayments.length === 0) return null
    const guardian = s.family?.find(f => f.isPrimary) || s.family?.[0]
    const payAmt = studentPayments.reduce((sum, p) => sum + p.amount, 0)
    return {
      id: s.id,
      name: s.name,
      classes: [...new Set(studentPayments.map(p => p.className))],
      payAmt,
      refund: 0,
      phone: s.phone,
      guardRel: guardian?.relation || '',
      guardPhone: guardian?.phone || '',
    }
  }).filter(Boolean)

  const toggleAll = () => setChecked(checked.length===unpaidData.length?[]:unpaidData.map(d=>d.id))

  return (
    <div className="payments-wrap">
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
                    if(m.id==='settings')navigate('/settings')
                    if(m.id==='dashboard')navigate('/dashboard')
                    if(m.id==='classes')navigate('/classes')
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

<div className="payments-body">
        {sidebarOpen&&(
          <div className="payments-sidebar">
            <div className="ss-title">수납관리</div>
            {SIDE_MENUS.map(group=>(
              <div key={group.id} className="ss-group-wrap">
                <div className="ss-group" onClick={()=>toggleGroup(group.id)}>
                  <span className="ss-toggle">{expanded.includes(group.id)?'∧':'∨'}</span><span>{group.label}</span>
                </div>
                {expanded.includes(group.id)&&group.items.map(item=>(
                  <div key={item.id} className={`ss-item ${activeSide===item.id?'active':''}`}
                    style={{position:'relative'}}
                    onClick={()=>{ if(item.locked){ setShowUpgradeModal(true) } else { setActiveSide(item.id) } }}>
                    <span className="ss-arrow">▶</span> {item.label}
                    {item.locked && (
                      <span style={{position:'absolute',inset:0,background:'rgba(100,100,100,0.45)',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',borderRadius:'inherit'}}>
                        <svg width="16" height="19" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="7" width="12" height="9" rx="1.5" fill="white"/>
                          <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                          <circle cx="7" cy="11.5" r="1.5" fill="rgba(100,100,100,0.45)"/>
                          <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="rgba(100,100,100,0.45)"/>
                        </svg>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <div className="ss-footer"><div className="ss-phone">1811-3435</div><div className="ss-hours">평일 09:00~18:00</div></div>
          </div>
        )}

        <div className="payments-main" ref={paymentsMainRef}>

          {/* 미리보기 배너 */}
          {['bulk-bill','class-bill','monthly-pay','daily-status','monthly-status','class-status'].includes(activeSide)&&(
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

          {/* 일괄청구 */}
          {activeSide==='bulk-bill'&&(
            <>
              <div className="pm-page-title"><span style={{color:'#ccc'}}>☆</span> 일괄청구</div>
              <div className="pm-section" style={{border:'none',background:'#f8f9fb',borderRadius:5,marginTop:40}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}>
                  <div className="pm-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="pm-dark-btn">검색하기</button><button className="pm-reset-btn">초기화</button>
                    <button className="pm-teal-btn">일괄청구</button><button className="pm-red-btn">일괄청구삭제</button>
                  </div>
                </div>
                <div className="pm-filter">
                  <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'flex-start'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수강월</label>
                      <MonthPicker value={bulkFilter.month} onChange={v=>setBulkFilter(f=>({...f,month:v}))}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 그룹</label>
                      <select className="pm-input" style={{width:90}} value={bulkFilter.group} onChange={e=>setBulkFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 상태</label>
                      <select className="pm-input" style={{width:90}} value={bulkFilter.status} onChange={e=>setBulkFilter(f=>({...f,status:e.target.value}))}><option>개강</option><option>폐강</option><option>대기</option></select>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 명</label>
                      <input className="pm-input" style={{width:120}} value={bulkFilter.name} onChange={e=>setBulkFilter(f=>({...f,name:e.target.value}))}/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pm-section" style={{border:'none'}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}><div className="pm-sec-title">반현황</div></div>
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <thead><tr><th><input type="checkbox" checked={bulkChecked.length===BULK_DATA.length} onChange={toggleBulkAll}/></th><th>반 그룹</th><th>반 명</th><th>반 코드</th><th>상태</th><th>수강생수</th><th>일괄청구차수</th><th>청구건수</th><th>청구금액</th><th>미납금액</th><th>수강기간</th></tr></thead>
                    <tbody>
                      {BULK_DATA.map(d=>(
                        <tr key={d.id} className={bulkChecked.includes(d.id)?'checked-row':''}>
                          <td><input type="checkbox" checked={bulkChecked.includes(d.id)} onChange={()=>toggleBulkCheck(d.id)}/></td>
                          <td>{d.group}</td><td>{d.name}</td><td>{d.code}</td>
                          <td style={{textAlign:'center'}}>{d.status}</td><td style={{textAlign:'center'}}>{d.count}</td>
                          <td style={{textAlign:'center'}}>{d.billRound}</td><td style={{textAlign:'center'}}>{d.billCnt}</td>
                          <td style={{textAlign:'center'}}>{d.amount}</td><td style={{textAlign:'center'}}>{d.unpaid}</td>
                          <td>{d.period}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 회차반 일괄청구 */}
          {activeSide==='class-bill'&&(
            <div style={{position:'relative', minHeight:400}}>
              <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)'}}>
                <svg width="80" height="98" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{filter:'drop-shadow(0px 3px 6px rgba(0,0,0,0.12))'}}>
                  <rect x="1" y="7" width="12" height="9" rx="1.5" fill="#d0d0d0"/>
                  <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="#d0d0d0" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <circle cx="7" cy="11.5" r="1.5" fill="#b0b0b0"/>
                  <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="#b0b0b0"/>
                </svg>
              </div>
            </div>
          )}

          {/* 청구/미납내역 */}
          {activeSide==='unpaid'&&(
            <>
              <div className="pm-page-title"><span ref={paymentsPageTitleRef}><span style={{color:'#F5C518'}}>⭐</span> 청구/미납내역</span></div>
              <div className="pm-section" style={{border:'none',background:'#f8f9fb',borderRadius:5,marginTop:40}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}>
                  <div className="pm-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}><button className="pm-search-btn">검색하기</button><button className="pm-reset-btn">초기화</button></div>
                </div>
                <div className="pm-filter">
                  <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'flex-start'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수강월</label><MonthPicker value={filter.month} onChange={v=>setFilter(f=>({...f,month:v}))}/></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 그룹</label><select className="pm-input" style={{width:90}} value={filter.group} onChange={e=>setFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반명</label><select className="pm-input" style={{width:90}} value={filter.className} onChange={e=>setFilter(f=>({...f,className:e.target.value}))}><option>선택하기</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>검색</label>
                      <select className="pm-input" style={{width:130}} value={filter.type} onChange={e=>setFilter(f=>({...f,type:e.target.value}))}><option>수강생-성명</option><option>수강생-휴대폰</option><option>수강생-집전화</option><option>주결제방법</option></select>
                      <input className="pm-input" style={{width:120}} value={filter.keyword} onChange={e=>setFilter(f=>({...f,keyword:e.target.value}))}/>
                      <button className="pm-dark-btn">검색</button><button className="pm-teal-btn">알림톡전송</button><button className="pm-orange-btn">알림톡전체전송</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pm-section" style={{border:'none'}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}>
                  <div className="pm-sec-title">수강생 목록</div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:12,color:'#666'}}>페이지당 조회</span>
                    <select className="pm-input" style={{width:60}} value={pageSize} onChange={e=>setPageSize(e.target.value)}><option>10</option><option>20</option><option>50</option></select>
                  </div>
                </div>
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <thead><tr><th><input type="checkbox" checked={unpaidData.length>0 && checked.length===unpaidData.length} onChange={toggleAll}/></th><th>번호</th><th>성명</th><th>주 결제방법</th><th>반명 / 납부기준일</th><th>미납금액</th><th>수강생휴대폰</th><th>문자전송일</th><th>보호자관계</th><th>보호자휴대폰</th><th>문자전송일</th></tr></thead>
                    <tbody>
                      {unpaidData.filter(d=>expandedUnpaidId===null||expandedUnpaidId===d.id).map((d,idx)=>(
                        <>
                          <tr key={d.id} className={checked.includes(d.id)?'checked-row':''}>
                            <td><input type="checkbox" checked={checked.includes(d.id)} onChange={()=>toggleCheck(d.id)}/></td>
                            <td>{idx+1}</td>
                            <td><span className="sts-name-link" onClick={()=>setExpandedUnpaidId(expandedUnpaidId===d.id?null:d.id)}>{d.name}</span></td>
                            <td>{d.method}</td>
                            <td>{d.classes.map((c,i)=><div key={i} className="cls-row"><span className="cls-name">{c.cls}</span><span className="cls-day">{c.day}</span></div>)}</td>
                            <td className="unpaid-amt">{d.unpaid.toLocaleString()}</td>
                            <td>{d.phone}</td>
                            <td className={d.sentDate?'sent-date':''}>{d.sentDate}</td>
                            <td>{d.rel}</td><td>{d.guardPhone}</td>
                            <td className={d.guardSent?'sent-date-red':''}>{d.guardSent}</td>
                          </tr>
                          {expandedUnpaidId===d.id && (
                            <tr key={`unpaid-detail-${d.id}`}>
                              <td colSpan={11} style={{padding:'0 10px',background:'#fff'}}>
                                <div style={{marginTop:40}}><PaymentTab studentId={d.id} studentName={d.name} defaultFilter="미납+완납(환불)" /></div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
                {unpaidData.length === 0 && <div className="pm-empty-footer">검색된 데이터가 없습니다.</div>}
              </div>
            </>
          )}

          {/* 수강월별 청구/수납 */}
          {activeSide==='monthly-pay'&&(
            <>
              <div className="pm-page-title"><span style={{color:'#ccc'}}>☆</span> 수강월별 청구/수납</div>
              <div className="pm-section" style={{border:'none',background:'#f8f9fb',borderRadius:5,marginTop:40}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}>
                  <div className="pm-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}><button className="pm-teal-btn">수납내역출력</button><button className="pm-reset-btn">초기화</button></div>
                </div>
                <div className="pm-filter">
                  <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'flex-start'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수강월</label><MonthPicker value={monthlyPayFilter.month} onChange={v=>setMonthlyPayFilter(f=>({...f,month:v}))}/></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 그룹</label><select className="pm-input" style={{width:90}} value={monthlyPayFilter.group} onChange={e=>setMonthlyPayFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반명</label><select className="pm-input" style={{width:90}} value={monthlyPayFilter.className} onChange={e=>setMonthlyPayFilter(f=>({...f,className:e.target.value}))}><option>선택하기</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>검색</label>
                      <select className="pm-input" style={{width:130}} value={monthlyPayFilter.searchType} onChange={e=>setMonthlyPayFilter(f=>({...f,searchType:e.target.value}))}><option>수강생-성명</option><option>수강생-휴대폰</option><option>수강생-집전화</option></select>
                      <input className="pm-input" style={{width:120}} value={monthlyPayFilter.keyword} onChange={e=>setMonthlyPayFilter(f=>({...f,keyword:e.target.value}))}/>
                      <button className="pm-gray-btn">검색</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pm-section" style={{border:'none'}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}><div className="pm-sec-title">수강생 목록</div></div>
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <thead><tr><th></th><th style={{textAlign:'left',paddingLeft:30}}>성명</th><th>반명</th><th>청구금액</th><th>거래일</th><th>수납방법</th><th>상태</th><th>수납금액</th><th>미납금액</th><th>생성</th><th>기능</th></tr></thead>
                    <tbody>
                      {MONTHLY_PAY_DATA.map(d=>(
                        <tr key={d.id}>
                          <td style={{textAlign:'center'}}>{d.id}</td>
                          <td style={{textAlign:'left'}}>{d.name}</td>
                          <td style={{textAlign:'center'}}>{d.cls}</td><td style={{textAlign:'center'}}>{d.billAmt}</td><td style={{textAlign:'center'}}>{d.tradeDate}</td><td style={{textAlign:'center'}}>{d.payMethod}</td>
                          <td style={{textAlign:'center'}}><span style={{color:d.status==='미납'?'#0100FF':'#000',cursor:d.status==='미납'?'pointer':'default'}}>{d.status}</span></td>
                          <td style={{textAlign:'center'}}>{d.payAmt}</td><td style={{textAlign:'center'}}>{d.unpaid}</td>
                          <td style={{textAlign:'center',fontSize:13}}>{d.created}</td>
                          <td style={{textAlign:'center'}}><button className="monthly-reg-btn" onClick={()=>{
                            if(d.status==='완납'){
                              alert('수납이 발생한 청구 건은 수정할 수 없습니다.')
                              return
                            }
                            sessionStorage.setItem('manualRegisterData', JSON.stringify({
                              className: d.cls,
                              month: monthlyPayFilter.month,
                              billAmt: d.billAmt,
                              item: '수강료01',
                            }))
                            const w = 650, h = 800
                            const left = window.screenX + (window.outerWidth - w) / 2
                            const top = window.screenY + (window.outerHeight - h) / 2
                            window.open('/manual-register','_blank',`width=${w},height=${h},left=${left},top=${top},resizable=yes`)
                          }}><span className="plus">+</span>수기등록</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pm-pagination">
                  <div className="pm-pages">{[1,2].map(p=><button key={p} className={`pm-page-btn ${p===1?'active':''}`}>{p}</button>)}</div>
                  <span className="pm-page-info">1 / 2 Pages</span>
                </div>
              </div>
            </>
          )}

          {/* 결제내역 */}
          {activeSide==='pay-history'&&(
            <>
              <div className="pm-page-title"><span style={{color:'#ccc'}}>☆</span> 결제 내역</div>
              <div className="pm-section" style={{border:'none',background:'#f8f9fb',borderRadius:5,marginTop:40}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}>
                  <div className="pm-sec-title">조건검색</div>
                  <div style={{display:'flex',gap:6}}><button className="pm-search-btn">검색하기</button><button className="pm-reset-btn">초기화</button></div>
                </div>
                <div className="pm-filter">
                  <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'flex-start'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>결제일</label>
                      <DatePicker value={payHistoryFilter.dateFrom} onChange={v=>setPayHistoryFilter(f=>({...f,dateFrom:v}))}/>
                      <span>~</span>
                      <DatePicker value={payHistoryFilter.dateTo} onChange={v=>setPayHistoryFilter(f=>({...f,dateTo:v}))}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 그룹</label><select className="pm-input" style={{width:90}} value={payHistoryFilter.group} onChange={e=>setPayHistoryFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반명</label><select className="pm-input" style={{width:90}} value={payHistoryFilter.className} onChange={e=>setPayHistoryFilter(f=>({...f,className:e.target.value}))}><option>선택하기</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>검색</label>
                      <select className="pm-input" style={{width:130}} value={payHistoryFilter.searchType} onChange={e=>setPayHistoryFilter(f=>({...f,searchType:e.target.value}))}><option>수강생-성명</option><option>수강생-휴대폰</option><option>수강생-집전화</option></select>
                      <input className="pm-input" style={{width:120}} value={payHistoryFilter.keyword} onChange={e=>setPayHistoryFilter(f=>({...f,keyword:e.target.value}))}/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pm-section" style={{border:'none'}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}><div className="pm-sec-title">수강생 목록</div></div>
                <div className="pm-table-wrap">
                  <table className="pm-table" style={{tableLayout:'fixed',minWidth:760}}>
                    <colgroup>
                      <col style={{width:60}}/><col style={{width:100}}/><col/><col style={{width:220}}/><col style={{width:170}}/><col style={{width:200}}/><col style={{width:170}}/><col style={{width:210}}/>
                    </colgroup>
                    <thead><tr><th>번호</th><th>성명</th><th>반명</th><th>결제금액</th><th>환불금액</th><th>수강생휴대폰</th><th>보호자관계</th><th>보호자휴대폰</th></tr></thead>
                    <tbody>
                      {payHistoryData.length === 0
                        ? <tr><td colSpan={8} style={{textAlign:'center',padding:'30px',color:'#bbb',fontSize:13}}>검색된 데이터가 없습니다.</td></tr>
                        : payHistoryData.filter(d=>expandedPayId===null||expandedPayId===d.id).map((d,idx)=>(
                          <>
                            <tr key={d.id}>
                              <td style={{textAlign:'center'}}>{idx+1}</td>
                              <td style={{textAlign:'left'}}>
                                <span className="sts-name-link"
                                  onClick={()=>setExpandedPayId(expandedPayId===d.id?null:d.id)}>
                                  {d.name}
                                </span>
                              </td>
                              <td style={{textAlign:'center'}}>{d.classes.map((c,i)=><div key={i} style={{fontSize:13,color:'#444',lineHeight:'1.6'}}>{c}</div>)}</td>
                              <td style={{textAlign:'center',color:'#0100FF',fontWeight:400}}>{d.payAmt.toLocaleString()}</td>
                              <td style={{textAlign:'center'}}>{d.refund || ''}</td>
                              <td style={{textAlign:'center'}}>{d.phone}</td><td style={{textAlign:'center'}}>{d.guardRel}</td><td style={{textAlign:'center'}}>{d.guardPhone}</td>
                            </tr>
                            {expandedPayId===d.id && (
                              <tr key={`billing-${d.id}`}>
                                <td colSpan={8} style={{padding:'0 10px',background:'#fff'}}>
                                  <div style={{marginTop:40}}><BillingTab studentId={d.id} studentName={d.name} /></div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 일별 수납현황 */}
          {activeSide==='daily-status'&&(
            <>
              <div className="pm-page-title"><span style={{color:'#ccc'}}>☆</span> 일별 수납 현황</div>
              <div className="pm-section" style={{border:'none',background:'#f8f9fb',borderRadius:5,marginTop:40}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}><div className="pm-sec-title">일별 수납현황 검색</div></div>
                <div className="pm-filter">
                  <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'flex-start'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수납일</label><DatePicker value={dailyFilter.date} onChange={v=>setDailyFilter(f=>({...f,date:v}))}/></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 그룹</label><select className="pm-input" style={{width:90}} value={dailyFilter.group} onChange={e=>setDailyFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반명</label><select className="pm-input" style={{width:90}} value={dailyFilter.className} onChange={e=>setDailyFilter(f=>({...f,className:e.target.value}))}><option>선택하기</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>검색</label>
                      <select className="pm-input" style={{width:130}} value={dailyFilter.searchType} onChange={e=>setDailyFilter(f=>({...f,searchType:e.target.value}))}><option>수강생-성명</option><option>수강생-휴대폰</option><option>수강생-집전화</option></select>
                      <input className="pm-input" style={{width:120}} value={dailyFilter.keyword} onChange={e=>setDailyFilter(f=>({...f,keyword:e.target.value}))}/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pm-section" style={{border:'none'}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}><div className="pm-sec-title">일별 수납현황 목록</div></div>
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <thead><tr><th>번호</th><th>성명</th><th>수강월</th><th>반명</th><th>항목</th><th>청구금액</th><th>거래일</th><th>수납방법</th><th>상태</th><th>수납금액</th><th>환불금액</th><th>미납금액</th></tr></thead>
                    <tbody><tr><td colSpan={12} style={{textAlign:'center',padding:'30px',color:'#bbb',fontSize:13}}>수납 내역이 없습니다.</td></tr></tbody>
                    <tfoot><tr className="pm-table-foot"><td colSpan={2}></td><td style={{textAlign:'center',fontWeight:700}}>합계</td><td colSpan={2}></td><td style={{textAlign:'center',fontWeight:700}}>0</td><td colSpan={3}></td><td style={{textAlign:'center',fontWeight:700}}>0</td><td style={{textAlign:'center',fontWeight:700}}>0</td><td style={{textAlign:'center',fontWeight:700}}>0</td></tr></tfoot>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 월별 수납현황 */}
          {activeSide==='monthly-status'&&(
            <>
              <div className="pm-page-title"><span style={{color:'#ccc'}}>☆</span> 월별 수납 현황</div>
              <div className="pm-section" style={{border:'none',background:'#f8f9fb',borderRadius:5,marginTop:40}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}><div className="pm-sec-title">월별 수납현황 검색</div></div>
                <div className="pm-filter">
                  <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'flex-start'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>구분</label><select className="pm-input" style={{width:80}} value={monthlyFilter.searchType} onChange={e=>setMonthlyFilter(f=>({...f,searchType:e.target.value}))}><option>수납월</option><option>수강월</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>월</label><MonthPicker value={monthlyFilter.month} onChange={v=>setMonthlyFilter(f=>({...f,month:v}))}/></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 그룹</label><select className="pm-input" style={{width:90}} value={monthlyFilter.group} onChange={e=>setMonthlyFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반명</label><select className="pm-input" style={{width:90}} value={monthlyFilter.className} onChange={e=>setMonthlyFilter(f=>({...f,className:e.target.value}))}><option>선택하기</option></select></div>
                  </div>
                </div>
              </div>
              <div className="pm-section" style={{border:'none'}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}><div className="pm-sec-title">월별 수납현황 목록</div></div>
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <thead><tr><th>번호</th><th>성명</th><th>수강월</th><th>반명</th><th>항목</th><th>청구금액</th><th>거래일</th><th>수납방법</th><th>상태</th><th>수납금액</th><th>환불금액</th><th>미납금액</th></tr></thead>
                    <tbody><tr><td colSpan={12} style={{textAlign:'center',padding:'30px',color:'#bbb',fontSize:13}}>수납 내역이 없습니다.</td></tr></tbody>
                    <tfoot><tr className="pm-table-foot"><td colSpan={2}></td><td style={{textAlign:'center',fontWeight:700}}>합계</td><td colSpan={2}></td><td style={{textAlign:'center',fontWeight:700}}>0</td><td colSpan={3}></td><td style={{textAlign:'center',fontWeight:700}}>0</td><td style={{textAlign:'center',fontWeight:700}}>0</td><td style={{textAlign:'center',fontWeight:700}}>0</td></tr></tfoot>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 반별 수납현황 */}
          {activeSide==='class-status'&&(
            <>
              <div className="pm-page-title"><span style={{color:'#ccc'}}>☆</span> 반별 수납 현황</div>
              <div className="pm-section" style={{border:'none',background:'#f8f9fb',borderRadius:5,marginTop:40}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}>
                  <div className="pm-sec-title">반별 수납현황 검색</div>
                  <div style={{display:'flex',gap:6}}><button className="pm-search-btn">검색하기</button><button className="pm-reset-btn">초기화</button></div>
                </div>
                <div className="pm-filter">
                  <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'flex-start'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>수강월</label><MonthPicker value={classStatusFilter.month} onChange={v=>setClassStatusFilter(f=>({...f,month:v}))}/></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반 그룹</label><select className="pm-input" style={{width:90}} value={classStatusFilter.group} onChange={e=>setClassStatusFilter(f=>({...f,group:e.target.value}))}><option>전체</option></select></div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}><label style={{fontSize:13,color:'#666',whiteSpace:'nowrap'}}>반명</label><select className="pm-input" style={{width:90}} value={classStatusFilter.className} onChange={e=>setClassStatusFilter(f=>({...f,className:e.target.value}))}><option>선택하기</option></select></div>
                  </div>
                </div>
              </div>
              <div className="pm-section" style={{border:'none'}}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}><div className="pm-sec-title">반별 수납현황</div></div>
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <thead><tr><th>번호</th><th>반명</th><th>수강월</th><th>청구건수</th><th>청구금액</th><th>수납건수</th><th>수납금액</th><th>환불건수</th><th>환불금액</th><th>미납건수</th><th>미납금액</th></tr></thead>
                    <tbody>
                      {CLASS_STATUS_DATA.map(d=>(
                        <tr key={d.id}>
                          <td style={{textAlign:'center'}}>{d.id}</td><td style={{textAlign:'center'}}>{d.cls}</td>
                          <td style={{textAlign:'center'}}>{d.month}</td><td style={{textAlign:'center'}}>{d.billCnt}</td>
                          <td style={{textAlign:'center'}}>{d.billAmt}</td><td style={{textAlign:'center'}}>{d.payCnt}</td>
                          <td style={{textAlign:'center'}}>{d.payAmt}</td><td style={{textAlign:'center'}}>{d.refundCnt}</td>
                          <td style={{textAlign:'center'}}>{d.refundAmt}</td><td style={{textAlign:'center'}}>{d.unpaidCnt}</td>
                          <td style={{textAlign:'center'}}>{d.unpaidAmt}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="pm-table-foot"><td colSpan={2}></td><td style={{textAlign:'center',fontWeight:700}}>합계</td><td style={{textAlign:'center',fontWeight:700}}>14</td><td style={{textAlign:'center',fontWeight:700}}>544,766</td><td style={{textAlign:'center',fontWeight:700}}>0</td><td style={{textAlign:'center',fontWeight:700}}>0</td><td style={{textAlign:'center',fontWeight:700}}>0</td><td style={{textAlign:'center',fontWeight:700}}>0</td><td style={{textAlign:'center',fontWeight:700}}>14</td><td style={{textAlign:'center',fontWeight:700}}>544,766</td></tr></tfoot>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
      {(showPaymentPageHint || showPaymentPageDetailHint) && paymentsMainRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[paymentsMainRect]}
            pad={0}
          />
          <div style={{
            position: 'fixed',
            left: paymentsMainRect.left,
            top: paymentsMainRect.top,
            width: paymentsMainRect.width,
            height: paymentsMainRect.height,
            zIndex: 3001,
          }} />
          {paymentsPageTitleRect && (
            <TutorialTooltip
              rect={paymentsPageTitleRect}
              placement="right"
              message={showPaymentPageHint
                ? "수납관리 메뉴로 이동하면 청구/미납내역 페이지가 먼저 나옵니다."
                : "청구/미납내역에서 결제를 진행해보겠습니다."}
              onConfirm={showPaymentPageHint ? handlePaymentPageConfirm : handlePaymentPageDetailConfirm}
            />
          )}
        </>
      )}
    </div>
  )
}
