import { useState } from 'react'
import '../../pages/Students.css'

const SAMPLE = [
  {
    id: 1,
    date: '2026.04.03',
    processStatus: '정상',
    payStatus: '수납',
    payDiv: '현장결제',
    payMethod: '카드',
    payAmt: '1,000',
    refund: '',
    cardNo: '',
    approvalNo: '',
  },
]

export default function BillingTab() {
  const [filter, setFilter] = useState('전체')
  const [checked, setChecked] = useState([])
  const toggleAll = () => setChecked(c => c.length===SAMPLE.length ? [] : SAMPLE.map(d=>d.id))
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
        <button className="family-add-btn"><span className="plus">+</span> 결제취소</button>
      </div>

      {/* 테이블 */}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{borderTop:'2px solid #666',borderBottom:'1px solid #e0e0e0',background:'#f8f9fb'}}>
            <th style={th}><input type="checkbox" checked={checked.length===SAMPLE.length} onChange={toggleAll}/></th>
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
          {SAMPLE.map(row=>(
            <tr key={row.id} style={{borderBottom:'1px solid #f0f0f0'}}>
              <td style={{...td,textAlign:'center'}}>
                <input type="checkbox" checked={checked.includes(row.id)} onChange={()=>toggle(row.id)}/>
              </td>
              <td style={{...td,textAlign:'center'}}>{row.date}</td>
              <td style={{...td,textAlign:'center'}}>{row.processStatus}</td>
              <td style={{...td,textAlign:'center'}}>{row.payStatus}</td>
              <td style={{...td,textAlign:'center'}}>{row.payDiv}</td>
              <td style={{...td,textAlign:'center'}}>{row.payMethod}</td>
              <td style={{...td,textAlign:'center'}}>{row.payAmt}</td>
              <td style={{...td,textAlign:'center'}}>{row.refund}</td>
              <td style={{...td,textAlign:'center'}}>{row.cardNo}</td>
              <td style={{...td,textAlign:'center'}}>{row.approvalNo}</td>
              <td style={{...td,textAlign:'center'}}>
                <button style={outlineBtn} onClick={()=>window.open('/payment-memo','_blank','width=650,height=700')}>메모</button>
              </td>
              <td style={{...td,textAlign:'center'}}>
                <div style={{display:'flex',gap:4,justifyContent:'center'}}>
                  <button style={outlineBtn}>현금영수증</button>
                  <button className="info-action-btn blue">출력</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const btnStyle = (bg) => ({
  padding:'5px 12px', background:bg, color:'#fff', border:'none',
  borderRadius:4, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
})

const outlineBtn = {
  padding:'4px 10px', background:'#fff', color:'#555',
  border:'1px solid #ccc', borderRadius:4, fontSize:12,
  cursor:'pointer', fontFamily:'inherit',
}

const th = {
  padding:'8px 10px', textAlign:'center', fontSize:13,
  fontWeight:700, color:'#555', whiteSpace:'nowrap',
}

const td = {
  padding:'6px 8px', verticalAlign:'middle', fontSize:13,
}
