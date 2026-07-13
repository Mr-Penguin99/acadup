import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import './Admin.css'

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
  const [period, setPeriod] = useState('일별')
  const [inflowRows, setInflowRows] = useState([])
  const [conversionRows, setConversionRows] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [now, setNow] = useState(new Date())

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
    </div>
  )
}
