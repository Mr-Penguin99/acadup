import { useState } from 'react'
import '../../pages/Students.css'

export default function ClassTab({ onRegisterClick, tutorialShowEnrollment, enrollmentRowRef }) {
  const [filter, setFilter] = useState('수강+종강')

  return (
    <div>
      {/* 헤더 */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:14,height:14,border:'2px solid #F5841F',borderRadius:2}}/>
          <span style={{fontSize:14,fontWeight:700,color:'#333'}}>수강사항</span>
          <select value={filter} onChange={e=>setFilter(e.target.value)}
            style={{padding:'4px 8px',border:'1px solid #ddd',borderRadius:4,fontSize:13,fontFamily:'inherit',outline:'none'}}>
            <option>수강+종강</option><option>수강</option><option>종강</option>
          </select>
        </div>
        <button className="family-add-btn" onClick={onRegisterClick ?? (()=>window.open('/class-register','_blank','width=650,height=800'))}><span className="plus">+</span> 수강신청</button>
      </div>

      {/* 테이블 */}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{borderTop:'2px solid #666',borderBottom:'1px solid #e0e0e0',background:'#f8f9fb'}}>
            <th style={th}>선택</th>
            <th style={th}>반명</th>
            <th style={th}>상태</th>
            <th style={th}>수강기간</th>
            <th style={th}>담임</th>
            <th style={th}>강의실</th>
            <th style={th} colSpan={8}>수업시간</th>
          </tr>
        </thead>
        <tbody>
          {tutorialShowEnrollment ? (
            <tr ref={enrollmentRowRef} style={{borderBottom:'1px solid #e0e0e0'}}>
              <td style={{...td,textAlign:'center'}}><input type="checkbox" defaultChecked readOnly /></td>
              <td style={td}>중등 수학A 1교시</td>
              <td style={{...td,textAlign:'center',color:'#29ABE2',fontWeight:600}}>수강</td>
              <td style={{...td,textAlign:'center'}}>2022.01.01~2999.12.31</td>
              <td style={{...td,textAlign:'center'}}>강사01</td>
              <td style={{...td,textAlign:'center'}}>101호</td>
              <td style={td} colSpan={8} />
            </tr>
          ) : (
            <tr>
              <td colSpan={14} style={{padding:'32px 0',textAlign:'center',fontSize:13,color:'#aaa',borderBottom:'1px solid #e0e0e0'}}>
                수강 내역이 없습니다.
              </td>
            </tr>
          )}
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
