import { useState, useRef, useEffect } from 'react'
import { useAppData } from '../contexts/AppDataContext'
import { useTutorial } from '../components/TutorialContext'
import TutorialMultiSpotlight from '../components/TutorialMultiSpotlight'
import TutorialTooltip from '../components/TutorialTooltip'

const PAY_METHODS = ['수납방법', '카드', '현금', '계좌', '제로페이', '카카오페이']

const formatAmount = (val) => val.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const toNumber = (val) => parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0

export default function PaymentRegister() {
  const { addPayment } = useAppData()
  const [data] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('paymentRegisterData')) } catch { return null }
  })
  const bills = data?.bills || []

  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10))
  const [payMethod, setPayMethod] = useState('수납방법')
  const [installment, setInstallment] = useState('할부기간선택')
  const [classAmt, setClassAmt] = useState(formatAmount(String(bills.reduce((s, b) => s + (b.billAmt || 0), 0))))
  const [payAmt, setPayAmt] = useState(formatAmount(String(bills.reduce((s, b) => s + (b.unpaid || 0), 0))))
  const [receipt, setReceipt] = useState(true)
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)
  const [payHover, setPayHover] = useState(false)
  const [closeHover, setCloseHover] = useState(false)

  const { activeStep, isOpen, advance } = useTutorial()
  const methodRef = useRef(null)
  const installmentRef = useRef(null)
  const payBtnRef = useRef(null)
  const [methodRect, setMethodRect] = useState(null)
  const [installmentRect, setInstallmentRect] = useState(null)
  const [payBtnRect, setPayBtnRect] = useState(null)
  const [notifyMsg, setNotifyMsg] = useState(null)

  const showMethodHint = isOpen && activeStep?.id === 'payment-register-method-hint'
  const showInstallmentHint = isOpen && activeStep?.id === 'payment-register-installment-hint'
  const showPayBtnHint = isOpen && activeStep?.id === 'payment-register-pay-btn-hint'
  const showIntroHint = isOpen && activeStep?.id === 'payment-register-modal-hint'

  useEffect(() => {
    if (!showMethodHint && !showIntroHint) return
    const measure = () => setMethodRect(methodRef.current?.getBoundingClientRect())
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showMethodHint, showIntroHint])

  useEffect(() => {
    if (!showInstallmentHint) return
    const measure = () => setInstallmentRect(installmentRef.current?.getBoundingClientRect())
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showInstallmentHint])

  useEffect(() => {
    if (!showPayBtnHint) return
    const measure = () => setPayBtnRect(payBtnRef.current?.getBoundingClientRect())
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showPayBtnHint])

  // 튜토리얼 "이전" 등으로 이 단계를 벗어나면 뜬 채로 남아있던 안내 팝업을 정리
  useEffect(() => {
    if (!showPayBtnHint) setNotifyMsg(null)
  }, [showPayBtnHint])

  // 튜토리얼의 결제하기 단계에서 나오는 안내는 네이티브 alert 대신 강조표시 가능한 팝업으로 띄움
  const notify = (msg) => {
    if (showPayBtnHint) { setNotifyMsg(msg); return }
    alert(msg)
  }

  const handlePay = async () => {
    if (!data || bills.length === 0) { notify('결제할 대상 정보가 없습니다.'); return }
    if (payMethod === '수납방법') { notify('수납방법을 선택해 주세요.'); return }
    if (payMethod === '카드' && installment === '할부기간선택') { notify('할부기간을 선택해 주세요.'); return }
    let remaining = toNumber(payAmt)
    if (remaining <= 0) { notify('수납금액을 입력해 주세요.'); return }

    setSaving(true)
    for (const bill of bills) {
      if (remaining <= 0) break
      const amount = Math.min(remaining, bill.unpaid)
      if (amount <= 0) continue
      const { error } = await addPayment({
        studentId: data.studentId,
        enrollmentId: bill.enrollmentId,
        className: bill.className,
        month: bill.month,
        item: bill.item,
        payDate,
        method: payMethod,
        amount,
        memo,
      })
      if (error) { setSaving(false); notify(error.message || '수납 처리에 실패했습니다.'); return }
      remaining -= amount
    }
    setSaving(false)
    try { if (window.opener && !window.opener.closed) window.opener.__refreshAppData?.() } catch {}
    // 임베디드(튜토리얼) 모드에서는 opener가 없으므로, 이 창 자체의 데이터를 서버 기준으로 다시 불러옴
    try { window.__refreshAppData?.() } catch {}
    if (showPayBtnHint) { setNotifyMsg('정상적으로 처리되었습니다.'); return }
    alert('정상적으로 처리되었습니다.')
    window.close()
  }

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif", padding: '20px 24px', fontSize: 13, color: '#333', minWidth: 520 }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>수납 등록</span>
      </div>
      <div style={{ borderTop: '1px solid #eee', marginBottom: 14 }} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 16 }}>
        <button
          ref={payBtnRef}
          style={btnStyle('#ff3c00', payHover)} disabled={saving} onClick={handlePay}
          onMouseEnter={() => setPayHover(true)} onMouseLeave={() => setPayHover(false)}
        >결제하기</button>
        <button
          style={btnStyle('#6e7576', closeHover)} onClick={() => window.close()}
          onMouseEnter={() => setCloseHover(true)} onMouseLeave={() => setCloseHover(false)}
        >닫기</button>
      </div>

      {/* 수강생 정보 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, borderTop: '2px solid #555' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>수강생 정보</td>
            <td style={valueCell}><strong>{data?.studentName ? `${data.studentName}(${data.studentBirth || ''})` : '수강생 미지정'}</strong></td>
          </tr>
        </tbody>
      </table>

      {/* 수강반 */}
      <div style={sectionHead}>수강반</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
        <thead>
          <tr style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #e0e0e0', background: '#f8f9fb' }}>
            <th style={th}>번호</th>
            <th style={th}>수강월</th>
            <th style={th}>수강반</th>
            <th style={th}>수강료</th>
          </tr>
        </thead>
        <tbody>
          {bills.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px 0', color: '#aaa' }}>결제할 대상이 없습니다.</td></tr>
          ) : bills.map((b, idx) => (
            <tr key={b.enrollmentId} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ ...td, textAlign: 'center' }}>{idx + 1}</td>
              <td style={{ ...td, textAlign: 'center' }}>{b.month}</td>
              <td style={{ ...td, textAlign: 'center' }}>{b.className}</td>
              <td style={{ ...td, textAlign: 'center' }}>{Number(b.billAmt).toLocaleString()}</td>
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
              <select ref={methodRef} style={{ ...inputStyle, width: '100%' }} value={payMethod} onChange={e => {
                const val = e.target.value
                setPayMethod(val)
                if (showMethodHint && val === '카드') advance()
              }}>
                {PAY_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={formLabel}>수강금액</td>
            <td style={formValue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input style={{ ...inputStyle, textAlign: 'right', width: 200 }} value={classAmt} onChange={e => setClassAmt(formatAmount(e.target.value))} />
                <span>원</span>
              </div>
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={formLabel}>수납금액</td>
            <td style={formValue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input style={{ ...inputStyle, textAlign: 'right', width: 200 }} value={payAmt} onChange={e => setPayAmt(formatAmount(e.target.value))} />
                <span>원</span>
              </div>
            </td>
          </tr>
          {payMethod === '카드' && (
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={formLabel}>할부기간</td>
              <td style={formValue}>
                <select ref={installmentRef} style={{ ...inputStyle, width: 200 }} value={installment} onChange={e => {
                  const val = e.target.value
                  setInstallment(val)
                  if (showInstallmentHint && val !== '할부기간선택') advance()
                }}>
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
      {showIntroHint && methodRect && (
        <TutorialTooltip
          rect={methodRect}
          placement="right"
          message="수납방법(할부기간)을 선택하고 결제를 진행합니다."
          onConfirm={() => advance()}
        />
      )}
      {showMethodHint && methodRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[{ rect: methodRect, pad: 10 }]}
          />
          <TutorialTooltip
            rect={methodRect}
            placement="top"
            message="수납 방법을 카드로 선택해보겠습니다."
          />
        </>
      )}
      {showInstallmentHint && installmentRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[{ rect: installmentRect, pad: 10 }]}
          />
          <TutorialTooltip
            rect={installmentRect}
            placement="top"
            message="할부기간을 선택하세요."
          />
        </>
      )}
      {showPayBtnHint && payBtnRect && !notifyMsg && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[{ rect: payBtnRect, pad: 10 }]}
          />
          <TutorialTooltip
            rect={payBtnRect}
            placement="top"
            rightAlign
            message="결제하기를 눌러주세요."
          />
        </>
      )}
      {notifyMsg && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 3499, background: 'rgba(0,0,0,0.6)' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 4200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4 }}>
            <div style={{ position: 'relative', background: '#fff', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', minWidth: 260, minHeight: 120 }}>
              <p style={{ position: 'absolute', top: 10, left: 10, margin: 0, fontSize: 14, color: '#333' }}>{notifyMsg}</p>
              <button
                style={{ position: 'absolute', bottom: 10, right: 10, padding: '8px 24px', background: '#2166D4', color: '#fff', border: 'none', borderRadius: 9999, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => { setNotifyMsg(null); advance() }}
              >확인</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const btnStyle = (color, hover) => ({
  padding: '6px 16px', border: `1px solid ${color}`,
  borderRadius: 4, fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit',
  background: hover ? 'transparent' : color,
  color: hover ? '#000' : '#fff',
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
