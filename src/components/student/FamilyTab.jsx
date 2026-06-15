import { useState } from 'react'
import '../../pages/Students.css'

const defaultRow = () => ({
  id: Date.now(),
  name: '', relation: '', isPrimary: false,
  phone: '', email1: '', email2: '', emailType: '직접입력',
  msgType: '전체수신',
})

export default function FamilyTab() {
  const [rows, setRows] = useState([defaultRow()])

  const addRow = () => setRows(r => [...r, defaultRow()])
  const removeRow = id => setRows(r =>
    r.length === 1
      ? [{ ...defaultRow(), id: r[0].id }]
      : r.filter(x => x.id !== id)
  )
  const updateRow = (id, key, val) => setRows(r => r.map(x => x.id === id ? {...x, [key]: val} : x))

  return (
    <div>
      {/* 헤더 */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:14,height:14,border:'2px solid #F5841F',borderRadius:2}}/>
          <span style={{fontSize:14,fontWeight:700,color:'#333'}}>가족사항</span>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={() => {}} className="family-save-btn">저장</button>
          <button onClick={addRow} className="family-add-btn"><span className="plus">+</span> 추가</button>
        </div>
      </div>

      {/* 테이블 */}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{borderTop:'2px solid #666',borderBottom:'1px solid #e0e0e0',background:'#f8f9fb'}}>
            <th style={th}>순번</th>
            <th style={th}><span style={{color:'#F5841F'}}>*</span> 성명</th>
            <th style={th}><span style={{color:'#F5841F'}}>*</span> 관계</th>
            <th style={th}>주보호자</th>
            <th style={th}><span style={{color:'#F5841F'}}>*</span> 휴대폰번호</th>
            <th style={{...th,minWidth:220}}>이메일</th>
            <th style={th}>메세지수신</th>
            <th style={th}>삭제</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id} style={{borderBottom:'1px solid #f0f0f0'}}>
              <td style={td}>{idx + 1}</td>
              <td style={td}>
                <input style={inputStyle} value={row.name} onChange={e => updateRow(row.id,'name',e.target.value)}/>
              </td>
              <td style={td}>
                <select style={inputStyle} value={row.relation} onChange={e => updateRow(row.id,'relation',e.target.value)}>
                  <option value="">선택</option>
                  <option>부</option><option>모</option><option>형제</option><option>자매</option>
                  <option>조부</option><option>조모</option><option>기타</option>
                </select>
              </td>
              <td style={{...td,textAlign:'center'}}>
                <input type="checkbox" checked={row.isPrimary} onChange={e => updateRow(row.id,'isPrimary',e.target.checked)}/>
              </td>
              <td style={td}>
                <input style={inputStyle} placeholder="010-0000-0000" value={row.phone} onChange={e => updateRow(row.id,'phone',e.target.value)}/>
              </td>
              <td style={td}>
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <input style={{...inputStyle,width:90}} value={row.email1} onChange={e => updateRow(row.id,'email1',e.target.value)}/>
                  <span>@</span>
                  <input style={{...inputStyle,width:90}} value={row.email2} onChange={e => updateRow(row.id,'email2',e.target.value)}/>
                  <select style={{...inputStyle,width:80}} value={row.emailType} onChange={e => updateRow(row.id,'emailType',e.target.value)}>
                    <option>직접입력</option><option>gmail.com</option><option>naver.com</option><option>kakao.com</option>
                  </select>
                </div>
              </td>
              <td style={td}>
                <select style={{...inputStyle,width:90}} value={row.msgType} onChange={e => updateRow(row.id,'msgType',e.target.value)}>
                  <option>전체수신</option><option>SMS수신</option><option>알림톡수신</option><option>수신안함</option>
                </select>
              </td>
              <td style={{...td,textAlign:'center'}}>
                <button onClick={() => removeRow(row.id)} style={{
                  width:24,height:24,background:'#fff',color:'#00a2ff',border:'1px solid #ddd',
                  borderRadius:4,cursor:'pointer',fontSize:14,lineHeight:1,
                }}>−</button>
              </td>
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
  padding:'6px 8px', textAlign:'center', verticalAlign:'middle',
}

const inputStyle = {
  padding:'5px 8px', border:'1px solid #ddd', borderRadius:4,
  fontSize:12, fontFamily:'inherit', outline:'none', color:'#333', width:'100%',
}
