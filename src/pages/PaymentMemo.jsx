import { useState } from 'react'

export default function PaymentMemo() {
  const [memo, setMemo] = useState('')

  return (
    <div style={{fontFamily:"'Noto Sans KR', sans-serif", padding:'20px', fontSize:13, color:'#333'}}>
      {/* 헤더 */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:12, borderBottom:'1px solid #e0e0e0', marginBottom:20}}>
        <span style={{fontSize:17, fontWeight:700}}>수납메모 등록</span>
        <div style={{display:'flex', gap:6}}>
          <button style={btnStyle('#29ABE2')}>저장</button>
          <button style={btnStyle('#E8445A')}>삭제</button>
          <button style={btnStyle('#555')} onClick={()=>window.close()}>닫기</button>
        </div>
      </div>

      {/* 수강생 정보 */}
      <table style={{width:'100%', borderCollapse:'collapse', marginBottom:20}}>
        <tbody>
          <tr style={{borderTop:'2px solid #555', borderBottom:'1px solid #e0e0e0'}}>
            <td style={labelCell}>수강생 정보</td>
            <td style={valueCell}>예비01 (01.01.01)</td>
          </tr>
        </tbody>
      </table>

      {/* 수강반 */}
      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
        <div style={{width:14, height:14, background:'#29ABE2', borderRadius:2}}/>
        <span style={{fontSize:14, fontWeight:700}}>수강반</span>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse', marginBottom:20}}>
        <thead>
          <tr style={{borderTop:'2px solid #666', borderBottom:'1px solid #e0e0e0', background:'#f8f9fb'}}>
            <th style={th}>순번</th>
            <th style={th}>수강월</th>
            <th style={th}>수강반</th>
            <th style={th}>수강료</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{borderBottom:'1px solid #f0f0f0'}}>
            <td style={{...td, color:'#F5841F'}}>1</td>
            <td style={td}>2026-02</td>
            <td style={td}>중등부 &gt; 중등 수학A 3교시</td>
            <td style={td}>1,000</td>
          </tr>
        </tbody>
      </table>

      {/* 결제정보 */}
      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
        <div style={{width:14, height:14, background:'#29ABE2', borderRadius:2}}/>
        <span style={{fontSize:14, fontWeight:700}}>결제정보</span>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <tbody>
          <tr style={{borderTop:'1px solid #e0e0e0', borderBottom:'1px solid #e0e0e0'}}>
            <td style={labelCell}>결제일자</td>
            <td style={valueCell}>2026.04.03</td>
          </tr>
          <tr style={{borderBottom:'1px solid #e0e0e0'}}>
            <td style={labelCell}>결제방식</td>
            <td style={valueCell}>카드결제</td>
          </tr>
          <tr style={{borderBottom:'1px solid #e0e0e0'}}>
            <td style={labelCell}>결제항목</td>
            <td style={valueCell}>교재</td>
          </tr>
          <tr style={{borderBottom:'1px solid #e0e0e0'}}>
            <td style={labelCell}>결제금액</td>
            <td style={valueCell}>1,000 원</td>
          </tr>
          <tr style={{borderBottom:'1px solid #e0e0e0'}}>
            <td style={labelCell}>
              <span style={{color:'#F5841F'}}>*</span> 메모
            </td>
            <td style={valueCell}>
              <textarea style={{
                width:'100%', height:100, padding:'6px 8px',
                border:'1px solid #ddd', borderRadius:4, resize:'vertical',
                fontFamily:'inherit', fontSize:13, outline:'none', boxSizing:'border-box',
              }} value={memo} onChange={e=>setMemo(e.target.value)}/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const btnStyle = (bg) => ({
  padding:'6px 14px', background:bg, color:'#fff', border:'none',
  borderRadius:4, fontSize:13, fontWeight:400, cursor:'pointer', fontFamily:'inherit',
})

const labelCell = {
  padding:'8px 12px', background:'#f8f9fb', fontWeight:600,
  fontSize:13, color:'#444', width:100, textAlign:'center',
  borderRight:'1px solid #e0e0e0', whiteSpace:'nowrap',
}

const valueCell = {
  padding:'8px 12px', fontSize:13, color:'#333',
}

const th = {
  padding:'8px 10px', textAlign:'center', fontSize:13,
  fontWeight:700, color:'#555', whiteSpace:'nowrap',
}

const td = {
  padding:'7px 10px', textAlign:'center', verticalAlign:'middle', fontSize:13,
}
