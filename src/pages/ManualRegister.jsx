import { useState, useEffect, useRef } from 'react'
import { useAppData } from '../contexts/AppDataContext'
import { useTutorial } from '../components/TutorialContext'

// replay(다시보기) 모드에서는 실제 sessionStorage 데이터가 없으므로, 반관리/수납관리에서 써온 것과
// 같은 고정 샘플(튜토리얼반)로 화면을 채워서 보여줌
const REPLAY_PREFILL = {
  studentName: '홍길동', studentBirth: '',
  className: '튜토리얼반', month: '2026-06', item: '수강료01', billAmt: 100000, unpaid: 100000,
}

const CLASS_LIST = ['중등 수학A 1교시', '중등 수학A 2교시', '중등 수학A 3교시']
const CLASS_INFO = {
  '중등 수학A 1교시': { teacher: '강사01 (수학)', type: '기간반', lastMonth: '2026-07', nextMonth: '2026-08' },
  '중등 수학A 2교시': { teacher: '강사01 (수학)', type: '기간반', lastMonth: '2026-07', nextMonth: '2026-08' },
  '중등 수학A 3교시': { teacher: '강사01 (수학)', type: '기간반', lastMonth: '2026-07', nextMonth: '2026-08' },
}
const TUITION_OPTIONS = ['선택', '수강료01', '수강료02', '교재(서적)01', '교재(서적)02', '교재(프린트물)01', '교재(프린트물)02', '교재(콘텐츠)01', '교재(콘텐츠)02']
const DISCOUNT_OPTIONS = ['선택', '형제할인', '장기할인', '성적우수할인', '일수할인', '기타(특별)할인']
const ADD_OPTIONS = ['선택', '수강료01', '수강료02', '교재(서적)01', '교재(서적)02', '교재(프린트물)01', '교재(프린트물)02', '교재(콘텐츠)01', '교재(콘텐츠)02']

const formatAmount = (val) => val.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const NUMERIC_ALLOWED_KEYS = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter']

