import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Payments.css'
import TopNav from '../components/TopNav'


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
    id: 'payment-mgmt', label: '수납관리',
    items: [
      { id: 'bulk-bill',     label: '일괄청구' },
      { id: 'class-bill',    label: '회차반 일괄청구' },
      { id: 'unpaid',        label: '청구/미납내역' },
      { id: 'monthly-pay',   label: '수강월 청구/수납' },
      { id: 'pay-history',   label: '결제내역' },
    ]
  },
  {
    id: 'pay-status', label: '수납현황',
    items: [
      { id: 'daily-status',   label: '일별 수납현황' },
      { id: 'monthly-status', label: '월별 수납현황' },
      { id: 'class-status',   label: '반별 수납현황' },
    ]
  },
]

const PAY_HISTORY_DATA = [
  { id:1, name:'@이순신',   classes:['to_반그룹 > to_반_AAA_배정','to_반그룹 > from_반_CCC','to_반그룹 > to_반_001_배정','고등_AA > 고등_AA_기초반'], payAmt:'1,115',   refund:'', phone:'', guardRel:'모', guardPhone:'010-8278-2350' },
  { id:2, name:'abc',       classes:['고등_AA > 고등_AA_기초반'],                                                                                         payAmt:'100,100', refund:'', phone:'', guardRel:'부', guardPhone:'010-8278-2350' },
  { id:3, name:'회차_김222', classes:['반그룹_02(회차반) > 회차반_001'],                                                                                  payAmt:'100',     refund:'', phone:'', guardRel:'',  guardPhone:'01082782350' },
  { id:4, name:'회차_김333', classes:['반그룹_02(회차반) > 회차반_001','반그룹_02(회차반) > 회차반_002','to_반그룹 > to_반_AAA_이동','to_반그룹 > from_반_CCC','to_반그룹 > to_반_111_배정','고등_AA > 고등_AA_기초반'], payAmt:'8', refund:'', phone:'', guardRel:'모', guardPhone:'111-2222-1011' },
  { id:5, name:'회차_김444', classes:['반그룹_02(회차반) > 회차반_001'],                                                                                  payAmt:'500',     refund:'', phone:'', guardRel:'',  guardPhone:'' },
]

const MONTHLY_PAY_DATA = [
  { id:1,  name:'@이순신',   cls:'to_반그룹 > from_반_CCC',      billAmt:'222',     tradeDate:'', payMethod:'', status:'미납', payAmt:'',   unpaid:'222',     created:'일괄수동' },
  { id:2,  name:'@하늘땅',   cls:'to_반그룹 > from_반_CCC',      billAmt:'222',     tradeDate:'', payMethod:'', status:'미납', payAmt:'',   unpaid:'222',     created:'일괄수동' },
  { id:3,  name:'회차_김333', cls:'to_반그룹 > from_반_CCC',     billAmt:'222',     tradeDate:'', payMethod:'', status:'미납', payAmt:'',   unpaid:'222',     created:'일괄수동' },
  { id:4,  name:'@이순신',   cls:'to_반그룹 > to_반_001_배정',   billAmt:'100,000', tradeDate:'', payMethod:'', status:'미납', payAmt:'',   unpaid:'100,000', created:'일괄수동' },
  { id:5,  name:'김학생AA',  cls:'to_반그룹 > to_반_001_배정',   billAmt:'100,000', tradeDate:'', payMethod:'', status:'미납', payAmt:'',   unpaid:'100,000', created:'일괄수동' },
  { id:6,  name:'김학생CC',  cls:'to_반그룹 > to_반_001_배정',   billAmt:'100,000', tradeDate:'', payMethod:'', status:'미납', payAmt:'',   unpaid:'100,000', created:'일괄수동' },
  { id:7,  name:'@예비',     cls:'to_반그룹 > to_반_AAA_배정',   billAmt:'100',     tradeDate:'', payMethod:'', status:'미납', payAmt:'',   unpaid:'100',     created:'수기등록' },
  { id:8,  name:'@이순신',   cls:'to_반그룹 > to_반_AAA_배정',   billAmt:'',        tradeDate:'', payMethod:'', status:'완납', payAmt:'0',  unpaid:'',        created:'수기등록' },
  { id:9,  name:'가나다',    cls:'to_반그룹 > to_반_AAA_배정',   billAmt:'10,000',  tradeDate:'', payMethod:'', status:'미납', payAmt:'',   unpaid:'10,000',  created:'수기등록' },
  { id:10, name:'홍길동ab',  cls:'to_반그룹 > to_반_AAA_배정',   billAmt:'5,000',   tradeDate:'', payMethod:'', status:'미납', payAmt:'',   unpaid:'5,000',   created:'일괄수동' },
]

