import { useEffect, useRef, useState } from 'react'
import './Students.css'
import { useAppData } from '../contexts/AppDataContext'
import { useTutorial } from '../components/TutorialContext'
import TutorialTooltip from '../components/TutorialTooltip'

export default function PaymentCancel() {
  const { cancelPayment } = useAppData()
  const [data, setData] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('paymentCancelData')
    if (raw) setData(JSON.parse(raw))
  }, [])

  const { activeStep, isOpen, advance } = useTutorial()
  const reasonRowRef = useRef(null)
  const reasonLabelRef = useRef(null)
  const [reasonRowRect, setReasonRowRect] = useState(null)
  const [reasonTailLeftPx, setReasonTailLeftPx] = useState(16)
  // errorMsg: 확인을 눌러도 그냥 닫히기만 함 (다음 단계로 진행 X)
  // confirmMsg: 확인을 누르면 실제로 결제취소를 진행함
  // doneMsg: 확인(최종)을 누르면 다음 단계로 진행함
  const [errorMsg, setErrorMsg] = useState(null)
  const [confirmMsg, setConfirmMsg] = useState(null)
  const [doneMsg, setDoneMsg] = useState(null)
  const showCancelModalHint = isOpen && activeStep?.id === 'payment-cancel-modal-hint'

  useEffect(() => {
    if (!showCancelModalHint) return
    const measure = () => {
      const rowRect = reasonRowRef.current?.getBoundingClientRect()
      const labelRect = reasonLabelRef.current?.getBoundingClientRect()
      setReasonRowRect(rowRect)
      if (rowRect && labelRect) setReasonTailLeftPx(labelRect.left + labelRect.width / 2 - rowRect.left)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showCancelModalHint])

  // 튜토리얼 "이전" 등으로 이 단계를 벗어나면 뜬 채로 남아있던 안내 팝업을 정리
  useEffect(() => {
    if (!showCancelModalHint) { setErrorMsg(null); setConfirmMsg(null); setDoneMsg(null) }
  }, [showCancelModalHint])

  const handleCancel = async () => {
    if (!showCancelModalHint) {
      // 튜토리얼 밖(실제 팝업창)에서는 기존 방식 그대로 유지
      if (!cancelReason.trim()) { alert('결제 취소사유를 입력해주세요.'); return }
      if (!data?.paymentId) { alert('취소할 결제 정보가 없습니다.'); return }
      setSaving(true)
      const { error } = await cancelPayment(data.paymentId, cancelReason)
      setSaving(false)
      if (error) { alert(error.message || '결제취소 처리에 실패했습니다.'); return }
      try { if (window.opener && !window.opener.closed) window.opener.__refreshAppData?.() } catch {}
      alert('결제취소 처리되었습니다.')
      window.close()
      return
    }
    // 튜토리얼 중: 사유 미입력 시 안내만(다음 단계로 진행 안 함), 정상 입력 시 재확인 팝업부터 거쳐야 실제 취소가 진행됨
    if (!cancelReason.trim()) { setErrorMsg('결제취소 사유를 작성해주세요.'); return }
    if (!data?.paymentId) { setErrorMsg('취소할 결제 정보가 없습니다.'); return }
    setConfirmMsg('결제 건을 취소하면 복구할 수 없습니다. 결제취소를 진행하시려면 확인을 선택해 주세요.')
  }

  const performCancel = async () => {
    setConfirmMsg(null)
    setSaving(true)
    const { error } = await cancelPayment(data.paymentId, cancelReason)
    setSaving(false)
    if (error) { setErrorMsg(error.message || '결제취소 처리에 실패했습니다.'); return }
    try { if (window.opener && !window.opener.closed) window.opener.__refreshAppData?.() } catch {}
    // 임베디드(튜토리얼) 모드에서는 opener가 없으므로, 이 창 자체의 데이터를 서버 기준으로 다시 불러와
    // 청구/미납내역이 로컬 상태 불일치 없이 정확히 갱신되도록 함
    try { window.__refreshAppData?.() } catch {}
    setDoneMsg('결제취소 처리가 완료되었습니다.')
  }

  const renderPopup = (msg, onConfirmClick) => (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 3499, background: 'rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 4200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4 }}>
        <div style={{ position: 'relative', background: '#fff', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', minWidth: 290, minHeight: 140 }}>
          <p style={{ position: 'absolute', top: 10, left: 10, margin: 0, fontSize: 14, color: '#333' }}>{msg}</p>
          <button
            style={{ position: 'absolute', bottom: 10, right: 10, padding: '8px 24px', background: '#2166D4', color: '#fff', border: 'none', borderRadius: 9999, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={onConfirmClick}
          >확인</button>
        </div>
      </div>
    </>
  )

  const sectionTitle = (text) => (
    <div style={{display:'flex',alignItems:'center',gap:8,margin:'18px 0 10px'}}>
      <div style={{width:4,height:16,background:'#00a2ff',borderRadius:2}}/>
      <span style={{fontSize:14,fontWeight:700,color:'#333'}}>{text}</span>
    </div>
  )

  return (
    <div style={{fontFamily:'inherit',minHeight:'100vh',background:'#fff',padding:'24px 28px'}}>
      {/* 제목 + 버튼 */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:18,fontWeight:600,color:'#333',marginBottom:14}}>결제 취소</div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button className="sts-search-btn" disabled={saving} onClick={handleCancel}>결제취소하기</button>
          <button className="sts-reset-btn" onClick={()=>window.close()}>닫기</button>
        </div>
      </div>

      {/* 수강생 정보 헤더 */}
      <div style={{display:'flex',borderTop:'2px solid #555',borderBottom:'1px solid #ddd',background:'#f8f9fb'}}>
        <div style={{padding:'8px 20px',fontWeight:700,fontSize:13,color:'#333',borderRight:'1px solid #ddd',minWidth:180,display:'flex',alignItems:'center',justifyContent:'center'}}>수강생 정보</div>
        <div style={{padding:'8px 16px',fontSize:16,color:'#333'}}>{data?.studentName || '반이동_매뉴얼'} ({data?.birth || '01.01.01'})</div>
      </div>

      {/* 수강반 */}
      {sectionTitle('수강반')}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{borderTop:'2px solid #555',borderBottom:'1px solid #e0e0e0',background:'#f8f9fb'}}>
            {['번호','수강월','수강반','수강료'].map(h=>(
              <th key={h} style={{padding:'8px 12px',textAlign:'center',fontWeight:700,color:'#555'}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={{borderBottom:'1px solid #f0f0f0'}}>
            <td style={{padding:'8px 12px',textAlign:'center'}}>1</td>
            <td style={{padding:'8px 12px',textAlign:'center'}}>{data?.month || '2026-06'}</td>
            <td style={{padding:'8px 12px',textAlign:'center'}}>{data?.className || '이동완로_매뉴얼반'}</td>
            <td style={{padding:'8px 12px',textAlign:'center'}}>{data?.payAmt != null ? Number(data.payAmt).toLocaleString() : '170,000'}</td>
          </tr>
        </tbody>
      </table>

      {/* 결제정보 */}
      {sectionTitle('결제정보')}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <tbody>
          {[
            ['결제일자', data?.date || '2026.06.05'],
            ['결제구분', data?.payDiv || '현장결제'],
            ['결제방법', data?.payMethod || '현금'],
            ['결제금액', (data?.payAmt != null ? Number(data.payAmt).toLocaleString() : '170,000') + ' 원'],
          ].map(([label, value], i) => (
            <tr key={label} style={{borderTop: i===0 ? '2px solid #555' : 'none', borderBottom:'1px solid #f0f0f0'}}>
              <td style={{padding:'9px 16px',color:'#000',width:120,background:'#fafafa'}}>{label}</td>
              <td style={{padding:'9px 16px',color:'#333'}}>{value}</td>
            </tr>
          ))}
          <tr ref={reasonRowRef} style={{borderBottom:'1px solid #f0f0f0'}}>
            <td ref={reasonLabelRef} style={{padding:'9px 16px',background:'#fafafa',whiteSpace:'nowrap'}}>
              <span style={{color:'#ff3c00'}}>*</span><span style={{color:'#000'}}> 결제 취소사유</span>
            </td>
            <td style={{padding:'6px 16px'}}>
              <input
                value={cancelReason}
                onChange={e=>setCancelReason(e.target.value)}
                style={{width:'100%',height:28,boxSizing:'border-box',padding:'0 8px',border:'1px solid #ddd',borderRadius:4,fontSize:13,fontFamily:'inherit',outline:'none'}}
              />
            </td>
          </tr>
        </tbody>
      </table>
      {showCancelModalHint && reasonRowRect && !errorMsg && !confirmMsg && !doneMsg && (
        <TutorialTooltip
          rect={reasonRowRect}
          placement="bottom"
          tailLeftPx={reasonTailLeftPx}
          message={<><span style={{ color: '#ff3c00' }}>결제 취소 사유</span>를 작성하고 결제취소하기 버튼을 눌러주세요.</>}
        />
      )}
      {errorMsg && renderPopup(errorMsg, () => setErrorMsg(null))}
      {confirmMsg && renderPopup(confirmMsg, performCancel)}
      {doneMsg && renderPopup(doneMsg, () => { setDoneMsg(null); advance() })}
    </div>
  )
}
