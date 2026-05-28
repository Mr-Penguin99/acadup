import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './Dashboard.css'

const logoEn = '/logo-en.svg'

const MENUS = [
  { id: 'students',    icon: '👥', label: '수강생관리' },
  { id: 'payments',   icon: '💰', label: '수납관리' },
  { id: 'classes',    icon: '📚', label: '반관리' },
  { id: 'lessons',    icon: '📖', label: '수업관리' },
  { id: 'consult',    icon: '💬', label: '상담관리' },
  { id: 'vehicle',    icon: '🚌', label: '차량관리' },
  { id: 'staff',      icon: '👔', label: '직원관리' },
  { id: 'ledger',     icon: '📒', label: '장부관리' },
  { id: 'management', icon: '📊', label: '경영현황' },
  { id: 'ai',         icon: '🤖', label: 'AI학원경영' },
  { id: 'salary',     icon: '💳', label: '급여관리' },
  { id: 'labor',      icon: '📋', label: '노무관리' },
  { id: 'accounting', icon: '🧮', label: '회계관리' },
  { id: 'shop',       icon: '🛒', label: '회원전용몰' },
]

const attData = [
  { name: '출석',   value: 0,  color: '#4FC3F7' },
  { name: '미출석', value: 13, color: '#F5841F' },
]

const incomeData = [
  { month: '2월', 수입: 0,    지출: 0,   수익: 0 },
  { month: '3월', 수입: 200,  지출: 150, 수익: 50 },
  { month: '4월', 수입: 1200, 지출: 800, 수익: 400 },
  { month: '5월', 수입: 1250, 지출: 0,   수익: 0 },
]

