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

const aggregateByPeriod = (rows, period) => {
  const counts = {}
  rows.forEach(r => {
    if (!r.created_at) return
    const key = bucketKey(r.created_at, period)
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }))
}

export default function Admin() {
  const [period, setPeriod] = useState('일별')
  const [inflowRows, setInflowRows] = useState([])
  const [conversionRows, setConversionRows] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

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
        <div className="admin-section">
          <div style={{textAlign:'center',fontSize:16,fontWeight:700,color:'#192a3c'}}>유입 / 정식전환 통계</div>
          <div style={{display:'flex',justifyContent:'center',gap:6,margin:'12px 0 20px'}}>
            {PERIODS.map(p => (
              <button key={p} className={`admin-btn ${period===p?'primary':'gray'} sm`} onClick={()=>setPeriod(p)}>{p}</button>
            ))}
          </div>

          {statsLoading ? (
            <div style={{padding:'40px',textAlign:'center',color:'#bbb'}}>불러오는 중...</div>
          ) : (
            <div style={{display:'flex',gap:20}}>
              <div style={{flex:1,border:'1px solid #eee',borderRadius:8,padding:16,boxSizing:'border-box'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#192a3c',marginBottom:8}}>
                  유입 수 (누적 {inflowRows.length}명)
                </div>
                <div style={{width:'100%',height:260}}>
                  <ResponsiveContainer>
                    <BarChart data={inflowData}>
                      <XAxis dataKey="date" fontSize={11} axisLine={{ stroke: '#333' }} tickLine={false} />
                      <YAxis allowDecimals={false} fontSize={11} axisLine={{ stroke: '#333' }} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="유입 수" fill="#29ABE2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{flex:1,border:'1px solid #eee',borderRadius:8,padding:16,boxSizing:'border-box'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#192a3c',marginBottom:8}}>
                  정식전환 버튼 클릭 수 (누적 {conversionRows.length}건)
                </div>
                <div style={{width:'100%',height:260}}>
                  <ResponsiveContainer>
                    <BarChart data={conversionData}>
                      <XAxis dataKey="date" fontSize={11} axisLine={{ stroke: '#333' }} tickLine={false} />
                      <YAxis allowDecimals={false} fontSize={11} axisLine={{ stroke: '#333' }} tickLine={false} />
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
    </div>
  )
}
