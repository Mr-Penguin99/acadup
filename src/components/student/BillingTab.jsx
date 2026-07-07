import { useState } from 'react'
import '../../pages/Students.css'
import { useAppData } from '../../contexts/AppDataContext'

export default function BillingTab({ studentId, studentName }) {
  const { payments } = useAppData()
  const [filter, setFilter] = useState('전체')
  const [checked, setChecked] = useState([])

  const rows = payments.filter(p => p.studentId === studentId).map(p => ({
    id: p.id,
    date: p.payDate,
    processStatus: '정상',
    payStatus: '수납',
    payDiv: '현장결제',
    payMethod: p.method,
    payAmt: p.amount,
    refund: '',
    cardNo: '',
    approvalNo: '',
    month: p.month,
    className: p.className,
  }))

  const toggleAll = () => setChecked(c => c.length===rows.length ? [] : rows.map(d=>d.id))
  const toggle = id => setChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id])

  return (
    <div>
      {/* 헤더 */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:14,height:14,border:'2px solid #F5841F',borderRadius:2}}/>
          <span style={{fontSize:14,fontWeight:700,color:'#333'}}>결제내역</span>
          <select value={filter} onChange={e=>setFilter(e.target.value)}
            style={{padding:'4px 8px',border:'1px solid #ddd',borderRadius:4,fontSize:13,fontFamily:'inherit',outline:'none'}}>
            <option>전체</option><option>결제</option><option>결제취소</option>
          </select>
        </div>
        <button className="family-add-btn" onClick={()=>{
          const target = checked.length > 0 ? rows.find(d=>d.id===checked[0]) : rows[0]
          if (!target) { alert('결제취소할 내역을 선택해주세요.'); return }
          sessionStorage.setItem('paymentCancelData', JSON.stringify({
            paymentId: target.id,
            date: target.date,
            payDiv: target.payDiv,
            payMethod: target.payMethod,
            payAmt: target.payAmt,
            month: target.month,
            className: target.className,
            studentName,
          }))
          const w = 600, h = 660
          const left = window.screenX + (window.outerWidth - w) / 2
          const top = window.screenY + (window.outerHeight - h) / 2
          window.open('/payment-cancel','_blank',`width=${w},height=${h},left=${left},top=${top},resizable=yes`)
        }}><span className="plus">+</span> 결제취소</button>
      </div>

      {/* 테이블 */}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{borderTop:'2px solid #666',borderBottom:'1px solid #e0e0e0',background:'#f8f9fb'}}>
            <th style={th}><input type="checkbox" checked={rows.length>0 && checked.length===rows.length} onChange={toggleAll}/></th>
            <th style={th}>결제일자</th>
            <th style={th}>처리상태</th>
            <th style={th}>결제상태</th>
            <th style={th}>결제구분</th>
            <th style={th}>결제방법</th>
            <th style={th}>결제금액</th>
            <th style={th}>환불금액</th>
            <th style={th}>카드번호</th>
            <th style={th}>승인번호</th>
            <th style={th}>메모</th>
            <th style={th}>기능</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={12} style={{textAlign:'center',padding:'24px 0',color:'#aaa',fontSize:13}}>결제 내역이 없습니다.</td></tr>
          ) : rows.map(row=>(
            <tr key={row.id} style={{borderBottom:'1px solid #f0f0f0'}}>
              <td style={{...td,textAlign:'center'}}>
                <input type="checkbox" checked={checked.includes(row.id)} onChange={()=>toggle(row.id)}/>
              </td>
              <td style={{...td,textAlign:'center'}}>{row.date}</td>
              <td style={{...td,textAlign:'center'}}>{row.processStatus}</td>
              <td style={{...td,textAlign:'center'}}>{row.payStatus}</td>
              <td style={{...td,textAlign:'center'}}>{row.payDiv}</td>
              <td style={{...td,textAlign:'center'}}>{row.payMethod}</td>
              <td style={{...td,textAlign:'center'}}>{row.payAmt.toLocaleString()}</td>
              <td style={{...td,textAlign:'center'}}>{row.refund}</td>
              <td style={{...td,textAlign:'center'}}>{row.cardNo}</td>
              <td style={{...td,textAlign:'center'}}>{row.approvalNo}</td>
              <td style={{...td,textAlign:'center'}}>
                <button style={outlineBtn} onClick={()=>{
                  const w = 650, h = 700
                  const left = window.screenX + (window.outerWidth - w) / 2
                  const top = window.screenY + (window.outerHeight - h) / 2
                  window.open('/payment-memo','_blank',`width=${w},height=${h},left=${left},top=${top},resizable=yes`)
                }}>메모</button>
              </td>
              <td style={{...td,textAlign:'center'}}>
                <div style={{display:'flex',gap:4,justifyContent:'center'}}>
                  <button style={outlineBtn}>현금영수증</button>
                  <button style={printBtn}>출력</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const outlineBtn = {
  padding:'4px 12px', background:'#fff', color:'#555',
  border:'1px solid #ccc', borderRadius:4, fontSize:12, fontWeight:400,
  cursor:'pointer', fontFamily:'inherit',
}

const printBtn = {
  padding:'4px 12px', background:'#00a2ff', color:'#fff',
  border:'1px solid #00a2ff', borderRadius:4, fontSize:12, fontWeight:400,
  cursor:'pointer', fontFamily:'inherit',
}

const th = {
  padding:'8px 10px', textAlign:'center', fontSize:13,
  fontWeight:700, color:'#555', whiteSpace:'nowrap',
}

const td = {
  padding:'6px 8px', verticalAlign:'middle', fontSize:13,
}
