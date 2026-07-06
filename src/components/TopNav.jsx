import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const EMP_NO = '260001'

export default function TopNav() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [showQuick, setShowQuick] = useState(false)
  const academyName = profile?.biz_name || 'OO학원'
  const userName = profile?.owner_name || '원장'
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites')) || [] }
    catch { return [] }
  })

  // localStorage 변경 감지
  useEffect(() => {
    const sync = () => {
      try { setFavorites(JSON.parse(localStorage.getItem('favorites')) || []) }
      catch { setFavorites([]) }
    }
    window.addEventListener('storage', sync)
    const interval = setInterval(sync, 500)
    return () => { window.removeEventListener('storage', sync); clearInterval(interval) }
  }, [])

  const TOP_RIGHT = [
    { icon: '/icons/tnav-home.svg',     label: '메인홈',  path: '/dashboard' },
    { icon: '/icons/tnav-book.svg',     label: '교재관리', path: null },
    { icon: '/icons/tnav-settings.svg', label: '환경설정', path: '/settings' },
  ]

  return (
    <div className="top-nav" style={{position:'relative'}}>
      <div className="tnav-left">
        <img src="/logo-en.svg" alt="AcademyUP" className="tnav-logo" />
        <div className="tnav-sep" />
        <span className="tnav-item tnav-academy">
          <img src="/icons/tnav-academy.svg" className="tnav-icon" /> {academyName}
        </span>
        <div className="tnav-sep" />
        <span className="tnav-item">{userName} ({EMP_NO})님</span>
        <div className="tnav-sep" />
        <span className="tnav-link" style={{cursor:'pointer'}}
         onClick={() => window.open('/myinfo', '_blank', 'width=1250,height=950')}>
         나의정보
        </span>
      </div>
      <div className="tnav-right">
        {TOP_RIGHT.map(item => (
          <span key={item.label} className="tnav-link"
            onClick={() => item.path && navigate(item.path)}>
            <img src={item.icon} className="tnav-icon" /> {item.label}
          </span>
        ))}

        {/* 빠른메뉴 */}
        <span className="tnav-link" style={{position:'relative'}}
          onClick={() => setShowQuick(s => !s)}>
          <img src="/icons/tnav-quick.svg" className="tnav-icon" /> 빠른메뉴
        </span>

        {/* 빠른메뉴 드롭다운 */}
        {showQuick && (
          <>
            <div style={{
              position:'fixed', inset:0, zIndex:998
            }} onClick={() => setShowQuick(false)} />
            <div style={{
              position:'absolute', top:36, right:60,
              background:'#fff', border:'1px solid #ddd',
              borderRadius:6, boxShadow:'0 4px 12px rgba(0,0,0,0.15)',
              minWidth:180, zIndex:999, overflow:'hidden',
            }}>
              <div style={{
                padding:'8px 14px', fontSize:12, fontWeight:700,
                color:'#888', borderBottom:'1px solid #eee',
                background:'#fafafa',
              }}>즐겨찾기</div>
              {favorites.length === 0 ? (
                <div style={{padding:'16px 14px', fontSize:13, color:'#bbb', textAlign:'center'}}>
                  즐겨찾기가 없습니다.
                </div>
              ) : (
                favorites.map(f => (
                  <div key={f.path} style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'10px 14px', fontSize:13, color:'#333',
                    cursor:'pointer', borderBottom:'1px solid #f5f5f5',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background='#fff4ec'}
                    onMouseLeave={e => e.currentTarget.style.background='#fff'}
                    onClick={() => { navigate(f.path); setShowQuick(false) }}>
                    <img src="/icons/title-star.svg" style={{
                      width:14, height:14,
                      filter:'invert(83%) sepia(60%) saturate(800%) hue-rotate(5deg) brightness(105%)'
                    }}/>
                    {f.label}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <span className="tnav-link">
          <img src="/icons/tnav-remote.svg" className="tnav-icon" /> 원격지원
        </span>

        <span className="tnav-link" onClick={() => navigate('/')}>
          <img src="/icons/tnav-logout.svg" className="tnav-icon" /> 로그아웃
        </span>
      </div>
    </div>
  )
}
