import { useEffect, useState } from 'react'
import './Students.css'
import { useAppData } from '../contexts/AppDataContext'

export default function PaymentCancel() {
  const { deletePayment } = useAppData()
  const [data, setData] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('paymentCancelData')
    if (raw) setData(JSON.parse(raw))
  }, [])

  const handleCancel = async () => {
    if (!cancelReason.trim()) { alert('결제 취소사유를 입력해주세요.'); return }
    if (!data?.paymentId) { alert('취소할 결제 정보가 없습니다.'); return }
    setSaving(true)
    const { error } = await deletePayment(data.paymentId)
    setSaving(false)
    if (error) { alert(error.message || '결제취소 처리에 실패했습니다.'); return }
    try { if (window.opener && !window.opener.closed) window.opener.__refreshAppData?.() } catch {}
    alert('결제취소 처리되었습니다.')
    window.close()
  }

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
          <button className="sts-search-btn" style={{fontWeight:500}} disabled={saving} onClick={handleCancel}>결제취소하기</button>
          <button className="sts-reset-btn" style={{fontWeight:500}} onClick={()=>window.close()}>창닫기</button>
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
          <tr style={{borderBottom:'1px solid #f0f0f0'}}>
            <td style={{padding:'9px 16px',background:'#fafafa',whiteSpace:'nowrap'}}>
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
    </div>
  )
}
