import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import './Classes.css'

const MENUS = [
  { id: 'students',    icon: '/icons/students.svg',    label: '수강생관리' },
  { id: 'payments',   icon: '/icons/payments.svg',    label: '수납관리' },
  { id: 'classes',    icon: '/icons/classes.svg',     label: '반관리' },
  { id: 'lessons',    icon: '/icons/lessons.svg',     label: '수업관리' },
  { id: 'consult',    icon: '/icons/consult.svg',     label: '상담관리' },
  { id: 'vehicle',    icon: '/icons/vehicle.svg',     label: '차량관리' },
  { id: 'staff',      icon: '/icons/staff.svg',       label: '직원관리' },
  { id: 'ledger',     icon: '/icons/ledger.svg',      label: '장부관리' },
  { id: 'management', icon: '/icons/management.svg',  label: '경영현황' },
  { id: 'ai',         icon: '/icons/ai.svg',          label: 'AI학원경영' },
  { id: 'salary',     icon: '/icons/salary.svg',      label: '급여관리' },
  { id: 'labor',      icon: '/icons/labor.svg',       label: '노무관리' },
  { id: 'accounting', icon: '/icons/acccounting.svg', label: '회계관리' },
  { id: 'shop',       icon: '/icons/shop.svg',        label: '회원전용몰' },
]

const SIDE_MENUS = [
  {
    id: 'class-mgmt', label: '반 관리',
    items: [
      { id: 'class-group',  label: '반 그룹' },
      { id: 'class-status', label: '반 현황' },
    ]
  },
  {
    id: 'class-assign', label: '반편성',
    items: [
      { id: 'assign-enrolled', label: '재원생 반편성' },
      { id: 'assign-prospect', label: '예비생 반배정' },
    ]
  },
]

const SAMPLE_DATA = [
  { id:1,  group:'',              name:'수업2_영어',       code:'CLASS00014', status:'개강', type:'국어', teacher:'김일희(강사)',    period:'2015.09.01~2026.12.31', room:'', count:'재원: 0명' },
  { id:2,  group:'',              name:'test02',           code:'CLASS00018', status:'개강', type:'국어', teacher:'',               period:'2016.09.01~2027.09.30', room:'', count:'재원: 1명' },
  { id:3,  group:'',              name:'test03',           code:'CLASS00020', status:'개강', type:'국어', teacher:'김부원장1',       period:'2015.11.06~2028.11.03', room:'', count:'재원: 0명' },
  { id:4,  group:'반그룹_02(회차반)', name:'회차반_001',   code:'CLASS00050', status:'개강', type:'국어', teacher:'장원장(기간반)',  period:'2026.03.01~2026.12.31', room:'', count:'재원: 1명' },
  { id:5,  group:'반그룹_02(회차반)', name:'회차반_002',   code:'CLASS00051', status:'개강', type:'국어', teacher:'장원장(기간반)',  period:'2026.01.01~2026.12.31', room:'', count:'재원: 0명' },
  { id:6,  group:'반그룹_02(회차반)', name:'회차반_003',   code:'CLASS00052', status:'개강', type:'수학', teacher:'장원장(기간반)',  period:'2026.03.01~2026.12.31', room:'', count:'재원: 0명' },
  { id:7,  group:'to_반그룹',     name:'to_반_AAA_배정',   code:'CLASS00030', status:'개강', type:'국어', teacher:'장원장(기간반)',  period:'2025.01.01~2026.12.31', room:'', count:'재원: 4명' },
  { id:8,  group:'to_반그룹',     name:'to_반_AAA_이동',   code:'CLASS00031', status:'개강', type:'국어', teacher:'',               period:'2026.01.01~2026.12.31', room:'', count:'재원: 0명' },
  { id:9,  group:'to_반그룹',     name:'to_반_AAA_미개강', code:'CLASS00032', status:'개강', type:'국어', teacher:'장원장(기간반)',  period:'2026.04.01~2026.12.31', room:'', count:'재원: 0명' },
  { id:10, group:'to_반그룹',     name:'to_반_XXX_배정',   code:'CLASS00040', status:'개강', type:'국어', teacher:'',               period:'2026.01.01~2026.12.31', room:'', count:'재원: 0명' },
]

