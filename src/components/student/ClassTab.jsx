import { useState } from 'react'

const SAMPLE = [
  {
    id: 1,
    name: '중등부 > 중등 수학A 1교시',
    status: '수강',
    period: '2026.05.20~2999.12.31',
    teacher: '강사01',
    room: '101호',
    time: '15:00 ~ 17:00',
    days: { 일:false, 월:false, 화:true, 수:false, 목:true, 금:false, 토:true },
  },
]

const DAYS = ['일','월','화','수','목','금','토']

export default function ClassTab() {
  const [filter, setFilter] = useState('수강+종강')
  const [checked, setChecked] = useState([])
  const toggle = id => setChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id])

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
        <button style={btnStyle('#29ABE2')} onClick={()=>window.open('/class-register','_blank','width=650,height=800')}>+ 수강신청</button>
      </div>

      {/* 테이블 */}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead>
          <tr style={{borderTop:'2px solid #666',borderBottom:'1px solid #e0e0e0',background:'#f8f9fb'}}>
            <th style={th} rowSpan={2}>선택</th>
            <th style={th} rowSpan={2}>반명</th>
            <th style={th} rowSpan={2}>상태</th>
            <th style={th} rowSpan={2}>수강기간</th>
            <th style={th} rowSpan={2}>담임</th>
            <th style={th} rowSpan={2}>강의실</th>
            <th style={{...th,borderBottom:'1px solid #e0e0e0'}} colSpan={8}>수업시간</th>
          </tr>
          <tr style={{background:'#f8f9fb',borderBottom:'1px solid #e0e0e0'}}>
            <th style={th}>시간</th>
            {DAYS.map(d=><th key={d} style={th}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {SAMPLE.map(row=>(
            <tr key={row.id} style={{borderBottom:'1px solid #f0f0f0'}}>
              <td style={{...td,textAlign:'center'}}>
                <input type="checkbox" checked={checked.includes(row.id)} onChange={()=>toggle(row.id)}/>
              </td>
              <td style={td}>{row.name}</td>
              <td style={{...td,textAlign:'center'}}>{row.status}</td>
              <td style={{...td,textAlign:'center'}}>{row.period}</td>
              <td style={{...td,textAlign:'center'}}>{row.teacher}</td>
              <td style={{...td,textAlign:'center'}}>{row.room}</td>
              <td style={{...td,textAlign:'center'}}>{row.time}</td>
              {DAYS.map(d=>(
                <td key={d} style={{...td,textAlign:'center'}}>
                  {row.days[d] ? <span style={{color:'#333'}}>O</span> : ''}
                </td>
              ))}
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
