import { useState, useEffect, useRef } from 'react'
import './ClassCreate.css'
import { FreeDatePicker } from '../components/DatePicker'
import { useTutorial } from '../components/TutorialContext'
import TutorialTooltip from '../components/TutorialTooltip'
import TutorialMultiSpotlight from '../components/TutorialMultiSpotlight'

const START_HOURS = Array.from({length:19},(_,i)=>String(i+5).padStart(2,'0'))  // 05~23
const END_HOURS   = Array.from({length:19},(_,i)=>String(i+6).padStart(2,'0'))  // 06~24
const MINS        = ['00','30']
const DAYS  = ['일','월','화','수','목','금','토']

const emptyLesson  = () => ({ id:Date.now()+Math.random(), sh:'09', sm:'00', eh:'10', em:'00', days:{일:false,월:false,화:false,수:false,목:false,금:false,토:false} })
const emptyTeacher = () => ({ id:Date.now()+Math.random(), name:'', homeroom:false, subject:'' })
const emptyPayment = () => ({ id:Date.now()+Math.random(), item:'', price:'', required:true, cycle:'' })

const REQUIRED_FIELDS_OVERLAY_STEP_IDS = [
  'class-create-required-fields', 'class-create-payday-hint', 'class-create-period-hint',
]

export default function ClassCreate({ onClose, embedded, onSave }) {
  const [form, setForm] = useState({
    code:'', group:'', name:'',
    subject:'', room:'', capacity:'',
    payCycle:'1개월납', payDay:'1',
    opType:'기간반', opFrom:'', opTo:'',
  })
  const [lessons,  setLessons]  = useState([emptyLesson()])
  const [teachers, setTeachers] = useState([emptyTeacher()])
  const [payments, setPayments] = useState([emptyPayment()])

  const { activeStep, isOpen, advance } = useTutorial()
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

  const nameLabelRef = useRef(null)
  const nameCellRef = useRef(null)
  const subjectLabelRef = useRef(null)
  const subjectCellRef = useRef(null)
  const payCycleLabelRef = useRef(null)
  const payCycleCellRef = useRef(null)
  const payDayLabelRef = useRef(null)
  const payDayCellRef = useRef(null)
  const opTypeLabelRef = useRef(null)
  const opTypeCellRef = useRef(null)
  const opPeriodLabelRef = useRef(null)
  const opPeriodCellRef = useRef(null)
  const paymentsSectionRef = useRef(null)
  const newRegisterBtnRef = useRef(null)
  const [requiredFieldsRects, setRequiredFieldsRects] = useState({ bounds: null, holes: [], nameRect: null, newRegisterRect: null })
  const showRequiredFieldsHint = isOpen && activeStep?.id === 'class-create-required-fields'
  // 납부기준일/운영기간 단계로 넘어가도 강조 오버레이는 계속 유지
  const showRequiredFieldsOverlay = isOpen && REQUIRED_FIELDS_OVERLAY_STEP_IDS.includes(activeStep?.id)
  const showNewRegisterHint = isOpen && activeStep?.id === 'class-create-new-register-hint'
  // 신규 반 등록 클릭 후, 모달을 닫기 전까지 말풍선 없이 강조만 유지하는 단계
  const showClosingOverlay = isOpen && activeStep?.id === 'class-create-closing'
  // 입력란 강조 영역 측정은 신규 반 등록 강조 단계에서도 필요
  const needsFieldHoles = showRequiredFieldsOverlay || showNewRegisterHint || showClosingOverlay

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
  const showPayDayHint = isOpen && activeStep?.id === 'class-create-payday-hint'

  useEffect(() => {
    if (!showPayDayHint) return
    const measure = () => {
      if (payDayLabelRef.current) setPayDayHintRect(payDayLabelRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showPayDayHint])

  const handlePayDayClick = () => {
    if (activeStep?.id === 'class-create-required-fields') advance()
  }

  const [periodHintRect, setPeriodHintRect] = useState(null)
  const showPeriodHint = isOpen && activeStep?.id === 'class-create-period-hint'

  useEffect(() => {
    if (!showPeriodHint) return
    const measure = () => {
      if (opPeriodLabelRef.current) setPeriodHintRect(opPeriodLabelRef.current.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showPeriodHint])

  const handlePeriodClick = () => {
    if (activeStep?.id === 'class-create-payday-hint') advance()
  }

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

  // 수납 항목을 모두 입력하면 저장 버튼 강조 단계로 진행
  // (이전 버튼 등으로 이미 입력된 상태에서 이 단계로 "막 진입"한 경우는 건너뛰고,
  //  이 단계에 머무는 동안 실제로 입력값이 바뀔 때만 검사한다)
  const periodHintEnteredRef = useRef(false)
  useEffect(() => {
    const isOnStep = activeStep?.id === 'class-create-period-hint'
    if (isOnStep && periodHintEnteredRef.current) {
      const allFilled = payments.length > 0 && payments.every(p => p.item && p.price && p.cycle)
      if (allFilled) advance()
    }
    periodHintEnteredRef.current = isOnStep
  }, [payments, activeStep])

  const setF = (key, val) => setForm(f => ({...f, [key]: val}))

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
  const addPayment    = () => setPayments(p => [...p, emptyPayment()])
  const removePayment = id => setPayments(p => p.length===1 ? [emptyPayment()] : p.filter(r=>r.id!==id))
  const updatePayment = (id, key, val) => setPayments(p => p.map(r => r.id===id ? {...r, [key]:val} : r))

  const formatPrice = val => val.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  const resetForm = () => {
    setForm({code:'',group:'',name:'',subject:'',room:'',capacity:'',payCycle:'1개월납',payDay:'1',opType:'기간반',opFrom:'',opTo:''})
    setLessons([emptyLesson()]); setTeachers([emptyTeacher()]); setPayments([emptyPayment()])
  }
  const handleNew  = () => {
    resetForm()
    if (activeStep?.id === 'class-create-new-register-hint') advance()
  }
  const handleSave = () => {
    onSave?.(form)
    alert('저장되었습니다.')
    if (activeStep?.id === 'class-create-save-hint') advance()
  }

  return (
    <div className={`cc-wrap${embedded ? ' cc-modal' : ''}`}>
      {showCodeHint && (
        <TutorialTooltip
          rect={codeInputRect}
          message="반 코드는 자동생성되니 입력을 안하셔도 됩니다."
          placement="top"
        />
      )}
      {showRequiredFieldsOverlay && (
        <TutorialMultiSpotlight boundsRect={requiredFieldsRects.bounds} holes={requiredFieldsRects.holes} />
      )}
      {showRequiredFieldsHint && (
        <TutorialTooltip
          rect={requiredFieldsRects.nameRect}
          placement="top"
          message={<><span className="cc-req">*</span>표시가 된 필수 입력란을 입력하고, 운영기간·수납까지 작성해 주세요.</>}
        />
      )}
      {showPayDayHint && (
        <TutorialTooltip
          rect={payDayHintRect && { left: payDayHintRect.left + 10, top: payDayHintRect.top, bottom: payDayHintRect.bottom }}
          placement="top"
          message="수강생 등록 시 별도로 학생마다 납부기준일을 다르게 설정할 수 있습니다."
        />
      )}
      {showPeriodHint && (
        <TutorialTooltip
          rect={periodHintRect}
          placement="top"
          message="운영기간을 길게 유지하고 싶을 경우 2999-12-31로 입력하시면 됩니다."
        />
      )}
      {showSaveHint && (
        <>
          <TutorialMultiSpotlight boundsRect={saveHintRects.bounds} holes={[saveHintRects.rect]} pad={3} />
          <TutorialTooltip
            rect={saveHintRects.rect}
            placement="top"
            message="저장 버튼을 눌러 저장해 주세요."
          />
        </>
      )}
      {showNewRegisterHint && (
        <>
          <TutorialMultiSpotlight
            boundsRect={requiredFieldsRects.bounds}
            holes={[...requiredFieldsRects.holes, requiredFieldsRects.newRegisterRect && { rect: requiredFieldsRects.newRegisterRect, pad: 3 }]}
          />
          <TutorialTooltip
            rect={requiredFieldsRects.newRegisterRect}
            placement="top"
            message="신규 반 등록을 클릭 시 이어서 반 등록을 할 수 있습니다."
          />
        </>
      )}
      {showClosingOverlay && (
        <TutorialMultiSpotlight
          boundsRect={requiredFieldsRects.bounds}
          holes={[...requiredFieldsRects.holes, requiredFieldsRects.newRegisterRect && { rect: requiredFieldsRects.newRegisterRect, pad: 3 }]}
        />
      )}
      {/* 헤더 */}
      <div className="cc-header">
        <span className="cc-title">반 등록</span>
        {onClose && <button className="cc-close-btn" onClick={onClose}>✕</button>}
      </div>

      <div className="cc-btn-row">
        <button ref={saveBtnRef} className="cc-btn cc-btn-save" onClick={handleSave}>저장</button>
        <button ref={newRegisterBtnRef} className="cc-btn cc-btn-new"  onClick={handleNew}>신규 반 등록</button>
      </div>

      <div className="cc-body">
        <div className="cc-box">
        {/* 기본 정보 그리드 */}
        <table className="cc-info-table">
          <tbody>
            <tr>
              <td className="cc-label"><span className="cc-req">*</span>반 코드</td>
              <td className="cc-cell">
                <input ref={codeInputRef} className="cc-input" placeholder="미입력시 자동부여" value={form.code} onChange={e=>setF('code',e.target.value)}/>
              </td>
              <td className="cc-label" ref={nameLabelRef}><span className="cc-req">*</span>반 명</td>
              <td className="cc-cell" ref={nameCellRef}>
                <select className="cc-select" value={form.group} onChange={e=>setF('group',e.target.value)}>
                  <option value="">반그룹 선택</option>
                </select>
                <input className="cc-input" style={{flex:1}} value={form.name} onChange={e=>setF('name',e.target.value)}/>
              </td>
            </tr>
            <tr>
              <td className="cc-label" ref={subjectLabelRef}><span className="cc-req">*</span>과목명(과정명)</td>
              <td className="cc-cell" ref={subjectCellRef}>
                <select className="cc-select" value={form.subject} onChange={e=>setF('subject',e.target.value)}>
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
                <select className="cc-select" value={form.payCycle} onChange={e=>setF('payCycle',e.target.value)}>
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
                <select className="cc-select" value={form.opType} onChange={e=>setF('opType',e.target.value)}>
                  <option>기간반</option><option>회차반</option>
                </select>
              </td>
              <td className="cc-label" ref={opPeriodLabelRef}>운영기간</td>
              <td className="cc-cell" ref={opPeriodCellRef}>
                <FreeDatePicker value={form.opFrom} onChange={v=>setF('opFrom',v)} className="cc-input cc-input-date" onInputFocus={handlePeriodClick}/>
                <span style={{margin:'0 6px',color:'#999'}}>~</span>
                <FreeDatePicker value={form.opTo} onChange={v=>setF('opTo',v)} className="cc-input cc-input-date" onInputFocus={handlePeriodClick}/>
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
