import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './Dashboard.css'
import TopNav from '../components/TopNav'

const MENUS = [
  { id: 'students',    icon: '/icons/students.svg',     label: '수강생관리' },
  { id: 'payments',   icon: '/icons/payments.svg',     label: '수납관리' },
  { id: 'classes',    icon: '/icons/classes.svg',      label: '반관리' },
  { id: 'lessons',    icon: '/icons/lessons.svg',      label: '수업관리' },
  { id: 'consult',    icon: '/icons/consult.svg',      label: '상담관리' },
  { id: 'vehicle',    icon: '/icons/vehicle.svg',      label: '차량관리' },
  { id: 'staff',      icon: '/icons/staff.svg',        label: '직원관리' },
  { id: 'ledger',     icon: '/icons/ledger.svg',       label: '장부관리' },
  { id: 'management', icon: '/icons/management.svg',   label: '경영현황' },
  { id: 'ai',         icon: '/icons/ai.svg',           label: 'AI학원경영' },
  { id: 'salary',     icon: '/icons/salary.svg',       label: '급여관리' },
  { id: 'labor',      icon: '/icons/labor.svg',        label: '노무관리' },
  { id: 'accounting', icon: '/icons/acccounting.svg',  label: '회계관리' },
  { id: 'shop',       icon: '/icons/shop.svg',         label: '회원전용몰' },
]

const PAYMENTS = [
  { name: '반이동_매뉴얼',     cls: '이동완료_매뉴얼반',        period: '2026년05월분', amount: '171,000원' },
  { name: '예비학생',          cls: '중등부>중등 수학A 1교시',  period: '2026년05월분', amount: '1,000원' },
  { name: '수강생05',          cls: '중등부>중등 수학A 3교시',  period: '2026년05월분', amount: '1,000원' },
  { name: '수강생_납부기준일', cls: '테스트반>납부기준일',      period: '2026년04월분', amount: '1,234원' },
]

const incomeData = [
  { month: '2월', 수입: 0,    지출: 0,   수익: 0 },
  { month: '3월', 수입: 300,  지출: 200, 수익: 100 },
  { month: '4월', 수입: 1200, 지출: 700, 수익: 400 },
  { month: '5월', 수입: 1250, 지출: 0,   수익: 0 },
]

