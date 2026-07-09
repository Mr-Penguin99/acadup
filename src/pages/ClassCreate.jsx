import { useState, useEffect, useRef } from 'react'
import './ClassCreate.css'
import { FreeDatePicker } from '../components/DatePicker'
import { useTutorial } from '../components/TutorialContext'
import TutorialTooltip from '../components/TutorialTooltip'
import TutorialMultiSpotlight from '../components/TutorialMultiSpotlight'
import { useAppData } from '../contexts/AppDataContext'

const START_HOURS = Array.from({length:19},(_,i)=>String(i+5).padStart(2,'0'))  // 05~23
const END_HOURS   = Array.from({length:19},(_,i)=>String(i+6).padStart(2,'0'))  // 06~24
const MINS        = ['00','30']
const DAYS  = ['일','월','화','수','목','금','토']

const emptyLesson  = () => ({ id:Date.now()+Math.random(), sh:'09', sm:'00', eh:'10', em:'00', days:{일:false,월:false,화:false,수:false,목:false,금:false,토:false} })
const emptyTeacher = () => ({ id:Date.now()+Math.random(), name:'', homeroom:false, subject:'' })
const emptyPayment = () => ({ id:Date.now()+Math.random(), item:'', price:'', required:true, cycle:'' })

// replay(다시보기) 모드에서는 실제로 타이핑하지 않으므로, 각 단계의 확인 조건(이름/과목/운영기간/수납항목 등)이
// 항상 이미 채워져 있도록 고정 샘플 값으로 시작함 - 나머지(납부주기/운영방식 등)는 원래 기본값 자체가 유효해서 그대로 둠
const REPLAY_SAMPLE_FORM = {
  code:'', group:'', name:'튜토리얼반',
  subject:'국어', room:'', capacity:'',
  payCycle:'1개월납', payDay:'1',
  opType:'기간반', opFrom:'2026-01-01', opTo:'2999-12-31',
}
const REPLAY_SAMPLE_PAYMENTS = [{ id: 1, item:'수강료01', price:'100,000', required:true, cycle:'월납' }]
// 리셋 상태에서도 수납항목 행 자체(선택란/입력란)는 남기고 내용만 비워둠
const REPLAY_EMPTY_PAYMENTS = [{ id: 1, item:'', price:'', required:true, cycle:'' }]
// "신규 반 등록" 단계에서 보여줄 리셋된 화면 - 실제 상태를 건드리지 않는 고정값이라
// 이전/다음으로 왔다갔다해도 항상 같은 모습으로 보임
const REPLAY_EMPTY_FORM = {
  code:'', group:'', name:'',
  subject:'', room:'', capacity:'',
  payCycle:'1개월납', payDay:'1',
  opType:'기간반', opFrom:'', opTo:'',
}

const REQUIRED_FIELDS_OVERLAY_STEP_IDS = [
  'class-create-required-fields',
]

// 이 단계들에서는 안내만 보고 확인/Enter로 진행하도록, 입력란을 직접 수정할 수 없게 막음
const INPUT_LOCKED_STEP_IDS = [
  'class-create-code-hint', 'class-create-required-fields', 'class-create-payday-hint',
]