function ItemTable({ items, setItems, options }) {
  const [addHover, setAddHover] = useState(false)
  const [warningId, setWarningId] = useState(null)
  const warningTimerRef = useRef(null)
  const add = () => setItems(p => [...p, { id: Date.now(), item: options[0], amt: '' }])
  const remove = (id) => setItems(p =>
    p.length === 1
      ? [{ ...p[0], item: options[0], amt: '' }]
      : p.filter(r => r.id !== id)
  )
  const update = (id, key, val) => setItems(p => p.map(r => r.id === id ? { ...r, [key]: val } : r))
  useEffect(() => () => clearTimeout(warningTimerRef.current), [])
  const handleAmountKeyDown = (id, e) => {
    if (NUMERIC_ALLOWED_KEYS.includes(e.key) || e.ctrlKey || e.metaKey) return
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault()
      setWarningId(id)
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = setTimeout(() => setWarningId(null), 1500)
    }
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f8f9fb', borderBottom: '1px solid #e0e0e0' }}>
          <th style={subTh}>항목</th>
          <th style={subTh}>금액(원)</th>
          <th style={subTh}>
            <button
              onClick={add}
              style={addHover ? addBtnHover : addBtn}
              onMouseEnter={() => setAddHover(true)}
              onMouseLeave={() => setAddHover(false)}
            >
              <span style={{ color: addHover ? '#fff' : '#FF9000' }}>+</span>{' '}
              <span style={{ color: addHover ? '#fff' : '#6e7576' }}>추가</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map(row => (
          <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={subTd}>
              <select style={{ ...selectStyle, width: 130 }} value={row.item} onChange={e => update(row.id, 'item', e.target.value)}>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            </td>
            <td style={{ ...subTd, position: 'relative' }}>
              <input
                style={{ ...inputStyle, width: 100, textAlign: 'right' }}
                value={row.amt}
                onKeyDown={e => handleAmountKeyDown(row.id, e)}
                onChange={e => update(row.id, 'amt', formatAmount(e.target.value))}
              />
              {warningId === row.id && (
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginTop: 4, padding: '4px 8px', background: '#333', color: '#fff',
                  fontSize: 11, borderRadius: 4, whiteSpace: 'nowrap', zIndex: 10,
                }}>
                  숫자만 입력이 가능합니다.
                </div>
              )}
            </td>
            <td style={{ ...subTd, textAlign: 'center' }}>
              <button onClick={() => remove(row.id)} style={delBtn}>－</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function ManualRegister() {
  const { classes, enrollments, payments, updateEnrollment, deleteEnrollment } = useAppData()
  const { isOpen, mode } = useTutorial()
  const isReplay = isOpen && mode === 'replay'
  const [prefillData, setPrefillData] = useState(null)
  const [className, setClassName] = useState('')
  const [round, setRound] = useState('1차')
  const [payType, setPayType] = useState('수납')
  const [addPay, setAddPay] = useState(false)
  const [payMonths, setPayMonths] = useState('1')
  const [targetStart, setTargetStart] = useState('')
  const [targetEnd, setTargetEnd] = useState('')
  const [payItems, setPayItems] = useState([{ id: 1, item: '수강료01', amt: '1,000' }])
  const [discountItems, setDiscountItems] = useState([{ id: 1, item: '선택', amt: '' }])
  const [addItems, setAddItems] = useState([{ id: 1, item: '선택', amt: '' }])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isReplay) {
      setPrefillData(REPLAY_PREFILL)
      setTargetStart(REPLAY_PREFILL.month); setTargetEnd(REPLAY_PREFILL.month)
      setPayItems([{ id: 1, item: REPLAY_PREFILL.item, amt: String(REPLAY_PREFILL.billAmt) }])
      return
    }
    const raw = sessionStorage.getItem('manualRegisterData')
    if (!raw) return
    sessionStorage.removeItem('manualRegisterData')
    const row = JSON.parse(raw)
    setPrefillData(row)
    if (row.month) { setTargetStart(row.month); setTargetEnd(row.month) }
    if (row.billAmt != null) setPayItems([{ id: 1, item: row.item || '수강료01', amt: String(row.billAmt) }])
    // 일반 CLASS_LIST 매칭도 시도
    const cls = row.className?.includes(' > ') ? row.className.split(' > ').pop() : row.className
    if (cls && CLASS_LIST.includes(cls)) setClassName(cls)
  }, [])

  const info = CLASS_INFO[className] || null
  const showForm = !!info || !!prefillData

  // 실제 반 데이터에서 강사 조회 (배정 안 되어 있으면 공백)
  const targetClassName = prefillData?.className?.includes(' > ')
    ? prefillData.className.split(' > ').pop()
    : prefillData?.className || className
  const matchedClass = classes.find(c => c.name === targetClassName)
  const teacher = matchedClass?.teacher || ''

  // 이 학생에 대해 마지막으로 청구서(결제 기록)가 생성된 연월
  const studentPayments = prefillData?.studentId ? payments.filter(p => p.studentId === prefillData.studentId) : []
  const lastBillMonth = studentPayments.length
    ? studentPayments.map(p => p.month).filter(Boolean).sort().slice(-1)[0] || ''
    : ''

  // "수정"은 결제(payments)를 새로 만드는 게 아니라, 해당 청구서(수강신청 건)의 금액을 그대로 수정/저장하는 동작
  const handleUpdate = async () => {
    if (!prefillData?.enrollmentId) { alert('수정할 대상 정보가 없습니다.'); return }
    const enrollment = enrollments.find(e => e.id === prefillData.enrollmentId)
    if (!enrollment) { alert('수정할 대상 정보가 없습니다.'); return }
    setSaving(true)
    const { error } = await updateEnrollment(enrollment.id, { ...enrollment, fee: total })
    setSaving(false)
    if (error) { alert(error.message || '수기등록에 실패했습니다.'); return }
    try { if (window.opener && !window.opener.closed) window.opener.__refreshAppData?.() } catch {}
    alert('처리가 완료되었습니다.')
    window.close()
  }

  const handleDelete = async () => {
    if (!prefillData?.enrollmentId) { alert('삭제할 대상 정보가 없습니다.'); return }
    if (!window.confirm('삭제하는 경우 자료를 복구할 수 없습니다.\n삭제하려면 확인을 선택해 주세요.')) return
    setSaving(true)
    const { error } = await deleteEnrollment(prefillData.enrollmentId)
    setSaving(false)
    if (error) { alert(error.message || '삭제에 실패했습니다.'); return }
    try { if (window.opener && !window.opener.closed) window.opener.__refreshAppData?.() } catch {}
    alert('정상적으로 처리되었습니다.')
    window.close()
  }

  const handleClassChange = (val) => {
    setClassName(val)
    const ci = CLASS_INFO[val]
    if (ci) {
      setTargetStart(ci.nextMonth)
      setTargetEnd(ci.nextMonth)
    }
  }

  const total = payItems.reduce((sum, r) => sum + (parseInt(r.amt.replace(/,/g, '')) || 0), 0)

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif", padding: '12px 20px', fontSize: 12, color: '#333', minWidth: 560 }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>수기 등록</span>
      </div>
      <div style={{ borderTop: '1px solid #eee', marginBottom: 14 }} />

      {showForm && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 14 }}>
          <button style={{ ...btnStyle('#555'), fontSize: 12 }} disabled={saving} onClick={handleUpdate}>수정</button>
          <button style={{ ...btnStyle('#555'), fontSize: 12 }} disabled={saving} onClick={handleDelete}>삭제</button>
        </div>
      )}

      {/* 수강생 정보 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10, borderTop: '2px solid #555' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>수강생 정보</td>
            <td style={valueCell}><strong>{prefillData?.studentName ? `${prefillData.studentName}(${prefillData.studentBirth || ''})` : '학생01(01.01.01)'}</strong></td>
          </tr>
        </tbody>
      </table>

      {/* 반 정보 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{ width: 14, height: 14, background: '#F5841F', borderRadius: 2 }} />
        <span style={{ fontSize: 14, fontWeight: 700 }}>반 정보</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0' }}>
        <tbody>
          {/* 반명 */}
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>반명</td>
            <td style={valueCell}>
              {prefillData ? (
                <span style={{ fontSize: 13, color: '#333' }}>{prefillData.className}</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select style={selectStyle} value={className} onChange={e => handleClassChange(e.target.value)}>
                    <option value="">반 선택</option>
                    {CLASS_LIST.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {info && <span style={{ fontSize: 12, color: '#555' }}>{info.type}</span>}
                </div>
              )}
            </td>
          </tr>

          {/* 강사 - 실제 반 데이터에서 자동 조회, 배정 안 되어 있으면 공백 */}
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>강사</td>
            <td style={{ ...valueCell, color: '#F5841F' }}>{teacher}</td>
          </tr>

          {/* 반 선택 후 또는 prefill 시 표시 */}
          {showForm && <>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>수강차수</td>
              <td style={valueCell}>
                <select style={selectStyle} value={round} onChange={e => setRound(e.target.value)}>
                  {['1차','2차','3차','4차','5차'].map(r => <option key={r}>{r}</option>)}
                </select>
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>수납구분</td>
              <td style={valueCell}>
                <select style={selectStyle} value={payType} onChange={e => setPayType(e.target.value)}>
                  <option>수납</option>
                  <option>환불</option>
                </select>
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>최종청구월</td>
              <td style={valueCell}>{lastBillMonth}</td>
            </tr>

            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>추가수납여부</td>
              <td style={valueCell}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={addPay} onChange={e => setAddPay(e.target.checked)} />
                  추가수납
                </label>
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}><span style={{ color: '#F5841F' }}>*</span> 수납월수</td>
              <td style={valueCell}>
                <select style={{ ...selectStyle, width: 100 }} value={payMonths} onChange={e => setPayMonths(e.target.value)}>
                  <option value="">선택</option>
                  <option value="일시납">일시납</option>
                  {['1','2','3','4','5','6','7','8','9','10','11','12'].map(m => (
                    <option key={m} value={m}>{m}개월</option>
                  ))}
                </select>
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}><span style={{ color: '#F5841F' }}>*</span> 대상년월</td>
              <td style={valueCell}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input style={inputStyle} value={targetStart} onChange={e => setTargetStart(e.target.value)} placeholder="YYYY-MM" />
                  <span>~</span>
                  <input style={inputStyle} value={targetEnd} onChange={e => setTargetEnd(e.target.value)} placeholder="YYYY-MM" />
                </div>
              </td>
            </tr>

            {/* 수납항목 */}
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>수납항목</td>
              <td style={{ ...valueCell, padding: 0 }}>
                <ItemTable items={payItems} setItems={setPayItems} options={TUITION_OPTIONS} />
              </td>
            </tr>

            {/* 할인항목 */}
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>할인항목</td>
              <td style={{ ...valueCell, padding: 0 }}>
                <ItemTable items={discountItems} setItems={setDiscountItems} options={DISCOUNT_OPTIONS} />
              </td>
            </tr>

            {/* 추가항목 */}
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>추가항목</td>
              <td style={{ ...valueCell, padding: 0 }}>
                <ItemTable items={addItems} setItems={setAddItems} options={ADD_OPTIONS} />
              </td>
            </tr>
          </>}

          {/* 합계금액 - 항상 표시 */}
          <tr>
            <td style={labelCell}>합계금액</td>
            <td style={valueCell}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{total.toLocaleString()}</span>
              <span style={{ marginLeft: 4 }}>원</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const btnStyle = (bg) => ({
  padding: '6px 16px', background: bg, color: '#fff', border: 'none',
  borderRadius: 4, fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit',
})

