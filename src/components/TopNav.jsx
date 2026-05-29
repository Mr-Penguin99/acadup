import { useNavigate } from 'react-router-dom'

const TOP_RIGHT = [
  { icon: '/icons/tnav-home.svg',     label: '메인홈',  path: '/dashboard' },
  { icon: '/icons/tnav-book.svg',     label: '교재관리', path: null },
  { icon: '/icons/tnav-settings.svg', label: '환경설정', path: '/settings' },
  { icon: '/icons/tnav-quick.svg',    label: '빠른메뉴', path: null },
  { icon: '/icons/tnav-remote.svg',   label: '원격지원', path: null },
]

export default function TopNav() {
  const navigate = useNavigate()

  return (
    <div className="top-nav">
      <div className="tnav-left">
        <img src="/logo-en.svg" alt="AcademyUP" className="tnav-logo" />
        <div className="tnav-sep" />
        <span className="tnav-item tnav-academy">
          <img src="/icons/tnav-academy.svg" className="tnav-icon" /> OO학원
        </span>
        <div className="tnav-sep" />
        <span className="tnav-item">원장 (200001)님</span>
        <div className="tnav-sep" />
        <span className="tnav-link">나의정보</span>
      </div>
      <div className="tnav-right">
        {TOP_RIGHT.map(item => (
          <span key={item.label} className="tnav-link"
            onClick={() => item.path && navigate(item.path)}>
            <img src={item.icon} className="tnav-icon" /> {item.label}
          </span>
        ))}
        <span className="tnav-link" onClick={() => navigate('/')}>
          <img src="/icons/tnav-logout.svg" className="tnav-icon" /> 로그아웃
        </span>
      </div>
    </div>
  )
}