const CLASS_BILL_DATA = [
  { group:'반그룹_02(회차반)', name:'회차반_001',            code:'CLASS00050', status:'개강', count:'2 명', period:'2026.03.01~2026.12.31' },
  { group:'반그룹_02(회차반)', name:'회차반_002',            code:'CLASS00051', status:'개강', count:'1 명', period:'2026.01.01~2026.12.31' },
  { group:'반그룹_02(회차반)', name:'회차반_003',            code:'CLASS00052', status:'개강', count:'0 명', period:'2026.03.01~2026.12.31' },
  { group:'no-use반모음',      name:'회 차반_333(사용안함)', code:'CLASS00008', status:'개강', count:'1 명', period:'2025.01.01~2031.12.31' },
  { group:'no-use반모음',      name:'02_피아노(2개월)_일시납', code:'CLASS00013', status:'개강', count:'1 명', period:'2016.03.01~2029.03.31' },
]

const BULK_DATA = [
  { id:1,  group:'',        name:'수업2_영어',      code:'CLASS00014', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2015.09.01~2026.12.31' },
  { id:2,  group:'',        name:'test02',          code:'CLASS00018', status:'개강', count:'1 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2016.09.01~2027.09.30' },
  { id:3,  group:'',        name:'test03',          code:'CLASS00020', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2015.11.06~2028.11.03' },
  { id:4,  group:'to_반그룹', name:'to_반_AAA_배정', code:'CLASS00030', status:'개강', count:'4 명', billRound:'1차',   billCnt:'4', amount:'15,100', unpaid:'15,100', period:'2025.01.01~2026.12.31' },
  { id:5,  group:'to_반그룹', name:'to_반_AAA_이동', code:'CLASS00031', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2026.01.01~2026.12.31' },
  { id:6,  group:'to_반그룹', name:'to_반_AAA_미개강', code:'CLASS00032', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',   unpaid:'',      period:'2026.04.01~2026.12.31' },
  { id:7,  group:'to_반그룹', name:'to_반_XXX_배정', code:'CLASS00040', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2026.01.01~2026.12.31' },
  { id:8,  group:'to_반그룹', name:'to_반_XXX_이동', code:'CLASS00041', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2026.01.01~2026.12.31' },
  { id:9,  group:'to_반그룹', name:'to_반_XXX_미개강', code:'CLASS00042', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',   unpaid:'',      period:'2026.05.01~2026.12.31' },
  { id:10, group:'to_반그룹', name:'from_반_AAA',    code:'CLASS00033', status:'개강', count:'0 명', billRound:'미생성', billCnt:'', amount:'',      unpaid:'',      period:'2025.01.01~2026.12.31' },
]

const SAMPLE_DATA = [
  { id:1,  name:'수강생01', method:'',            classes:[{cls:'중등부>중등 수학A 1교시',day:'25일'},{cls:'고등부>고등 수학A 1교시',day:'1일'}],  unpaid:2000,  phone:'010-0000-0000', sentDate:'',           rel:'부', guardPhone:'010-3816-3799', guardSent:'' },
  { id:2,  name:'수강생02', method:'비대면(카드)', classes:[{cls:'중등부>중등 수학A 2교시',day:'25일'}],                                          unpaid:4000,  phone:'010-0000-0000', sentDate:'',           rel:'모', guardPhone:'010-0000-0000', guardSent:'2026-04-24' },
  { id:3,  name:'수강생03', method:'',            classes:[{cls:'중등부>중등 수학A 2교시',day:'25일'}],                                          unpaid:3000,  phone:'010-0000-0000', sentDate:'',           rel:'모', guardPhone:'010-0000-0000', guardSent:'2026-04-24' },
  { id:4,  name:'수강생04', method:'',            classes:[{cls:'중등부>중등 수학A 3교시',day:'25일'}],                                          unpaid:3000,  phone:'010-0000-0000', sentDate:'',           rel:'모', guardPhone:'010-0000-0000', guardSent:'2026-04-24' },
  { id:5,  name:'수강생05', method:'',            classes:[{cls:'중등부>중등 수학A 3교시',day:'1일'}],                                           unpaid:1200,  phone:'010-0000-0000', sentDate:'',           rel:'모', guardPhone:'010-0000-0000', guardSent:'' },
  { id:6,  name:'수강생06', method:'',            classes:[{cls:'중등부>중등 수학A 3교시',day:'1일'},{cls:'고등부>고등 수학A 1교시',day:'1일'}],   unpaid:4000,  phone:'010-0000-0000', sentDate:'',           rel:'모', guardPhone:'010-0000-0000', guardSent:'' },
  { id:7,  name:'수강생07', method:'',            classes:[{cls:'고등부>고등 수학A 1교시',day:'1일'}],                                           unpaid:3000,  phone:'010-0000-0000', sentDate:'',           rel:'모', guardPhone:'010-0000-0000', guardSent:'' },
  { id:8,  name:'수강생08', method:'',            classes:[{cls:'고등부>고등 수학A 1교시',day:'1일'}],                                           unpaid:3000,  phone:'010-0000-0000', sentDate:'',           rel:'모', guardPhone:'010-0000-0000', guardSent:'' },
  { id:9,  name:'수강생09', method:'',            classes:[{cls:'고등부>고등 수학A 2교시',day:'1일'}],                                           unpaid:4000,  phone:'010-0000-0000', sentDate:'',           rel:'모', guardPhone:'010-0000-0000', guardSent:'' },
  { id:10, name:'수강생10', method:'',            classes:[{cls:'고등부>고등 수학A 2교시',day:'1일'}],                                           unpaid:1000,  phone:'010-0000-0000', sentDate:'',           rel:'모', guardPhone:'010-0000-0000', guardSent:'' },
]

export default function Payments() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('payments')
  const [activeSide, setActiveSide] = useState('bulk-bill')
  const [expanded, setExpanded] = useState(['payment-mgmt'])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [checked, setChecked] = useState([])
  const [bulkFilter, setBulkFilter] = useState({ month:'2026-05', group:'전체', status:'개강', name:'' })
  const [classBillFilter, setClassBillFilter] = useState({
  searchType:'반별', group:'전체', className:'', remaining:'3회 이하', student:''
  })
  const [monthlyPayFilter, setMonthlyPayFilter] = useState({
  month:'2026-05', group:'전체', className:'', searchType:'수강생-성명', keyword:''
  })
  const [payHistoryFilter, setPayHistoryFilter] = useState({
  dateFrom:'2026-01-01', dateTo:'2026-05-26', group:'전체', className:'', searchType:'수강생-성명', keyword:''
  })
  const CLASS_STATUS_DATA = [
  { id:1, cls:'고등_AA > 고등_AA_기초반',          month:'2026-05', billCnt:2, billAmt:'200,000', payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:2, unpaidAmt:'200,000' },
  { id:2, cls:'반그룹_수업1 > 수업1_영어(일화목토)', month:'2026-05', billCnt:1, billAmt:'10,000',  payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:1, unpaidAmt:'10,000' },
  { id:3, cls:'반그룹_01(기간반) > 01_국어(222개월)', month:'2026-05', billCnt:2, billAmt:'19,000', payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:2, unpaidAmt:'19,000' },
  { id:4, cls:'to_반그룹 > to_반_001_배정',          month:'2026-05', billCnt:3, billAmt:'300,000', payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:3, unpaidAmt:'300,000' },
  { id:5, cls:'to_반그룹 > to_반_AAA_배정',          month:'2026-05', billCnt:3, billAmt:'15,100',  payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:3, unpaidAmt:'15,100' },
  { id:6, cls:'to_반그룹 > from_반_CCC',             month:'2026-05', billCnt:3, billAmt:'666',     payCnt:'', payAmt:'', refundCnt:'', refundAmt:'', unpaidCnt:3, unpaidAmt:'666' },
  ]
  const [dailyFilter, setDailyFilter] = useState({
  date:'2026-05-01', group:'전체', className:'', searchType:'수강생-성명', keyword:''
  })
  const [monthlyFilter, setMonthlyFilter] = useState({
  searchType:'수납월', month:'2026-05', group:'전체', className:''
  })
  const [classStatusFilter, setClassStatusFilter] = useState({
  month:'2026-05', group:'전체', className:''
  })
  const [bulkChecked, setBulkChecked] = useState([])
  const toggleBulkCheck = id =>
  setBulkChecked(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])
  const toggleBulkAll = () =>
  setBulkChecked(bulkChecked.length === BULK_DATA.length ? [] : BULK_DATA.map(d => d.id))
  const [pageSize, setPageSize] = useState('20')
  const [filter, setFilter] = useState({
    month: '2026-05', group: '전체', className: '', type: '수강생-성명', keyword: ''
  })

  const toggleGroup = id =>
    setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id])

  const toggleCheck = id =>
    setChecked(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])

  const toggleAll = () =>
    setChecked(checked.length === SAMPLE_DATA.length ? [] : SAMPLE_DATA.map(d => d.id))

  return (
    <div className="payments-wrap">

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
                if (m.id === 'settings') navigate('/settings')
                if (m.id === 'dashboard') navigate('/dashboard')
                if (m.id === 'classes') navigate('/classes')
              }}>
              <img src={m.icon} alt={m.label} className="menu-icon" />
              <span className="menu-label">{m.label}</span>
            </div>
          ))}
        </div>
        <button className="menu-charge-btn">전송충전관리</button>
      </div>

      {/* 바디 */}
      <div className="payments-body">

        {/* 사이드바 */}
        {sidebarOpen && (
          <div className="payments-sidebar">
            <div className="ss-title">수납관리</div>
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
        <div className="payments-main">

       {/* 일괄청구 */}
  {activeSide === 'bulk-bill' && (
    <>
      <div className="pm-page-title">
        <span style={{color:'#ccc'}}>☆</span> 일괄청구
      </div>
      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">조건검색</div>
          <div style={{display:'flex', gap:6}}>
            <button className="pm-dark-btn">검색하기</button>
            <button className="pm-reset-btn">초기화</button>
            <button className="pm-orange-btn">일괄청구</button>
            <button className="pm-red-btn">일괄청구삭제</button>
          </div>
        </div>
        <div className="pm-filter">
          <div className="pm-filter-row">
            <div className="pm-filter-item">
              <label className="pm-filter-label">수강월</label>
              <input type="month" className="pm-input" value={bulkFilter.month}
                onChange={e => setBulkFilter(f => ({...f, month: e.target.value}))} />
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반 그룹</label>
              <select className="pm-input" value={bulkFilter.group}
                onChange={e => setBulkFilter(f => ({...f, group: e.target.value}))}>
                <option>전체</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반 상태</label>
              <select className="pm-input" value={bulkFilter.status}
                onChange={e => setBulkFilter(f => ({...f, status: e.target.value}))}>
                <option>개강</option><option>폐강</option><option>대기</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반 명</label>
              <input className="pm-input" value={bulkFilter.name}
                onChange={e => setBulkFilter(f => ({...f, name: e.target.value}))} />
            </div>
          </div>
        </div>
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">반현황</div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th><input type="checkbox"
                  checked={bulkChecked.length === BULK_DATA.length}
                  onChange={toggleBulkAll} /></th>
                <th>반 그룹</th>
                <th>반 명</th>
                <th>반 코드</th>
                <th>상태</th>
                <th>수강생수</th>
                <th>일괄청구차수</th>
                <th>청구건수</th>
                <th>청구금액</th>
                <th>미납금액</th>
                <th>수강기간</th>
              </tr>
            </thead>
            <tbody>
              {BULK_DATA.map(d => (
                <tr key={d.id} className={bulkChecked.includes(d.id) ? 'checked-row' : ''}>
                  <td><input type="checkbox"
                    checked={bulkChecked.includes(d.id)}
                    onChange={() => toggleBulkCheck(d.id)} /></td>
                  <td>{d.group}</td>
                  <td>{d.name}</td>
                  <td>{d.code}</td>
                  <td style={{textAlign:'center'}}>{d.status}</td>
                  <td style={{textAlign:'center'}}>{d.count}</td>
                  <td style={{textAlign:'center'}}>{d.billRound}</td>
                  <td style={{textAlign:'center'}}>{d.billCnt}</td>
                  <td style={{textAlign:'right'}}>{d.amount}</td>
                  <td style={{textAlign:'right', color:'#E8445A'}}>{d.unpaid}</td>
                  <td>{d.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

  {/* 회차반 일괄청구 */}
  {activeSide === 'class-bill' && (
    <>
      <div className="pm-page-title">
        <span style={{color:'#ccc'}}>☆</span> 회차반 일괄청구
      </div>
      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">조건검색</div>
          <div style={{display:'flex', gap:6}}>
            <button className="pm-dark-btn">검색하기</button>
            <button className="pm-reset-btn">초기화</button>
            <button className="pm-orange-btn">선택청구</button>
            <button className="pm-red-btn">선택청구삭제</button>
          </div>
        </div>
        <div className="pm-filter">
          <div className="pm-filter-row">
            <div className="pm-filter-item">
              <label className="pm-filter-label">조회구분</label>
              <select className="pm-input" value={classBillFilter.searchType}
                onChange={e => setClassBillFilter(f => ({...f, searchType: e.target.value}))}>
                <option>반별</option><option>수강생별</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반 그룹</label>
              <select className="pm-input" value={classBillFilter.group}
                onChange={e => setClassBillFilter(f => ({...f, group: e.target.value}))}>
                <option>전체</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반명</label>
              <select className="pm-input" value={classBillFilter.className}
                onChange={e => setClassBillFilter(f => ({...f, className: e.target.value}))}>
                <option>선택하기</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">잔여횟수</label>
              <select className="pm-input" value={classBillFilter.remaining}
                onChange={e => setClassBillFilter(f => ({...f, remaining: e.target.value}))}>
                <option>3회 이하</option><option>5회 이하</option><option>10회 이하</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">수강생</label>
              <input className="pm-input" value={classBillFilter.student}
                onChange={e => setClassBillFilter(f => ({...f, student: e.target.value}))} />
            </div>
          </div>
        </div>
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">반현황</div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>반 그룹</th>
                <th>반 명</th>
                <th>반 코드</th>
                <th>상태</th>
                <th>수강생수</th>
                <th>수강기간</th>
              </tr>
            </thead>
            <tbody>
              {CLASS_BILL_DATA.map((d, i) => (
                <tr key={i}>
                  <td style={{textAlign:'center'}}>{d.group}</td>
                  <td style={{textAlign:'center'}}>{d.name}</td>
                  <td style={{textAlign:'center'}}>{d.code}</td>
                  <td style={{textAlign:'center'}}>{d.status}</td>
                  <td style={{textAlign:'center'}}>{d.count}</td>
                  <td style={{textAlign:'center'}}>{d.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
   )}

  {/* 반별 수납현황 */}
  {activeSide === 'class-status' && (
    <>
      <div className="pm-page-title">
        <span style={{color:'#ccc'}}>☆</span> 반별 수납 현황
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">반별 수납현황 검색</div>
          <div style={{display:'flex', gap:6}}>
            <button className="pm-search-btn">검색하기</button>
            <button className="pm-reset-btn">초기화</button>
          </div>
        </div>
        <div className="pm-filter">
          <div className="pm-filter-row">
            <div className="pm-filter-item">
              <label className="pm-filter-label">수강월</label>
              <input type="month" className="pm-input" value={classStatusFilter.month}
                onChange={e => setClassStatusFilter(f => ({...f, month: e.target.value}))} />
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반 그룹</label>
              <select className="pm-input" value={classStatusFilter.group}
                onChange={e => setClassStatusFilter(f => ({...f, group: e.target.value}))}>
                <option>전체</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반명</label>
              <select className="pm-input" value={classStatusFilter.className}
                onChange={e => setClassStatusFilter(f => ({...f, className: e.target.value}))}>
                <option>선택하기</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">반별 수납현황</div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>반명</th>
                <th>수강월</th>
                <th>청구건수</th>
                <th>청구금액</th>
                <th>수납건수</th>
                <th>수납금액</th>
                <th>환불건수</th>
                <th>환불금액</th>
                <th>미납건수</th>
                <th>미납금액</th>
              </tr>
            </thead>
            <tbody>
              {CLASS_STATUS_DATA.map(d => (
                <tr key={d.id}>
                  <td style={{textAlign:'center'}}>{d.id}</td>
                  <td style={{textAlign:'center'}}>{d.cls}</td>
                  <td style={{textAlign:'center'}}>{d.month}</td>
                  <td style={{textAlign:'center'}}>{d.billCnt}</td>
                  <td style={{textAlign:'right'}}>{d.billAmt}</td>
                  <td style={{textAlign:'center'}}>{d.payCnt}</td>
                  <td style={{textAlign:'right'}}>{d.payAmt}</td>
                  <td style={{textAlign:'center'}}>{d.refundCnt}</td>
                  <td style={{textAlign:'right'}}>{d.refundAmt}</td>
                  <td style={{textAlign:'center'}}>{d.unpaidCnt}</td>
                  <td style={{textAlign:'right'}}>{d.unpaidAmt}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="pm-table-foot">
                <td colSpan={2}></td>
                <td style={{textAlign:'center', fontWeight:700}}>합계</td>
                <td style={{textAlign:'center', fontWeight:700}}>14</td>
                <td style={{textAlign:'right', fontWeight:700}}>544,766</td>
                <td style={{textAlign:'center', fontWeight:700}}>0</td>
                <td style={{textAlign:'right', fontWeight:700}}>0</td>
                <td style={{textAlign:'center', fontWeight:700}}>0</td>
                <td style={{textAlign:'right', fontWeight:700}}>0</td>
                <td style={{textAlign:'center', fontWeight:700}}>14</td>
                <td style={{textAlign:'right', fontWeight:700}}>544,766</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  )}

  {/* 월별 수납현황 */}
  {activeSide === 'monthly-status' && (
    <>
      <div className="pm-page-title">
        <span style={{color:'#ccc'}}>☆</span> 월별 수납 현황
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">월별 수납현황 검색</div>
        </div>
        <div className="pm-filter">
          <div className="pm-filter-row">
            <div className="pm-filter-item">
              <label className="pm-filter-label">구분</label>
              <select className="pm-input" style={{width:80}} value={monthlyFilter.searchType}
                onChange={e => setMonthlyFilter(f => ({...f, searchType: e.target.value}))}>
                <option>수납월</option>
                <option>수강월</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">월</label>
              <input type="month" className="pm-input" value={monthlyFilter.month}
                onChange={e => setMonthlyFilter(f => ({...f, month: e.target.value}))} />
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반 그룹</label>
              <select className="pm-input" value={monthlyFilter.group}
                onChange={e => setMonthlyFilter(f => ({...f, group: e.target.value}))}>
                <option>전체</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반명</label>
              <select className="pm-input" value={monthlyFilter.className}
                onChange={e => setMonthlyFilter(f => ({...f, className: e.target.value}))}>
                <option>선택하기</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">월별 수납현황 목록</div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>성명</th>
                <th>수강월</th>
                <th>반명</th>
                <th>항목</th>
                <th>청구금액</th>
                <th>거래일</th>
                <th>수납방법</th>
                <th>상태</th>
                <th>수납금액</th>
                <th>환불금액</th>
                <th>미납금액</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={12} style={{textAlign:'center', padding:'30px', color:'#bbb', fontSize:13}}>
                  수납 내역이 없습니다.
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="pm-table-foot">
                <td colSpan={2}></td>
                <td style={{textAlign:'center', fontWeight:700}}>합계</td>
                <td colSpan={2}></td>
                <td style={{textAlign:'right', fontWeight:700}}>0</td>
                <td colSpan={3}></td>
                <td style={{textAlign:'right', fontWeight:700}}>0</td>
                <td style={{textAlign:'right', fontWeight:700}}>0</td>
                <td style={{textAlign:'right', fontWeight:700}}>0</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  )}

  {/* 일별 수납현황 */}
  {activeSide === 'daily-status' && (
    <>
      <div className="pm-page-title">
        <span style={{color:'#ccc'}}>☆</span> 일별 수납 현황
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">일별 수납현황 검색</div>
        </div>
        <div className="pm-filter">
          <div className="pm-filter-row">
            <div className="pm-filter-item">
              <label className="pm-filter-label">수납일</label>
              <input type="date" className="pm-input" value={dailyFilter.date}
                onChange={e => setDailyFilter(f => ({...f, date: e.target.value}))} />
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반 그룹</label>
              <select className="pm-input" value={dailyFilter.group}
                onChange={e => setDailyFilter(f => ({...f, group: e.target.value}))}>
                <option>전체</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반명</label>
              <select className="pm-input" value={dailyFilter.className}
                onChange={e => setDailyFilter(f => ({...f, className: e.target.value}))}>
                <option>선택하기</option>
              </select>
            </div>
            <div className="pm-filter-item" style={{flex:2}}>
              <label className="pm-filter-label">검색</label>
              <div style={{display:'flex', gap:6}}>
                <select className="pm-input" style={{width:130}} value={dailyFilter.searchType}
                  onChange={e => setDailyFilter(f => ({...f, searchType: e.target.value}))}>
                  <option>수강생-성명</option>
                  <option>수강생-전화</option>
                </select>
                <input className="pm-input" style={{flex:1}} value={dailyFilter.keyword}
                  onChange={e => setDailyFilter(f => ({...f, keyword: e.target.value}))} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">일별 수납현황 목록</div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>성명</th>
                <th>수강월</th>
                <th>반명</th>
                <th>항목</th>
                <th>청구금액</th>
                <th>거래일</th>
                <th>수납방법</th>
                <th>상태</th>
                <th>수납금액</th>
                <th>환불금액</th>
                <th>미납금액</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={12} style={{textAlign:'center', padding:'30px', color:'#bbb', fontSize:13}}>
                  수납 내역이 없습니다.
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="pm-table-foot">
                <td colSpan={2}></td>
                <td style={{textAlign:'center', fontWeight:700}}>합계</td>
                <td colSpan={2}></td>
                <td style={{textAlign:'right', fontWeight:700}}>0</td>
                <td colSpan={3}></td>
                <td style={{textAlign:'right', fontWeight:700}}>0</td>
                <td style={{textAlign:'right', fontWeight:700}}>0</td>
                <td style={{textAlign:'right', fontWeight:700}}>0</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  )}

  {/* 결제내역 */}
  {activeSide === 'pay-history' && (
    <>
      <div className="pm-page-title">
        <span style={{color:'#ccc'}}>☆</span> 결제 내역
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">조건검색</div>
          <div style={{display:'flex', gap:6}}>
            <button className="pm-search-btn">검색하기</button>
            <button className="pm-reset-btn">초기화</button>
          </div>
        </div>
        <div className="pm-filter">
          <div className="pm-filter-row">
            <div className="pm-filter-item" style={{flex:2}}>
              <label className="pm-filter-label">결제일</label>
              <div style={{display:'flex', gap:6, alignItems:'center'}}>
                <input type="date" className="pm-input" value={payHistoryFilter.dateFrom}
                  onChange={e => setPayHistoryFilter(f => ({...f, dateFrom: e.target.value}))} />
                <span>~</span>
                <input type="date" className="pm-input" value={payHistoryFilter.dateTo}
                  onChange={e => setPayHistoryFilter(f => ({...f, dateTo: e.target.value}))} />
              </div>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반 그룹</label>
              <select className="pm-input" value={payHistoryFilter.group}
                onChange={e => setPayHistoryFilter(f => ({...f, group: e.target.value}))}>
                <option>전체</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반명</label>
              <select className="pm-input" value={payHistoryFilter.className}
                onChange={e => setPayHistoryFilter(f => ({...f, className: e.target.value}))}>
                <option>선택하기</option>
              </select>
            </div>
            <div className="pm-filter-item" style={{flex:2}}>
              <label className="pm-filter-label">검색</label>
              <div style={{display:'flex', gap:6}}>
                <select className="pm-input" style={{width:130}} value={payHistoryFilter.searchType}
                  onChange={e => setPayHistoryFilter(f => ({...f, searchType: e.target.value}))}>
                  <option>수강생-성명</option>
                  <option>수강생-전화</option>
                </select>
                <input className="pm-input" style={{flex:1}} value={payHistoryFilter.keyword}
                  onChange={e => setPayHistoryFilter(f => ({...f, keyword: e.target.value}))} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">수강생 목록</div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>성명</th>
                <th>반명</th>
                <th>결제금액</th>
                <th>환불금액</th>
                <th>수강생휴대폰</th>
                <th>보호자관계</th>
                <th>보호자휴대폰</th>
              </tr>
            </thead>
            <tbody>
              {PAY_HISTORY_DATA.map(d => (
                <tr key={d.id}>
                  <td style={{textAlign:'center'}}>{d.id}</td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:4}}>
                      <span>👤</span><span>{d.name}</span>
                    </div>
                  </td>
                  <td>
                    {d.classes.map((c, i) => (
                      <div key={i} style={{fontSize:11, color:'#444', lineHeight:'1.6'}}>{c}</div>
                    ))}
                  </td>
                  <td style={{textAlign:'right', color:'#29ABE2', fontWeight:700}}>{d.payAmt}</td>
                  <td style={{textAlign:'right'}}>{d.refund}</td>
                  <td>{d.phone}</td>
                  <td style={{textAlign:'center'}}>{d.guardRel}</td>
                  <td>{d.guardPhone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

  {/* 수강월별 청구/수납 */}
  {activeSide === 'monthly-pay' && (
    <>
      <div className="pm-page-title">
        <span style={{color:'#ccc'}}>☆</span> 수강월별 청구/수납
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">조건검색</div>
          <div style={{display:'flex', gap:6}}>
            <button className="pm-teal-btn">수납내역출력</button>
            <button className="pm-reset-btn">초기화</button>
          </div>
        </div>
        <div className="pm-filter">
          <div className="pm-filter-row">
            <div className="pm-filter-item">
              <label className="pm-filter-label">수강월</label>
              <input type="month" className="pm-input" value={monthlyPayFilter.month}
                onChange={e => setMonthlyPayFilter(f => ({...f, month: e.target.value}))} />
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반 그룹</label>
              <select className="pm-input" value={monthlyPayFilter.group}
                onChange={e => setMonthlyPayFilter(f => ({...f, group: e.target.value}))}>
                <option>전체</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반명</label>
              <select className="pm-input" value={monthlyPayFilter.className}
                onChange={e => setMonthlyPayFilter(f => ({...f, className: e.target.value}))}>
                <option>선택하기</option>
              </select>
            </div>
            <div className="pm-filter-item" style={{flex:2}}>
              <label className="pm-filter-label">검색</label>
              <div style={{display:'flex', gap:6}}>
                <select className="pm-input" style={{width:130}} value={monthlyPayFilter.searchType}
                  onChange={e => setMonthlyPayFilter(f => ({...f, searchType: e.target.value}))}>
                  <option>수강생-성명</option>
                  <option>수강생-전화</option>
                </select>
                <input className="pm-input" style={{flex:1}} value={monthlyPayFilter.keyword}
                  onChange={e => setMonthlyPayFilter(f => ({...f, keyword: e.target.value}))} />
                <button className="pm-dark-btn">검색</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">수강생 목록</div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>성명</th>
                <th>반명</th>
                <th>청구금액</th>
                <th>거래일</th>
                <th>수납방법</th>
                <th>상태</th>
                <th>수납금액</th>
                <th>미납금액</th>
                <th>생성</th>
                <th>기능</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_PAY_DATA.map(d => (
                <tr key={d.id}>
                  <td style={{textAlign:'center'}}>{d.id}</td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:4}}>
                      <span>👤</span><span>{d.name}</span>
                    </div>
                  </td>
                  <td>{d.cls}</td>
                  <td style={{textAlign:'right'}}>{d.billAmt}</td>
                  <td>{d.tradeDate}</td>
                  <td>{d.payMethod}</td>
                  <td style={{textAlign:'center'}}>
                    <span style={{color: d.status === '미납' ? '#29ABE2' : '#333', cursor: d.status === '미납' ? 'pointer' : 'default'}}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{textAlign:'right'}}>{d.payAmt}</td>
                  <td style={{textAlign:'right'}}>{d.unpaid}</td>
                  <td style={{textAlign:'center', fontSize:11}}>{d.created}</td>
                  <td style={{textAlign:'center'}}>
                    <button className="monthly-reg-btn">+수기등록</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-pagination">
          <div className="pm-pages">
            {[1, 2].map(p => (
              <button key={p} className={`pm-page-btn ${p === 1 ? 'active' : ''}`}>{p}</button>
            ))}
          </div>
          <span className="pm-page-info">1 / 2 Pages</span>
        </div>
      </div>
    </>
  )}
  {/* 청구/미납내역 */}
  {activeSide === 'unpaid' && (
    <>
      <div className="pm-page-title">
        <span style={{color:'#F5C518'}}>⭐</span> 청구/미납내역
      </div>
      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">조건검색</div>
          <div style={{display:'flex', gap:6}}>
            <button className="pm-search-btn">검색하기</button>
            <button className="pm-reset-btn">초기화</button>
          </div>
        </div>
        <div className="pm-filter">
          <div className="pm-filter-row">
            <div className="pm-filter-item">
              <label className="pm-filter-label">수강월</label>
              <input type="month" className="pm-input" value={filter.month}
                onChange={e => setFilter(f => ({...f, month: e.target.value}))} />
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반 그룹</label>
              <select className="pm-input" value={filter.group}
                onChange={e => setFilter(f => ({...f, group: e.target.value}))}>
                <option>전체</option>
              </select>
            </div>
            <div className="pm-filter-item">
              <label className="pm-filter-label">반명</label>
              <select className="pm-input" value={filter.className}
                onChange={e => setFilter(f => ({...f, className: e.target.value}))}>
                <option>선택하기</option>
              </select>
            </div>
            <div className="pm-filter-item" style={{flex:2}}>
              <label className="pm-filter-label">검색</label>
              <div style={{display:'flex', gap:6}}>
                <select className="pm-input" style={{width:130}} value={filter.type}
                  onChange={e => setFilter(f => ({...f, type: e.target.value}))}>
                  <option>수강생-성명</option>
                  <option>수강생-전화</option>
                  <option>보호자-성명</option>
                </select>
                <input className="pm-input" style={{flex:1}} value={filter.keyword}
                  onChange={e => setFilter(f => ({...f, keyword: e.target.value}))} />
                <button className="pm-dark-btn">검색</button>
                <button className="pm-teal-btn">알림톡전송</button>
                <button className="pm-orange-btn">알림톡전체전송</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pm-section">
        <div className="pm-sec-head">
          <div className="pm-sec-title">수강생 목록</div>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span style={{fontSize:12, color:'#666'}}>페이지당 조회</span>
            <select className="pm-input" style={{width:60}} value={pageSize}
              onChange={e => setPageSize(e.target.value)}>
              <option>10</option><option>20</option><option>50</option>
            </select>
          </div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th><input type="checkbox"
                  checked={checked.length === SAMPLE_DATA.length}
                  onChange={toggleAll} /></th>
                <th>번호</th><th>성명</th><th>주 결제방법</th>
                <th>반명 / 납부기준일</th><th>미납금액</th>
                <th>수강생휴대폰</th><th>문자전송일</th>
                <th>보호자관계</th><th>보호자휴대폰</th><th>문자전송일</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_DATA.map(d => (
                <tr key={d.id} className={checked.includes(d.id) ? 'checked-row' : ''}>
                  <td><input type="checkbox"
                    checked={checked.includes(d.id)}
                    onChange={() => toggleCheck(d.id)} /></td>
                  <td>{d.id}</td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:4}}>
                      <span className="student-icon">👤</span>
                      <span>{d.name}</span>
                    </div>
                  </td>
                  <td>{d.method}</td>
                  <td>
                    {d.classes.map((c, i) => (
                      <div key={i} className="cls-row">
                        <span className="cls-name">{c.cls}</span>
                        <span className="cls-day">{c.day}</span>
                      </div>
                    ))}
                  </td>
                  <td className="unpaid-amt">{d.unpaid.toLocaleString()}</td>
                  <td>{d.phone}</td>
                  <td className={d.sentDate ? 'sent-date' : ''}>{d.sentDate}</td>
                  <td>{d.rel}</td>
                  <td>{d.guardPhone}</td>
                  <td className={d.guardSent ? 'sent-date-red' : ''}>{d.guardSent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-pagination">
          <div className="pm-pages">
            {[1, 2].map(p => (
              <button key={p} className={`pm-page-btn ${p === 1 ? 'active' : ''}`}>{p}</button>
            ))}
          </div>
          <span className="pm-page-info">1 / 2 Pages</span>
        </div>
      </div>
    </>
  )}
        </div>
      </div>
    </div>
  )
}