export default function Classes() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('classes')
  const [activeSide, setActiveSide] = useState('class-status')
  const [expanded, setExpanded] = useState(['class-mgmt'])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState({ group: '전체', status: '개강', name: '' })

  const toggleGroup = id =>
    setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id])

  return (
    <div className="classes-wrap">

      <TopNav />

      {/* 메뉴 바 */}
      <div className="menu-bar">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(s => !s)}>☰</button>
        <div className="menu-list">
          {MENUS.map(m => (
            <div key={m.id}
              className={`menu-item ${activeMenu === m.id ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu(m.id)
                if (m.id === 'students') navigate('/students')
                if (m.id === 'payments') navigate('/payments')
                if (m.id === 'settings') navigate('/settings')
                if (m.id === 'dashboard') navigate('/dashboard')
              }}>
              <img src={m.icon} alt={m.label} className="menu-icon" />
              <span className="menu-label">{m.label}</span>
            </div>
          ))}
        </div>
        <button className="menu-charge-btn">전송충전관리</button>
      </div>

      {/* 바디 */}
      <div className="classes-body">

        {/* 사이드바 */}
        {sidebarOpen && (
          <div className="classes-sidebar">
            <div className="ss-title">반관리</div>
            {SIDE_MENUS.map(group => (
              <div key={group.id} className="ss-group-wrap">
                <div className="ss-group" onClick={() => toggleGroup(group.id)}>
                  <span className="ss-toggle">{expanded.includes(group.id) ? '∧' : '∨'}</span>
                  <span>{group.label}</span>
                </div>
                {expanded.includes(group.id) && group.items.map(item => (
                  <div key={item.id}
                    className={`ss-item ${activeSide === item.id ? 'active' : ''}`}
                    onClick={() => setActiveSide(item.id)}>
                    <span className="ss-arrow">▶</span> {item.label}
                  </div>
                ))}
              </div>
            ))}
            <div className="ss-footer">
              <div className="ss-phone">1811-3435</div>
              <div className="ss-hours">평일 09:00~18:00</div>
            </div>
          </div>
        )}

        {/* 메인 */}
        <div className="classes-main">
          <div className="cl-page-title">
            <span style={{color:'#ccc'}}>☆</span> 반 현황
          </div>

          {/* 조건검색 */}
          <div className="cl-section">
            <div className="cl-sec-head">
              <div className="cl-sec-title">조건검색</div>
              <div style={{display:'flex', gap:6}}>
                <button className="cl-search-btn">검색하기</button>
                <button className="cl-reset-btn">초기화</button>
              </div>
            </div>
            <div className="cl-filter">
              <div className="cl-filter-row">
                <div className="cl-filter-item">
                  <label className="cl-filter-label">반 그룹</label>
                  <select className="cl-input" value={filter.group}
                    onChange={e => setFilter(f => ({...f, group: e.target.value}))}>
                    <option>전체</option>
                  </select>
                </div>
                <div className="cl-filter-item">
                  <label className="cl-filter-label">반 상태</label>
                  <select className="cl-input" value={filter.status}
                    onChange={e => setFilter(f => ({...f, status: e.target.value}))}>
                    <option>개강</option>
                    <option>폐강</option>
                    <option>대기</option>
                  </select>
                </div>
                <div className="cl-filter-item">
                  <label className="cl-filter-label">반 명</label>
                  <input className="cl-input" value={filter.name}
                    onChange={e => setFilter(f => ({...f, name: e.target.value}))} />
                </div>
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <div className="cl-section">
            <div className="cl-table-header">
              <button className="cl-reg-btn">반 등록</button>
            </div>
            <div className="cl-table-wrap">
              <table className="cl-table">
                <thead>
                  <tr>
                    <th>출력순서</th>
                    <th>반 그룹</th>
                    <th>반 명</th>
                    <th>반 코드</th>
                    <th>상태</th>
                    <th>중분류</th>
                    <th>담임</th>
                    <th>수강기간</th>
                    <th>강의실</th>
                    <th>수강생수</th>
                    <th>기능</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_DATA.map(d => (
                    <tr key={d.id}>
                      <td className="td-center">{d.id}</td>
                      <td>{d.group}</td>
                      <td>{d.name}</td>
                      <td>{d.code}</td>
                      <td className="td-center">{d.status}</td>
                      <td className="td-center">{d.type}</td>
                      <td>{d.teacher}</td>
                      <td>{d.period}</td>
                      <td>{d.room}</td>
                      <td>{d.count}</td>
                      <td className="td-center">
                        <button className="cl-edit-btn">반 수정</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