const addBtn = {
  padding: '4px 10px', background: '#f9f9f9', border: '1px solid #ccc',
  borderRadius: 3, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
}

const addBtnHover = {
  ...addBtn, background: '#6e7576', border: '1px solid #6e7576',
}

const delBtn = {
  width: 20, height: 20, padding: 0, background: '#fff', border: '1px solid #ccc',
  borderRadius: 3, cursor: 'pointer', fontSize: 12, color: '#00a2ff',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

// 내용(순수 텍스트/select/input/checkbox)에 상관없이 모든 행의 세로 크기를 고정 - 뒤죽박죽 방지
const ROW_HEIGHT = 36

const labelCell = {
  height: ROW_HEIGHT, boxSizing: 'border-box', verticalAlign: 'middle',
  padding: '0 14px', background: '#f8f9fb', fontWeight: 600,
  fontSize: 13, color: '#444', width: 180, textAlign: 'center',
  borderRight: '1px solid #e0e0e0', whiteSpace: 'nowrap',
}

const valueCell = {
  height: ROW_HEIGHT, boxSizing: 'border-box', verticalAlign: 'middle',
  padding: '0 14px', fontSize: 13, color: '#333',
}

const selectStyle = {
  padding: '3px 8px', border: '1px solid #ddd', borderRadius: 4,
  fontSize: 12, fontFamily: 'inherit', outline: 'none', color: '#333', width: 160,
}

const inputStyle = {
  padding: '3px 8px', border: '1px solid #ddd', borderRadius: 4,
  fontSize: 12, fontFamily: 'inherit', outline: 'none', color: '#333', width: 120,
}

const subTh = {
  height: ROW_HEIGHT, boxSizing: 'border-box', verticalAlign: 'middle',
  padding: '0 14px', textAlign: 'center', fontSize: 12,
  fontWeight: 700, color: '#555', whiteSpace: 'nowrap',
  borderRight: '1px solid #e0e0e0',
}

const subTd = {
  height: ROW_HEIGHT, boxSizing: 'border-box', verticalAlign: 'middle',
  padding: '0 14px', fontSize: 12,
  borderRight: '1px solid #e0e0e0', textAlign: 'center',
}
