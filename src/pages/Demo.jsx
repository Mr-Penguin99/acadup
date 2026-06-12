import { useNavigate } from 'react-router-dom'
import './Demo.css'

const logo = '/logo.svg'

export default function Demo() {
  const navigate = useNavigate()

  return (
    <div className="demo-page">
      <div className="demo-header">
        <img src={logo} alt="아카데미UP" className="demo-logo" />
        <p className="demo-tagline">학원운영 통합관리 솔루션</p>
      </div>

      <div className="demo-boxes">
        <div className="demo-box" onClick={() => navigate('/signup')}>
          <div className="demo-box-icon">📝</div>
          <h3 className="demo-box-title">회원가입</h3>
          <p className="demo-box-sub">
            데모버전으로 미리 체험하고<br />
            기능들을 이용해보세요.
          </p>
          <button className="demo-btn-primary">회원가입하기</button>
        </div>

        <div className="demo-box" onClick={() => navigate('/login')}>
          <div className="demo-box-icon">🔑</div>
          <h3 className="demo-box-title">로그인</h3>
          <p className="demo-box-sub">
            이미 계정이 있으신가요?<br />
            로그인하여 서비스를 이용하세요.
          </p>
          <button className="demo-btn-secondary">로그인하기</button>
        </div>
      </div>

      <div className="demo-footer">
        <p className="demo-footer-brand">GNB 지엔비시스템</p>
        <p className="demo-footer-copy">Copyright ⓒ GNBSYSTEM corp. All Rights reserved</p>
      </div>
    </div>
  )
}
