import { useState } from 'react'
import './Admin.css'

const SAMPLE_USERS = [
  { id:1,  userId:'academy01',   academyName:'아카데미업 학원',     phone:'010-1234-5678', referrer:'',          status:'승인완료', joinDate:'2026-01-15' },
  { id:2,  userId:'math_king',   academyName:'수학의왕 학원',       phone:'010-2345-6789', referrer:'academy01', status:'신청중',  joinDate:'2026-02-20' },
  { id:3,  userId:'english_pro', academyName:'영어프로 학원',       phone:'010-3456-7890', referrer:'academy01', status:'미신청',  joinDate:'2026-03-05' },
  { id:4,  userId:'science_lab', academyName:'사이언스랩 학원',     phone:'010-4567-8901', referrer:'',          status:'승인완료', joinDate:'2026-03-12' },
  { id:5,  userId:'art_center',  academyName:'아트센터 학원',       phone:'010-5678-9012', referrer:'math_king', status:'반려',   joinDate:'2026-04-01' },
  { id:6,  userId:'piano_dream', academyName:'피아노드림 학원',     phone:'010-6789-0123', referrer:'',          status:'미신청',  joinDate:'2026-04-08' },
  { id:7,  userId:'coding_kids', academyName:'코딩키즈 학원',       phone:'010-7890-1234', referrer:'academy01', status:'신청중',  joinDate:'2026-04-15' },
  { id:8,  userId:'dance_star',  academyName:'댄스스타 학원',       phone:'010-8901-2345', referrer:'',          status:'승인완료', joinDate:'2026-05-02' },
  { id:9,  userId:'book_world',  academyName:'북월드 독서 학원',    phone:'010-9012-3456', referrer:'science_lab',status:'미신청', joinDate:'2026-05-10' },
  { id:10, userId:'taekwondo01', academyName:'한국태권도 학원',     phone:'010-0123-4567', referrer:'',          status:'신청중',  joinDate:'2026-05-18' },
  { id:11, userId:'speech_up',   academyName:'스피치업 학원',       phone:'010-1111-2222', referrer:'art_center',status:'미신청',  joinDate:'2026-06-01' },
  { id:12, userId:'math_pro2',   academyName:'수학프로2 학원',      phone:'010-2222-3333', referrer:'math_king', status:'승인완료', joinDate:'2026-06-05' },
]

const STATUS_LIST = ['전체', '미신청', '신청중', '승인완료', '반려']
const PAGE_SIZE = 10

