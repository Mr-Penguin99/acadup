import { useState, useEffect } from 'react'
import { useAppData } from '../contexts/AppDataContext'

const REPEAT_OPTIONS = ['선택', '월납', '일시납']
const DISCOUNT_OPTIONS = ['선택', '형제할인', '장기할인', '성적우수할인', '일수할인', '기타(특별)할인']

export default function ClassRegister({ classSectionRef, classNameRowRef, classSelectRef, onClassSelect, classPaydayRowRef, classDiscountRowRef, classDiscountRepeatSelectRef, classSubmitBtnRef, onSubmitClick, autoSelectFirstClass, onRepeatFocus, onRepeatChange }) {
  const { classes: contextClasses, students, enrollments, addEnrollment, updateEnrollment, deleteEnrollment } = useAppData()

  // 독립 창(팝업)으로 열렸을 때만 사용 - 임베디드(튜토리얼) 모드에서는 onSubmitClick prop으로 동작
  const [context] = useState(() => {
    if (onSubmitClick) return null
    try { return JSON.parse(sessionStorage.getItem('classRegisterContext')) } catch { return null }
  })
  const studentInfo = context ? students.find(s => s.id === context.studentId) : null
  const explicitEnrollment = context?.enrollmentId ? enrollments.find(e => e.id === context.enrollmentId) : null

  // 메인 창을 통째로 새로고침하지 않고, 데이터만 다시 불러오도록 요청 (선택된 학생/탭 등 화면 상태 유지)
  const reloadOpener = () => { try { if (window.opener && !window.opener.closed) window.opener.__refreshAppData?.() } catch {} }

  const GROUPS = [...new Set(contextClasses.map(c => c.group || '반 그룹'))].filter(Boolean)
  const CLASS_OPTIONS = contextClasses.reduce((acc, c) => {
    const g = c.group || '반 그룹'
    if (!acc[g]) acc[g] = []
    acc[g].push(c.name)
    return acc
  }, {})
  const CLASS_INFO = contextClasses.reduce((acc, c) => {
    acc[c.name] = {
      teacher: c.teacher || '',
      period: c.period || `${c.opFrom || ''}~${c.opTo || ''}`,
      room: c.room || '',
      fee: c.payments?.[0]?.price || '0',
      type: c.opType || '기간반',
      payDay: c.payDay || '1',
    }
    return acc
  }, {})
  const [group, setGroup] = useState(explicitEnrollment?.group || '반 그룹')
  const [submitHover, setSubmitHover] = useState(false)
  const [className, setClassName] = useState(explicitEnrollment?.className || '')
  const [round, setRound] = useState('신규')

  useEffect(() => {
    if (!autoSelectFirstClass || className) return
    const options = CLASS_OPTIONS[group] || []
    if (options.length > 0) setClassName(options[0])
  }, [autoSelectFirstClass])
  const [startDate, setStartDate] = useState(explicitEnrollment?.startDate || '2026-06-05')
  const [endDate, setEndDate] = useState(explicitEnrollment?.endDate || '2999-12-31')
  const [payDay, setPayDay] = useState(explicitEnrollment?.payDay || '1')

  // enrollments가 비동기로 늦게 로드되는 경우(독립 창 새로고침 직후 등) 대비 - 로드되면 폼에 반영
  useEffect(() => {
    if (!explicitEnrollment) return
    setGroup(explicitEnrollment.group || '반 그룹')
    setClassName(explicitEnrollment.className || '')
    setStartDate(explicitEnrollment.startDate || '2026-06-05')
    setEndDate(explicitEnrollment.endDate || '2999-12-31')
    setPayDay(explicitEnrollment.payDay || '1')
  }, [explicitEnrollment])

  // 지금 선택된 반에 이미 이 학생의 수강신청이 있으면(독립 창 모드) 자동으로 수정/삭제 모드로 전환
  const editTarget = !onSubmitClick && context
    ? enrollments.find(e => e.studentId === context.studentId && e.className === className)
    : null

  const handleRegister = async (payload) => {
    await addEnrollment({ studentId: context.studentId, ...payload })
    reloadOpener()
    alert('처리 완료.')
    window.close()
  }
  const handleUpdate = async (payload) => {
    await updateEnrollment(editTarget.id, payload)
    reloadOpener()
    alert('처리 완료.')
  }
  const handleDeleteEnrollment = async () => {
    if (!window.confirm('삭제하는 경우 자료를 복구할 수 없습니다. 삭제하려면 확인을 선택해 주세요.')) return
    await deleteEnrollment(editTarget.id)
    reloadOpener()
    alert('정상적으로 처리되었습니다.')
    window.close()
  }
  const [payItems, setPayItems] = useState([
    { id: 1, checked: true, item: '수강료01', amt: '1,000', repeat: '월납' },
  ])
  const [discountItems, setDiscountItems] = useState([
    { id: 1, item: '선택', amt: '', repeat: '선택' },
  ])

  const info = CLASS_INFO[className] || null

  const addDiscount = () => setDiscountItems(prev => [...prev, { id: Date.now(), item: '선택', amt: '', repeat: '선택' }])
  const removeDiscount = (id) => setDiscountItems(prev =>
    prev.length === 1
      ? [{ ...prev[0], item: '선택', amt: '', repeat: '선택' }]
      : prev.filter(r => r.id !== id)
  )
  const updateDiscount = (id, key, val) => setDiscountItems(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r))

  const total = payItems.filter(r => r.checked).reduce((sum, r) => sum + (parseInt(r.amt.replace(/,/g, '')) || 0), 0)

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif", padding: '24px', fontSize: 13, color: '#333', minWidth: 580 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>수강신청</span>
        {info && (
          onSubmitClick ? (
            <button
              ref={classSubmitBtnRef}
              onClick={() => onSubmitClick({
                className,
                group: group || '반 그룹',
                startDate,
                endDate,
                payDay,
                status: '수강',
                teacher: info.teacher,
                room: info.room,
                fee: info.fee,
              })}
              onMouseEnter={() => setSubmitHover(true)}
              onMouseLeave={() => setSubmitHover(false)}
              style={submitHover ? submitBtnHoverStyle : submitBtnStyle}
            >등록</button>
          ) : editTarget ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => handleUpdate({
                  className, group: group || '반 그룹', startDate, endDate, payDay,
                  status: '수강', teacher: info.teacher, room: info.room, fee: info.fee,
                })}
                style={submitBtnStyle}
              >수정</button>
              <button onClick={handleDeleteEnrollment} style={submitBtnStyle}>삭제</button>
            </div>
          ) : (
            <button
              onClick={() => handleRegister({
                className, group: group || '반 그룹', startDate, endDate, payDay,
                status: '수강', teacher: info.teacher, room: info.room, fee: info.fee,
              })}
              onMouseEnter={() => setSubmitHover(true)}
              onMouseLeave={() => setSubmitHover(false)}
              style={submitHover ? submitBtnHoverStyle : submitBtnStyle}
            >등록</button>
          )
        )}
      </div>

      {/* 수강생 정보 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, borderTop: '2px solid #555' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>수강생 정보</td>
            <td style={valueCell}>{studentInfo ? `${studentInfo.name} (${studentInfo.birth || '-'})` : '학생01 (01.01.01)'}</td>
          </tr>
        </tbody>
      </table>

      {/* 신청 정보 */}
      <div ref={classSectionRef}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <div style={{ width: 14, height: 14, background: '#F5841F', borderRadius: 2 }} />
        <span style={{ fontSize: 14, fontWeight: 700 }}>신청 정보</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0' }}>
        <tbody>
          {/* 반명 - 항상 표시 */}
          <tr ref={classNameRowRef} style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>반명</td>
            <td style={valueCell}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <select style={selectStyle} value={group} onChange={e => { setGroup(e.target.value); setClassName('') }}>
                  {GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
                <span style={{ color: '#888' }}>{'>'}</span>
                <select ref={classSelectRef} style={selectStyle} value={className} onChange={e => { setClassName(e.target.value); if (e.target.value) onClassSelect?.() }}>
                  <option value="">반 선택</option>
                  {(CLASS_OPTIONS[group] || []).map(c => <option key={c}>{c}</option>)}
                </select>
                {info && <span style={{ fontSize: 12, color: '#555' }}>{info.type}</span>}
              </div>
            </td>
          </tr>

          {/* 반 선택 후에만 표시 */}
          {info && <>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>강사</td>
              <td style={valueCell}>{info.teacher}</td>
            </tr>

            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>개설기간</td>
              <td style={valueCell}><span style={{ fontWeight: 700 }}>{info.period}</span></td>
            </tr>

            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>강의실</td>
              <td style={{ ...valueCell, color: '#F5841F' }}>{info.room}</td>
            </tr>

            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>수강차수</td>
              <td style={valueCell}>
                <select style={selectStyle} value={round} onChange={e => setRound(e.target.value)}>
                  <option>신규</option>
                  {['1차', '2차', '3차', '4차', '5차'].map(r => <option key={r}>{r}</option>)}
                </select>
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>수강기간</td>
              <td style={valueCell}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} />
                  <span>~</span>
                  <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} />
                  <button style={{ ...btnStyle('#29ABE2'), fontSize: 13, padding: '4px 10px' }}
                    onClick={() => setEndDate(new Date().toISOString().slice(0, 10))}>+ 수강중지</button>
                </div>
              </td>
            </tr>

            <tr ref={classPaydayRowRef} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>납부기준일</td>
              <td style={valueCell}>
                <input style={{ ...inputStyle, width: 60 }} value={payDay} onChange={e => setPayDay(e.target.value)} />
              </td>
            </tr>

            {/* 수납항목 */}
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>수납항목</td>
              <td style={{ ...valueCell, padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fb', borderBottom: '1px solid #e0e0e0' }}>
                      <th style={{ ...subTh, width: 50 }}>선택</th>
                      <th style={subTh}>항목</th>
                      <th style={subTh}>금액(원)</th>
                      <th style={subTh}>반복주기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payItems.map(row => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ ...subTd, textAlign: 'center', width: 50 }}>
                          <input type="checkbox" checked={row.checked}
                            onChange={e => setPayItems(prev => prev.map(r => r.id === row.id ? { ...r, checked: e.target.checked } : r))} />
                        </td>
                        <td style={subTd}>{row.item}</td>
                        <td style={subTd}>{row.amt}</td>
                        <td style={{ ...subTd, textAlign: 'center' }}>
                          <select style={{ ...selectStyle, width: 80 }} value={row.repeat}
                            onChange={e => setPayItems(prev => prev.map(r => r.id === row.id ? { ...r, repeat: e.target.value } : r))}>
                            {REPEAT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* 할인항목 */}
            <tr ref={classDiscountRowRef} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>할인항목</td>
              <td style={{ ...valueCell, padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fb', borderBottom: '1px solid #e0e0e0' }}>
                      <th style={subTh}>항목</th>
                      <th style={subTh}>금액(원)</th>
                      <th style={subTh}>반복주기</th>
                      <th style={{ ...subTh, textAlign: 'center' }}>
                        <button onClick={addDiscount} style={{ ...btnStyle('#29ABE2'), fontSize: 13, padding: '2px 8px' }}>+ 추가</button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {discountItems.map((row, index) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={subTd}>
                          <select style={{ ...selectStyle, width: 120 }} value={row.item} onChange={e => updateDiscount(row.id, 'item', e.target.value)}>
                            {DISCOUNT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                        <td style={subTd}>
                          <input style={{ ...inputStyle, width: 80 }} value={row.amt} onChange={e => updateDiscount(row.id, 'amt', e.target.value)} />
                        </td>
                        <td style={subTd}>
                          <select
                            ref={index === 0 ? classDiscountRepeatSelectRef : undefined}
                            style={{ ...selectStyle, width: 80 }}
                            value={row.repeat}
                            onFocus={index === 0 ? onRepeatFocus : undefined}
                            onChange={e => {
                              updateDiscount(row.id, 'repeat', e.target.value)
                              if (index === 0) onRepeatChange?.(e.target.value)
                            }}
                          >
                            {REPEAT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                        <td style={{ ...subTd, textAlign: 'center' }}>
                          <button onClick={() => removeDiscount(row.id)}
                            style={{ padding: '2px 8px', background: '#eee', border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer', fontSize: 13 }}>－</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
    </div>
  )
}

const btnStyle = (bg) => ({
  padding: '6px 16px', background: bg, color: '#fff', border: 'none',
  borderRadius: 4, fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit',
})

const submitBtnStyle = {
  padding: '5px 14px', background: '#6e7576', color: '#fff', border: '1px solid #6e7576',
  borderRadius: 4, fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit',
}

const submitBtnHoverStyle = {
  padding: '5px 14px', background: 'none', color: '#6e7576', border: '1px solid #6e7576',
  borderRadius: 4, fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit',
}

const labelCell = {
  padding: '10px 16px', background: '#f8f9fb', fontWeight: 600,
  fontSize: 13, color: '#444', width: 110, textAlign: 'center',
  borderRight: '1px solid #e0e0e0', whiteSpace: 'nowrap',
}

const valueCell = {
  padding: '10px 14px', fontSize: 13, color: '#333',
}

const selectStyle = {
  padding: '5px 8px', border: '1px solid #ddd', borderRadius: 4,
  fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#333', width: 150,
}

const inputStyle = {
  padding: '5px 8px', border: '1px solid #ddd', borderRadius: 4,
  fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#333', width: 130,
}

const subTh = {
  padding: '7px 10px', textAlign: 'center', fontSize: 12,
  fontWeight: 700, color: '#555', whiteSpace: 'nowrap',
  borderRight: '1px solid #e0e0e0',
}

const subTd = {
  padding: '7px 10px', verticalAlign: 'middle', fontSize: 13,
  borderRight: '1px solid #e0e0e0', textAlign: 'center',
}
