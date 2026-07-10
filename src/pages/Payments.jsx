import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Payments.css'
import TopNav from '../components/TopNav'
import { MonthPicker, DatePicker } from '../components/DatePicker'
import BillingTab from '../components/student/BillingTab'
import PaymentTab from '../components/student/PaymentTab'
import TutorialMultiSpotlight from '../components/TutorialMultiSpotlight'
import TutorialTooltip from '../components/TutorialTooltip'
import { useTutorial, TUTORIAL_STEPS } from '../components/TutorialContext'
import { logConversionClick } from '../lib/trackConversion'
import { useAppData } from '../contexts/AppDataContext'
import ManualRegister from './ManualRegister'
import PaymentRegister from './PaymentRegister'
import PaymentCancel from './PaymentCancel'

// 조건검색 날짜/월 필터의 기본값 - 오늘 날짜 기준(예: 오늘이 7/9이면 이번 달 1일~오늘)
const TODAY = new Date().toISOString().slice(0, 10)
const CURRENT_MONTH = TODAY.slice(0, 7)
const MONTH_START = `${CURRENT_MONTH}-01`

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
  { id:1, name:'김민준', cls:'고1 수학반',   billAmt:'360,000', tradeDate:'', payMethod:'', status:'완납', payAmt:'360,000', unpaid:'0',       created:'수기등록' },
  { id:2, name:'이서연', cls:'고1 수학반',   billAmt:'180,000', tradeDate:'', payMethod:'', status:'미납', payAmt:'',        unpaid:'180,000', created:'일괄수동', birth:'10.06.05' },
  { id:3, name:'박도윤', cls:'수능 실전반', billAmt:'220,000', tradeDate:'', payMethod:'', status:'완납', payAmt:'220,000', unpaid:'0',       created:'일괄자동' },
]
const CLASS_BILL_DATA = [
  { group:'반그룹_02(회차반)', name:'회차반_001', code:'CLASS00050', status:'개강', count:'2 명', period:'2026.03.01~2026.12.31' },
  { group:'반그룹_02(회차반)', name:'회차반_002', code:'CLASS00051', status:'개강', count:'1 명', period:'2026.01.01~2026.12.31' },
  { group:'반그룹_02(회차반)', name:'회차반_003', code:'CLASS00052', status:'개강', count:'0 명', period:'2026.03.01~2026.12.31' },
  { group:'no-use반모음', name:'회 차반_333(사용안함)', code:'CLASS00008', status:'개강', count:'1 명', period:'2025.01.01~2031.12.31' },
  { group:'no-use반모음', name:'02_피아노(2개월)_일시납', code:'CLASS00013', status:'개강', count:'1 명', period:'2016.03.01~2029.03.31' },
]
const BULK_DATA = [
  { id:1, group:'고등부', name:'고1 수학반',   code:'CLASS00001', status:'개강', count:'12명', billRound:'2차', billCnt:'18', amount:'3,240,000', unpaid:'430,000', period:'2026.02.01~2999.12.31' },
  { id:2, group:'고등부', name:'고2 수학반',   code:'CLASS00002', status:'개강', count:'8명',  billRound:'2차', billCnt:'12', amount:'2,160,000', unpaid:'',        period:'2026.02.01~2999.12.31' },
  { id:3, group:'입시부', name:'수능 실전반', code:'CLASS00003', status:'개강', count:'13명', billRound:'1차', billCnt:'13', amount:'2,860,000', unpaid:'440,000', period:'2026.02.01~2999.12.31' },
]
const CLASS_STATUS_DATA = [
  { id:1, cls:'고1 수학반',   month:'2026-06', billCnt:2, billAmt:'3,240,000', payCnt:15, payAmt:'2,700,000', refundCnt:'', refundAmt:'', unpaidCnt:3, unpaidAmt:'430,000' },
  { id:2, cls:'고2 수학반',   month:'2026-06', billCnt:2, billAmt:'2,160,000', payCnt:12, payAmt:'2,160,000', refundCnt:'', refundAmt:'', unpaidCnt:'', unpaidAmt:'' },
  { id:3, cls:'수능 실전반', month:'2026-06', billCnt:1, billAmt:'2,860,000', payCnt:11, payAmt:'2,420,000', refundCnt:'', refundAmt:'', unpaidCnt:2, unpaidAmt:'440,000' },
]
// 표 하단 합계 - CLASS_STATUS_DATA 값이 바뀌어도 항상 실제 합계로 계산됨
const sumClassStatusField = (key) => CLASS_STATUS_DATA.reduce((s, d) => s + (parseInt(String(d[key]).replace(/,/g, ''), 10) || 0), 0)
const CLASS_STATUS_TOTALS = {
  billCnt: sumClassStatusField('billCnt'),
  billAmt: sumClassStatusField('billAmt').toLocaleString(),
  payCnt: sumClassStatusField('payCnt'),
  payAmt: sumClassStatusField('payAmt').toLocaleString(),
  refundCnt: sumClassStatusField('refundCnt'),
  refundAmt: sumClassStatusField('refundAmt').toLocaleString(),
  unpaidCnt: sumClassStatusField('unpaidCnt'),
  unpaidAmt: sumClassStatusField('unpaidAmt').toLocaleString(),
}