export default function Admin() {
  const [users, setUsers]           = useState(SAMPLE_USERS)
  const [searchType, setSearchType] = useState('학원명')
  const [keyword, setKeyword]       = useState('')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [page, setPage]             = useState(1)
  const [selected, setSelected]     = useState([])
  const [detailUser, setDetailUser] = useState(null)

  const filtered = users.filter(u => {
    const matchStatus = statusFilter === '전체' || u.status === statusFilter
    const matchKeyword = !keyword || (
      searchType === '학원명'   ? u.academyName.includes(keyword) :
      searchType === '아이디'   ? u.userId.includes(keyword) :
      searchType === '연락처'   ? u.phone.includes(keyword) :
      u.referrer.includes(keyword)
    )
    return matchStatus && matchKeyword
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = () => setPage(1)
  const handleReset  = () => { setKeyword(''); setStatusFilter('전체'); setPage(1) }

  const toggleAll = () =>
    setSelected(selected.length === paged.length ? [] : paged.map(u => u.id))
  const toggleOne = id =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const handleStatusChange = (id, newStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u))
    if (detailUser?.id === id) setDetailUser(d => ({ ...d, status: newStatus }))
  }

  const stats = {
    total:    users.length,
    신청중:   users.filter(u => u.status === '신청중').length,
    승인완료: users.filter(u => u.status === '승인완료').length,
    미신청:   users.filter(u => u.status === '미신청').length,
    반려:     users.filter(u => u.status === '반려').length,
  }

  return (
    <div className="admin-wrap">
      {/* 헤더 */}
      <div className="admin-header">
        <div className="admin-header-title">🛠 AcadUp 관리자</div>
        <div className="admin-header-right">
          <span>관리자</span>
          <span style={{color:'#556'}}>|</span>
          <span>로그아웃</span>
        </div>
      </div>

      <div className="admin-main">
        {/* 통계 카드 */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-label">전체 가입자</div>
            <div className="admin-stat-value">{stats.total}명</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">정식 신청중</div>
            <div className="admin-stat-value blue">{stats.신청중}건</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">승인 완료</div>
            <div className="admin-stat-value green">{stats.승인완료}건</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">미신청</div>
            <div className="admin-stat-value orange">{stats.미신청}명</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">반려</div>
            <div className="admin-stat-value red">{stats.반려}건</div>
          </div>
        </div>

        {/* 유저 목록 */}
        <div className="admin-section">
          <div className="admin-section-head">
            <span className="admin-section-title">유저 목록</span>
            <div style={{display:'flex',gap:6}}>
              <button className="admin-btn blue sm">엑셀 다운로드</button>
            </div>
          </div>

          {/* 필터 */}
          <div className="admin-filter">
            <select className="admin-filter-select" value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="admin-filter-select" value={searchType}
              onChange={e => setSearchType(e.target.value)}>
              {['학원명','아이디','연락처','추천인'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input className="admin-filter-input" placeholder={`${searchType} 검색`}
              value={keyword} onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
            <button className="admin-btn primary" onClick={handleSearch}>검색</button>
            <button className="admin-btn gray" onClick={handleReset}>초기화</button>
            <span style={{marginLeft:'auto',fontSize:12,color:'#888'}}>
              총 <strong style={{color:'#192a3c'}}>{filtered.length}</strong>명
            </span>
          </div>

          {/* 테이블 */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selected.length===paged.length&&paged.length>0} onChange={toggleAll}/></th>
                  <th>번호</th>
                  <th>아이디</th>
                  <th>학원명</th>
                  <th>연락처</th>
                  <th>추천인</th>
                  <th>정식신청현황</th>
                  <th>가입일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={9} style={{padding:'40px',color:'#bbb'}}>검색 결과가 없습니다.</td></tr>
                ) : paged.map(u => (
                  <tr key={u.id}>
                    <td><input type="checkbox" checked={selected.includes(u.id)} onChange={()=>toggleOne(u.id)}/></td>
                    <td>{u.id}</td>
                    <td>{u.userId}</td>
                    <td className="left">{u.academyName}</td>
                    <td>{u.phone}</td>
                    <td>{u.referrer || <span style={{color:'#ccc'}}>-</span>}</td>
                    <td><span className={`admin-badge ${u.status}`}>{u.status}</span></td>
                    <td>{u.joinDate}</td>
                    <td>
                      <div style={{display:'flex',gap:4,justifyContent:'center'}}>
                        <button className="admin-btn blue sm" onClick={()=>setDetailUser(u)}>상세</button>
                        {u.status==='신청중' && <>
                          <button className="admin-btn green sm" onClick={()=>handleStatusChange(u.id,'승인완료')}>승인</button>
                          <button className="admin-btn red sm" onClick={()=>handleStatusChange(u.id,'반려')}>반려</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="admin-pagination">
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} className={`admin-page-btn ${p===page?'active':''}`} onClick={()=>setPage(p)}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 모달 */}
      {detailUser && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={()=>setDetailUser(null)}>
          <div style={{background:'#fff',borderRadius:8,padding:'28px 32px',width:420,boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}
            onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:700,color:'#192a3c',marginBottom:20}}>유저 상세 정보</div>
            {[
              ['아이디',      detailUser.userId],
              ['학원명',      detailUser.academyName],
              ['연락처',      detailUser.phone],
              ['추천인',      detailUser.referrer || '-'],
              ['가입일',      detailUser.joinDate],
            ].map(([label,value])=>(
              <div key={label} style={{display:'flex',borderBottom:'1px solid #f0f0f0',padding:'9px 0',fontSize:13}}>
                <span style={{width:100,color:'#888',flexShrink:0}}>{label}</span>
                <span style={{color:'#333'}}>{value}</span>
              </div>
            ))}
            <div style={{display:'flex',borderBottom:'1px solid #f0f0f0',padding:'9px 0',fontSize:13,alignItems:'center'}}>
              <span style={{width:100,color:'#888',flexShrink:0}}>정식신청현황</span>
              <span className={`admin-badge ${detailUser.status}`}>{detailUser.status}</span>
            </div>
            <div style={{display:'flex',gap:8,marginTop:20,justifyContent:'flex-end'}}>
              {detailUser.status==='신청중' && <>
                <button className="admin-btn green" onClick={()=>handleStatusChange(detailUser.id,'승인완료')}>승인</button>
                <button className="admin-btn red"   onClick={()=>handleStatusChange(detailUser.id,'반려')}>반려</button>
              </>}
              <button className="admin-btn gray" onClick={()=>setDetailUser(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
