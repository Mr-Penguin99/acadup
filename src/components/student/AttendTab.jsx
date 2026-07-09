import { useState } from 'react'
import { MonthPicker } from '../DatePicker'

const DAYS = Array.from({length:30}, (_,i) => i+1)
const WEEKENDS = [6,7,13,14,20,21,27,28]

const ATTEND_MAP = {
  '출석': '●',
  '지각': '◑',
  '조퇴': '◕',
  '결석': 'X',
  '미체크': '○',
}

const SAMPLE = [
  {
    id: 1,
    name: '중등 수학A 3교시',
    days: { 1: '미체크' },
  },
]

export default function AttendTab() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))

  return (
    <div>
      {/* 헤더 */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:14, height:14, border:'2px solid #F5841F', borderRadius:2}}/>
          <span style={{fontSize:15, fontWeight:700, color:'#333'}}>수강월</span>
          <MonthPicker value={month} onChange={v=>setMonth(v)}/>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12, fontSize:15, color:'#555'}}>
          <span><span style={{color:'#29ABE2', fontWeight:700, fontSize:15}}>●</span> : 출석</span>
          <span><span style={{color:'#29ABE2', fontWeight:700, fontSize:15}}>◑</span> : 지각</span>
          <span><span style={{color:'#E8445A', fontWeight:700, fontSize:15}}>◑</span> : 조퇴</span>
          <span><span style={{fontWeight:700, fontSize:15}}>X</span> : 결석</span>
          <span><span style={{fontWeight:700, fontSize:15}}>○</span> : 미체크</span>
        </div>
      </div>

      {/* 테이블 */}
      <div style={{overflowX:'auto'}}>
        <table style={{borderCollapse:'collapse', fontSize:12, minWidth:'100%'}}>
          <thead>
            <tr style={{borderTop:'2px solid #666', borderBottom:'1px solid #e0e0e0', background:'#f8f9fb'}}>
              <th style={{...th, minWidth:120, textAlign:'left', paddingLeft:12}}>반명</th>
              {DAYS.map(d=>(
                <th key={d} style={{
                  ...th, minWidth:26,
                  color: WEEKENDS.includes(d) ? '#E8445A' : '#555',
                }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SAMPLE.map(row=>(
              <tr key={row.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                <td style={{...td, textAlign:'left', paddingLeft:12, whiteSpace:'nowrap'}}>{row.name}</td>
                {DAYS.map(d=>{
                  const status = row.days[d]
                  return (
                    <td key={d} style={{...td, textAlign:'center', color: status==='출석'?'#29ABE2' : status==='지각'?'#29ABE2' : status==='조퇴'?'#E8445A' : status==='결석'?'#333' : '#aaa'}}>
                      {status ? ATTEND_MAP[status] : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th = {
  padding:'7px 4px', textAlign:'center', fontSize:13,
  fontWeight:700, color:'#555', whiteSpace:'nowrap',
}

const td = {
  padding:'6px 4px', verticalAlign:'middle', fontSize:13,
}