export default function ClassCreate({ onClose, embedded, onSave, modalBoxRef }) {
  const { classes, addClass, updateClass, deleteClass } = useAppData()
  const { activeStep, isOpen, advance, mode } = useTutorial()
  const isReplay = isOpen && mode === 'replay'
  // replay 모드에서 "신규 반 등록" 단계에 있는 동안만 리셋된 화면을 보여줌 - 실제 state를
  // 건드리는 게 아니라 그 단계일 때만 다른 값을 "보여주는" 것이므로, 이전/다음으로 이동해도
  // 항상 그 단계에 맞는 내용이 그대로 나옴 (페이지 UI처럼 고정된 화면)
  const isReplayResetStep = isReplay && activeStep?.id === 'class-create-new-register-hint'
  const [editingClass, setEditingClass] = useState(() => {
    if (embedded) return null
    try {
      const parsed = JSON.parse(sessionStorage.getItem('editingClassData'))
      sessionStorage.removeItem('editingClassData')
      return parsed
    } catch { return null }
  })
  const [liveForm, setLiveForm] = useState(() => editingClass ? {
    code: editingClass.code || '', group: editingClass.group || '', name: editingClass.name || '',
    subject: editingClass.subject || '', room: editingClass.room || '', capacity: '',
    payCycle: '1개월납', payDay: editingClass.payDay || '1',
    opType: editingClass.opType || '기간반', opFrom: editingClass.opFrom || '', opTo: editingClass.opTo || '',
  } : {
    code:'', group:'', name:'',
    subject:'', room:'', capacity:'',
    payCycle:'1개월납', payDay:'1',
    opType:'기간반', opFrom:'', opTo:'',
  })
  const [lessons,  setLessons]  = useState([emptyLesson()])
  const [teachers, setTeachers] = useState([emptyTeacher()])
  const [livePayments, setLivePayments] = useState(() =>
    editingClass?.payments?.length ? editingClass.payments : [emptyPayment()]
  )

  const form = isReplay ? (isReplayResetStep ? REPLAY_EMPTY_FORM : REPLAY_SAMPLE_FORM) : liveForm
  const payments = isReplay ? (isReplayResetStep ? REPLAY_EMPTY_PAYMENTS : REPLAY_SAMPLE_PAYMENTS) : livePayments

  const inputsLocked = isOpen && (INPUT_LOCKED_STEP_IDS.includes(activeStep?.id) || isReplay)
  const codeInputRef = useRef(null)
  const [codeInputRect, setCodeInputRect] = useState(null)
  const showCodeHint = isOpen && activeStep?.id === 'class-create-code-hint'

  useEffect(() => {
    if (!showCodeHint) return
    const measure = () => {
      if (codeInputRef.current) setCodeInputRect(codeInputRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showCodeHint])

  // 확인 클릭 또는 Enter만 누르면 다음 단계로 진행 (입력 여부는 따지지 않음)
  const handleCodeConfirm = () => {
    advance()
  }

  useEffect(() => {
    if (!showCodeHint) return
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleCodeConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCodeHint])

  const nameLabelRef = useRef(null)
  const nameCellRef = useRef(null)
  const nameInputRef = useRef(null)
  const [nameHoleRect, setNameHoleRect] = useState(null)
  const [nameTooltipRect, setNameTooltipRect] = useState(null)
  const [nameEnterWarning, setNameEnterWarning] = useState(false)
  const showNameHint = isOpen && activeStep?.id === 'class-create-name-hint'

  useEffect(() => {
    if (!showNameHint) return
    const measure = () => {
      // 강조 영역은 "*반 명" 라벨부터 셀 오른쪽 끝(박스 라인)까지 (이전 단계의 강조 영역과 동일한 기준)
      setNameHoleRect(unionRects(nameLabelRef.current?.getBoundingClientRect(), nameCellRef.current?.getBoundingClientRect()))
      setNameTooltipRect(nameInputRef.current?.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showNameHint])

  // 반 명 입력 후에만 다음 단계로 진행, 입력 없이 확인/Enter면 경고 문구 표시 (반 코드 단계와 동일한 방식)
  const handleNameConfirm = () => {
    if (form.name.trim()) advance()
    else setNameEnterWarning(true)
  }

  useEffect(() => {
    if (!showNameHint) { setNameEnterWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleNameConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showNameHint, form.name])

  // 필수 입력란 안내 다음, 반 명 입력란에 포커스하면 반 명 강조 단계로 진행
  const handleNameFieldFocus = () => {
    if (activeStep?.id === 'class-create-required-fields') advance()
  }
  const subjectLabelRef = useRef(null)
  const subjectCellRef = useRef(null)
  const subjectSelectRef = useRef(null)
  const [subjectHoleRect, setSubjectHoleRect] = useState(null)
  const [subjectTooltipRect, setSubjectTooltipRect] = useState(null)
  const [subjectEnterWarning, setSubjectEnterWarning] = useState(false)
  const showSubjectHint = isOpen && activeStep?.id === 'class-create-subject-hint'

  useEffect(() => {
    if (!showSubjectHint) return
    const measure = () => {
      setSubjectHoleRect(unionRects(subjectLabelRef.current?.getBoundingClientRect(), subjectCellRef.current?.getBoundingClientRect()))
      setSubjectTooltipRect(subjectSelectRef.current?.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showSubjectHint])

  // 과목명을 선택해야 다음 단계로 진행, 선택 안 하고 확인/Enter면 경고 문구 표시
  const handleSubjectConfirm = () => {
    if (form.subject) advance()
    else setSubjectEnterWarning(true)
  }

  useEffect(() => {
    if (!showSubjectHint) { setSubjectEnterWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleSubjectConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSubjectHint, form.subject])

  const payCycleLabelRef = useRef(null)
  const payCycleCellRef = useRef(null)
  const payCycleSelectRef = useRef(null)
  const [payCycleHoleRect, setPayCycleHoleRect] = useState(null)
  const [payCycleTooltipRect, setPayCycleTooltipRect] = useState(null)
  const [payCycleEnterWarning, setPayCycleEnterWarning] = useState(false)
  const showPayCycleHint = isOpen && activeStep?.id === 'class-create-paycycle-hint'

  useEffect(() => {
    if (!showPayCycleHint) return
    const measure = () => {
      setPayCycleHoleRect(unionRects(payCycleLabelRef.current?.getBoundingClientRect(), payCycleCellRef.current?.getBoundingClientRect()))
      setPayCycleTooltipRect(payCycleSelectRef.current?.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showPayCycleHint])

  // 납부주기를 선택해야 다음 단계로 진행, 선택 안 하고 확인/Enter면 경고 문구 표시
  const handlePayCycleConfirm = () => {
    if (form.payCycle) advance()
    else setPayCycleEnterWarning(true)
  }

  useEffect(() => {
    if (!showPayCycleHint) { setPayCycleEnterWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handlePayCycleConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPayCycleHint, form.payCycle])

  const opTypeSelectRef = useRef(null)
  const [opTypeHoleRect, setOpTypeHoleRect] = useState(null)
  const [opTypeTooltipRect, setOpTypeTooltipRect] = useState(null)
  const [opTypeEnterWarning, setOpTypeEnterWarning] = useState(false)
  const showOpTypeHint = isOpen && activeStep?.id === 'class-create-optype-hint'

  useEffect(() => {
    if (!showOpTypeHint) return
    const measure = () => {
      setOpTypeHoleRect(unionRects(opTypeLabelRef.current?.getBoundingClientRect(), opTypeCellRef.current?.getBoundingClientRect()))
      setOpTypeTooltipRect(opTypeSelectRef.current?.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showOpTypeHint])

  // 운영방식을 선택해야 다음 단계로 진행, 선택 안 하고 확인/Enter면 경고 문구 표시
  const handleOpTypeConfirm = () => {
    if (form.opType) advance()
    else setOpTypeEnterWarning(true)
  }

  useEffect(() => {
    if (!showOpTypeHint) { setOpTypeEnterWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleOpTypeConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showOpTypeHint, form.opType])

  const payDayLabelRef = useRef(null)
  const payDayCellRef = useRef(null)
  const opTypeLabelRef = useRef(null)
  const opTypeCellRef = useRef(null)
  const opPeriodLabelRef = useRef(null)
  const opPeriodCellRef = useRef(null)
  const opFromDateRef = useRef(null)
  const opToDateRef = useRef(null)
  const paymentsSectionRef = useRef(null)
  const newRegisterBtnRef = useRef(null)
  const [requiredFieldsRects, setRequiredFieldsRects] = useState({ bounds: null, holes: [], nameRect: null, newRegisterRect: null })
  const showRequiredFieldsHint = isOpen && activeStep?.id === 'class-create-required-fields'
  // 확인 클릭 또는 Enter만 누르면 다음 단계로 진행 (반 코드 단계와 동일한 방식)
  const handleRequiredFieldsConfirm = () => advance()

  useEffect(() => {
    if (!showRequiredFieldsHint) return
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleRequiredFieldsConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showRequiredFieldsHint])
  // 납부기준일/운영기간 단계로 넘어가도 강조 오버레이는 계속 유지
  const showRequiredFieldsOverlay = isOpen && REQUIRED_FIELDS_OVERLAY_STEP_IDS.includes(activeStep?.id)
  const showNewRegisterHint = isOpen && activeStep?.id === 'class-create-new-register-hint'
  // 입력란 강조 영역 측정은 신규 반 등록 강조 단계에서도 필요
  const needsFieldHoles = showRequiredFieldsOverlay || showNewRegisterHint

  // 신규 반 등록 단계에서는 버튼만이 아니라 모달 전체를 강조함
  const [newRegisterModalRect, setNewRegisterModalRect] = useState(null)

  useEffect(() => {
    if (!showNewRegisterHint) return
    const measure = () => {
      if (modalBoxRef?.current) setNewRegisterModalRect(modalBoxRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showNewRegisterHint])


  // 여러 영역(제목+입력란 등)을 하나로 합쳐 깨지지 않는 큰 강조 영역으로 만듦
  const unionRects = (...rects) => rects.filter(Boolean).reduce((acc, r) => {
    if (!acc) return r
    const left = Math.min(acc.left, r.left)
    const top = Math.min(acc.top, r.top)
    const right = Math.max(acc.right, r.right)
    const bottom = Math.max(acc.bottom, r.bottom)
    return { left, top, right, bottom, width: right - left, height: bottom - top }
  }, null)

  useEffect(() => {
    if (!needsFieldHoles) return
    const measure = () => {
      const nameHole = unionRects(
        nameLabelRef.current?.getBoundingClientRect(), nameCellRef.current?.getBoundingClientRect(),
      )
      // 과목명~운영방식(좌측 열)을 하나로 통일
      const leftColumnHole = unionRects(
        subjectLabelRef.current?.getBoundingClientRect(), subjectCellRef.current?.getBoundingClientRect(),
        payCycleLabelRef.current?.getBoundingClientRect(), payCycleCellRef.current?.getBoundingClientRect(),
        opTypeLabelRef.current?.getBoundingClientRect(), opTypeCellRef.current?.getBoundingClientRect(),
      )
      // 납부기준일~운영기간(우측 열)을 하나로 통일
      const rightColumnHole = unionRects(
        payDayLabelRef.current?.getBoundingClientRect(), payDayCellRef.current?.getBoundingClientRect(),
        opPeriodLabelRef.current?.getBoundingClientRect(), opPeriodCellRef.current?.getBoundingClientRect(),
      )
      setRequiredFieldsRects({
        bounds: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
        holes: [nameHole, leftColumnHole, rightColumnHole, paymentsSectionRef.current?.getBoundingClientRect()],
        nameRect: nameLabelRef.current?.getBoundingClientRect(),
        newRegisterRect: newRegisterBtnRef.current?.getBoundingClientRect(),
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [needsFieldHoles])

  const [payDayHintRect, setPayDayHintRect] = useState(null)
  const [payDayHoleRect, setPayDayHoleRect] = useState(null)
  const showPayDayHint = isOpen && activeStep?.id === 'class-create-payday-hint'

  useEffect(() => {
    if (!showPayDayHint) return
    const measure = () => {
      if (payDayLabelRef.current) setPayDayHintRect(payDayLabelRef.current.getBoundingClientRect())
      setPayDayHoleRect(unionRects(payDayLabelRef.current?.getBoundingClientRect(), payDayCellRef.current?.getBoundingClientRect()))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showPayDayHint])

  const handlePayDayClick = () => {
    if (activeStep?.id === 'class-create-required-fields') advance()
  }

  // 확인 클릭 또는 Enter만 누르면 다음 단계(반 명 입력)로 진행
  const handlePayDayConfirm = () => advance()

  useEffect(() => {
    if (!showPayDayHint) return
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handlePayDayConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPayDayHint])

  const [periodFromHintRect, setPeriodFromHintRect] = useState(null)
  const [periodFromHoleRect, setPeriodFromHoleRect] = useState(null)
  const [periodFromEnterWarning, setPeriodFromEnterWarning] = useState(false)
  const showPeriodFromHint = isOpen && activeStep?.id === 'class-create-period-from-hint'

  useEffect(() => {
    if (!showPeriodFromHint) return
    const measure = () => {
      setPeriodFromHoleRect(unionRects(opPeriodLabelRef.current?.getBoundingClientRect(), opPeriodCellRef.current?.getBoundingClientRect()))
      setPeriodFromHintRect(opFromDateRef.current?.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showPeriodFromHint])

  // 첫 번째 날짜(운영 시작일)를 입력해야 함, 입력 안 하고 확인/Enter면 경고 문구 표시. 다음 단계로는 진행하지 않음(두 번째 입력란 클릭으로만 진행)
  const handlePeriodFromConfirm = () => {
    if (!form.opFrom) setPeriodFromEnterWarning(true)
  }

  useEffect(() => {
    if (!showPeriodFromHint) { setPeriodFromEnterWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handlePeriodFromConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPeriodFromHint, form.opFrom])

  // 운영기간 두 번째 입력란(종료일) 클릭 시 다음 단계로 진행
  const handleOpToFocus = () => {
    handlePeriodClick()
    if (activeStep?.id === 'class-create-period-from-hint') advance()
  }

  const [periodHintRect, setPeriodHintRect] = useState(null)
  const [periodHoleRect, setPeriodHoleRect] = useState(null)
  const [periodTailLeftPx, setPeriodTailLeftPx] = useState(16)
  const [periodEnterWarning, setPeriodEnterWarning] = useState(false)
  const showPeriodHint = isOpen && activeStep?.id === 'class-create-period-hint'

  useEffect(() => {
    if (!showPeriodHint) return
    const measure = () => {
      const labelRect = opPeriodLabelRef.current?.getBoundingClientRect()
      const opToRect = opToDateRef.current?.getBoundingClientRect()
      const holeRect = unionRects(labelRect, opPeriodCellRef.current?.getBoundingClientRect())
      if (labelRect && holeRect) {
        const shiftedLeft = labelRect.left + 60
        const shiftedTop = holeRect.top
        setPeriodHintRect({ ...holeRect, left: shiftedLeft, right: shiftedLeft + holeRect.width, top: shiftedTop })
        if (opToRect) setPeriodTailLeftPx(opToRect.left + opToRect.width / 2 - shiftedLeft)
      }
      setPeriodHoleRect(holeRect)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showPeriodHint])

  const handlePeriodClick = () => {
    if (activeStep?.id === 'class-create-payday-hint') advance()
  }

  // 운영기간을 설정해야 다음 단계로 진행, 설정 안 하고 확인/Enter면 경고 문구 표시
  const handlePeriodConfirm = () => {
    if (form.opFrom && form.opTo) advance()
    else setPeriodEnterWarning(true)
  }

  useEffect(() => {
    if (!showPeriodHint) { setPeriodEnterWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handlePeriodConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPeriodHint, form.opFrom, form.opTo])

  const saveBtnRef = useRef(null)
  const [saveHintRects, setSaveHintRects] = useState({ bounds: null, rect: null })
  const showSaveHint = isOpen && activeStep?.id === 'class-create-save-hint'

  useEffect(() => {
    if (!showSaveHint) return
    const measure = () => {
      setSaveHintRects({
        bounds: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
        rect: saveBtnRef.current?.getBoundingClientRect(),
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showSaveHint])

  const showPaymentHint = isOpen && activeStep?.id === 'class-create-payment-hint'
  const [paymentEnterWarning, setPaymentEnterWarning] = useState(false)
  const [paymentSectionRect, setPaymentSectionRect] = useState(null)

  useEffect(() => {
    if (!showPaymentHint) return
    const measure = () => {
      if (paymentsSectionRef.current) setPaymentSectionRect(paymentsSectionRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showPaymentHint, payments])

  // 수납 항목을 모두 입력해야 다음 단계로 진행, 입력 안 하고 확인/Enter면 경고 문구 표시
  const handlePaymentConfirm = () => {
    const allFilled = payments.length > 0 && payments.every(p => p.item && p.price && p.cycle)
    if (allFilled) advance()
    else setPaymentEnterWarning(true)
  }

  useEffect(() => {
    if (!showPaymentHint) { setPaymentEnterWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handlePaymentConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPaymentHint, payments])

  const setF = (key, val) => setLiveForm(f => ({...f, [key]: val}))

  /* 수업 */
  const addLesson    = () => setLessons(p => [...p, emptyLesson()])
  const removeLesson = id => setLessons(p => p.length===1 ? [emptyLesson()] : p.filter(r=>r.id!==id))
  const updateLesson = (id, key, val) => setLessons(p => p.map(r => r.id===id ? {...r, [key]:val} : r))
  const toggleDay    = (id, d) => setLessons(p => p.map(r => r.id===id ? {...r, days:{...r.days, [d]:!r.days[d]}} : r))

  /* 강사 */
  const addTeacher    = () => setTeachers(p => [...p, emptyTeacher()])
  const removeTeacher = id => setTeachers(p => p.length===1 ? [emptyTeacher()] : p.filter(r=>r.id!==id))
  const updateTeacher = (id, key, val) => setTeachers(p => p.map(r => r.id===id ? {...r, [key]:val} : r))

  /* 수납 */
  const addPayment    = () => setLivePayments(p => [...p, emptyPayment()])
  const removePayment = id => setLivePayments(p => p.length===1 ? [emptyPayment()] : p.filter(r=>r.id!==id))
  const updatePayment = (id, key, val) => setLivePayments(p => p.map(r => r.id===id ? {...r, [key]:val} : r))

  const formatPrice = val => val.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  const reloadOpener = () => { try { if (window.opener && !window.opener.closed) window.opener.__refreshAppData?.() } catch {} }

  const resetForm = () => {
    setLiveForm({code:'',group:'',name:'',subject:'',room:'',capacity:'',payCycle:'1개월납',payDay:'1',opType:'기간반',opFrom:'',opTo:''})
    setLessons([emptyLesson()]); setTeachers([emptyTeacher()]); setLivePayments([emptyPayment()])
  }
  const handleNew  = () => {
    resetForm()
    setEditingClass(null)
    sessionStorage.removeItem('editingClassData')
    if (activeStep?.id === 'class-create-new-register-hint') advance()
  }
  const handleSave = async () => {
    if (onSave) {
      await onSave({ ...form, payments })
    } else {
      const { error } = await addClass({
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
        payments: payments || [],
      })
      if (error) { alert(error.message || '반 등록에 실패했습니다.'); return }
      reloadOpener()
    }
    alert('저장되었습니다.')
    if (activeStep?.id === 'class-create-save-hint') advance()
  }
  const handleUpdate = async () => {
    const { error } = await updateClass(editingClass.id, { ...form, payments })
    if (error) { alert(error.message || '수정에 실패했습니다.'); return }
    reloadOpener()
    alert('정상적으로 처리되었습니다.')
  }
  const handleDelete = async () => {
    if (!window.confirm('삭제하는 경우 자료를 복구할 수 없습니다. 삭제하려면 확인을 선택해 주세요.')) return
    const { error } = await deleteClass(editingClass.id)
    if (error) { alert('삭제에 실패했습니다.'); return }
    reloadOpener()
    alert('정상적으로 처리되었습니다.')
    window.close()
  }

  return (
    <div className={`cc-wrap${embedded ? ' cc-modal' : ''}`}>
      {showCodeHint && (
        <TutorialTooltip
          rect={codeInputRect}
          message="반 코드는 자동생성되니 입력을 안하셔도 됩니다."
          placement="top"
          onConfirm={handleCodeConfirm}
        />
      )}
      {showRequiredFieldsOverlay && (
        <TutorialMultiSpotlight boundsRect={requiredFieldsRects.bounds} holes={requiredFieldsRects.holes} />
      )}
      {showRequiredFieldsHint && (
        <TutorialTooltip
          rect={requiredFieldsRects.nameRect}
          placement="top"
          message={<><span className="cc-req">*</span>표시가 된 필수 입력란을 입력하고, 운영기간·수납까지 작성합니다.</>}
          onConfirm={handleRequiredFieldsConfirm}
        />
      )}
      {showNameHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[nameHoleRect]}
          />
          <TutorialTooltip
            rect={nameTooltipRect}
            placement="top"
            message={nameEnterWarning ? <span style={{ color: '#ff3c00' }}>내용을 입력하고 확인[Enter]을 누르세요.</span> : '반 명을 입력합니다.'}
            onConfirm={handleNameConfirm}
          />
        </>
      )}
      {showSubjectHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[subjectHoleRect]}
          />
          <TutorialTooltip
            rect={subjectTooltipRect}
            placement="top"
            message={subjectEnterWarning ? <span style={{ color: '#ff3c00' }}>선택하고 확인[Enter]을 누르세요.</span> : '과목명을 선택합니다.'}
            onConfirm={handleSubjectConfirm}
          />
        </>
      )}
      {showPayCycleHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[payCycleHoleRect]}
          />
          <TutorialTooltip
            rect={payCycleTooltipRect}
            placement="top"
            message={payCycleEnterWarning ? <span style={{ color: '#ff3c00' }}>선택하고 확인[Enter]을 누르세요.</span> : '납부주기를 선택합니다.'}
            onConfirm={handlePayCycleConfirm}
          />
        </>
      )}
      {showOpTypeHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[opTypeHoleRect]}
          />
          <TutorialTooltip
            rect={opTypeTooltipRect}
            placement="top"
            message={opTypeEnterWarning ? <span style={{ color: '#ff3c00' }}>선택하고 확인[Enter]을 누르세요.</span> : '운영방식을 선택합니다.'}
            onConfirm={handleOpTypeConfirm}
          />
        </>
      )}
      {showPayDayHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[payDayHoleRect]}
          />
          <TutorialTooltip
            rect={payDayHintRect}
            placement="top"
            tailLeftPx={payDayHintRect ? payDayHintRect.width / 2 : 16}
            message="해당 반의 납부기준일을 입력합니다."
            onConfirm={handlePayDayConfirm}
          />
          {payDayHoleRect && (
            <div style={{
              position: 'fixed', zIndex: 3500,
              left: payDayHoleRect.left, top: payDayHoleRect.bottom + 8,
              color: '#fff', fontSize: 13,
            }}>
              수강생이 수강 신청 시 학생들마다 납부기준일을 다르게 설정할 수 있습니다.
            </div>
          )}
        </>
      )}
      {showPeriodFromHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[periodFromHoleRect]}
          />
          <TutorialTooltip
            rect={periodFromHintRect}
            placement="top"
            message={periodFromEnterWarning
              ? <span style={{ color: '#ff3c00' }}>운영기간을 설정하고 확인[Enter]을 누르세요.</span>
              : '반의 운영기간을 입력합니다.'}
            onConfirm={handlePeriodFromConfirm}
          />
        </>
      )}
      {showPeriodHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[periodHoleRect]}
          />
          <TutorialTooltip
            rect={periodHintRect}
            placement="top"
            tailLeftPx={periodTailLeftPx}
            message={periodEnterWarning
              ? <span style={{ color: '#ff3c00' }}>운영기간을 설정하고 확인[Enter]을 누르세요.</span>
              : '운영기간을 길게 유지하고 싶을 경우 2999-12-31로 입력하시면 됩니다.'}
            onConfirm={handlePeriodConfirm}
          />
        </>
      )}
      {showPaymentHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[paymentSectionRect]}
          />
          <TutorialTooltip
            rect={paymentSectionRect}
            placement="top"
            center
            message={paymentEnterWarning
              ? <span style={{ color: '#ff3c00' }}>수납 항목을 모두 입력하고 확인[Enter]을 누르세요.</span>
              : '수납 항목을 입력합니다.'}
            onConfirm={handlePaymentConfirm}
          />
        </>
      )}
      {showSaveHint && (
        <>
          <TutorialMultiSpotlight boundsRect={saveHintRects.bounds} holes={[saveHintRects.rect]} pad={3} />
          <TutorialTooltip
            rect={saveHintRects.rect}
            placement="top"
            message="내용을 저장하고 등록할 때는 저장 버튼을 눌러주세요."
          />
        </>
      )}
      {showNewRegisterHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[newRegisterModalRect]}
          />
          <TutorialTooltip
            rect={requiredFieldsRects.newRegisterRect}
            placement="top"
            message="신규 반 등록을 클릭 시 내용을 리셋하고 이어서 반 등록을 할 수 있습니다."
          />
        </>
      )}
      {/* 헤더 */}
      <div className="cc-header">
        <span className="cc-title">반 등록</span>
        {onClose && <button className="cc-close-btn" onClick={onClose}>✕</button>}
      </div>

      <div className="cc-btn-row" style={isReplay ? { pointerEvents: 'none' } : undefined}>
        {editingClass ? (
          <>
            <button className="cc-btn cc-btn-edit" onClick={handleUpdate}>수정</button>
            <button className="cc-btn cc-btn-delete" onClick={handleDelete}>삭제</button>
            <button ref={newRegisterBtnRef} className="cc-btn cc-btn-new" onClick={handleNew}>신규 반 등록</button>
          </>
        ) : (
          <>
            <button ref={saveBtnRef} className="cc-btn cc-btn-save" onClick={handleSave}>저장</button>
            <button ref={newRegisterBtnRef} className="cc-btn cc-btn-new"  onClick={handleNew}>신규 반 등록</button>
          </>
        )}
      </div>

      <div className="cc-body">
        <div className="cc-box" style={inputsLocked ? { pointerEvents: 'none' } : undefined}>
        {/* 기본 정보 그리드 */}
        <table className="cc-info-table">
          <tbody>
            <tr>
              <td className="cc-label">반 코드</td>
              <td className="cc-cell">
                <input ref={codeInputRef} className="cc-input" placeholder="미입력시 자동부여" value={form.code} onChange={e=>setF('code',e.target.value)}/>
              </td>
              <td className="cc-label" ref={nameLabelRef}><span className="cc-req">*</span>반 명</td>
              <td className="cc-cell" ref={nameCellRef}>
                <select className="cc-select" value={form.group} onChange={e=>setF('group',e.target.value)}>
                  <option value="">반그룹 선택</option>
                </select>
                <input ref={nameInputRef} className="cc-input" style={{flex:1}} value={form.name} onChange={e=>{setF('name',e.target.value); setNameEnterWarning(false)}} onFocus={handleNameFieldFocus}/>
              </td>
            </tr>
            <tr>
              <td className="cc-label" ref={subjectLabelRef}><span className="cc-req">*</span>과목명(과정명)</td>
              <td className="cc-cell" ref={subjectCellRef}>
                <select ref={subjectSelectRef} className="cc-select" value={form.subject} onChange={e=>{setF('subject',e.target.value); setSubjectEnterWarning(false)}}>
                  <option value="">선택</option>
                  <option>국어</option><option>수학</option><option>영어</option><option>과학</option><option>사회</option>
                </select>
              </td>
              <td className="cc-label">강의실/정원</td>
              <td className="cc-cell">
                <select className="cc-select" value={form.room} onChange={e=>setF('room',e.target.value)}>
                  <option value="">강의실선택</option>
                </select>
                <span className="cc-slash">/</span>
                <input className="cc-input cc-input-sm" value={form.capacity} onChange={e=>setF('capacity',e.target.value)}/>
              </td>
            </tr>
            <tr>
              <td className="cc-label" ref={payCycleLabelRef}><span className="cc-req">*</span>납부주기</td>
              <td className="cc-cell" ref={payCycleCellRef}>
                <select ref={payCycleSelectRef} className="cc-select" value={form.payCycle} onChange={e=>{setF('payCycle',e.target.value); setPayCycleEnterWarning(false)}}>
                  <option value="">선택</option><option>일시납</option><option>1개월납</option><option>2개월납</option><option>3개월납</option><option>4개월납</option><option>5개월납</option><option>6개월납</option>
                </select>
              </td>
              <td className="cc-label" ref={payDayLabelRef}><span className="cc-req">*</span>납부기준일</td>
              <td className="cc-cell" ref={payDayCellRef}>
                <input className="cc-input cc-input-sm" style={{textAlign:'center'}} value={form.payDay} onChange={e=>setF('payDay',e.target.value)} onClick={handlePayDayClick}/>
              </td>
            </tr>
            <tr>
              <td className="cc-label" ref={opTypeLabelRef}><span className="cc-req">*</span>운영방식</td>
              <td className="cc-cell" ref={opTypeCellRef}>
                <select ref={opTypeSelectRef} className="cc-select" value={form.opType} onChange={e=>{setF('opType',e.target.value); setOpTypeEnterWarning(false)}}>
                  <option>기간반</option><option>회차반</option>
                </select>
              </td>
              <td className="cc-label" ref={opPeriodLabelRef}>운영기간</td>
              <td className="cc-cell" ref={opPeriodCellRef}>
                <span ref={opFromDateRef} style={{display:'inline-block'}}>
                  <FreeDatePicker value={form.opFrom} onChange={v=>{setF('opFrom',v); setPeriodEnterWarning(false); setPeriodFromEnterWarning(false)}} className="cc-input cc-input-date" onInputFocus={handlePeriodClick}/>
                </span>
                <span style={{margin:'0 6px',color:'#999'}}>~</span>
                <span ref={opToDateRef} style={{display:'inline-block'}}>
                  <FreeDatePicker value={form.opTo} onChange={v=>{setF('opTo',v); setPeriodEnterWarning(false)}} className="cc-input cc-input-date" onInputFocus={handleOpToFocus}/>
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 수업 */}
        <div className="cc-section">
          <div className="cc-section-label">수업</div>
          <div className="cc-section-body">
            <div className="cc-add-row">
              <button className="cc-add-btn" onClick={addLesson}>+ 추가</button>
            </div>
            <table className="cc-sub-table">
              <thead>
                <tr>
                  <th colSpan={7}>수업시간</th>
                  {DAYS.map(d=><th key={d}>{d}</th>)}
                  <th className="cc-th-del">삭제</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map(r=>(
                  <tr key={r.id}>
                    <td className="cc-time-td cc-time-td-first">
                      <select className="cc-time-sel" value={r.sh} onChange={e=>updateLesson(r.id,'sh',e.target.value)}>
                        {START_HOURS.map(h=><option key={h}>{h}</option>)}
                      </select>
                    </td>
                    <td className="cc-time-sep">:</td>
                    <td className="cc-time-td"><select className="cc-time-sel" value={r.sm} onChange={e=>updateLesson(r.id,'sm',e.target.value)}>{MINS.map(m=><option key={m}>{m}</option>)}</select></td>
                    <td className="cc-time-sep">~</td>
                    <td className="cc-time-td"><select className="cc-time-sel" value={r.eh} onChange={e=>updateLesson(r.id,'eh',e.target.value)}>{END_HOURS.map(h=><option key={h}>{h}</option>)}</select></td>
                    <td className="cc-time-sep">:</td>
                    <td className="cc-time-td cc-time-td-last"><select className="cc-time-sel" value={r.em} onChange={e=>updateLesson(r.id,'em',e.target.value)}>{MINS.map(m=><option key={m}>{m}</option>)}</select></td>
                    {DAYS.map(d=>(
                      <td key={d} style={{textAlign:'center'}}>
                        <input type="checkbox" checked={r.days[d]} onChange={()=>toggleDay(r.id,d)}/>
                      </td>
                    ))}
                    <td className="cc-td-del">
                      <button className="cc-minus-btn" onClick={()=>removeLesson(r.id)}>－</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 강사 */}
        <div className="cc-section">
          <div className="cc-section-label">강사</div>
          <div className="cc-section-body">
            <div className="cc-add-row">
              <button className="cc-add-btn" onClick={addTeacher}>+ 추가</button>
            </div>
            <table className="cc-sub-table" style={{tableLayout:'fixed'}}>
              <thead>
                <tr>
                  <th style={{width:'240px'}}>강사</th>
                  <th style={{width:'150px'}}>담임</th>
                  <th>과목</th>
                  <th className="cc-th-del">삭제</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(r=>(
                  <tr key={r.id}>
                    <td>
                      <select className="cc-select" style={{width:'100%'}} value={r.name} onChange={e=>updateTeacher(r.id,'name',e.target.value)}>
                        <option value="">선택</option>
                      </select>
                    </td>
                    <td style={{textAlign:'center'}}>
                      <input type="checkbox" checked={r.homeroom} onChange={e=>updateTeacher(r.id,'homeroom',e.target.checked)}/>
                    </td>
                    <td>
                      <input className="cc-input" style={{width:'100%'}} value={r.subject} onChange={e=>updateTeacher(r.id,'subject',e.target.value)}/>
                    </td>
                    <td className="cc-td-del">
                      <button className="cc-minus-btn" onClick={()=>removeTeacher(r.id)}>－</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 수납 */}
        <div className="cc-section" ref={paymentsSectionRef}>
          <div className="cc-section-label">수납</div>
          <div className="cc-section-body">
            <div className="cc-add-row">
              <button className="cc-add-btn" onClick={addPayment}>+ 추가</button>
            </div>
            <table className="cc-sub-table">
              <thead>
                <tr>
                  <th style={{width:'25%'}}>수납항목</th>
                  <th style={{width:'25%'}}>기준가격</th>
                  <th>필수여부</th>
                  <th>청구주기</th>
                  <th className="cc-th-del">삭제</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(r=>(
                  <tr key={r.id}>
                    <td>
                      <select className="cc-select" style={{width:'100%'}} value={r.item} onChange={e=>updatePayment(r.id,'item',e.target.value)}>
                        <option value="">선택</option>
                        <option>수강료01</option><option>수강료02</option>
                        <option>교재(서적)01</option><option>교재(서적)02</option>
                        <option>교재(프린트물)01</option><option>교재(프린트물)02</option>
                        <option>교재(콘텐츠)01</option><option>교재(콘텐츠)02</option>
                      </select>
                    </td>
                    <td>
                      <input className="cc-input" style={{width:'100%',textAlign:'right'}} value={r.price} onChange={e=>updatePayment(r.id,'price',formatPrice(e.target.value))} placeholder="0"/>
                    </td>
                    <td style={{textAlign:'center'}}>
                      <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,fontSize:13}}>
                        <input type="checkbox" checked={r.required} onChange={e=>updatePayment(r.id,'required',e.target.checked)}/>
                        필수
                      </label>
                    </td>
                    <td>
                      <select className="cc-select" style={{width:'100%'}} value={r.cycle} onChange={e=>updatePayment(r.id,'cycle',e.target.value)}>
                        <option value="">선택</option>
                        <option>월납</option><option>일시납</option>
                      </select>
                    </td>
                    <td className="cc-td-del">
                      <button className="cc-minus-btn" onClick={()=>removePayment(r.id)}>－</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>{/* cc-box */}
      </div>
    </div>
  )
}
