import { useState } from 'react'
import './ClassCreate.css'

const START_HOURS = Array.from({length:19},(_,i)=>String(i+5).padStart(2,'0'))  // 05~23
const END_HOURS   = Array.from({length:19},(_,i)=>String(i+6).padStart(2,'0'))  // 06~24
const MINS        = ['00','30']
const DAYS  = ['일','월','화','수','목','금','토']

const emptyLesson  = () => ({ id:Date.now()+Math.random(), sh:'09', sm:'00', eh:'10', em:'00', days:{일:false,월:false,화:false,수:false,목:false,금:false,토:false} })
const emptyTeacher = () => ({ id:Date.now()+Math.random(), name:'', homeroom:false, subject:'' })
const emptyPayment = () => ({ id:Date.now()+Math.random(), item:'', price:'', required:true, cycle:'' })

export default function ClassCreate() {
  const [form, setForm] = useState({
    code:'', group:'', name:'',
    subject:'', room:'', capacity:'',
    payCycle:'1개월납', payDay:'1',
    opType:'기간반', opFrom:'', opTo:'',
  })
  const [lessons,  setLessons]  = useState([emptyLesson()])
  const [teachers, setTeachers] = useState([emptyTeacher()])
  const [payments, setPayments] = useState([emptyPayment()])
  const [fromFocus, setFromFocus] = useState(false)
  const [toFocus,   setToFocus]   = useState(false)

  const setF = (key, val) => setForm(f => ({...f, [key]: val}))

  /* 수업 */
  const addLesson    = () => setLessons(p => [...p, emptyLesson()])
  const removeLesson = id => setLessons(p => p.length===1 ? [emptyLesson()] : p.filter(r=>r.id!==id))
  const updateLesson = (id, key, val) => setLessons(p => p.map(r => r.id===id ? {...r, [key]:val} : r))
  const toggleDay    = (id, d) => setLessons(p => p.map(r => r.id===id ? {...r, days:{...r.days, [d]:!r.days[d]}} : r))

  /* 강사 */
  const addTeacher    = () => setTeachers(p => [...p, emptyTeacher()])
  const removeTeacher = id => setTeachers(p => p.length===1 ? [emptyTeacher()] : p.filter(r=>r.id!==id))
  const updateTeacher = (id, key, val) => setTeachers(p => p.map(r => r.id===id ? {...r, [key]:val} : r))

  /* 수납 */
  const addPayment    = () => setPayments(p => [...p, emptyPayment()])
  const removePayment = id => setPayments(p => p.length===1 ? [emptyPayment()] : p.filter(r=>r.id!==id))
  const updatePayment = (id, key, val) => setPayments(p => p.map(r => r.id===id ? {...r, [key]:val} : r))

  const formatPrice = val => val.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  const handleNew  = () => { setForm({code:'',group:'',name:'',subject:'',room:'',capacity:'',payCycle:'1개월납',payDay:'1',opType:'기간반',opFrom:'',opTo:''}); setLessons([emptyLesson()]); setTeachers([emptyTeacher()]); setPayments([emptyPayment()]) }
  const handleSave = () => alert('저장되었습니다.')

  return (
    <div className="cc-wrap">
      {/* 헤더 */}
      <div className="cc-header">
        <span className="cc-title">반 등록</span>
      </div>

      <div className="cc-btn-row">
        <button className="cc-btn cc-btn-save" onClick={handleSave}>저장</button>
        <button className="cc-btn cc-btn-new"  onClick={handleNew}>신규 반 등록</button>
      </div>

      <div className="cc-body">
        <div className="cc-box">
        {/* 기본 정보 그리드 */}
        <table className="cc-info-table">
          <tbody>
            <tr>
              <td className="cc-label"><span className="cc-req">*</span>반 코드</td>
              <td className="cc-cell">
                <input className="cc-input" placeholder="미입력시 자동부여" value={form.code} onChange={e=>setF('code',e.target.value)}/>
              </td>
              <td className="cc-label"><span className="cc-req">*</span>반 명</td>
              <td className="cc-cell">
                <select className="cc-select" value={form.group} onChange={e=>setF('group',e.target.value)}>
                  <option value="">반그룹 선택</option>
                </select>
                <input className="cc-input" style={{flex:1}} value={form.name} onChange={e=>setF('name',e.target.value)}/>
              </td>
            </tr>
            <tr>
              <td className="cc-label"><span className="cc-req">*</span>과목명(과정명)</td>
              <td className="cc-cell">
                <select className="cc-select" value={form.subject} onChange={e=>setF('subject',e.target.value)}>
                  <option value="">선택</option>
                  <option>국어</option><option>수학</option><option>영어</option><option>과학</option><option>사회</option>
                </select>
              </td>
              <td className="cc-label">강의실/정원</td>
              <td className="cc-cell">
                <select className="cc-select" value={form.room} onChange={e=>setF('room',e.target.value)}>
                  <option value="">강의실선택</option>
                </select>
                <span className="cc-slash">/</span>
                <input className="cc-input cc-input-sm" value={form.capacity} onChange={e=>setF('capacity',e.target.value)}/>
              </td>
            </tr>
            <tr>
              <td className="cc-label"><span className="cc-req">*</span>납부주기</td>
              <td className="cc-cell">
                <select className="cc-select" value={form.payCycle} onChange={e=>setF('payCycle',e.target.value)}>
                  <option value="">선택</option><option>일시납</option><option>1개월납</option><option>2개월납</option><option>3개월납</option><option>4개월납</option><option>5개월납</option><option>6개월납</option>
                </select>
              </td>
              <td className="cc-label"><span className="cc-req">*</span>납부기준일</td>
              <td className="cc-cell">
                <input className="cc-input cc-input-sm" style={{textAlign:'center'}} value={form.payDay} onChange={e=>setF('payDay',e.target.value)}/>
              </td>
            </tr>
            <tr>
              <td className="cc-label"><span className="cc-req">*</span>운영방식</td>
              <td className="cc-cell">
                <select className="cc-select" value={form.opType} onChange={e=>setF('opType',e.target.value)}>
                  <option>기간반</option><option>회차반</option>
                </select>
              </td>
              <td className="cc-label">운영기간</td>
              <td className="cc-cell">
                <input type="date" className={`cc-input cc-input-date${(!form.opFrom && !fromFocus) ? ' cc-date-empty' : ''}`} value={form.opFrom} onChange={e=>setF('opFrom',e.target.value)} onFocus={()=>setFromFocus(true)} onBlur={()=>setFromFocus(false)}/>
                <span style={{margin:'0 6px',color:'#999'}}>~</span>
                <input type="date" className={`cc-input cc-input-date${(!form.opTo && !toFocus) ? ' cc-date-empty' : ''}`} value={form.opTo} onChange={e=>setF('opTo',e.target.value)} onFocus={()=>setToFocus(true)} onBlur={()=>setToFocus(false)}/>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 수업 */}
        <div className="cc-section">
          <div className="cc-section-label">수업</div>
          <div className="cc-section-body">
            <div className="cc-add-row">
              <button className="cc-add-btn" onClick={addLesson}>+ 추가</button>
            </div>
            <table className="cc-sub-table">
              <thead>
                <tr>
                  <th colSpan={7}>수업시간</th>
                  {DAYS.map(d=><th key={d}>{d}</th>)}
                  <th className="cc-th-del">삭제</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map(r=>(
                  <tr key={r.id}>
                    <td className="cc-time-td cc-time-td-first">
                      <select className="cc-time-sel" value={r.sh} onChange={e=>updateLesson(r.id,'sh',e.target.value)}>
                        {START_HOURS.map(h=><option key={h}>{h}</option>)}
                      </select>
                    </td>
                    <td className="cc-time-sep">:</td>
                    <td className="cc-time-td"><select className="cc-time-sel" value={r.sm} onChange={e=>updateLesson(r.id,'sm',e.target.value)}>{MINS.map(m=><option key={m}>{m}</option>)}</select></td>
                    <td className="cc-time-sep">~</td>
                    <td className="cc-time-td"><select className="cc-time-sel" value={r.eh} onChange={e=>updateLesson(r.id,'eh',e.target.value)}>{END_HOURS.map(h=><option key={h}>{h}</option>)}</select></td>
                    <td className="cc-time-sep">:</td>
                    <td className="cc-time-td cc-time-td-last"><select className="cc-time-sel" value={r.em} onChange={e=>updateLesson(r.id,'em',e.target.value)}>{MINS.map(m=><option key={m}>{m}</option>)}</select></td>
                    {DAYS.map(d=>(
                      <td key={d} style={{textAlign:'center'}}>
                        <input type="checkbox" checked={r.days[d]} onChange={()=>toggleDay(r.id,d)}/>
                      </td>
                    ))}
                    <td className="cc-td-del">
                      <button className="cc-minus-btn" onClick={()=>removeLesson(r.id)}>－</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 강사 */}
        <div className="cc-section">
          <div className="cc-section-label">강사</div>
          <div className="cc-section-body">
            <div className="cc-add-row">
              <button className="cc-add-btn" onClick={addTeacher}>+ 추가</button>
            </div>
            <table className="cc-sub-table" style={{tableLayout:'fixed'}}>
              <thead>
                <tr>
                  <th style={{width:'240px'}}>강사</th>
                  <th style={{width:'150px'}}>담임</th>
                  <th>과목</th>
                  <th className="cc-th-del">삭제</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(r=>(
                  <tr key={r.id}>
                    <td>
                      <select className="cc-select" style={{width:'100%'}} value={r.name} onChange={e=>updateTeacher(r.id,'name',e.target.value)}>
                        <option value="">선택</option>
                      </select>
                    </td>
                    <td style={{textAlign:'center'}}>
                      <input type="checkbox" checked={r.homeroom} onChange={e=>updateTeacher(r.id,'homeroom',e.target.checked)}/>
                    </td>
                    <td>
                      <input className="cc-input" style={{width:'100%'}} value={r.subject} onChange={e=>updateTeacher(r.id,'subject',e.target.value)}/>
                    </td>
                    <td className="cc-td-del">
                      <button className="cc-minus-btn" onClick={()=>removeTeacher(r.id)}>－</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 수납 */}
        <div className="cc-section">
          <div className="cc-section-label">수납</div>
          <div className="cc-section-body">
            <div className="cc-add-row">
              <button className="cc-add-btn" onClick={addPayment}>+ 추가</button>
            </div>
            <table className="cc-sub-table">
              <thead>
                <tr>
                  <th style={{width:'25%'}}>수납항목</th>
                  <th style={{width:'25%'}}>기준가격</th>
                  <th>필수여부</th>
                  <th>청구주기</th>
                  <th className="cc-th-del">삭제</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(r=>(
                  <tr key={r.id}>
                    <td>
                      <select className="cc-select" style={{width:'100%'}} value={r.item} onChange={e=>updatePayment(r.id,'item',e.target.value)}>
                        <option value="">선택</option>
                        <option>수강료01</option><option>수강료02</option>
                        <option>교재(서적)01</option><option>교재(서적)02</option>
                        <option>교재(프린트물)01</option><option>교재(프린트물)02</option>
                        <option>교재(콘텐츠)01</option><option>교재(콘텐츠)02</option>
                      </select>
                    </td>
                    <td>
                      <input className="cc-input" style={{width:'100%',textAlign:'right'}} value={r.price} onChange={e=>updatePayment(r.id,'price',formatPrice(e.target.value))} placeholder="0"/>
                    </td>
                    <td style={{textAlign:'center'}}>
                      <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,fontSize:13}}>
                        <input type="checkbox" checked={r.required} onChange={e=>updatePayment(r.id,'required',e.target.checked)}/>
                        필수
                      </label>
                    </td>
                    <td>
                      <select className="cc-select" style={{width:'100%'}} value={r.cycle} onChange={e=>updatePayment(r.id,'cycle',e.target.value)}>
                        <option value="">선택</option>
                        <option>월납</option><option>일시납</option>
                      </select>
                    </td>
                    <td className="cc-td-del">
                      <button className="cc-minus-btn" onClick={()=>removePayment(r.id)}>－</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>{/* cc-box */}
      </div>
    </div>
  )
}
