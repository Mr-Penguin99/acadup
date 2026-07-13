import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { DEVICE_PRODUCTS, ATTACHMENT_FIELDS } from '../lib/conversionFlowConstants'
import './Admin.css'

const PAGES = [
  { id: 'stats', label: '통계' },
  { id: 'migration', label: '데이터이전' },
  { id: 'device', label: '단말기 신청' },
]

const PERIODS = ['일별', '월별', '연도별']

const bucketKey = (isoDate, period) => {
  const d = new Date(isoDate)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  if (period === '연도별') return `${y}`
  if (period === '월별') return `${y}-${m}`
  return `${y}-${m}-${day}`
}

// 일별=이번 달의 모든 날짜(1~말일), 월별=올해의 1~12월, 연도별=2025년부터 올해까지를
// 항상 전부 채워서 보여줌(데이터 없는 날/달/연도도 0으로 표시) - 연도별은 시작을 2025로 고정해두고
// 끝은 항상 "올해"이므로, 해가 바뀌면(예: 2027년) 자동으로 막대가 하나씩 늘어남
const STATS_START_YEAR = 2025

const buildFullBuckets = (period) => {
  const now = new Date()
  if (period === '일별') {
    const y = now.getFullYear(), m = now.getMonth()
    const days = new Date(y, m + 1, 0).getDate()
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1
      return { key: `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, label: `${day}일` }
    })
  }
  if (period === '월별') {
    const y = now.getFullYear()
    return Array.from({ length: 12 }, (_, i) => ({ key: `${y}-${String(i + 1).padStart(2, '0')}`, label: `${i + 1}월` }))
  }
  if (period === '연도별') {
    const y = now.getFullYear()
    const count = Math.max(1, y - STATS_START_YEAR + 1)
    return Array.from({ length: count }, (_, i) => {
      const year = STATS_START_YEAR + i
      return { key: `${year}`, label: `${year}년` }
    })
  }
  return null
}

const aggregateByPeriod = (rows, period) => {
  const counts = {}
  rows.forEach(r => {
    if (!r.created_at) return
    const key = bucketKey(r.created_at, period)
    counts[key] = (counts[key] || 0) + 1
  })
  const fullBuckets = buildFullBuckets(period)
  if (fullBuckets) {
    return fullBuckets.map(({ key, label }) => ({ date: label, count: counts[key] || 0 }))
  }
  return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }))
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const formatNow = (d) =>
  `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]}) ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`

export default function Admin() {
  const [page, setPage] = useState('stats')

  const [period, setPeriod] = useState('일별')
  const [inflowRows, setInflowRows] = useState([])
  const [conversionRows, setConversionRows] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  const [migrationRows, setMigrationRows] = useState([])
  const [migrationLoading, setMigrationLoading] = useState(true)
  const [migrationSubTab, setMigrationSubTab] = useState('all') // 'all' | 'pending' | 'completed' | 'trash'
  const [selectedMigrationIds, setSelectedMigrationIds] = useState(new Set())

  const [deviceRows, setDeviceRows] = useState([])
  const [deviceLoading, setDeviceLoading] = useState(true)
  const [deviceSubTab, setDeviceSubTab] = useState('list') // 'list' | 'trash'
  const [selectedDeviceIds, setSelectedDeviceIds] = useState(new Set())
  const [attachmentView, setAttachmentView] = useState(null)
  const [attachmentUrls, setAttachmentUrls] = useState({})

  const [memoEdit, setMemoEdit] = useState(null)
  const [memoForm, setMemoForm] = useState({ academyName: '', contactName: '', phone: '' })

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let cancelled = false
    setStatsLoading(true)
    Promise.all([
      supabaseAdmin.from('profiles').select('created_at'),
      supabaseAdmin.from('conversion_clicks').select('created_at'),
    ]).then(([profilesRes, clicksRes]) => {
      if (cancelled) return
      setInflowRows(profilesRes.data || [])
      setConversionRows(clicksRes.data || [])
      setStatsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const loadMigration = () => {
    setMigrationLoading(true)
    Promise.all([
      supabaseAdmin.from('data_migration_requests').select('id, user_id, status, created_at, memo, deleted_at').order('created_at', { ascending: false }),
      supabaseAdmin.from('profiles').select('id, biz_name, owner_name, phone, email'),
    ]).then(([reqRes, profRes]) => {
      const profMap = {}
      ;(profRes.data || []).forEach(p => { profMap[p.id] = p })
      const rows = (reqRes.data || []).map(r => ({ ...r, profile: profMap[r.user_id] || null }))
      setMigrationRows(rows)
      setMigrationLoading(false)
    })
  }

  const loadDevice = () => {
    setDeviceLoading(true)
    supabaseAdmin.from('device_applications').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setDeviceRows(data || [])
      setDeviceLoading(false)
    })
  }

  useEffect(() => {
    if (page === 'migration' && migrationRows.length === 0) loadMigration()
    if (page === 'device' && deviceRows.length === 0) loadDevice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const completeMigration = async (id) => {
    await supabaseAdmin.from('data_migration_requests').update({ status: 'completed' }).eq('id', id)
    loadMigration()
  }

  const toggleMigrationSelect = (id) => {
    setSelectedMigrationIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const deleteSelectedMigration = async () => {
    if (selectedMigrationIds.size === 0) return
    const ids = Array.from(selectedMigrationIds)
    if (migrationSubTab === 'trash') {
      if (!window.confirm(`선택한 ${ids.length}건을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return
      await supabaseAdmin.from('data_migration_requests').delete().in('id', ids)
    } else {
      if (!window.confirm(`선택한 ${ids.length}건을 휴지통으로 이동하시겠습니까?`)) return
      await supabaseAdmin.from('data_migration_requests').update({ deleted_at: new Date().toISOString() }).in('id', ids)
    }
    setSelectedMigrationIds(new Set())
    loadMigration()
  }

  const cancelMigrationComplete = async (id) => {
    await supabaseAdmin.from('data_migration_requests').update({ status: 'requested' }).eq('id', id)
    loadMigration()
  }

  const toggleDeviceSelect = (id) => {
    setSelectedDeviceIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const deleteSelectedDevice = async () => {
    if (selectedDeviceIds.size === 0) return
    const ids = Array.from(selectedDeviceIds)
    if (deviceSubTab === 'trash') {
      if (!window.confirm(`선택한 ${ids.length}건을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return
      await supabaseAdmin.from('device_applications').delete().in('id', ids)
    } else {
      if (!window.confirm(`선택한 ${ids.length}건을 휴지통으로 이동하시겠습니까?`)) return
      await supabaseAdmin.from('device_applications').update({ deleted_at: new Date().toISOString() }).in('id', ids)
    }
    setSelectedDeviceIds(new Set())
    loadDevice()
  }

  const openMemoEdit = (row) => {
    setMemoEdit(row)
    setMemoForm({
      academyName: row.memo?.academyName || '',
      contactName: row.memo?.contactName || '',
      phone: row.memo?.phone || '',
    })
  }

  const saveMemo = async () => {
    await supabaseAdmin.from('data_migration_requests').update({ memo: memoForm }).eq('id', memoEdit.id)
    setMemoEdit(null)
    loadMigration()
  }

  const openAttachments = async (row) => {
    setAttachmentView(row)
    const attachments = row.attachments || {}
    const entries = await Promise.all(
      Object.entries(attachments).map(async ([key, path]) => {
        const { data } = await supabaseAdmin.storage.from('device-attachments').createSignedUrl(path, 300)
        return [key, data?.signedUrl || null]
      })
    )
    setAttachmentUrls(Object.fromEntries(entries))
  }

  const inflowData = aggregateByPeriod(inflowRows, period)
  const conversionData = aggregateByPeriod(conversionRows, period)

  return (
    <div className="admin-wrap">
      {/* 헤더 */}
      <div className="admin-header">
        <div className="admin-header-title">🛠 AcadUp 관리자</div>
        <div className="admin-header-right">
          <span>관리자</span>
          <span style={{color:'#556'}}>|</span>
          <span style={{cursor:'pointer'}} onClick={()=>supabaseAdmin.auth.signOut()}>로그아웃</span>
        </div>
      </div>

      <div style={{display:'flex',gap:6,padding:'10px 24px',background:'#fff',borderBottom:'1px solid #eee'}}>
        {PAGES.map(p => (
          <button key={p.id} className={`admin-btn ${page===p.id?'primary':'gray'} sm`} onClick={()=>setPage(p.id)}>{p.label}</button>
        ))}
      </div>

      {page === 'stats' && (
      <div className="admin-main">
        <div style={{textAlign:'center',fontSize:24,fontWeight:700,color:'#192a3c'}}>유입 / 정식전환 통계</div>
        <div style={{textAlign:'center',fontSize:18,color:'#888',marginTop:6}}>{formatNow(now)}</div>
        <div style={{display:'flex',justifyContent:'center',gap:6,margin:'12px 0 20px'}}>
          {PERIODS.map(p => (
            <button key={p} className={`admin-btn ${period===p?'primary':'gray'} sm`} onClick={()=>setPeriod(p)}>{p}</button>
          ))}
        </div>

        {statsLoading ? (
          <div style={{padding:'40px',textAlign:'center',color:'#bbb'}}>불러오는 중...</div>
        ) : (
          <div style={{display:'flex',gap:20}}>
            <div style={{flex:1,background:'#fff',border:'1px solid #eee',borderRadius:8,padding:16,boxSizing:'border-box'}}>
              <div style={{fontSize:18,fontWeight:500,color:'#192a3c',marginBottom:8,textAlign:'right'}}>
                유입 수 (누적 {inflowRows.length}명)
              </div>
              <div style={{width:'100%',height:380}}>
                <ResponsiveContainer>
                  <BarChart data={inflowData}>
                    <XAxis dataKey="date" fontSize={11} axisLine={{ stroke: '#333' }} tickLine={false} />
                    <YAxis allowDecimals={false} fontSize={11} axisLine={{ stroke: '#333' }} tickLine={false} domain={[0, (dataMax) => Math.max(20, dataMax)]} />
                    <Tooltip />
                    <Bar dataKey="count" name="유입 수" fill="#29ABE2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{flex:1,background:'#fff',border:'1px solid #eee',borderRadius:8,padding:16,boxSizing:'border-box'}}>
              <div style={{fontSize:18,fontWeight:500,color:'#192a3c',marginBottom:8,textAlign:'right'}}>
                정식전환 버튼 클릭 수 (누적 {conversionRows.length}건)
              </div>
              <div style={{width:'100%',height:380}}>
                <ResponsiveContainer>
                  <BarChart data={conversionData}>
                    <XAxis dataKey="date" fontSize={11} axisLine={{ stroke: '#333' }} tickLine={false} />
                    <YAxis allowDecimals={false} fontSize={11} axisLine={{ stroke: '#333' }} tickLine={false} domain={[0, (dataMax) => Math.max(20, dataMax)]} />
                    <Tooltip />
                    <Bar dataKey="count" name="정식전환 클릭 수" fill="#ff9000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {page === 'migration' && (() => {
        const visibleMigrationRows = migrationRows.filter(r => {
          if (migrationSubTab === 'trash') return !!r.deleted_at
          if (r.deleted_at) return false
          if (migrationSubTab === 'pending') return r.status !== 'completed'
          if (migrationSubTab === 'completed') return r.status === 'completed'
          return true
        })
        return (
      <div className="admin-main">
        <div className="admin-section">
          <div className="admin-section-head">
            <div className="admin-section-title">데이터이전 신청 현황</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button className={`admin-btn ${migrationSubTab==='all'?'primary':'gray'} sm`} onClick={() => { setMigrationSubTab('all'); setSelectedMigrationIds(new Set()) }}>전체</button>
              <button className={`admin-btn ${migrationSubTab==='pending'?'primary':'gray'} sm`} onClick={() => { setMigrationSubTab('pending'); setSelectedMigrationIds(new Set()) }}>대기</button>
              <button className={`admin-btn ${migrationSubTab==='completed'?'primary':'gray'} sm`} onClick={() => { setMigrationSubTab('completed'); setSelectedMigrationIds(new Set()) }}>완료</button>
              <button className={`admin-btn ${migrationSubTab==='trash'?'primary':'gray'} sm`} onClick={() => { setMigrationSubTab('trash'); setSelectedMigrationIds(new Set()) }}>휴지통</button>
              <button className="admin-btn red sm" disabled={selectedMigrationIds.size===0} onClick={deleteSelectedMigration}>삭제</button>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox"
                      checked={visibleMigrationRows.length > 0 && visibleMigrationRows.every(r => selectedMigrationIds.has(r.id))}
                      onChange={() => {
                        const allSelected = visibleMigrationRows.length > 0 && visibleMigrationRows.every(r => selectedMigrationIds.has(r.id))
                        setSelectedMigrationIds(allSelected ? new Set() : new Set(visibleMigrationRows.map(r => r.id)))
                      }} />
                  </th>
                  <th>신청일</th>
                  <th>학원명</th>
                  <th>성명</th>
                  <th>연락처</th>
                  <th>완료여부</th>
                  <th>완료처리</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody>
                {migrationLoading ? (
                  <tr><td colSpan={8} style={{padding:24,color:'#bbb'}}>불러오는 중...</td></tr>
                ) : visibleMigrationRows.length === 0 ? (
                  <tr><td colSpan={8} style={{padding:24,color:'#bbb'}}>{migrationSubTab==='trash' ? '휴지통이 비어있습니다.' : '신청 내역이 없습니다.'}</td></tr>
                ) : visibleMigrationRows.map(row => (
                  <tr key={row.id}>
                    <td><input type="checkbox" checked={selectedMigrationIds.has(row.id)} onChange={() => toggleMigrationSelect(row.id)} /></td>
                    <td>{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                    <td>{row.memo?.academyName || row.profile?.biz_name || '-'}</td>
                    <td>{row.memo?.contactName || row.profile?.owner_name || '-'}</td>
                    <td>{row.memo?.phone || row.profile?.phone || '-'}</td>
                    <td>{row.status === 'completed' ? 'O' : row.status === 'skipped' ? '건너뜀' : 'X'}</td>
                    <td>
                      {migrationSubTab === 'trash' ? '-' : row.status === 'requested' ? (
                        <button className="admin-btn green sm" onClick={() => completeMigration(row.id)}>완료처리</button>
                      ) : row.status === 'completed' ? (
                        <button className="admin-btn red sm" onClick={() => cancelMigrationComplete(row.id)}>대기처리</button>
                      ) : '-'}
                    </td>
                    <td>{migrationSubTab === 'trash' ? '-' : <button className="admin-btn gray sm" onClick={() => openMemoEdit(row)}>선택</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        )
      })()}

      {page === 'device' && (() => {
        const visibleDeviceRows = deviceRows.filter(r => deviceSubTab === 'trash' ? !!r.deleted_at : !r.deleted_at)
        return (
      <div className="admin-main">
        <div className="admin-section">
          <div className="admin-section-head">
            <div className="admin-section-title">단말기 신청 현황</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button className={`admin-btn ${deviceSubTab==='list'?'primary':'gray'} sm`} onClick={() => { setDeviceSubTab('list'); setSelectedDeviceIds(new Set()) }}>목록</button>
              <button className={`admin-btn ${deviceSubTab==='trash'?'primary':'gray'} sm`} onClick={() => { setDeviceSubTab('trash'); setSelectedDeviceIds(new Set()) }}>휴지통</button>
              <button className="admin-btn red sm" disabled={selectedDeviceIds.size===0} onClick={deleteSelectedDevice}>삭제</button>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox"
                      checked={visibleDeviceRows.length > 0 && visibleDeviceRows.every(r => selectedDeviceIds.has(r.id))}
                      onChange={() => {
                        const allSelected = visibleDeviceRows.length > 0 && visibleDeviceRows.every(r => selectedDeviceIds.has(r.id))
                        setSelectedDeviceIds(allSelected ? new Set() : new Set(visibleDeviceRows.map(r => r.id)))
                      }} />
                  </th>
                  <th>상품</th>
                  <th>사업자번호</th>
                  <th>학원명</th>
                  <th>연락처</th>
                  <th>주소</th>
                  <th>신청일</th>
                  <th>첨부파일</th>
                </tr>
              </thead>
              <tbody>
                {deviceLoading ? (
                  <tr><td colSpan={8} style={{padding:24,color:'#bbb'}}>불러오는 중...</td></tr>
                ) : visibleDeviceRows.length === 0 ? (
                  <tr><td colSpan={8} style={{padding:24,color:'#bbb'}}>{deviceSubTab==='trash' ? '휴지통이 비어있습니다.' : '신청 내역이 없습니다.'}</td></tr>
                ) : visibleDeviceRows.map(row => (
                  <tr key={row.id}>
                    <td><input type="checkbox" checked={selectedDeviceIds.has(row.id)} onChange={() => toggleDeviceSelect(row.id)} /></td>
                    <td>{row.product}{DEVICE_PRODUCTS[row.product] ? ` (${DEVICE_PRODUCTS[row.product].name})` : ''}</td>
                    <td>{row.biz_no}</td>
                    <td>{row.academy_name}</td>
                    <td>{row.phone}</td>
                    <td className="left">{row.address}</td>
                    <td>{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                    <td>{deviceSubTab === 'trash' ? '-' : <button className="admin-btn blue sm" onClick={() => openAttachments(row)}>첨부파일 확인</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        )
      })()}

      {attachmentView && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:5000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={() => { setAttachmentView(null); setAttachmentUrls({}) }}>
          <div style={{background:'#fff',borderRadius:10,padding:'24px 28px',width:420,maxWidth:'92vw',maxHeight:'82vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:700,color:'#192a3c',marginBottom:16}}>{attachmentView.academy_name} 첨부파일</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {ATTACHMENT_FIELDS.map(({ key, label }) => (
                <div key={key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:13,padding:'6px 0',borderBottom:'1px solid #f0f0f0'}}>
                  <span style={{color:'#555'}}>{label}</span>
                  {attachmentUrls[key] ? (
                    <a href={attachmentUrls[key]} target="_blank" rel="noreferrer" style={{color:'#00a2ff'}}>보기</a>
                  ) : (
                    <span style={{color:'#ccc'}}>미첨부</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{textAlign:'right',marginTop:18}}>
              <button className="admin-btn gray sm" onClick={() => { setAttachmentView(null); setAttachmentUrls({}) }}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {memoEdit && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:5000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={() => setMemoEdit(null)}>
          <div style={{background:'#fff',borderRadius:10,padding:'24px 28px',width:360,maxWidth:'92vw'}} onClick={e => e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:700,color:'#192a3c',marginBottom:16}}>메모 - 학원명/성명/연락처 입력</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <input className="admin-filter-input" style={{width:'100%',boxSizing:'border-box'}} placeholder="학원명" value={memoForm.academyName} onChange={e => setMemoForm(f => ({ ...f, academyName: e.target.value }))} />
              <input className="admin-filter-input" style={{width:'100%',boxSizing:'border-box'}} placeholder="성명" value={memoForm.contactName} onChange={e => setMemoForm(f => ({ ...f, contactName: e.target.value }))} />
              <input className="admin-filter-input" style={{width:'100%',boxSizing:'border-box'}} placeholder="연락처" value={memoForm.phone} onChange={e => setMemoForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:18}}>
              <button className="admin-btn gray sm" onClick={() => setMemoEdit(null)}>취소</button>
              <button className="admin-btn primary sm" onClick={saveMemo}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
