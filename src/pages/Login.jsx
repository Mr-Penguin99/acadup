import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const logo = '/logo.svg'

const SLIDES = [
  { label: '출결관리는 스마트하게!', title: '등·하원 안심알림', sub: '안심톡! 발송 서비스' },
  { label: '수납관리도 한번에!', title: '토스프론트 단말기', sub: '결제 즉시 자동 기록' },
  { label: '이탈 걱정 끝!', title: 'AI 이탈 분석', sub: '위험 학생 사전 탐지' },
]

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ id: '', password: '', remember: false })
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 3000)
    return () => clearInterval(t)
  }, [])

  const handleLogin = () => {
    if (!form.id || !form.password) {
      alert('아이디와 비밀번호를 입력해주세요.')
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-container">

        {/* 왼쪽 */}
        <div className="login-left">
          <div className="login-logo-wrap">
            <img src={logo} alt="아카데미UP" className="login-logo" />
            <p className="login-tagline">학원운영 통합관리 솔루션</p>
          </div>

          <div className="login-form">
            <div className="input-wrap">
              <span className="input-icon">👤</span>
              <input
                className="login-input"
                type="text"
                placeholder="아이디"
                value={form.id}
                onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
              />
            </div>

            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                className="login-input"
                type="password"
                placeholder="비밀번호"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button className="login-btn" onClick={handleLogin}>
              학원 로그인
            </button>

            <div className="remember-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                />
                <span>아이디 기억하기</span>
              </label>
            </div>

            <div className="login-divider" />

            <div className="login-links">
              <span>아이디 찾기</span>
              <span className="link-div">|</span>
              <span>비밀번호 찾기</span>
            </div>
          </div>

          <div className="login-footer">
            <p className="footer-brand">GNB 지엔비시스템</p>
            <p className="footer-copy">Copyright ⓒ GNBSYSTEM corp. All Rights reserved</p>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="login-right">
          <div className="right-top">
            <h2 className="hello-text">Hello, Academyup!</h2>
          </div>

          {/* 배너 슬라이드 */}
          <div className="banner-wrap">
            <div className="banner-slide">
              <p className="banner-label">{SLIDES[slide].label}</p>
              <p className="banner-title">{SLIDES[slide].title}</p>
              <p className="banner-sub">{SLIDES[slide].sub}</p>
            </div>
            <div className="banner-dots">
              {SLIDES.map((_, i) => (
                <span
                  key={i}
                  className={`dot ${i === slide ? 'active' : ''}`}
                  onClick={() => setSlide(i)}
                />
              ))}
            </div>
          </div>

          {/* 고객지원 */}
          <div className="support-wrap">
            <p className="support-title">고객지원 상담</p>
            <p className="support-tel">1811-3435</p>
            <p className="support-sub">학원 운영 통합관리 솔루션 상담</p>
            <p className="support-time">상담시간 : 평일 09시 ~ 18시</p>
          </div>
        </div>

      </div>
    </div>
  )
}