function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: prevDays - firstDay + 1 + i, type: 'prev' })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, type: 'current' })
  }
  while (days.length < 42) {
    days.push({ day: days.length - firstDay - daysInMonth + 1, type: 'next' })
  }

  const prevMonth = () => month === 0 ? (setYear(y => y-1), setMonth(11)) : setMonth(m => m-1)
  const nextMonth = () => month === 11 ? (setYear(y => y+1), setMonth(0)) : setMonth(m => m+1)

  return (
    <div className="calendar">
      <div className="cal-header">
        <button onClick={prevMonth}>{'<'}</button>
        <span>{year}년 {month+1}월</span>
        <button onClick={nextMonth}>{'>'}</button>
      </div>
      <div className="cal-grid">
        {['일','월','화','수','목','금','토'].map((d,i) => (
          <div key={d} className={`cal-dow ${i===0?'sun':i===6?'sat':''}`}>{d}</div>
        ))}
        {days.map((d, i) => {
          const col = i % 7
          const isToday = d.type==='current' && d.day===today.getDate()
            && month===today.getMonth() && year===today.getFullYear()
          return (
            <div key={i} className={[
              'cal-day',
              d.type!=='current'?'other':'',
              col===0?'sun':col===6?'sat':'',
              isToday?'today':''
            ].filter(Boolean).join(' ')}>
              {d.day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('')
  const [incomeView, setIncomeView] = useState('월별')

  const attTotal = 13
  const attPresent = 0
  const attAbsent = 13
  const attPct = Math.round(attPresent / attTotal * 100)
  const attChartData = attPresent === 0
    ? [{ name: '미출석', value: attTotal, color: '#F5841F' }]
    : [
        { name: '출석',   value: attPresent, color: '#4FC3F7' },
        { name: '미출석', value: attAbsent,  color: '#F5841F' },
      ]

  return (
    <div className="dash-wrap">

    <TopNav />

      {/* 메뉴 바 */}
      <div className="menu-bar">
        <button className="hamburger-btn" style={{visibility:'hidden'}}>☰</button>
        <div className="menu-list">
          {MENUS.map(m => (
            <div
              key={m.id}
              className={`menu-item ${activeMenu===m.id?'active':''}`}
              onClick={() => {
               setActiveMenu(m.id)
               if (m.id === 'students') navigate('/students')
               if (m.id === 'payments') navigate('/payments')
               if (m.id === 'classes') navigate('/classes')
              }}
            >
              <img src={m.icon} alt={m.label} className="menu-icon" />
              <span className="menu-label">{m.label}</span>
            </div>
          ))}
        </div>
        <button className="menu-charge-btn">전송충전관리</button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="dash-content">

        {/* 1행 */}
        <div className="dash-row">

          {/* 수강생현황 */}
          <div className="card card-yellow">
            <div className="card-head yellow">
              <span className="ch-title">수강생현황</span>
              <button className="ch-btn orange">신규 수강생등록</button>
            </div>
            <div className="card-body">
              <div className="stu-stats">
                <div className="stu-stat">
                  <span className="ss-label">재원</span>
                  <span className="ss-num" style={{color:'#F5841F'}}>15명</span>
                </div>
                <div className="stu-divider" />
                <div className="stu-stat">
                  <span className="ss-label">예비</span>
                  <span className="ss-num" style={{color:'#29ABE2'}}>4명</span>
                </div>
                <div className="stu-divider" />
                <div className="stu-stat">
                  <span className="ss-label">퇴원</span>
                  <span className="ss-num" style={{color:'#333'}}>13명</span>
                </div>
              </div>
              <div className="stu-btns">
                {['전체 수강생관리','반 등록관리','반 그룹관리'].map(t=>(
                  <button key={t} className="stu-btn">{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 등원현황 */}
          <div className="card card-teal">
            <div className="card-head teal">
              <span className="ch-title">등원현황</span>
              <button className="ch-btn white">등원 현황보기</button>
            </div>
            <div className="card-body">
              <div className="att-wrap">
                <div className="att-chart-wrap">
                  <PieChart width={150} height={150}>
                    <Pie
                      data={attChartData}
                      cx={70} cy={70}
                      innerRadius={48} outerRadius={70}
                      dataKey="value"
                      startAngle={90} endAngle={-270}
                    >
                      {attChartData.map((e,i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                  </PieChart>
                  <div className="att-center-text">
                    <span className="att-pct">{attPct}%</span>
                    <span className="att-sub">출석</span>
                  </div>
                </div>
                <div className="att-legend">
                  <div className="att-leg-row">
                    <span className="att-dot" style={{background:'#555'}}/>
                    <span className="att-leg-label">등원대상</span>
                    <strong className="att-leg-val">{attTotal}명</strong>
                  </div>
                  <div className="att-leg-row">
                    <span className="att-dot" style={{background:'#4FC3F7'}}/>
                    <span className="att-leg-label">출석</span>
                    <strong className="att-leg-val">{attPresent}명</strong>
                  </div>
                  <div className="att-leg-row">
                    <span className="att-dot" style={{background:'#F5841F'}}/>
                    <span className="att-leg-label">미출석</span>
                    <strong className="att-leg-val" style={{color:'#F5841F'}}>{attAbsent}명</strong>
                  </div>
                </div>
              </div>
              <div className="att-date">
                {new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'})}
              </div>
            </div>
          </div>

          {/* 수납현황 */}
          <div className="card card-blue">
            <div className="card-head blue">
              <span className="ch-title">수납현황</span>
              <button className="ch-btn white">일월 청구관리</button>
            </div>
            <div className="card-body">
              <table className="pay-table">
                <tbody>
                  {PAYMENTS.map((p,i) => (
                    <tr key={i}>
                      <td className="pt-name">{p.name}</td>
                      <td className="pt-cls">{p.cls}</td>
                      <td className="pt-period">{p.period}</td>
                      <td className="pt-amt">{p.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pay-rate-row">
                <span>2026년 05월분 청구 수납율 현황:</span>
                <strong style={{color:'#00B5A9',marginLeft:6}}>95%</strong>
              </div>
              <div className="pay-bar-bg">
                <div className="pay-bar-fill" style={{width:'95%'}}/>
              </div>
              <div className="pay-summary">
                <span>이달 청구금액 : 182,200원</span>
                <span>수납금액 : <strong style={{color:'#F5841F'}}>173,000원</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* 2행 */}
        <div className="dash-row">

          {/* 상담관리 */}
          <div className="card">
            <div className="card-sub-head">
              <span className="csh-title">상담관리</span>
              <button className="csh-btn">상담 관리하기</button>
            </div>
            <div className="card-body consult-body">
              <p className="empty-msg">등록된 상담 내역이 없습니다.</p>
            </div>
          </div>

          {/* 수입지출 */}
          <div className="card">
            <div className="card-sub-head">
              <span className="csh-title">수입지출</span>
              <div className="toggle-wrap">
                {['월별','년별'].map(t=>(
                  <button key={t}
                    className={`toggle-btn ${incomeView===t?'active':''}`}
                    onClick={()=>setIncomeView(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={incomeData} margin={{top:4,right:8,left:-15,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="month" tick={{fontSize:11}}/>
                  <YAxis tick={{fontSize:10}}/>
                  <Tooltip/>
                  <Legend iconSize={10} wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="수입" fill="#F5841F" radius={[3,3,0,0]}/>
                  <Bar dataKey="지출" fill="#4FC3F7" radius={[3,3,0,0]}/>
                  <Bar dataKey="수익" fill="#2CBB6A" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 달력 */}
          <div className="card">
            <div className="card-body">
              <Calendar/>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
