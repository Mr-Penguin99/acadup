import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Settings.css'
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
    id: 'academy', label: '학원정보 설정',
    items: [{ id: 'basic', label: '학원 기본정보' }]
  },
  {
    id: 'auth', label: '권한 관리',
    items: [
      { id: 'auth-group', label: '권한그룹명 변경' },
      { id: 'auth-user',  label: '사용자별 권한관리' },
      { id: 'auth-mgmt',  label: '그룹별 사용자관리' },
    ]
  },
  {
    id: 'code', label: '코드 관리',
    items: [
      { id: 'code-status', label: '코드 현황' },
    ]
  },
  {
    id: 'resid', label: '주민번호 예외처리',
    items: [
      { id: 'resid-status', label: '주민번호 예외 현황' },
    ]
  },
]

export default function Settings() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('')
  const [activeSide, setActiveSide] = useState('basic')
  const [expanded, setExpanded] = useState(['academy'])
  const [editing, setEditing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [form, setForm] = useState({
    name: 'OO학원',       bizNo: '123-45-67891',
    code: '10102093',     taxType: '면세',
    region1: '서울',      region2: '중구',
    regNo: '000000',      tel: '010-0000-0000',
    adminTel: '010-0000-0000',
    email1: '', email2: '', emailType: '직접입력',
    fax: '',
    zip: '', addr: '', addrDetail: '',
    ownerName: '홍길동',  nationality: '내국인',
    resId1: '000000',     resId2: '1111111',
    classroom: '', classroomCnt: '',
    office: '', deskCnt: '',
    lounge: '', bus: '',
    billDay: '25',
  })

  const toggleGroup = id => {
    setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id])
  }

  return (
    <div className="settings-wrap">

      <TopNav />

      {/* 메뉴 바 */}
      <div className="menu-bar">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(s => !s)}>
        ☰
        </button>
        <div className="menu-list">
          {MENUS.map(m => (
            <div key={m.id}
              className={`menu-item ${activeMenu === m.id ? 'active' : ''}`}
              onClick={() => {
                 setActiveMenu(m.id)
                 if (m.id === 'students') navigate('/students')
                 if (m.id === 'dashboard') navigate('/dashboard')
                 if (m.id === 'payments') navigate('/payments')
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
      <div className="settings-body">

        {/* 왼쪽 사이드바 */}
{sidebarOpen && (
  <div className="settings-sidebar">
    <div className="ss-title">환경설정</div>
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

        {/* 오른쪽 콘텐츠 */}
        <div className="settings-main">
          <div className="sm-page-title">
            <span className="sm-title-icon">✦</span> 학원 기본정보
          </div>

          {/* 기본정보 섹션 */}
          <div className="sm-section">
            <div className="sm-sec-head">
              <div className="sm-sec-title">기본정보</div>
              <button className="sm-edit-btn" onClick={() => setEditing(!editing)}>
                {editing ? '저장' : '수정'}
              </button>
            </div>
            <div className="sm-form">

              <div className="sm-row">
                <div className="sm-field">
                  <label className="sm-label required">학원명</label>
                  <input className="sm-input" value={form.name}
                    readOnly={!editing}
                    onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div className="sm-field">
                  <label className="sm-label required">사업자번호</label>
                  <input className="sm-input" value={form.bizNo}
                    readOnly={!editing}
                    onChange={e => setForm(f => ({...f, bizNo: e.target.value}))}
                    placeholder="예: 123-45-67890" />
                </div>
              </div>

              <div className="sm-row">
                <div className="sm-field">
                  <label className="sm-label required">학원코드</label>
                  <input className="sm-input" value={form.code} readOnly />
                </div>
                <div className="sm-field">
                  <label className="sm-label required">과세유형</label>
                  <select className="sm-input" value={form.taxType} disabled={!editing}
                    onChange={e => setForm(f => ({...f, taxType: e.target.value}))}>
                    <option>면세</option><option>과세</option>
                  </select>
                </div>
              </div>

              <div className="sm-row">
                <div className="sm-field">
                  <label className="sm-label required">관할교육청/지청</label>
                  <div style={{display:'flex',gap:6}}>
                    <select className="sm-input" style={{width:90}} value={form.region1}
                      disabled={!editing}
                      onChange={e => setForm(f => ({...f, region1: e.target.value}))}>
                      {['서울','경기','인천','부산','대구','광주','대전','울산'].map(r=><option key={r}>{r}</option>)}
                    </select>
                    <input className="sm-input" value={form.region2}
                      readOnly={!editing} placeholder="동부,서부,남부,북부,중부,강남서조"
                      onChange={e => setForm(f => ({...f, region2: e.target.value}))} />
                  </div>
                </div>
                <div className="sm-field">
                  <label className="sm-label required">학원등록번호</label>
                  <input className="sm-input" value={form.regNo}
                    readOnly={!editing}
                    onChange={e => setForm(f => ({...f, regNo: e.target.value}))} />
                </div>
              </div>

              <div className="sm-row">
                <div className="sm-field">
                  <label className="sm-label required">전화번호</label>
                  <input className="sm-input" value={form.tel}
                    readOnly={!editing} placeholder="* 알림전송 발신번호"
                    onChange={e => setForm(f => ({...f, tel: e.target.value}))} />
                </div>
                <div className="sm-field">
                  <label className="sm-label required">관리자 휴대폰</label>
                  <input className="sm-input" value={form.adminTel}
                    readOnly={!editing} placeholder="* 청구서 안내문자 발송"
                    onChange={e => setForm(f => ({...f, adminTel: e.target.value}))} />
                </div>
              </div>

              <div className="sm-row">
                <div className="sm-field">
                  <label className="sm-label">이메일</label>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <input className="sm-input" style={{flex:1}} value={form.email1}
                      readOnly={!editing}
                      onChange={e => setForm(f => ({...f, email1: e.target.value}))} />
                    <span>@</span>
                    <input className="sm-input" style={{flex:1}} value={form.email2}
                      readOnly={!editing}
                      onChange={e => setForm(f => ({...f, email2: e.target.value}))} />
                    <select className="sm-input" style={{width:90}} value={form.emailType}
                      disabled={!editing}
                      onChange={e => setForm(f => ({...f, emailType: e.target.value}))}>
                      <option>직접입력</option>
                      <option>gmail.com</option>
                      <option>naver.com</option>
                      <option>kakao.com</option>
                    </select>
                  </div>
                </div>
                <div className="sm-field">
                  <label className="sm-label">팩스번호</label>
                  <input className="sm-input" value={form.fax}
                    readOnly={!editing} placeholder="예: 02-1234-5678"
                    onChange={e => setForm(f => ({...f, fax: e.target.value}))} />
                </div>
              </div>

              <div className="sm-row">
                <div className="sm-field" style={{flex:2}}>
                  <label className="sm-label">주소</label>
                  <div style={{display:'flex',gap:6,marginBottom:6}}>
                    <input className="sm-input" style={{width:120}} value={form.zip}
                      readOnly={!editing} placeholder="우편번호"
                      onChange={e => setForm(f => ({...f, zip: e.target.value}))} />
                    <button className="sm-zip-btn" disabled={!editing}>우편번호 찾기</button>
                  </div>
                  <input className="sm-input" style={{width:'100%',marginBottom:6}} value={form.addr}
                    readOnly={!editing}
                    onChange={e => setForm(f => ({...f, addr: e.target.value}))} />
                  <input className="sm-input" style={{width:'100%'}} value={form.addrDetail}
                    readOnly={!editing} placeholder="상세주소를 입력해 주세요."
                    onChange={e => setForm(f => ({...f, addrDetail: e.target.value}))} />
                </div>
              </div>

            </div>
          </div>

          {/* 대표자 섹션 */}
          <div className="sm-section">
            <div className="sm-sec-head">
              <div className="sm-sec-title">대표자</div>
            </div>
            <div className="sm-form">
              <div className="sm-row">
                <div className="sm-field">
                  <label className="sm-label required">대표자명</label>
                  <input className="sm-input" value={form.ownerName}
                    readOnly={!editing}
                    onChange={e => setForm(f => ({...f, ownerName: e.target.value}))} />
                </div>
                <div className="sm-field">
                  <label className="sm-label required">내/외국인선택</label>
                  <div style={{display:'flex',gap:16,alignItems:'center',padding:'8px 0'}}>
                    {['내국인','외국인'].map(n=>(
                      <label key={n} style={{display:'flex',alignItems:'center',gap:4,fontSize:13,cursor:'pointer'}}>
                        <input type="radio" name="nationality" value={n}
                          checked={form.nationality===n} disabled={!editing}
                          onChange={e=>setForm(f=>({...f,nationality:e.target.value}))} />
                        {n}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sm-row">
                <div className="sm-field">
                  <label className="sm-label required">주민등록번호</label>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <input className="sm-input" style={{width:110}} value={form.resId1}
                      readOnly={!editing} maxLength={6}
                      onChange={e=>setForm(f=>({...f,resId1:e.target.value}))} />
                    <span>-</span>
                    <input className="sm-input" style={{width:110}} value={form.resId2}
                      readOnly={!editing} maxLength={7} type="password"
                      onChange={e=>setForm(f=>({...f,resId2:e.target.value}))} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 사업장 시설 섹션 */}
          <div className="sm-section">
            <div className="sm-sec-head">
              <div className="sm-sec-title">사업장 시설</div>
            </div>
            <div className="sm-form">
              <div className="sm-row">
                <div className="sm-field">
                  <label className="sm-label">사업장시설</label>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {[
                      {l:'강의실',k:'classroom',unit:'㎡'},{l:'사무실',k:'office',unit:'㎡'},{l:'휴게실외',k:'lounge',unit:'㎡'}
                    ].map(({l,k,unit})=>(
                      <div key={k} style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{width:50,fontSize:13,color:'#555'}}>{l}</span>
                        <input className="sm-input" style={{width:80}} value={form[k]}
                          readOnly={!editing}
                          onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
                        <span style={{fontSize:13}}>{unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sm-field">
                  <label className="sm-label" style={{visibility:'hidden'}}>-</label>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {[
                      {l:'강의실수',k:'classroomCnt',unit:'개'},{l:'책상수',k:'deskCnt',unit:'개'},{l:'통학 버스',k:'bus',unit:'대'}
                    ].map(({l,k,unit})=>(
                      <div key={k} style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{width:60,fontSize:13,color:'#555'}}>{l}</span>
                        <input className="sm-input" style={{width:80}} value={form[k]}
                          readOnly={!editing}
                          onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
                        <span style={{fontSize:13}}>{unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 청구 설정 섹션 */}
          <div className="sm-section">
            <div className="sm-sec-head">
              <div className="sm-sec-title">청구 설정</div>
            </div>
            <div className="sm-form">
              <div className="sm-row">
                <div className="sm-field">
                  <label className="sm-label">자동 청구 생성일</label>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <select className="sm-input" style={{width:120}} value={form.billDay}
                      disabled={!editing}
                      onChange={e=>setForm(f=>({...f,billDay:e.target.value}))}>
                      {Array.from({length:28},(_,i)=>`${i+1}`).map(d=>(
                        <option key={d} value={d}>매월 {d}일</option>
                      ))}
                    </select>
                    <span style={{fontSize:12,color:'#555'}}>
                      * 자동청구 생성일에 <strong>다음 달 수강할 청구서</strong>가 생성됩니다.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}