export default function Payments() {
  const navigate = useNavigate()
  const { activeStep, isOpen, advance, mode, effectiveStep } = useTutorial()
  const isReplay = isOpen && mode === 'replay'
  // 결제완료 단계부터는 청구/미납내역에서 사라지고, 결제내역 목록 단계부터는 결제내역에 나타나는 것처럼
  // 누적으로 보여주기 위한 기준 인덱스
  const PAYMENT_COMPLETED_STEP_INDEX = TUTORIAL_STEPS.findIndex(s => s.id === 'payment-completed-list-hint')
  const PAYMENT_HISTORY_LIST_STEP_INDEX = TUTORIAL_STEPS.findIndex(s => s.id === 'payment-history-list-hint')
  // 결제취소 완료 단계부터는 결제내역에서도 사라짐(청구/미납내역으로 다시 미납 표시되는 흐름)
  const PAYMENT_CANCEL_COMPLETED_STEP_INDEX = TUTORIAL_STEPS.findIndex(s => s.id === 'payment-cancel-completed-list-hint')
  // "학생 이름 클릭" 단계(청구/미납내역으로 되돌아온 시점)부터 다시 미납 목록에 나타남
  const PAYMENT_FINAL_LIST_STEP_INDEX = TUTORIAL_STEPS.findIndex(s => s.id === 'payment-final-list-hint')
  const { students, enrollments, payments: paymentRecords } = useAppData()
  const [activeMenu, setActiveMenu] = useState('payments')
  const [activeSide, setActiveSide] = useState('unpaid')
  const [expanded, setExpanded] = useState(['payment-mgmt'])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [checked, setChecked] = useState([])
  const [bulkFilter, setBulkFilter] = useState({ month:CURRENT_MONTH, group:'전체', status:'개강', name:'' })
  const [classBillFilter, setClassBillFilter] = useState({ searchType:'반별', group:'전체', className:'', remaining:'3회 이하', student:'' })
  const [monthlyPayFilter, setMonthlyPayFilter] = useState({ month:CURRENT_MONTH, group:'전체', className:'', searchType:'수강생-성명', keyword:'' })
  const [payHistoryFilter, setPayHistoryFilter] = useState({ dateFrom:MONTH_START, dateTo:TODAY, group:'전체', className:'', searchType:'수강생-성명', keyword:'' })
  const [dailyFilter, setDailyFilter] = useState({ date:TODAY, group:'전체', className:'', searchType:'수강생-성명', keyword:'' })
  const [monthlyFilter, setMonthlyFilter] = useState({ searchType:'수납월', month:CURRENT_MONTH, group:'전체', className:'' })
  const [classStatusFilter, setClassStatusFilter] = useState({ month:CURRENT_MONTH, group:'전체', className:'' })
  const [bulkChecked, setBulkChecked] = useState([])
  const [pageSize, setPageSize] = useState('20')
  const [filter, setFilter] = useState({ month:CURRENT_MONTH, group:'전체', className:'', type:'수강생-성명', keyword:'' })

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
    // 강조표시는 "청구/미납내역" 제목부터 수강생목록 끝까지 - 두 rect를 합쳐서 하나의 강조 영역으로 만듦
    const measure = () => {
      const titleRect = paymentsPageTitleRef.current?.getBoundingClientRect()
      const listRect = studentListSectionRef.current?.getBoundingClientRect()
      if (titleRect) setPaymentsPageTitleRect(titleRect)
      if (titleRect && listRect) {
        const left = Math.min(titleRect.left, listRect.left)
        const right = Math.max(titleRect.right, listRect.right)
        const top = titleRect.top
        const bottom = listRect.bottom
        setPaymentsMainRect({ left, right, top, bottom, width: right - left, height: bottom - top })
      }
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

  // 수납관리 튜토리얼 마지막 흐름: 수강생 목록 → 이름 클릭 → 수납내역 펼침 → 체크박스(PaymentTab) → 수기등록/수납 모달
  const studentListSectionRef = useRef(null)
  const studentNameRef = useRef(null)
  const paymentDetailRef = useRef(null)
  const [studentListRect, setStudentListRect] = useState(null)
  const [studentNameRect, setStudentNameRect] = useState(null)
  const [paymentDetailRect, setPaymentDetailRect] = useState(null)
  const showStudentListHint = isOpen && activeStep?.id === 'payment-student-list-hint'
  const showStudentNameHint = isOpen && activeStep?.id === 'payment-student-name-hint'
  const showDetailHint = isOpen && activeStep?.id === 'payment-detail-hint'

  useEffect(() => {
    if (!showStudentListHint) return
    const measure = () => setStudentListRect(studentListSectionRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showStudentListHint])

  useEffect(() => {
    if (!showStudentNameHint) return
    const measure = () => setStudentNameRect(studentNameRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showStudentNameHint])

  useEffect(() => {
    if (!showDetailHint) return
    const measure = () => setPaymentDetailRect(paymentDetailRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showDetailHint])

  const handleStudentListConfirm = () => advance()
  useEffect(() => {
    if (!showStudentListHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handleStudentListConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showStudentListHint])

  const handleDetailConfirm = () => advance()
  useEffect(() => {
    if (!showDetailHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handleDetailConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showDetailHint])

  // 결제 완료 이후: 청구/미납내역 목록에서 사라짐 안내 → 결제내역 메뉴 클릭 유도 → 결제내역 페이지 수강생 목록 강조
  const payHistoryMenuItemRef = useRef(null)
  const payHistorySectionRef = useRef(null)
  const [payHistoryMenuRect, setPayHistoryMenuRect] = useState(null)
  const [payHistoryListRect, setPayHistoryListRect] = useState(null)
  const showCompletedListHint = isOpen && activeStep?.id === 'payment-completed-list-hint'
  const showPayHistoryMenuHint = isOpen && activeStep?.id === 'payment-history-menu-hint'
  const showPayHistoryListHint = isOpen && activeStep?.id === 'payment-history-list-hint'

  useEffect(() => {
    if (!showCompletedListHint) return
    const measure = () => setStudentListRect(studentListSectionRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showCompletedListHint])

  useEffect(() => {
    if (!showPayHistoryMenuHint) return
    const measure = () => setPayHistoryMenuRect(payHistoryMenuItemRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showPayHistoryMenuHint])

  useEffect(() => {
    if (!showPayHistoryListHint) return
    const measure = () => setPayHistoryListRect(payHistorySectionRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showPayHistoryListHint])

  const handleCompletedListConfirm = () => advance()
  useEffect(() => {
    if (!showCompletedListHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handleCompletedListConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCompletedListHint])

  const handlePayHistoryListConfirm = () => advance()
  useEffect(() => {
    if (!showPayHistoryListHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handlePayHistoryListConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPayHistoryListHint])

  // 결제내역 페이지: 수강생 이름 클릭 → 결제내역(BillingTab) 강조 → (체크박스/결제취소 버튼은 BillingTab 내부) → 결제취소 모달
  const billingNameRef = useRef(null)
  const billingDetailRef = useRef(null)
  const [billingNameRect, setBillingNameRect] = useState(null)
  const [billingDetailRect, setBillingDetailRect] = useState(null)
  const showBillingNameHint = isOpen && activeStep?.id === 'payment-history-name-hint'
  const showBillingDetailHint = isOpen && activeStep?.id === 'payment-billing-detail-hint'

  useEffect(() => {
    if (!showBillingNameHint) return
    const measure = () => setBillingNameRect(billingNameRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showBillingNameHint])

  useEffect(() => {
    if (!showBillingDetailHint) return
    const measure = () => setBillingDetailRect(billingDetailRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showBillingDetailHint])

  const handleBillingDetailConfirm = () => advance()
  useEffect(() => {
    if (!showBillingDetailHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handleBillingDetailConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showBillingDetailHint])

  // 결제취소 버튼을 누르면(튜토리얼 중에는 팝업창 대신) 화면 중앙에 모달로 띄우고 강조표시
  const paymentCancelModalBoxRef = useRef(null)
  const [paymentCancelModalRect, setPaymentCancelModalRect] = useState(null)
  const showPaymentCancelModal = isOpen && activeStep?.id === 'payment-cancel-modal-hint'

  useEffect(() => {
    if (!showPaymentCancelModal) return
    const measure = () => setPaymentCancelModalRect(paymentCancelModalBoxRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showPaymentCancelModal])

  // 결제취소 완료 이후: 결제내역 목록에서 사라짐 안내 → 청구/미납내역 메뉴 클릭 유도 → 수강생 목록 → 다시 미납으로 표시된 수납내역 → 튜토리얼 완료 버튼
  const unpaidMenuItemRef = useRef(null)
  const nameHeaderRef = useRef(null)
  const [unpaidMenuRect, setUnpaidMenuRect] = useState(null)
  const [nameHeaderRect, setNameHeaderRect] = useState(null)
  const [statusHeaderRect, setStatusHeaderRect] = useState(null)
  const showCancelCompletedListHint = isOpen && activeStep?.id === 'payment-cancel-completed-list-hint'
  const showUnpaidMenuHint = isOpen && activeStep?.id === 'payment-unpaid-menu-hint'
  const showFinalListHint = isOpen && activeStep?.id === 'payment-final-list-hint'
  const showFinalDetailHint = isOpen && activeStep?.id === 'payment-final-detail-hint'

  useEffect(() => {
    if (!showCancelCompletedListHint) return
    const measure = () => setPayHistoryListRect(payHistorySectionRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showCancelCompletedListHint])

  useEffect(() => {
    if (!showUnpaidMenuHint) return
    const measure = () => setUnpaidMenuRect(unpaidMenuItemRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showUnpaidMenuHint])

  useEffect(() => {
    if (!showFinalListHint) return
    const measure = () => {
      setStudentListRect(studentListSectionRef.current?.getBoundingClientRect())
      setNameHeaderRect(nameHeaderRef.current?.getBoundingClientRect())
    }
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showFinalListHint])

  useEffect(() => {
    if (!showFinalDetailHint) return
    const measure = () => {
      setPaymentDetailRect(paymentDetailRef.current?.getBoundingClientRect())
      setStatusHeaderRect(paymentDetailRef.current?.querySelector('[data-tutorial="status-header"]')?.getBoundingClientRect())
    }
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showFinalDetailHint])

  const handleCancelCompletedListConfirm = () => advance()
  useEffect(() => {
    if (!showCancelCompletedListHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handleCancelCompletedListConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCancelCompletedListHint])

  const handleFinalListConfirm = () => advance()
  useEffect(() => {
    if (!showFinalListHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handleFinalListConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showFinalListHint])

  // 수기등록/수납 버튼을 누르면(튜토리얼 중에는 팝업창 대신) 화면 중앙에 모달로 띄우고 강조표시, 클릭/엔터로 다음 단계 진행
  const manualModalBoxRef = useRef(null)
  const payRegisterModalBoxRef = useRef(null)
  const [manualModalRect, setManualModalRect] = useState(null)
  const [payRegisterModalRect, setPayRegisterModalRect] = useState(null)
  const showManualModal = isOpen && activeStep?.id === 'payment-manual-modal-hint'
  // 수납 등록 모달은 인트로 단계 이후에도 수납방법/할부기간/결제하기 단계까지 계속 열려있어야 함
  const PAY_REGISTER_STEP_IDS = ['payment-register-modal-hint', 'payment-register-method-hint', 'payment-register-installment-hint', 'payment-register-pay-btn-hint']
  const showPayRegisterModal = isOpen && PAY_REGISTER_STEP_IDS.includes(activeStep?.id)
  const showPayRegisterIntro = isOpen && activeStep?.id === 'payment-register-modal-hint'

  useEffect(() => {
    if (!showManualModal) return
    const measure = () => setManualModalRect(manualModalBoxRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showManualModal])

  useEffect(() => {
    if (!showPayRegisterModal) return
    const measure = () => setPayRegisterModalRect(payRegisterModalBoxRef.current?.getBoundingClientRect())
    const timer = setTimeout(measure, 80)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [showPayRegisterModal])

  useEffect(() => {
    if (!showManualModal) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; advance() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showManualModal])

  useEffect(() => {
    if (!showPayRegisterIntro) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; advance() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPayRegisterIntro])

  const toggleGroup   = id => setExpanded(e=>e.includes(id)?[]:  [id])
  const toggleBulkCheck = id => setBulkChecked(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id])
  const toggleBulkAll   = () => setBulkChecked(bulkChecked.length===BULK_DATA.length?[]:BULK_DATA.map(d=>d.id))
  const toggleCheck   = id => setChecked(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id])

  // replay(다시보기) 모드에서는 실제 미납 데이터 대신 고정 샘플 학생 한 명만 보여줌
  const REPLAY_UNPAID_SAMPLE = {
    id: 'replay-unpaid-1', name: '홍길동', method: '',
    classes: [{ cls: '튜토리얼반', day: '1일' }],
    unpaid: 100000, phone: '010-1234-5678', sentDate: '',
    rel: '모', guardPhone: '010-1234-5678', guardSent: '',
  }

  const unpaidData = isReplay
    ? (effectiveStep >= PAYMENT_COMPLETED_STEP_INDEX && effectiveStep < PAYMENT_FINAL_LIST_STEP_INDEX ? [] : [REPLAY_UNPAID_SAMPLE])
    : students.map(s => {
    const rows = enrollments
      .filter(e => e.studentId === s.id)
      .map(e => {
        const fee = parseInt(String(e.fee).replace(/[^0-9]/g, ''), 10) || 0
        const paid = paymentRecords.filter(p => p.enrollmentId === e.id && !p.cancelled).reduce((sum, p) => sum + p.amount, 0)
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

  // replay(다시보기) 모드에서는 결제내역 목록 단계에 도달했을 때만(누적) 고정 샘플 한 명이 나타남
  const REPLAY_HISTORY_SAMPLE = {
    id: 'replay-history-1', name: '홍길동', classes: ['튜토리얼반'],
    payAmt: 100000, refund: 0, phone: '010-1234-5678', guardRel: '모', guardPhone: '010-1234-5678',
  }

  const payHistoryData = isReplay
    ? (effectiveStep >= PAYMENT_HISTORY_LIST_STEP_INDEX && effectiveStep < PAYMENT_CANCEL_COMPLETED_STEP_INDEX ? [REPLAY_HISTORY_SAMPLE] : [])
    : students.map(s => {
    // 결제취소된 건은 청구/미납내역으로 돌아가므로, 결제내역 수강생 목록에서는 제외 (수강생관리 > 결제 탭에서만 확인 가능)
    const studentPayments = paymentRecords.filter(p => p.studentId === s.id && !p.cancelled)
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

  // 펼쳐둔 학생이 수납/결제취소 등으로 목록에서 사라지면(예: 미납금 완납), 존재하지 않는 id로
  // 계속 필터링돼서 나머지 학생들까지 통째로 안 보이는 문제를 막기 위해 안전한 값으로 대체
  const safeExpandedUnpaidId = unpaidData.some(d => d.id === expandedUnpaidId) ? expandedUnpaidId : null
  const safeExpandedPayId = payHistoryData.some(d => d.id === expandedPayId) ? expandedPayId : null

  const toggleAll = () => setChecked(checked.length===unpaidData.length?[]:unpaidData.map(d=>d.id))

  // 튜토리얼 중 "이전" 버튼 등으로 단계를 되돌아가도, 그 단계가 필요로 하는 사이드메뉴/펼침 상태를 항상 맞춰줌
  // (앞으로 진행할 때만 자연스럽게 바뀌던 activeSide/expandedUnpaidId/expandedPayId를 단계 기준으로 강제 동기화)
  const UNPAID_TAB_STEP_IDS = [
    'payment-page-hint', 'payment-page-detail-hint',
    'payment-student-list-hint', 'payment-student-name-hint', 'payment-detail-hint',
    'payment-checkbox-hint', 'payment-manual-btn-hint', 'payment-manual-modal-hint',
    'payment-pay-btn-hint', 'payment-register-modal-hint', 'payment-register-method-hint',
    'payment-register-installment-hint', 'payment-register-pay-btn-hint',
    'payment-completed-list-hint', 'payment-history-menu-hint',
    'payment-final-list-hint', 'payment-final-detail-hint',
  ]
  const UNPAID_EXPANDED_STEP_IDS = [
    'payment-detail-hint', 'payment-checkbox-hint', 'payment-manual-btn-hint', 'payment-manual-modal-hint',
    'payment-pay-btn-hint', 'payment-register-modal-hint', 'payment-register-method-hint',
    'payment-register-installment-hint', 'payment-register-pay-btn-hint',
    'payment-final-detail-hint',
  ]
  const PAY_HISTORY_TAB_STEP_IDS = [
    'payment-history-list-hint', 'payment-history-name-hint', 'payment-billing-detail-hint',
    'payment-billing-checkbox-hint', 'payment-cancel-btn-hint', 'payment-cancel-modal-hint',
    'payment-cancel-completed-list-hint', 'payment-unpaid-menu-hint',
  ]
  const PAY_HISTORY_EXPANDED_STEP_IDS = [
    'payment-billing-detail-hint', 'payment-billing-checkbox-hint', 'payment-cancel-btn-hint', 'payment-cancel-modal-hint',
  ]

  useEffect(() => {
    if (!isOpen || !activeStep) return
    const id = activeStep.id
    if (UNPAID_TAB_STEP_IDS.includes(id)) {
      setSidebarOpen(true)
      setExpanded(e => e.includes('payment-mgmt') ? e : ['payment-mgmt'])
      setActiveSide('unpaid')
      setExpandedUnpaidId(UNPAID_EXPANDED_STEP_IDS.includes(id) ? (unpaidData[0]?.id ?? null) : null)
    } else if (PAY_HISTORY_TAB_STEP_IDS.includes(id)) {
      setSidebarOpen(true)
      setExpanded(e => e.includes('payment-mgmt') ? e : ['payment-mgmt'])
      setActiveSide('pay-history')
      setExpandedPayId(PAY_HISTORY_EXPANDED_STEP_IDS.includes(id) ? (payHistoryData[0]?.id ?? null) : null)
    }
  }, [isOpen, activeStep?.id])

  return (
    <div className="payments-wrap">
      <TopNav/>
      <div className="menu-bar" style={isReplay ? { pointerEvents: 'none' } : undefined}>
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
                    <svg width="18" height="22" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <button style={{padding:'10px 24px',background:'#F5841F',color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:400,cursor:'pointer',fontFamily:'inherit'}} onClick={()=>window.open('https://www.acadup.co.kr/home/member/signup_agree.asp','_blank')}>
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

<div className="payments-body" style={isReplay ? { pointerEvents: 'none' } : undefined}>
        {sidebarOpen&&(
          <div className="payments-sidebar">
            <div className="ss-title">수납관리</div>
            {SIDE_MENUS.map(group=>(
              <div key={group.id} className="ss-group-wrap">
                <div className="ss-group" onClick={()=>toggleGroup(group.id)}>
                  <span className="ss-toggle">{expanded.includes(group.id)?'∧':'∨'}</span><span>{group.label}</span>
                </div>
                {expanded.includes(group.id)&&group.items.map(item=>(
                  <div key={item.id} ref={item.id==='pay-history' ? payHistoryMenuItemRef : (item.id==='unpaid' ? unpaidMenuItemRef : null)}
                    className={`ss-item ${activeSide===item.id?'active':''}`}
                    style={{position:'relative'}}
                    onClick={()=>{
                      if(item.locked){ setShowUpgradeModal(true); return }
                      setActiveSide(item.id)
                      // 다른 사이드 메뉴로 이동했다가 돌아왔을 때 이전에 펼쳐뒀던 수납/결제내역은 항상 접힌 상태로 시작
                      setExpandedUnpaidId(null)
                      setExpandedPayId(null)
                      if (showPayHistoryMenuHint && item.id === 'pay-history') advance()
                      if (showUnpaidMenuHint && item.id === 'unpaid') advance()
                    }}>
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
              <button style={{flexShrink:0,marginLeft:16,padding:'3px 20px',background:'#ff9000',color:'#fff',border:'none',borderRadius:4,fontSize:13,fontWeight:400,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}} onClick={()=>{logConversionClick(); window.open('https://www.acadup.co.kr/home/member/signup_agree.asp','_blank')}}>
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
              <div className="pm-section" style={{border:'none'}} ref={studentListSectionRef}>
                <div className="pm-sec-head" style={{borderBottom:'none'}}>
                  <div className="pm-sec-title">수강생 목록</div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:12,color:'#666'}}>페이지당 조회</span>
                    <select className="pm-input" style={{width:60}} value={pageSize} onChange={e=>setPageSize(e.target.value)}><option>10</option><option>20</option><option>50</option></select>
                  </div>
                </div>
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <thead><tr><th><input type="checkbox" checked={unpaidData.length>0 && checked.length===unpaidData.length} onChange={toggleAll}/></th><th>번호</th><th ref={nameHeaderRef}>성명</th><th>주 결제방법</th><th>반명 / 납부기준일</th><th>미납금액</th><th>수강생휴대폰</th><th>문자전송일</th><th>보호자관계</th><th>보호자휴대폰</th><th>문자전송일</th></tr></thead>
                    <tbody>
                      {unpaidData.filter(d=>safeExpandedUnpaidId===null||safeExpandedUnpaidId===d.id).map((d,idx)=>(
                        <>
                          <tr key={d.id} className={checked.includes(d.id)?'checked-row':''}>
                            <td><input type="checkbox" checked={checked.includes(d.id)} onChange={()=>toggleCheck(d.id)}/></td>
                            <td>{idx+1}</td>
                            <td ref={idx===0 ? studentNameRef : null}>
                              <span className="sts-name-link" onClick={()=>{
                                setExpandedUnpaidId(expandedUnpaidId===d.id?null:d.id)
                                if (showStudentNameHint || showFinalListHint) advance()
                              }}>{d.name}</span>
                            </td>
                            <td>{d.method}</td>
                            <td>{d.classes.map((c,i)=><div key={i} className="cls-row"><span className="cls-name">{c.cls}</span><span className="cls-day">{c.day}</span></div>)}</td>
                            <td className="unpaid-amt">{d.unpaid.toLocaleString()}</td>
                            <td>{d.phone}</td>
                            <td className={d.sentDate?'sent-date':''}>{d.sentDate}</td>
                            <td>{d.rel}</td><td>{d.guardPhone}</td>
                            <td className={d.guardSent?'sent-date-red':''}>{d.guardSent}</td>
                          </tr>
                          {safeExpandedUnpaidId===d.id && (
                            <tr key={`unpaid-detail-${d.id}`}>
                              <td colSpan={11} style={{padding:'0 10px',background:'#fff'}}>
                                <div style={{marginTop:40}} ref={paymentDetailRef}><PaymentTab studentId={d.id} studentName={d.name} defaultFilter="미납+완납(환불)" /></div>
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
                              studentName: d.name,
                              studentBirth: d.birth,
                              // 수강월 청구/수납 페이지는 고정 UI라, 여기서 연 수기등록 창의
                              // 수정/삭제 버튼은 다른 +수기등록 진입 경로와 달리 실제 동작 없이 UI만 보여줌
                              fixedUi: true,
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
              <div className="pm-section" style={{border:'none'}} ref={payHistorySectionRef}>
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
                        : payHistoryData.filter(d=>safeExpandedPayId===null||safeExpandedPayId===d.id).map((d,idx)=>(
                          <>
                            <tr key={d.id}>
                              <td style={{textAlign:'center'}}>{idx+1}</td>
                              <td ref={idx===0 ? billingNameRef : null}>
                                <span className="sts-name-link"
                                  onClick={()=>{
                                    setExpandedPayId(expandedPayId===d.id?null:d.id)
                                    if (showBillingNameHint) advance()
                                  }}>
                                  {d.name}
                                </span>
                              </td>
                              <td style={{textAlign:'center'}}>{d.classes.map((c,i)=><div key={i} style={{fontSize:13,color:'#444',lineHeight:'1.6'}}>{c}</div>)}</td>
                              <td style={{textAlign:'center',color:'#0100FF',fontWeight:400}}>{d.payAmt.toLocaleString()}</td>
                              <td style={{textAlign:'center'}}>{d.refund || ''}</td>
                              <td style={{textAlign:'center'}}>{d.phone}</td><td style={{textAlign:'center'}}>{d.guardRel}</td><td style={{textAlign:'center'}}>{d.guardPhone}</td>
                            </tr>
                            {safeExpandedPayId===d.id && (
                              <tr key={`billing-${d.id}`}>
                                <td colSpan={8} style={{padding:'0 10px',background:'#fff'}}>
                                  <div style={{marginTop:40}} ref={billingDetailRef}><BillingTab studentId={d.id} studentName={d.name} /></div>
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
                    <tfoot><tr className="pm-table-foot"><td colSpan={2}></td><td style={{textAlign:'center',fontWeight:700}}>합계</td><td style={{textAlign:'center',fontWeight:700}}>{CLASS_STATUS_TOTALS.billCnt}</td><td style={{textAlign:'center',fontWeight:700}}>{CLASS_STATUS_TOTALS.billAmt}</td><td style={{textAlign:'center',fontWeight:700}}>{CLASS_STATUS_TOTALS.payCnt}</td><td style={{textAlign:'center',fontWeight:700}}>{CLASS_STATUS_TOTALS.payAmt}</td><td style={{textAlign:'center',fontWeight:700}}>{CLASS_STATUS_TOTALS.refundCnt}</td><td style={{textAlign:'center',fontWeight:700}}>{CLASS_STATUS_TOTALS.refundAmt}</td><td style={{textAlign:'center',fontWeight:700}}>{CLASS_STATUS_TOTALS.unpaidCnt}</td><td style={{textAlign:'center',fontWeight:700}}>{CLASS_STATUS_TOTALS.unpaidAmt}</td></tr></tfoot>
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
              rect={{
                left: paymentsPageTitleRect.left,
                right: paymentsPageTitleRect.right,
                width: paymentsPageTitleRect.width,
                height: paymentsPageTitleRect.height,
                top: paymentsPageTitleRect.top - 5,
                bottom: paymentsPageTitleRect.bottom - 5,
              }}
              placement="top"
              message={showPaymentPageHint
                ? "수납관리 메뉴로 이동하면 청구/미납내역 페이지가 먼저 나옵니다."
                : "청구/미납내역에서 결제를 진행해보겠습니다."}
              onConfirm={showPaymentPageHint ? handlePaymentPageConfirm : handlePaymentPageDetailConfirm}
            />
          )}
        </>
      )}
      {showStudentListHint && studentListRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[studentListRect]}
          />
          <div style={{
            position: 'fixed',
            left: studentListRect.left,
            top: studentListRect.top,
            width: studentListRect.width,
            height: studentListRect.height,
            zIndex: 3001,
          }} />
          <TutorialTooltip
            rect={studentListRect}
            placement="top"
            message="수강신청까지 진행하면 해당 학생이 수강한 반에 대한 청구서가 이곳에 생성됩니다."
            onConfirm={handleStudentListConfirm}
          />
        </>
      )}
      {showStudentNameHint && studentNameRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[studentNameRect]}
          />
          <TutorialTooltip
            rect={studentNameRect}
            placement="top"
            center
            message="학생의 이름을 클릭합니다."
          />
        </>
      )}
      {showDetailHint && paymentDetailRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[{ rect: paymentDetailRect, pad: 10 }]}
          />
          <div style={{
            position: 'fixed',
            left: paymentDetailRect.left - 10,
            top: paymentDetailRect.top - 10,
            width: paymentDetailRect.width + 20,
            height: paymentDetailRect.height + 20,
            zIndex: 3001,
          }} />
          <TutorialTooltip
            rect={paymentDetailRect}
            placement="top"
            message="이곳에서 보이는 수납내역은 수강생 정보 하단 메뉴에 있던 수납 메뉴와 동일합니다."
            onConfirm={handleDetailConfirm}
          />
        </>
      )}
      {showManualModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={manualModalBoxRef} style={{ width: 650, maxWidth: '90vw', maxHeight: '90vh', background: '#fff', borderRadius: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', overflowY: 'auto', minHeight: 0 }}>
              <ManualRegister />
              <div style={{ position: 'absolute', inset: 0 }} />
            </div>
            {!isReplay && (
              <div style={{ textAlign: 'center', padding: '12px 0', borderTop: '1px solid #eee' }}>
                <span style={{ color: '#F5841F', fontWeight: 500, fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }} onClick={() => advance()}>다음 단계로 이동 - 확인[Enter]</span>
              </div>
            )}
          </div>
        </div>
      )}
      {showManualModal && manualModalRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[manualModalRect]}
          />
          <TutorialTooltip
            rect={{
              left: manualModalRect.left,
              right: manualModalRect.right,
              width: manualModalRect.width,
              height: manualModalRect.height,
              top: manualModalRect.top + 5,
              bottom: manualModalRect.bottom + 5,
            }}
            placement="top"
            center
            message={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span>수기 등록 화면 예시</span>
                {!isReplay && (
                  <span
                    onClick={e => { e.stopPropagation(); advance() }}
                    style={{ fontSize: 11, color: '#F5841F', fontWeight: 600, cursor: 'pointer' }}
                  >확인[Enter]</span>
                )}
              </div>
            }
          />
        </>
      )}
      {showPayRegisterModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={payRegisterModalBoxRef} style={{ width: 650, maxWidth: '90vw', maxHeight: '90vh', background: '#fff', borderRadius: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', overflowY: 'auto', minHeight: 0 }}>
              <PaymentRegister />
            </div>
          </div>
        </div>
      )}
      {showPayRegisterIntro && payRegisterModalRect && (
        <TutorialMultiSpotlight
          boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
          holes={[payRegisterModalRect]}
        />
      )}
      {showCompletedListHint && studentListRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[studentListRect]}
          />
          <div style={{
            position: 'fixed',
            left: studentListRect.left,
            top: studentListRect.top,
            width: studentListRect.width,
            height: studentListRect.height,
            zIndex: 3001,
          }} />
          <TutorialTooltip
            rect={studentListRect}
            placement="top"
            message="결제가 완료된 청구서는 결제내역으로 이동합니다."
            onConfirm={handleCompletedListConfirm}
          />
        </>
      )}
      {showPayHistoryMenuHint && payHistoryMenuRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[payHistoryMenuRect]}
          />
          <TutorialTooltip
            rect={payHistoryMenuRect}
            placement="right"
            message="결제내역을 클릭하세요."
          />
        </>
      )}
      {showPayHistoryListHint && payHistoryListRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[payHistoryListRect]}
          />
          <div style={{
            position: 'fixed',
            left: payHistoryListRect.left,
            top: payHistoryListRect.top,
            width: payHistoryListRect.width,
            height: payHistoryListRect.height,
            zIndex: 3001,
          }} />
          <TutorialTooltip
            rect={payHistoryListRect}
            placement="top"
            message="결제가 완료된 내역은 이곳 결제내역에서 확인할 수 있습니다."
            onConfirm={handlePayHistoryListConfirm}
          />
        </>
      )}
      {showBillingNameHint && billingNameRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[billingNameRect]}
          />
          <TutorialTooltip
            rect={billingNameRect}
            placement="top"
            message="수강생 이름을 클릭해 주세요."
          />
        </>
      )}
      {showBillingDetailHint && billingDetailRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[{ rect: billingDetailRect, pad: 10 }]}
          />
          <div style={{
            position: 'fixed',
            left: billingDetailRect.left - 10,
            top: billingDetailRect.top - 10,
            width: billingDetailRect.width + 20,
            height: billingDetailRect.height + 20,
            zIndex: 3001,
          }} />
          <TutorialTooltip
            rect={billingDetailRect}
            placement="top"
            message="이곳에서 결제내역을 확인할 수 있고 결제 취소를 할 수 있습니다."
            onConfirm={handleBillingDetailConfirm}
          />
          <div style={{
            position: 'fixed',
            left: billingDetailRect.left,
            top: billingDetailRect.bottom + 20,
            width: billingDetailRect.width,
            zIndex: 3002,
            color: '#fff',
            fontSize: 13,
            textAlign: 'center',
          }}>
            수강생 정보에 있는 결제 메뉴에서도 이 내용을 확인하실 수 있습니다.
          </div>
        </>
      )}
      {showPaymentCancelModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={paymentCancelModalBoxRef} style={{ width: 600, maxWidth: '90vw', maxHeight: '90vh', background: '#fff', borderRadius: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', overflowY: 'auto', minHeight: 0 }}>
              <PaymentCancel />
            </div>
          </div>
        </div>
      )}
      {showPaymentCancelModal && paymentCancelModalRect && (
        <TutorialMultiSpotlight
          boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
          holes={[paymentCancelModalRect]}
        />
      )}
      {showCancelCompletedListHint && payHistoryListRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[{ rect: payHistoryListRect, pad: 10 }]}
          />
          <div style={{
            position: 'fixed',
            left: payHistoryListRect.left - 10,
            top: payHistoryListRect.top - 10,
            width: payHistoryListRect.width + 20,
            height: payHistoryListRect.height + 20,
            zIndex: 3001,
          }} />
          <TutorialTooltip
            rect={payHistoryListRect}
            placement="top"
            message="결제취소 처리되어 결제내역에서 사라지고 청구/미납내역으로 다시 미납으로 표시됩니다."
            onConfirm={handleCancelCompletedListConfirm}
          />
        </>
      )}
      {showUnpaidMenuHint && unpaidMenuRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[unpaidMenuRect]}
          />
          <TutorialTooltip
            rect={unpaidMenuRect}
            placement="right"
            message="청구/미납내역을 클릭해 주세요."
          />
        </>
      )}
      {showFinalListHint && studentListRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[studentListRect]}
          />
          <TutorialTooltip
            rect={nameHeaderRect || studentListRect}
            placement="top"
            center
            message="학생 이름 클릭"
            onConfirm={handleFinalListConfirm}
          />
        </>
      )}
      {showFinalDetailHint && paymentDetailRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[{ rect: paymentDetailRect, pad: 10 }]}
          />
          <div style={{
            position: 'fixed',
            left: paymentDetailRect.left - 10,
            top: paymentDetailRect.top - 10,
            width: paymentDetailRect.width + 20,
            height: paymentDetailRect.height + 20,
            zIndex: 3001,
          }} />
          <TutorialTooltip
            rect={statusHeaderRect || paymentDetailRect}
            placement="top"
            center
            message="미납 내역으로 표시"
          />
          {/* 이 단계는 튜토리얼의 마지막 스텝이라, 리플레이 중에도 예외적으로 이 버튼만은 클릭 가능하게
              둠 - 눌러서 나가면 advance()가 마지막 단계 완료 처리(100%로 저장 + 종료)까지 같이 해줌 */}
          <div style={{
            position: 'fixed',
            left: '50%',
            top: paymentDetailRect.bottom + 100,
            transform: 'translateX(-50%)',
            zIndex: 3002,
          }}>
            <button
              style={{ padding: '10px 24px', background: '#00a2ff', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => advance()}
            >튜토리얼 완료</button>
          </div>
        </>
      )}
    </div>
  )
}
