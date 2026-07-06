import { useState } from 'react'
import { useAppData } from '../contexts/AppDataContext'

const PAY_METHODS = ['수납방법', '카드', '현금', '계좌', '제로페이', '카카오페이']

export default function PaymentRegister() {
  const { addPayment } = useAppData()
  const [data] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('paymentRegisterData')) } catch { return null }
  })
  const classes = data ? [{
    id: data.enrollmentId,
    month: data.month,
    name: data.className,
    fee: data.billAmt || 0,
  }] : []

  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10))
  const [payMethod, setPayMethod] = useState('수납방법')
  const [classAmt, setClassAmt] = useState(String(data?.billAmt ?? ''))
  const [payAmt, setPayAmt] = useState(String(data?.unpaid ?? ''))
  const [receipt, setReceipt] = useState(true)
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePay = async () => {
    if (!data) { alert('결제할 대상 정보가 없습니다.'); return }
    const amount = parseInt(String(payAmt).replace(/[^0-9]/g, ''), 10) || 0
    if (amount <= 0) { alert('수납금액을 입력해 주세요.'); return }
    setSaving(true)
    const { error } = await addPayment({
      studentId: data.studentId,
      enrollmentId: data.enrollmentId,
      className: data.className,
      month: data.month,
      item: data.item,
      payDate,
      method: payMethod,
      amount,
      memo,
    })
    setSaving(false)
    if (error) { alert(error.message || '수납 처리에 실패했습니다.'); return }
    try { if (window.opener && !window.opener.closed) window.opener.__refreshAppData?.() } catch {}
    alert('정상적으로 처리되었습니다.')
    window.close()
  }

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif", padding: '20px 24px', fontSize: 13, color: '#333', minWidth: 520 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>수납 등록</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={btnStyle('#F5841F')} disabled={saving} onClick={handlePay}>결제하기</button>
          <button style={btnStyle('#888')} onClick={() => window.close()}>닫기</button>
        </div>
      </div>

      {/* 수강생 정보 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, borderTop: '2px solid #555' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>수강생 정보</td>
            <td style={valueCell}><strong>{data?.studentName || '수강생 미지정'}</strong></td>
          </tr>
        </tbody>
      </table>

      {/* 수강반 */}
      <div style={sectionHead}>수강반</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
        <thead>
          <tr style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #e0e0e0', background: '#f8f9fb' }}>
            <th style={th}>수강월</th>
            <th style={th}>수강반</th>
            <th style={th}>수강료</th>
            <th style={th}>미납잔액</th>
          </tr>
        </thead>
        <tbody>
          {classes.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px 0', color: '#aaa' }}>결제할 대상이 없습니다.</td></tr>
          ) : classes.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ ...td, textAlign: 'center' }}>{c.month}</td>
              <td style={td}>{c.name}</td>
              <td style={{ ...td, textAlign: 'right' }}>{Number(c.fee).toLocaleString()}</td>
              <td style={{ ...td, textAlign: 'right', color: '#0100FF' }}>{Number(data.unpaid).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 결제정보 */}
      <div style={sectionHead}>결제정보</div>
      <div style={{ borderTop: '2px solid #555', marginBottom: 8 }} />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={formLabel}>수납일자</td>
            <td style={formValue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="date" style={inputStyle} value={payDate} onChange={e => setPayDate(e.target.value)} />
              </div>
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={formLabel}>수납방법</td>
            <td style={formValue}>
              <select style={{ ...inputStyle, width: '100%' }} value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                {PAY_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={formLabel}>수강금액</td>
            <td style={formValue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input style={{ ...inputStyle, textAlign: 'right', width: 200 }} value={classAmt} onChange={e => setClassAmt(e.target.value)} />
                <span>원</span>
              </div>
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={formLabel}>수납금액</td>
            <td style={formValue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input style={{ ...inputStyle, textAlign: 'right', width: 200 }} value={payAmt} onChange={e => setPayAmt(e.target.value)} />
                <span>원</span>
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>미납잔액보다 적게 입력하면 나머지는 계속 미납으로 남습니다.</div>
            </td>
          </tr>
          {payMethod === '카드' && (
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={formLabel}>할부기간</td>
              <td style={formValue}>
                <select style={{ ...inputStyle, width: 200 }}>
                  <option>할부기간선택</option>
                  <option>일시불</option>
                  {['2','3','4','5','6','7','8','9','10','11','12'].map(m => (
                    <option key={m} value={m}>{m}개월</option>
                  ))}
                </select>
              </td>
            </tr>
          )}
          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={formLabel}>영수증</td>
            <td style={formValue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {payMethod === '카드' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    카드단말기발급
                  </label>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={receipt} onChange={e => setReceipt(e.target.checked)} />
                  일반프린터 출력
                </label>
              </div>
            </td>
          </tr>
          <tr>
            <td style={formLabel}>메모</td>
            <td style={formValue}>
              <textarea style={{
                width: '100%', height: 80, padding: '6px 8px',
                border: '1px solid #ddd', borderRadius: 4, resize: 'vertical',
                fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }} value={memo} onChange={e => setMemo(e.target.value)} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const btnStyle = (bg) => ({
  padding: '6px 16px', background: bg, color: '#fff', border: 'none',
  borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
})

const sectionHead = {
  fontSize: 14, fontWeight: 700, color: '#333',
  borderLeft: '3px solid #29ABE2', paddingLeft: 8,
  marginBottom: 8,
}

const labelCell = {
  padding: '8px 16px', background: '#f8f9fb', fontWeight: 600,
  fontSize: 13, color: '#444', width: 110, textAlign: 'center',
  borderRight: '1px solid #e0e0e0', whiteSpace: 'nowrap',
}

const valueCell = { padding: '8px 14px', fontSize: 13, color: '#333' }

const formLabel = {
  padding: '8px 12px', fontSize: 13, color: '#555',
  width: 90, whiteSpace: 'nowrap', verticalAlign: 'middle',
}

const formValue = { padding: '6px 8px', fontSize: 13, color: '#333' }

const th = {
  padding: '8px 10px', textAlign: 'center', fontSize: 13,
  fontWeight: 700, color: '#555', whiteSpace: 'nowrap',
}

const td = { padding: '7px 10px', verticalAlign: 'middle', fontSize: 13 }

const inputStyle = {
  padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4,
  fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#333', width: 200,
}
