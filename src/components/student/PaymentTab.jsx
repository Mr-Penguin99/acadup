import { useState } from 'react'
import '../../pages/Students.css'

const SAMPLE = [
  {
    id: 1,
    month: '2026-06',
    className: '중등부 > 중등 수학A 1교시',
    item: '수강료01',
    billAmt: '1,000',
    tradeDate: '',
    payMethod: '',
    status: '미납',
    payAmt: '',
    refund: '',
    unpaid: '1,000',
  },
]

export default function PaymentTab() {
  const [filter, setFilter] = useState('미납+완납(환불)')
  const [checked, setChecked] = useState([])
  const toggleAll = () => setChecked(c => c.length === SAMPLE.length ? [] : SAMPLE.map(d => d.id))
  const toggle = id => setChecked(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])

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
          <button className="family-add-btn" onClick={()=>{
            if(checked.length > 0){
              const row = SAMPLE.find(d=>d.id===checked[0])
              sessionStorage.setItem('manualRegisterData', JSON.stringify(row))
            } else {
              sessionStorage.removeItem('manualRegisterData')
            }
            window.open('/manual-register','_blank','width=650,height=800')
          }}><span className="plus">+</span> 수기등록</button>
          <button className="family-add-btn" onClick={()=>window.open('/payment-register','_blank','width=650,height=800')}><span className="plus">+</span> 수납</button>
        </div>
      </div>

      {/* 테이블 */}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{borderTop:'2px solid #666',borderBottom:'1px solid #e0e0e0',background:'#f8f9fb'}}>
            <th style={th}><input type="checkbox" checked={checked.length===SAMPLE.length} onChange={toggleAll}/></th>
            <th style={th}>수강월</th>
            <th style={th}>반명</th>
            <th style={th}>항목</th>
            <th style={th}>청구금액</th>
            <th style={th}>거래일</th>
            <th style={th}>수납방법</th>
            <th style={th}>상태</th>
            <th style={th}>수납금액</th>
            <th style={th}>환불금액</th>
            <th style={th}>미납금액</th>
          </tr>
        </thead>
        <tbody>
          {SAMPLE.map(row=>(
            <tr key={row.id} style={{borderBottom:'1px solid #f0f0f0'}}>
              <td style={{...td,textAlign:'center'}}>
                <input type="checkbox" checked={checked.includes(row.id)} onChange={()=>toggle(row.id)}/>
              </td>
              <td style={{...td,textAlign:'center'}}>{row.month}</td>
              <td style={td}>{row.className}</td>
              <td style={{...td,textAlign:'center'}}>{row.item}</td>
              <td style={{...td,textAlign:'center'}}>{row.billAmt}</td>
              <td style={{...td,textAlign:'center'}}>{row.tradeDate}</td>
              <td style={{...td,textAlign:'center'}}>{row.payMethod}</td>
              <td style={{...td,textAlign:'center',color:row.status==='미납'?'#29ABE2':'#333'}}>{row.status}</td>
              <td style={{...td,textAlign:'center'}}>{row.payAmt}</td>
              <td style={{...td,textAlign:'center'}}>{row.refund}</td>
              <td style={{...td,textAlign:'center'}}>{row.unpaid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const btnStyle = (bg) => ({
  padding:'6px 14px', background:bg, color:'#fff', border:'none',
  borderRadius:4, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
})

const th = {
  padding:'8px 10px', textAlign:'center', fontSize:13,
  fontWeight:700, color:'#555', whiteSpace:'nowrap',
}

const td = {
  padding:'6px 8px', verticalAlign:'middle', fontSize:13,
}
