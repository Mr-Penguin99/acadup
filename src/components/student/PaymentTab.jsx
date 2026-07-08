import { useState, useRef, useEffect } from 'react'
import '../../pages/Students.css'
import { useAppData } from '../../contexts/AppDataContext'
import { useTutorial } from '../TutorialContext'
import TutorialMultiSpotlight from '../TutorialMultiSpotlight'
import TutorialTooltip from '../TutorialTooltip'

export default function PaymentTab({ studentId, studentName, defaultFilter = '미납' }) {
  const { students, enrollments, payments } = useAppData()
  const studentBirth = students.find(s => s.id === studentId)?.birth || ''
  const [filter, setFilter] = useState(defaultFilter)
  const [checked, setChecked] = useState([])

  const { activeStep, isOpen, advance } = useTutorial()
  const firstRowCheckboxRef = useRef(null)
  const manualBtnRef = useRef(null)
  const payBtnRef = useRef(null)
  const [checkboxHintRect, setCheckboxHintRect] = useState(null)
  const [manualBtnRect, setManualBtnRect] = useState(null)
  const [payBtnRect, setPayBtnRect] = useState(null)

  const showCheckboxHint = isOpen && activeStep?.id === 'payment-checkbox-hint'
  const showManualBtnHint = isOpen && activeStep?.id === 'payment-manual-btn-hint'
  const showPayBtnHint = isOpen && activeStep?.id === 'payment-pay-btn-hint'

  useEffect(() => {
    if (!showCheckboxHint) return
    const measure = () => setCheckboxHintRect(firstRowCheckboxRef.current?.getBoundingClientRect())
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showCheckboxHint])

  useEffect(() => {
    if (!showManualBtnHint) return
    const measure = () => setManualBtnRect(manualBtnRef.current?.getBoundingClientRect())
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showManualBtnHint])

  useEffect(() => {
    if (!showPayBtnHint) return
    const measure = () => setPayBtnRect(payBtnRef.current?.getBoundingClientRect())
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showPayBtnHint])

  const handleManualBtnConfirm = () => advance()
  useEffect(() => {
    if (!showManualBtnHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handleManualBtnConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showManualBtnHint])

  const handlePayBtnConfirm = () => advance()
  useEffect(() => {
    if (!showPayBtnHint) return
    const handleKeyDown = e => { if (e.key !== 'Enter') return; handlePayBtnConfirm() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showPayBtnHint])

  const allRows = enrollments.filter(e => e.studentId === studentId).map(e => {
    const fee = parseInt(String(e.fee).replace(/[^0-9]/g, ''), 10) || 0
    const activePayments = payments.filter(p => p.enrollmentId === e.id && !p.cancelled)
    const paid = activePayments.reduce((sum, p) => sum + p.amount, 0)
    const unpaid = Math.max(fee - paid, 0)
    return {
      id: e.id,
      month: (e.startDate || '').slice(0, 7),
      className: e.className,
      item: '수강료01',
      billAmt: fee,
      tradeDate: paid > 0 ? (activePayments[0]?.payDate || '') : '',
      payMethod: paid > 0 ? (activePayments[0]?.method || '') : '',
      status: unpaid > 0 ? '미납' : '완납',
      payAmt: paid,
      refund: 0,
      unpaid,
    }
  })

  const rows = filter === '삭제' ? [] : allRows.filter(r =>
    filter === '미납+완납(환불)' ? true : filter === '미납' ? r.status === '미납' : r.status === '완납'
  )

  const toggleAll = () => {
    setChecked(c => c.length === rows.length ? [] : rows.map(d => d.id))
    if (showCheckboxHint) advance()
  }
  const toggle = id => {
    setChecked(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])
    if (showCheckboxHint) advance()
  }

  return (
    <div>
      {/* 헤더 */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:14,height:14,border:'2px solid #F5841F',borderRadius:2}}/>
          <span style={{fontSize:14,fontWeight:700,color:'#333'}}>수납내역</span>
          <select value={filter} onChange={e=>setFilter(e.target.value)}
            style={{padding:'4px 8px',border:'1px solid #ddd',borderRadius:4,fontSize:13,fontFamily:'inherit',outline:'none'}}>
            <option>미납+완납(환불)</option><option>미납</option><option>완납(환불)</option><option>삭제</option>
          </select>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button className="family-add-btn" ref={manualBtnRef} onClick={()=>{
            const target = checked.length > 0 ? rows.find(d=>d.id===checked[0]) : rows.find(r=>r.status==='미납')
            if (target) {
              sessionStorage.setItem('manualRegisterData', JSON.stringify({
                studentId, studentName, studentBirth,
                enrollmentId: target.id,
                className: target.className,
                month: target.month,
                item: target.item,
                billAmt: target.billAmt,
                unpaid: target.unpaid,
              }))
            } else {
              sessionStorage.removeItem('manualRegisterData')
            }
            if (showManualBtnHint) { advance(); return }
            const w = 650, h = 800
            const left = window.screenX + (window.outerWidth - w) / 2
            const top = window.screenY + (window.outerHeight - h) / 2
            window.open('/manual-register','_blank',`width=${w},height=${h},left=${left},top=${top},resizable=yes`)
          }}><span className="plus">+</span> 수기등록</button>
          <button className="family-add-btn" ref={payBtnRef} onClick={()=>{
            const targets = checked.length > 0 ? rows.filter(d=>checked.includes(d.id)) : rows.filter(r=>r.status==='미납').slice(0,1)
            if (targets.length > 0) {
              sessionStorage.setItem('paymentRegisterData', JSON.stringify({
                studentId, studentName, studentBirth,
                bills: targets.map(t => ({
                  enrollmentId: t.id,
                  className: t.className,
                  month: t.month,
                  item: t.item,
                  billAmt: t.billAmt,
                  unpaid: t.unpaid,
                })),
              }))
            } else {
              sessionStorage.removeItem('paymentRegisterData')
            }
            if (showPayBtnHint) { advance(); return }
            const w = 650, h = 800
            const left = window.screenX + (window.outerWidth - w) / 2
            const top = window.screenY + (window.outerHeight - h) / 2
            window.open('/payment-register','_blank',`width=${w},height=${h},left=${left},top=${top},resizable=yes`)
          }}><span className="plus">+</span> 수납</button>
        </div>
      </div>

      {/* 테이블 */}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{borderTop:'2px solid #666',borderBottom:'1px solid #e0e0e0',background:'#f8f9fb'}}>
            <th style={th}><input type="checkbox" checked={rows.length>0 && checked.length===rows.length} onChange={toggleAll}/></th>
            <th style={th}>수강월</th>
            <th style={th}>반명</th>
            <th style={th}>항목</th>
            <th style={th}>청구금액</th>
            <th style={th}>거래일</th>
            <th style={th}>수납방법</th>
            <th style={th} data-tutorial="status-header">상태</th>
            <th style={th}>수납금액</th>
            <th style={th}>환불금액</th>
            <th style={th}>미납금액</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={11} style={{textAlign:'center',padding:'24px 0',color:'#aaa',fontSize:13}}>수납 내역이 없습니다.</td></tr>
          ) : rows.map((row,idx)=>(
            <tr key={row.id} style={{borderBottom:'1px solid #f0f0f0'}}>
              <td style={{...td,textAlign:'center'}} ref={idx===0 ? firstRowCheckboxRef : null}>
                <input type="checkbox" checked={checked.includes(row.id)} onChange={()=>toggle(row.id)}/>
              </td>
              <td style={{...td,textAlign:'center'}}>{row.month}</td>
              <td style={td}>{row.className}</td>
              <td style={{...td,textAlign:'center'}}>{row.item}</td>
              <td style={{...td,textAlign:'center'}}>{row.billAmt.toLocaleString()}</td>
              <td style={{...td,textAlign:'center'}}>{row.tradeDate}</td>
              <td style={{...td,textAlign:'center'}}>{row.payMethod}</td>
              <td style={{...td,textAlign:'center',color:row.status==='미납'?'#0100FF':'#333'}}>{row.status}</td>
              <td style={{...td,textAlign:'center'}}>{row.payAmt ? row.payAmt.toLocaleString() : ''}</td>
              <td style={{...td,textAlign:'center'}}>{row.refund || ''}</td>
              <td style={{...td,textAlign:'center'}}>{row.unpaid ? row.unpaid.toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showCheckboxHint && checkboxHintRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[checkboxHintRect]}
          />
          <TutorialTooltip
            rect={checkboxHintRect}
            placement="top"
            message="처리할 수납내역을 선택해 주세요."
          />
        </>
      )}
      {showManualBtnHint && manualBtnRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[{ rect: manualBtnRect, pad: 10 }]}
          />
          <TutorialTooltip
            rect={manualBtnRect}
            placement="top"
            rightAlign
            message="수기등록 버튼을 눌러 해당 청구서를 수정할 수 있습니다."
            onConfirm={handleManualBtnConfirm}
          />
        </>
      )}
      {showPayBtnHint && payBtnRect && (
        <>
          <TutorialMultiSpotlight
            boundsRect={{ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }}
            holes={[{ rect: payBtnRect, pad: 10 }]}
          />
          <TutorialTooltip
            rect={payBtnRect}
            placement="top"
            rightAlign
            message="수납 버튼을 눌러 결제를 진행합니다."
            onConfirm={handlePayBtnConfirm}
          />
        </>
      )}
    </div>
  )
}

const th = {
  padding:'8px 10px', textAlign:'center', fontSize:13,
  fontWeight:700, color:'#555', whiteSpace:'nowrap',
}

const td = {
  padding:'6px 8px', verticalAlign:'middle', fontSize:13,
}