const PAYMENTS = [
  { name: '반이동_매뉴얼',      cls: '이동완료_매뉴얼반',          period: '2026년05월분', amount: '171,000원' },
  { name: '예비학생',           cls: '중등부>중등 수학A 1교시',     period: '2026년05월분', amount: '1,000원' },
  { name: '수강생05',           cls: '중등부>중등 수학A 3교시',     period: '2026년05월분', amount: '1,000원' },
  { name: '수강생_납부기준일',  cls: '테스트반>납부기준일',         period: '2026년04월분', amount: '1,234원' },
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

  const prevMonth = () => month === 0 ? (setYear(y => y - 1), setMonth(11)) : setMonth(m => m - 1)
  const nextMonth = () => month === 11 ? (setYear(y => y + 1), setMonth(0)) : setMonth(m => m + 1)

  return (
    <div className="calendar">
      <div className="cal-header">
        <button onClick={prevMonth}>{'<'}</button>
        <span>{year}년 {month + 1}월</span>
        <button onClick={nextMonth}>{'>'}</button>
      </div>
      <div className="cal-grid">
        {['일','월','화','수','목','금','토'].map((d, i) => (
          <div key={d} className={`cal-dow ${i===0?'sun':i===6?'sat':''}`}>{d}</div>
        ))}
        {days.map((d, i) => {
          const col = i % 7
          const isToday = d.type === 'current' &&
            d.day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
          return (
            <div key={i} className={[
              'cal-day',
              d.type !== 'current' ? 'other' : '',
              col === 0 ? 'sun' : col === 6 ? 'sat' : '',
              isToday ? 'today' : ''
            ].join(' ')}>
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
  const [activeMenu, setActiveMenu] = useState('students')
  const [incomeView, setIncomeView] = useState('월별')

  return (
    <div className="dash-wrap">

      {/* 상단 네비 */}
      <div className="top-nav">
        <div className="top-nav-left">
          <img src={logoEn} alt="AcademyUP" className="nav-logo" />
          <div className="nav-div" />
          <span className="nav-item">📋 OO학원</span>
          <div className="nav-div" />
          <span className="nav-item">원장 (200001)님</span>
          <div className="nav-div" />
          <span className="nav-item nav-link">나의정보</span>
        </div>
        <div className="top-nav-right">
          {['🏠 메인홈','📋 교재관리','⚙️ 환경설정','⚡ 빠른메뉴','🖥️ 원격지원'].map(item => (
            <span key={item} className="nav-link">{item}</span>
          ))}
          <span className="nav-link" onClick={() => navigate('/')}>🚪 로그아웃</span>
        </div>
      </div>

      {/* 메뉴 바 */}
      <div className="menu-bar">
        <div className="menu-items">
          {MENUS.map(m => (
            <div
              key={m.id}
              className={`menu-item ${activeMenu === m.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(m.id)}
            >
              <span className="menu-icon">{m.icon}</span>
              <span className="menu-label">{m.label}</span>
            </div>
          ))}
        </div>
        <button className="menu-charge-btn">전송충전관리</button>
      </div>

      {/* 콘텐츠 */}
      <div className="dash-content">

        {/* 1행 */}
        <div className="dash-row">

          {/* 수강생현황 */}
          <div className="widget">
            <div className="widget-header yellow">
              <span className="wh-title">수강생현황</span>
              <button className="wh-btn">신규 수강생등록</button>
            </div>
            <div className="widget-body">
              <div className="stu-stats">
                <div className="stu-stat">
                  <span className="stu-stat-label">재원</span>
                  <span className="stu-stat-num" style={{ color: '#F5841F' }}>15명</span>
                </div>
                <div className="stu-stat">
                  <span className="stu-stat-label">예비</span>
                  <span className="stu-stat-num" style={{ color: '#29ABE2' }}>4명</span>
                </div>
                <div className="stu-stat">
                  <span className="stu-stat-label">퇴원</span>
                  <span className="stu-stat-num" style={{ color: '#333' }}>13명</span>
                </div>
              </div>
              <div className="stu-btns">
                {['전체 수강생관리','반 등록관리','반 그룹관리'].map(t => (
                  <button key={t} className="stu-btn">{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 등원현황 */}
          <div className="widget">
            <div className="widget-header teal">
              <span className="wh-title">등원현황</span>
              <button className="wh-btn">등원 현황보기</button>
            </div>
            <div className="widget-body">
              <div className="att-wrap">
                <div className="att-chart-wrap">
                  <PieChart width={130} height={130}>
                    <Pie data={attData} cx={60} cy={60}
                      innerRadius={42} outerRadius={62}
                      dataKey="value" startAngle={90} endAngle={-270}>
                      {attData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="att-center">
                    <span className="att-pct">0%</span>
                    <span className="att-sub">출석</span>
                  </div>
                </div>
                <div className="att-legend">
                  {[
                    { dot: '#555', label: '등원대상', val: '13명' },
                    { dot: '#4FC3F7', label: '출석',   val: '0명' },
                    { dot: '#F5841F', label: '미출석', val: '13명' },
                  ].map(item => (
                    <div key={item.label} className="att-leg-row">
                      <span className="att-dot" style={{ background: item.dot }} />
                      <span className="att-leg-label">{item.label}</span>
                      <strong className="att-leg-val">{item.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="att-date">
                {new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' })}
              </div>
            </div>
          </div>

          {/* 수납현황 */}
          <div className="widget">
            <div className="widget-header blue">
              <span className="wh-title">수납현황</span>
              <button className="wh-btn">일월 청구관리</button>
            </div>
            <div className="widget-body">
              <table className="pay-table">
                <tbody>
                  {PAYMENTS.map((p, i) => (
                    <tr key={i}>
                      <td className="pay-name">{p.name}</td>
                      <td className="pay-cls">{p.cls}</td>
                      <td className="pay-period">{p.period}</td>
                      <td className="pay-amt">{p.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pay-rate-row">
                <span className="pay-rate-text">2026년 05월분 청구 수납율 현황:</span>
                <strong className="pay-rate-pct">95%</strong>
              </div>
              <div className="pay-bar-bg">
                <div className="pay-bar-fill" style={{ width: '95%' }} />
              </div>
              <div className="pay-summary">
                <span>이달 청구금액 : 182,200원</span>
                <span>수납금액 : <strong style={{ color: '#F5841F' }}>173,000원</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* 2행 */}
        <div className="dash-row">

          {/* 상담관리 */}
          <div className="widget">
            <div className="widget-sub-header">
              <span className="wsh-title">상담관리</span>
              <button className="wsh-btn">상담 관리하기</button>
            </div>
            <div className="widget-body" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
              <p style={{ color:'#bbb', fontSize:13 }}>등록된 상담 내역이 없습니다.</p>
            </div>
          </div>

          {/* 수입지출 */}
          <div className="widget">
            <div className="widget-sub-header">
              <span className="wsh-title">수입지출</span>
              <div className="toggle-wrap">
                {['월별','년별'].map(t => (
                  <button key={t}
                    className={`toggle-btn ${incomeView===t?'active':''}`}
                    onClick={() => setIncomeView(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="widget-body">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={incomeData} margin={{ top:5, right:10, left:-10, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:12 }} />
                  <YAxis tick={{ fontSize:11 }} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize:12 }} />
                  <Bar dataKey="수입" fill="#F5841F" radius={[3,3,0,0]} />
                  <Bar dataKey="지출" fill="#4FC3F7" radius={[3,3,0,0]} />
                  <Bar dataKey="수익" fill="#2CBB6A" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 달력 */}
          <div className="widget">
            <div className="widget-body">
              <Calendar />
            </div>
          </div>

        </div>
      </div>

      {/* 하단 바 */}
      <div className="bottom-bar">
        <span className="ai-notice">🤖 AI 손실주정: 이탈 위험 학생 예측</span>
        <button className="help-btn">도움말 통합 ∧</button>
      </div>

    </div>
  )
}
