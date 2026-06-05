import { useState } from 'react'

const CLASS_LIST = ['중등 수학A 1교시', '중등 수학A 2교시', '중등 수학A 3교시']
const CLASS_INFO = {
  '중등 수학A 1교시': { teacher: '강사01 (수학)', type: '기간반', lastMonth: '2026-07', nextMonth: '2026-08' },
  '중등 수학A 2교시': { teacher: '강사01 (수학)', type: '기간반', lastMonth: '2026-07', nextMonth: '2026-08' },
  '중등 수학A 3교시': { teacher: '강사01 (수학)', type: '기간반', lastMonth: '2026-07', nextMonth: '2026-08' },
}
const TUITION_OPTIONS = ['선택', '수강료01', '수강료02', '교재(서적)01', '교재(서적)02', '교재(프린트물)01', '교재(프린트물)02', '교재(콘텐츠)01', '교재(콘텐츠)02']
const DISCOUNT_OPTIONS = ['선택', '형제할인', '장기할인', '성적우수할인', '일수할인', '기타(특별)할인']
const ADD_OPTIONS = ['선택', '수강료01', '수강료02', '교재(서적)01', '교재(서적)02', '교재(프린트물)01', '교재(프린트물)02', '교재(콘텐츠)01', '교재(콘텐츠)02']

function ItemTable({ items, setItems, options }) {
  const add = () => setItems(p => [...p, { id: Date.now(), item: options[0], amt: '' }])
  const remove = (id) => setItems(p =>
    p.length === 1
      ? [{ ...p[0], item: options[0], amt: '' }]
      : p.filter(r => r.id !== id)
  )
  const update = (id, key, val) => setItems(p => p.map(r => r.id === id ? { ...r, [key]: val } : r))
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f8f9fb', borderBottom: '1px solid #e0e0e0' }}>
          <th style={subTh}>항목</th>
          <th style={subTh}>금액(원)</th>
          <th style={subTh}>
            <button onClick={add} style={addBtn}>+ 추가</button>
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
            <td style={subTd}>
              <input style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={row.amt} onChange={e => update(row.id, 'amt', e.target.value)} />
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

  const info = CLASS_INFO[className] || null

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>수기 등록</span>
        {info && <button style={btnStyle('#555')}>등록</button>}
      </div>

      {/* 수강생 정보 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10, borderTop: '2px solid #555' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>수강생 정보</td>
            <td style={valueCell}><strong>학생01 (01.01.01)</strong></td>
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
          {/* 반명 - 항상 표시 */}
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>반명</td>
            <td style={valueCell}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select style={selectStyle} value={className} onChange={e => handleClassChange(e.target.value)}>
                  <option value="">반 선택</option>
                  {CLASS_LIST.map(c => <option key={c}>{c}</option>)}
                </select>
                {info && <span style={{ fontSize: 12, color: '#555' }}>{info.type}</span>}
              </div>
            </td>
          </tr>

          {/* 반 선택 후에만 표시 */}
          {info && <>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={labelCell}>강사</td>
              <td style={{ ...valueCell, color: '#F5841F' }}>{info.teacher}</td>
            </tr>

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
              <td style={valueCell}>{info.lastMonth}</td>
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
  borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
})

const addBtn = {
  padding: '5px 14px', background: '#F5841F', color: '#fff', border: 'none',
  borderRadius: 3, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
}

const delBtn = {
  padding: '2px 8px', background: '#eee', border: '1px solid #ccc',
  borderRadius: 3, cursor: 'pointer', fontSize: 12,
}

const labelCell = {
  padding: '9px 16px', background: '#f8f9fb', fontWeight: 600,
  fontSize: 13, color: '#444', width: 180, textAlign: 'center',
  borderRight: '1px solid #e0e0e0', whiteSpace: 'nowrap',
}

const valueCell = { padding: '9px 14px', fontSize: 13, color: '#333' }

const selectStyle = {
  padding: '5px 8px', border: '1px solid #ddd', borderRadius: 4,
  fontSize: 12, fontFamily: 'inherit', outline: 'none', color: '#333', width: 160,
}

const inputStyle = {
  padding: '5px 8px', border: '1px solid #ddd', borderRadius: 4,
  fontSize: 12, fontFamily: 'inherit', outline: 'none', color: '#333', width: 120,
}

const subTh = {
  padding: '10px 10px', textAlign: 'center', fontSize: 12,
  fontWeight: 700, color: '#555', whiteSpace: 'nowrap',
  borderRight: '1px solid #e0e0e0',
}

const subTd = {
  padding: '10px 10px', verticalAlign: 'middle', fontSize: 12,
  borderRight: '1px solid #e0e0e0', textAlign: 'center',
}
