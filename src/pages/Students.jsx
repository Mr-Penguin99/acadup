import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Students.css'
import TopNav from '../components/TopNav'
import { useTutorial } from '../components/TutorialContext'
import TutorialSpotlight from '../components/TutorialSpotlight'
import TutorialMultiSpotlight from '../components/TutorialMultiSpotlight'
import TutorialTooltip from '../components/TutorialTooltip'
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
  { id:9,  name:'학생1',    birth:'20.01.01', photo:'X', status:'재원', classes:['반그룹 수업1 > 수업1 영어(월화목토)'], keypad:'1234', dept:'고등학교', school:'', grade:'1' },
  { id:10, name:'예비학생1', birth:'21.03.10', photo:'X', status:'예비', classes:[], keypad:'', dept:'초등학교', school:'', grade:'2' },
  { id:11, name:'예비학생2', birth:'22.07.05', photo:'X', status:'예비', classes:[], keypad:'', dept:'', school:'', grade:'' },
  { id:12, name:'휴원학생1', birth:'19.05.15', photo:'X', status:'휴원', classes:['to_반그룹 > to_반_AAA_배정'], keypad:'0000', dept:'중학교', school:'', grade:'3' },
  { id:13, name:'퇴원학생1', birth:'18.07.20', photo:'X', status:'퇴원', classes:[], keypad:'', dept:'고등학교', school:'', grade:'1' },
]
const INFO_TABS = ['가족','수강','수납','결제','상담','출결','학원성적','학교성적','알림내역','메모','진도','차량']
const LOCKED_TABS = ['상담','출결','학원성적','학교성적','알림내역','메모','진도','차량']
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

  const { activeStep, isOpen, advance } = useTutorial()
  const infoPanelRef = useRef(null)
  const [infoPanelRect, setInfoPanelRect] = useState(null)
  const showInfoPanelHint = isOpen && activeStep?.id === 'student-class-list-intro' && activeSide === 'class-students'

  useEffect(() => {
    if (!showInfoPanelHint) return
    const measure = () => {
      if (infoPanelRef.current) setInfoPanelRect(infoPanelRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showInfoPanelHint])

  // 확인 클릭 또는 Enter만 누르면 다음 단계로 진행
  const handleInfoPanelConfirm = () => advance()

  useEffect(() => {
    if (!showInfoPanelHint) return
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleInfoPanelConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showInfoPanelHint])

  const nameLabelRef = useRef(null)
  const nameCellRef = useRef(null)
  const nameInputRef = useRef(null)
  const [nameHoleRect, setNameHoleRect] = useState(null)
  const [nameTooltipRect, setNameTooltipRect] = useState(null)
  const [nameEnterWarning, setNameEnterWarning] = useState(false)
  const showNameHint = isOpen && activeStep?.id === 'student-name-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showNameHint) return
    const measure = () => {
      setNameHoleRect(unionRects(nameLabelRef.current?.getBoundingClientRect(), nameCellRef.current?.getBoundingClientRect()))
      setNameTooltipRect(nameInputRef.current?.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showNameHint])

  const birthLabelRef = useRef(null)
  const birthCellRef = useRef(null)
  const enrollLabelRef = useRef(null)
  const enrollCellRef = useRef(null)
  const phoneLabelRef = useRef(null)
  const phoneCellRef = useRef(null)

  const [enrollHoleRect, setEnrollHoleRect] = useState(null)
  const [enrollTooltipRect, setEnrollTooltipRect] = useState(null)
  const [enrollEnterWarning, setEnrollEnterWarning] = useState(false)
  const showEnrollHint = isOpen && activeStep?.id === 'student-enroll-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showEnrollHint) return
    const measure = () => {
      setEnrollHoleRect(unionRects(enrollLabelRef.current?.getBoundingClientRect(), enrollCellRef.current?.getBoundingClientRect()))
      setEnrollTooltipRect(enrollCellRef.current?.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showEnrollHint])

  const [phoneHoleRect, setPhoneHoleRect] = useState(null)
  const [phoneTooltipRect, setPhoneTooltipRect] = useState(null)
  const [phoneEnterWarning, setPhoneEnterWarning] = useState(false)
  const showPhoneHint = isOpen && activeStep?.id === 'student-phone-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showPhoneHint) return
    const measure = () => {
      setPhoneHoleRect(unionRects(phoneLabelRef.current?.getBoundingClientRect(), phoneCellRef.current?.getBoundingClientRect()))
      setPhoneTooltipRect(phoneCellRef.current?.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showPhoneHint])

  const [birthHoleRect, setBirthHoleRect] = useState(null)
  const [birthTooltipRect, setBirthTooltipRect] = useState(null)
  const [birthEnterWarning, setBirthEnterWarning] = useState(false)
  const showBirthHint = isOpen && activeStep?.id === 'student-birth-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showBirthHint) return
    const measure = () => {
      setBirthHoleRect(unionRects(birthLabelRef.current?.getBoundingClientRect(), birthCellRef.current?.getBoundingClientRect()))
      setBirthTooltipRect(birthCellRef.current?.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showBirthHint])

  const [requiredFieldsRects, setRequiredFieldsRects] = useState({ bounds: null, holes: [], nameRect: null })
  const showRequiredFieldsHint = isOpen && activeStep?.id === 'student-required-fields' && activeSide === 'class-students'

  // 여러 영역(레이블+입력란)을 하나로 합쳐 깨지지 않는 강조 영역으로 만듦
  const unionRects = (...rects) => rects.filter(Boolean).reduce((acc, r) => {
    if (!acc) return r
    const left = Math.min(acc.left, r.left)
    const top = Math.min(acc.top, r.top)
    const right = Math.max(acc.right, r.right)
    const bottom = Math.max(acc.bottom, r.bottom)
    return { left, top, right, bottom, width: right - left, height: bottom - top }
  }, null)

  useEffect(() => {
    if (!showRequiredFieldsHint) return
    const measure = () => {
      const nameHole = unionRects(nameLabelRef.current?.getBoundingClientRect(), nameCellRef.current?.getBoundingClientRect())
      const birthHole = unionRects(birthLabelRef.current?.getBoundingClientRect(), birthCellRef.current?.getBoundingClientRect())
      // 입학일자 + 학생 휴대폰을 하나의 강조 영역으로 통합
      const enrollPhoneHole = unionRects(
        enrollLabelRef.current?.getBoundingClientRect(), enrollCellRef.current?.getBoundingClientRect(),
        phoneLabelRef.current?.getBoundingClientRect(), phoneCellRef.current?.getBoundingClientRect(),
      )
      setRequiredFieldsRects({
        bounds: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
        holes: [nameHole, birthHole, enrollPhoneHole],
        nameRect: nameHole,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showRequiredFieldsHint])

  const saveBtnRef = useRef(null)
  const [saveBtnRect, setSaveBtnRect] = useState(null)
  const showSaveHint = isOpen && activeStep?.id === 'student-save-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showSaveHint) return
    const measure = () => {
      if (saveBtnRef.current) setSaveBtnRect(saveBtnRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showSaveHint])

  const infoTabContentRef = useRef(null)
  const infoTabsWrapRef = useRef(null)
  const [saveCompleteRect, setSaveCompleteRect] = useState(null)
  const showSaveCompleteHint = isOpen && activeStep?.id === 'student-save-complete-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showSaveCompleteHint) return
    const measure = () => {
      setSaveCompleteRect(unionRects(infoPanelRef.current?.getBoundingClientRect(), infoTabContentRef.current?.getBoundingClientRect()))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showSaveCompleteHint])

  const handleSaveCompleteConfirm = () => advance()

  useEffect(() => {
    if (!showSaveCompleteHint) return
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleSaveCompleteConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSaveCompleteHint])

  const [familyHoleRect, setFamilyHoleRect] = useState(null)
  const showFamilyHint = isOpen && activeStep?.id === 'student-family-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showFamilyHint) return
    const measure = () => {
      setFamilyHoleRect(unionRects(infoTabsWrapRef.current?.getBoundingClientRect(), infoTabContentRef.current?.getBoundingClientRect()))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showFamilyHint])

  const handleFamilyConfirm = () => advance()

  useEffect(() => {
    if (!showFamilyHint) return
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleFamilyConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showFamilyHint])

  const familyNameInputRef = useRef(null)
  const [familyNameRect, setFamilyNameRect] = useState(null)
  const showFamilyNameHint = isOpen && activeStep?.id === 'student-family-name-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showFamilyNameHint) return
    const measure = () => {
      if (familyNameInputRef.current) setFamilyNameRect(familyNameInputRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showFamilyNameHint])

  const [familyNameWarning, setFamilyNameWarning] = useState(false)
  const handleFamilyNameConfirm = () => {
    if (familyNameInputRef.current?.value.trim()) advance()
    else setFamilyNameWarning(true)
  }

  useEffect(() => {
    if (!showFamilyNameHint) { setFamilyNameWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleFamilyNameConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showFamilyNameHint])

  const familyRelationSelectRef = useRef(null)
  const [familyRelationRect, setFamilyRelationRect] = useState(null)
  const showFamilyRelationHint = isOpen && activeStep?.id === 'student-family-relation-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showFamilyRelationHint) return
    const measure = () => {
      if (familyRelationSelectRef.current) setFamilyRelationRect(familyRelationSelectRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showFamilyRelationHint])

  const [familyRelationWarning, setFamilyRelationWarning] = useState(false)
  const handleFamilyRelationConfirm = () => {
    if (familyRelationSelectRef.current?.value) advance()
    else setFamilyRelationWarning(true)
  }

  useEffect(() => {
    if (!showFamilyRelationHint) { setFamilyRelationWarning(false); return }
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handleFamilyRelationConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showFamilyRelationHint])

  const familyPhoneInputRef = useRef(null)
  const [familyPhoneRect, setFamilyPhoneRect] = useState(null)
  const showFamilyPhoneHint = isOpen && activeStep?.id === 'student-family-phone-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showFamilyPhoneHint) return
    const measure = () => {
      if (familyPhoneInputRef.current) setFamilyPhoneRect(familyPhoneInputRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showFamilyPhoneHint])

  const [familyPhoneWarning, setFamilyPhoneWarning] = useState(false)
  const handleFamilyPhoneConfirm = () => {
    if (familyPhoneInputRef.current?.value.trim()) advance()
    else setFamilyPhoneWarning(true)
  }

  useEffect(() => {
    if (!showFamilyPhoneHint) { setFamilyPhoneWarning(false); return }
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handleFamilyPhoneConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showFamilyPhoneHint])

  const familyMsgTypeSelectRef = useRef(null)
  const [familyMsgTypeRect, setFamilyMsgTypeRect] = useState(null)
  const showFamilyMsgTypeHint = isOpen && activeStep?.id === 'student-family-msgtype-hint' && activeSide === 'class-students'
  const showFamilyMsgTypeInfoHint = isOpen && activeStep?.id === 'student-family-msgtype-info-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showFamilyMsgTypeHint && !showFamilyMsgTypeInfoHint) return
    const measure = () => {
      if (familyMsgTypeSelectRef.current) setFamilyMsgTypeRect(familyMsgTypeSelectRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showFamilyMsgTypeHint, showFamilyMsgTypeInfoHint])

  const handleFamilyMsgTypeConfirm = () => advance()
  const handleFamilyMsgTypeClick = () => { if (showFamilyMsgTypeHint) advance() }
  const handleFamilyMsgTypeChange = () => { if (showFamilyMsgTypeInfoHint) advance() }

  useEffect(() => {
    if (!showFamilyMsgTypeHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handleFamilyMsgTypeConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showFamilyMsgTypeHint])

  useEffect(() => {
    if (!showFamilyMsgTypeInfoHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; advance() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showFamilyMsgTypeInfoHint])

  const familySaveBtnRef = useRef(null)
  const [familySaveBtnRect, setFamilySaveBtnRect] = useState(null)
  const showFamilySaveHint = isOpen && activeStep?.id === 'student-family-save-hint' && activeSide === 'class-students'

  useEffect(() => {
    if (!showFamilySaveHint) return
    const measure = () => {
      if (familySaveBtnRef.current) setFamilySaveBtnRect(familySaveBtnRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showFamilySaveHint])

  const handleFamilySaveClick = () => { if (showFamilySaveHint) advance() }

  const emptyForm = {
    studentNo:'', status:'', name:'', birth:'', gender:'남자',
    id:'', pw:'', enrollDate:'', payMethod:'',
    phone:'', homePhone:'', grade1:'', grade2:'', attendNo:'',
    email1:'', email2:'', emailType:'직접입력', dept:'',
    hasClasses: false,
  }

  const getDisplayStatus = () => {
    if (selectedStudentId === null) return ''
    if (selectedStudentId === 'new' && !form.name) return ''
    if (form.status === '퇴원') return '퇴원'
    if (form.status === '휴원') return '휴원'
    if (form.hasClasses) return '재원'
    return '예비'
  }
  const [form, setForm] = useState(emptyForm)

  // 학생 이름을 입력해야 다음 단계로 진행, 입력 없이 확인/Enter면 경고 문구로 교체
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

  // 입학일자를 선택해야 다음 단계로 진행, 미선택 상태로 확인/Enter면 경고 문구로 교체
  const handleEnrollConfirm = () => {
    if (form.enrollDate) advance()
    else setEnrollEnterWarning(true)
  }

  useEffect(() => {
    if (!showEnrollHint) { setEnrollEnterWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleEnrollConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showEnrollHint, form.enrollDate])

  // 학생 휴대폰을 입력해야 다음 단계로 진행, 입력 없이 확인/Enter면 경고 문구로 교체
  const handlePhoneConfirm = () => {
    if (form.phone.trim()) advance()
    else setPhoneEnterWarning(true)
  }

  useEffect(() => {
    if (!showPhoneHint) { setPhoneEnterWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handlePhoneConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPhoneHint, form.phone])

  // 생년월일을 입력해야 다음 단계로 진행, 입력 없이 확인/Enter면 경고 문구로 교체
  const handleBirthConfirm = () => {
    if (form.birth.length === 6) advance()
    else setBirthEnterWarning(true)
  }

  useEffect(() => {
    if (!showBirthHint) { setBirthEnterWarning(false); return }
    const handleKeyDown = e => {
      if (e.key !== 'Enter') return
      handleBirthConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showBirthHint, form.birth])

  // 확인 클릭 또는 Enter만 누르면 다음 단계로 진행 (입력은 이 단계에서는 막아둠)
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
    if (selectedStudentId === 'new' || selectedStudentId === null) {
      const newId = Date.now()
      const newStatus = form.status || '예비'
      setStudents(prev => [...prev, { ...form, id: newId, status: newStatus }])
      setForm(f => ({...f, status: newStatus}))
      setSelectedStudentId(newId)
      setInfoTab('가족')
    } else {
      setStudents(prev => prev.map(s => s.id === selectedStudentId ? { ...form, id: selectedStudentId } : s))
      setInfoTab('가족')
    }
    if (activeStep?.id === 'student-save-hint') advance()
  }

  const toggleGroup = id => setExpanded(e => e.includes(id) ? [] : [id])
  const toggleReplaceCheck = id => setReplaceChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id])
  const toggleTalkCheck    = id => setTalkChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id])
  const toggleNoticeCheck  = id => setNoticeChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id])
  const toggleStatusCheck  = id => setStatusChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id])

  const filteredStudents = STUDENT_STATUS_DATA.filter(d => {
    const s = statusFilter.studentStatus
    if (s === '선택하기') return true
    if (s === '예비+휴원+퇴원') return ['예비','휴원','퇴원'].includes(d.status)
    return d.status === s
  })

  const toggleStatusAll = () => setStatusChecked(statusChecked.length===filteredStudents.length ? [] : filteredStudents.map(d=>d.id))

  return (
    <div className="students-wrap">
      {showInfoPanelHint && (
        <TutorialSpotlight
          rect={infoPanelRect}
          placement="top"
          message="이곳에서 학생의 상세 정보를 등록하고 관리할 수 있습니다."
          onConfirm={handleInfoPanelConfirm}
        />
      )}
      {showRequiredFieldsHint && (
        <>
          <TutorialMultiSpotlight boundsRect={requiredFieldsRects.bounds} holes={requiredFieldsRects.holes} />
          <TutorialTooltip
            rect={requiredFieldsRects.nameRect}
            placement="top"
            message={<><span style={{color:'#F5841F'}}>*</span>표시가 있는 필수 입력란을 입력해 주세요.</>}
            onConfirm={handleRequiredFieldsConfirm}
          />
        </>
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
            message={nameEnterWarning
              ? <span style={{ color: '#ff3c00' }}>내용을 입력하고 확인[Enter]을 누르세요.</span>
              : '학생 이름을 입력해 주세요.'}
            onConfirm={handleNameConfirm}
          />
        </>
      )}
      {showEnrollHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[enrollHoleRect]}
          />
          <TutorialTooltip
            rect={enrollTooltipRect}
            placement="top"
            message={enrollEnterWarning
              ? <span style={{ color: '#ff3c00' }}>입학일자를 선택하고 확인[Enter]을 누르세요.</span>
              : '입학일자를 입력해 주세요.'}
            onConfirm={handleEnrollConfirm}
          />
        </>
      )}
      {showPhoneHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[phoneHoleRect]}
          />
          <TutorialTooltip
            rect={phoneTooltipRect}
            placement="top"
            message={phoneEnterWarning
              ? <span style={{ color: '#ff3c00' }}>내용을 입력하고 확인[Enter]을 누르세요.</span>
              : '학생 휴대폰을 입력해 주세요.'}
            onConfirm={handlePhoneConfirm}
          />
        </>
      )}
      {showBirthHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[birthHoleRect]}
          />
          <TutorialTooltip
            rect={birthTooltipRect}
            placement="top"
            message={birthEnterWarning
              ? <span style={{ color: '#ff3c00' }}>생년월일 6자리를 입력하세요.</span>
              : '생년월일 6자리와 성별을 체크해 주세요.'}
            onConfirm={handleBirthConfirm}
          />
        </>
      )}
      {showSaveHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[saveBtnRect]}
            pad={3}
          />
          <TutorialTooltip
            rect={saveBtnRect}
            placement="top"
            message="저장 버튼을 누르고 저장해 주세요!"
          />
        </>
      )}
      {showSaveCompleteHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[saveCompleteRect]}
            pad={3}
          />
          <TutorialTooltip
            rect={saveCompleteRect}
            placement="top"
            center
            message="수강생 정보가 저장되었습니다!"
            onConfirm={handleSaveCompleteConfirm}
          />
        </>
      )}
      {showFamilyHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[familyHoleRect]}
            pad={10}
          />
          <TutorialTooltip
            rect={familyHoleRect}
            placement="top"
            center
            message="이곳에서 해당 학생의 가족 정보를 입력할 수 있습니다."
            onConfirm={handleFamilyConfirm}
          />
        </>
      )}
      {showFamilyNameHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[familyNameRect]}
            pad={4}
          />
          <TutorialTooltip
            rect={familyNameRect}
            placement="top"
            center
            message="학부모님 성명을 작성해주세요."
            onConfirm={handleFamilyNameConfirm}
            warn={familyNameWarning}
          />
        </>
      )}
      {showFamilyRelationHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[familyRelationRect]}
            pad={4}
          />
          <TutorialTooltip
            rect={familyRelationRect}
            placement="top"
            center
            message="관계를 선택하세요."
            onConfirm={handleFamilyRelationConfirm}
            warn={familyRelationWarning}
          />
        </>
      )}
      {showFamilyPhoneHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[familyPhoneRect]}
            pad={4}
          />
          <TutorialTooltip
            rect={familyPhoneRect}
            placement="top"
            center
            message="휴대폰번호를 입력하세요."
            onConfirm={handleFamilyPhoneConfirm}
            warn={familyPhoneWarning}
          />
        </>
      )}
      {showFamilyMsgTypeHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[familyMsgTypeRect]}
            pad={4}
          />
          <TutorialTooltip
            rect={familyMsgTypeRect}
            placement="top"
            center
            message="메세지 수신 조건을 선택합니다."
            onConfirm={handleFamilyMsgTypeConfirm}
          />
        </>
      )}
      {showFamilyMsgTypeInfoHint && familyMsgTypeRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[familyMsgTypeRect]}
            pad={4}
          />
          <div style={{
            position: 'fixed',
            right: window.innerWidth - familyMsgTypeRect.left + 12,
            top: familyMsgTypeRect.top + familyMsgTypeRect.height / 2 - 22 + 70,
            zIndex: 4000,
            color: '#fff',
            fontSize: 13,
            lineHeight: 1.8,
            whiteSpace: 'nowrap',
            textAlign: 'right',
          }}>
            <div>학원관련 공지사항·출결 등의 알림만 수신한다면 [학원관련]</div>
            <div>청구서·수납 등의 결제 내용 알림만 수신한다면 [청구+수납]</div>
          </div>
        </>
      )}
      {showFamilySaveHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[familySaveBtnRect]}
            pad={4}
          />
          <TutorialTooltip
            rect={familySaveBtnRect}
            placement="top"
            rightAlign
            message={"학부모 정보는 이곳에서 저장을 합니다.\n저장을 클릭해주세요."}
            multiLine
            minWidth={245}
          />
        </>
      )}
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
                    setShowUpgradeModal(true)
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
        <div style={{position:'relative',display:'inline-flex',margin:'10px 0',overflow:'hidden',borderRadius:4}}>
          <button className="menu-charge-btn" style={{margin:0}}>전송충전관리</button>
          <span style={{position:'absolute',inset:0,background:'rgba(200,200,200,0.75)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
            onClick={()=>setShowUpgradeModal(true)}>
            <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="7" width="12" height="9" rx="1.5" fill="#fff"/>
              <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 5V7" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <circle cx="7" cy="11.5" r="1.5" fill="rgba(200,200,200,0.75)"/>
              <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="rgba(200,200,200,0.75)"/>
            </svg>
          </span>
        </div>
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
              background:'#fff', borderRadius:8, padding:'20px 40px',
              textAlign:'center', boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
              maxWidth:360, width:'90%',
            }} onClick={e=>e.stopPropagation()}>
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
              <p style={{fontSize:15, color:'#333', lineHeight:1.7, marginBottom:20}}>무료로 정식 계정으로 전환하고<br/>모든 기능을 제한없이 이용해보세요!</p>
              <button style={{
                padding:'10px 24px', background:'#F5841F', color:'#fff',
                border:'none', borderRadius:6, fontSize:14, fontWeight:500,
                cursor:'pointer', fontFamily:'inherit',
              }} onClick={()=>setShowUpgradeModal(false)}>
                <svg width="13" height="15" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline-block',verticalAlign:'middle',marginRight:6,marginTop:-2}}>
                  <rect x="1" y="7" width="12" height="9" rx="1.5" fill="white"/>
                  <path d="M3.5 7V5C3.5 2.79 5.07 1 7 1C8.93 1 10.5 2.79 10.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <circle cx="7" cy="11.5" r="1.5" fill="rgba(245,132,31,0.8)"/>
                  <rect x="6.25" y="12.5" width="1.5" height="2" rx="0.75" fill="rgba(245,132,31,0.8)"/>
                </svg>
                잠금 해제하러 가기
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
                <div className="info-panel" ref={infoPanelRef} style={(showSaveCompleteHint || showFamilyHint) ? { pointerEvents: 'none' } : undefined}>
                  <div className="info-header">
                    <span className="info-title">학생 정보자료</span>
                    <div style={{display:'flex',gap:6}}>
                      {typeof selectedStudentId === 'number' ? <>
                        <button className="info-action-btn blue narrow">수정</button>
                        <button className="info-action-btn red narrow" onClick={()=>setForm(f=>({...f,status:'퇴원'}))}>퇴원</button>
                        <button className="info-action-btn red narrow" onClick={()=>setForm(f=>({...f,status:'휴원'}))}>휴원</button>
                        <button className="info-action-btn gray narrow">삭제</button>
                        <button className="info-action-btn blue">수강생파일</button>
                        <button className="info-action-btn teal">알림톡전송</button>
                        <button className="info-action-btn blue" onClick={handleNewStudent}>신규 수강생 등록</button>
                      </> : <>
                        <button ref={saveBtnRef} className="info-action-btn red narrow" onClick={handleSave}>저장</button>
                        <button className="info-action-btn blue" onClick={handleNewStudent}>신규 수강생 등록</button>
                      </>}
                    </div>
                  </div>
                  <div className="info-body">
                    <div className="info-form-wrap" style={(showInfoPanelHint || showRequiredFieldsHint) ? { pointerEvents: 'none' } : undefined}>
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
                            <span style={{fontSize:13,color:'#333',minWidth:40,display:'inline-block'}}>{getDisplayStatus()}</span>
                          </div>
                        </div>
                        <div className="if-row">
                          <label className="if-label required" ref={nameLabelRef}>성명</label>
                          <div className="if-cell" ref={nameCellRef}>
                            <input ref={nameInputRef} className="if-input" value={form.name} onChange={e=>{setForm(f=>({...f,name:e.target.value})); setNameEnterWarning(false)}}/>
                          </div>
                          <label className="if-label required" ref={birthLabelRef}>생년월일</label>
                          <div className="if-cell" ref={birthCellRef}>
                            <input className="if-input" placeholder="예) 901230" style={{width:120}} value={form.birth} onChange={e=>{const digits=e.target.value.replace(/\D/g,'').slice(0,6); setForm(f=>({...f,birth:digits})); setBirthEnterWarning(false)}}/>
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
                          <label className="if-label required" ref={enrollLabelRef}>입학일자</label>
                          <div className="if-cell" ref={enrollCellRef}>
                            <DatePicker value={form.enrollDate} onChange={v=>{setForm(f=>({...f,enrollDate:v})); setEnrollEnterWarning(false)}}/>
                          </div>
                          <label className="if-label">주 결제방법</label>
                          <div className="if-cell">
                            <select className="if-input"><option>선택</option><option>현장결제</option><option>비대면(카드)</option><option>비대면(계좌)</option></select>
                          </div>
                        </div>
                        <div className="if-row">
                          <label className="if-label required" ref={phoneLabelRef}>학생 휴대폰</label>
                          <div className="if-cell" ref={phoneCellRef}>
                            <input className="if-input" placeholder="예) 010-1234-5678" value={form.phone} onChange={e=>{
                              const digits = e.target.value.replace(/\D/g,'').slice(0,11)
                              const formatted = digits.length <= 3 ? digits
                                : digits.length <= 7 ? `${digits.slice(0,3)}-${digits.slice(3)}`
                                : `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`
                              setForm(f=>({...f,phone:formatted})); setPhoneEnterWarning(false)
                            }}/>
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
                    <div className="info-tabs-wrap" ref={infoTabsWrapRef} style={(showInfoPanelHint || showRequiredFieldsHint) ? { pointerEvents: 'none' } : undefined}>
                      <div className="info-tabs">
                        <div className="info-tab-v">V</div>
                        {INFO_TABS.map(t=>(
                          <button key={t} className={`info-tab ${infoTab===t?'active':''}`}
                            onClick={()=>{
                              if(LOCKED_TABS.includes(t)){
                                setShowUpgradeModal(true)
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
                        <div className="info-tab-content" ref={infoTabContentRef}>
                          {infoTab==='가족'     && <FamilyTab nameInputRef={familyNameInputRef} relationSelectRef={familyRelationSelectRef} phoneInputRef={familyPhoneInputRef} msgTypeSelectRef={familyMsgTypeSelectRef} onMsgTypeChange={handleFamilyMsgTypeChange} onMsgTypeClick={handleFamilyMsgTypeClick} saveBtnRef={familySaveBtnRef} onSaveClick={handleFamilySaveClick} />}
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
                    <button className="sts-export-btn">수강생 등록</button>
                    <button className="sts-teal-btn">진도 등록</button>
                    <button className="sts-export-btn">알림톡전송</button>
                    <button className="sts-orange-btn">알림톡전체전송</button>
                  </div>
                </div>
                <div className="sts-table-wrap">
                  <table className="sts-table">
                    <thead><tr>
                      <th><input type="checkbox" checked={filteredStudents.length>0&&statusChecked.length===filteredStudents.length} onChange={toggleStatusAll}/></th>
                      <th>성명</th><th>생년월일</th><th>사진</th><th>상태</th><th>반명</th><th>키패드</th><th>학부</th><th>학교명</th><th>학년</th>
                    </tr></thead>
                    <tbody>
                      {filteredStudents.map(d=>(
                        <tr key={d.id} className={statusChecked.includes(d.id)?'checked-row':''}>
                          <td><input type="checkbox" checked={statusChecked.includes(d.id)} onChange={()=>toggleStatusCheck(d.id)}/></td>
                          <td><span className="sts-name-link" onClick={()=>{ sessionStorage.setItem('studentDetailData', JSON.stringify(d)); window.open('/student-detail','_blank','width=1250,height=850'); }}>{d.name}</span></td>
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

          {/* 등하원관리·학원공지 미리보기 배너 */}
          {['attend-inout','attend-ride','notice-board','notice-talk','notice-replace','notice-schedule'].includes(activeSide)&&(
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

          {/* 공지사항 */}
          {activeSide==='notice-board'&&(
            <>
              <div className="sm-page-title"><span style={{color:'#ccc'}}>☆</span> 공지사항</div>
              <div className="notice-subtitle">수강생 및 학부모에게 안내하는 {localStorage.getItem('academyName') || 'OO학원'} 소식입니다.</div>
              <div className="notice-search-wrap">
                <select className="sts-input" style={{width:120}} value={noticeSearch.type} onChange={e=>setNoticeSearch(f=>({...f,type:e.target.value}))}><option>제목+내용</option><option>제목</option><option>내용</option></select>
                <div className="notice-search-box"><input className="notice-search-input" value={noticeSearch.keyword} onChange={e=>setNoticeSearch(f=>({...f,keyword:e.target.value}))}/><button className="notice-search-icon">🔍</button></div>
              </div>
              <div className="sts-section">
                <div className="notice-list-head">
                  <span className="sts-sec-title">공지사항 목록</span>
                  <div style={{display:'flex',gap:6}}><button className="sts-export-btn">공지사항 등록</button><button className="sts-export-btn">알림톡전송</button></div>
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
                  <div style={{display:'flex',gap:6}}><button className="sts-export-btn">소통톡톡 등록</button><button className="sts-export-btn">알림톡전송</button></div>
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
                <div className="notice-list-head"><span className="sts-sec-title">예약 목록</span><button className="sts-search-btn">전송 취소</button></div>
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
