import { useState, useEffect } from 'react'
import './Signup.css'

const logo = '/logo.svg'

export default function Signup() {
  const [step, setStep] = useState(1)
  const [agreed, setAgreed] = useState({ all: false, terms: false, privacy: false })

  const [phoneInput, setPhoneInput] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [bizVerified, setBizVerified] = useState(false)
  const [timer, setTimer] = useState(180)
  const [timerActive, setTimerActive] = useState(false)

  const [form, setForm] = useState({
    bizName: '', bizNum: '', ownerName: '',
    phone: '', tel: '', email: '',
    address: '', addressDetail: '',
    referral: '', referralCode: '',
  })

  useEffect(() => {
    if (!timerActive) return
    if (timer === 0) { setTimerActive(false); return }
    const interval = setInterval(() => setTimer(t => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timerActive, timer])

  const formatTimer = () => {
    const m = Math.floor(timer / 60)
    const s = timer % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleSendCode = () => {
    if (!phoneInput) return
    setCodeSent(true)
    setTimer(180)
    setTimerActive(true)
    alert(`${phoneInput}로 인증번호를 발송했습니다.\n(테스트: 123456)`)
  }

  const handleVerify = () => {
    if (codeInput === '123456') {
      setCodeVerified(true)
      setTimerActive(false)
      setForm(f => ({ ...f, phone: phoneInput }))
    } else {
      alert('인증번호가 올바르지 않습니다.')
    }
  }

  const handleAll = () => {
    const v = !agreed.all
    setAgreed({ all: v, terms: v, privacy: v })
  }

  const handleCheck = (key) => {
    const next = { ...agreed, [key]: !agreed[key] }
    next.all = next.terms && next.privacy
    setAgreed(next)
  }

  const canSubmit = form.ownerName && form.email && form.address

  const steps = [
    { n: 1, label: '약관동의' },
    { n: 2, label: '정보입력' },
    { n: 3, label: '신청완료' },
  ]

  return (
    <div className="page">

      <div className="header">
        <img src={logo} alt="아카데미UP" className="logo" />
        <p className="page-title">이용 가입신청</p>
      </div>

      <div className="steps">
        {steps.map((s, i) => (
          <div key={s.n} className="step-wrapper">
            {i > 0 && <div className="step-line" />}
            <div className="step-item">
              <div className={`step-circle ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
                {s.n}
              </div>
              <span className={`step-label ${step === s.n ? 'active' : ''}`}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">

        {/* STEP 1 약관동의 */}
        {step === 1 && (
          <div className="step-content">
            <h2 className="section-title">약관동의</h2>
            <p className="section-sub">필수 항목 동의를 거부하면 서비스 이용이 제한됩니다.</p>

            <div
              className={`agree-row highlight ${agreed.all ? 'checked' : ''}`}
              onClick={handleAll}
            >
              <input type="checkbox" checked={agreed.all} readOnly />
              <span>모두 동의합니다.</span>
            </div>

            <div className="agree-row" onClick={() => handleCheck('terms')}>
              <input type="checkbox" checked={agreed.terms} readOnly />
              <span>이용약관에 동의합니다. (필수)</span>
              <button className="view-link" onClick={e => e.stopPropagation()}>보기</button>
            </div>

            <div className="agree-row" onClick={() => handleCheck('privacy')}>
              <input type="checkbox" checked={agreed.privacy} readOnly />
              <span>개인정보 취급방침에 동의합니다. (필수)</span>
              <button className="view-link" onClick={e => e.stopPropagation()}>보기</button>
            </div>

            <button
              className={`btn-primary ${!agreed.terms || !agreed.privacy ? 'btn-disabled' : ''}`}
              onClick={() => { if (agreed.terms && agreed.privacy) setStep(2) }}
            >
              다음
            </button>
            <button className="btn-secondary">취소</button>
          </div>
        )}

        {/* STEP 2-1: 휴대폰 본인확인 */}
        {step === 2 && !phoneVerified && (
          <div className="step-content">
            <h2 className="section-title">휴대폰 본인확인</h2>
            <p className="section-sub">휴대폰 인증 후 다음 단계로 이동합니다.</p>

            <div className="field-group">
              <label className="field-label">휴대폰 번호 <span className="required">*</span></label>
              <div className="input-row">
                <input
                  className="field-input"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  disabled={codeSent}
                />
                <button className="btn-inline" onClick={handleSendCode}>
                  {codeSent ? '재발송' : '인증번호 발송'}
                </button>
              </div>
            </div>

            {codeSent && (
              <div className="field-group">
                <label className="field-label">인증번호 <span className="required">*</span></label>
                <div className="input-row">
                  <input
                    className="field-input"
                    type="text"
                    placeholder="인증번호 6자리"
                    value={codeInput}
                    onChange={e => setCodeInput(e.target.value)}
                    maxLength={6}
                    disabled={codeVerified}
                  />
                  {!codeVerified ? (
                    <>
                      <button className="btn-inline" onClick={handleVerify}>확인</button>
                      <span className="timer">{formatTimer()}</span>
                    </>
                  ) : (
                    <span style={{ color: '#2CBB6A', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
                      ✅ 완료
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              className={`btn-primary ${!codeVerified ? 'btn-disabled' : ''}`}
              onClick={() => { if (codeVerified) setPhoneVerified(true) }}
            >
              인증 확인
            </button>
            <button className="btn-secondary" onClick={() => setStep(1)}>이전</button>
          </div>
        )}

        {/* STEP 2-2: 사업자 확인 */}
        {step === 2 && phoneVerified && !bizVerified && (
          <div className="step-content">
            <h2 className="section-title">사업자 확인</h2>
            <p className="section-sub">상호명과 사업자번호를 입력 후 진위확인을 해주세요.</p>

            <div className="verified-box" style={{ marginBottom: 20 }}>
              ✅ {phoneInput} 휴대폰 인증 완료
            </div>

            <div className="field-group">
              <label className="field-label">상호명 <span className="required">*</span></label>
              <input
                className="field-input"
                placeholder="학원명을 입력해주세요"
                value={form.bizName}
                onChange={e => setForm(f => ({ ...f, bizName: e.target.value }))}
              />
            </div>

            <div className="field-group">
              <label className="field-label">사업자번호 <span className="required">*</span></label>
              <div className="input-row">
                <input
                  className="field-input"
                  placeholder="000-00-00000"
                  value={form.bizNum}
                  onChange={e => setForm(f => ({ ...f, bizNum: e.target.value }))}
                />
                <button
                  className="btn-inline"
                  onClick={() => {
                    if (!form.bizName || !form.bizNum) {
                      alert('상호명과 사업자번호를 입력해주세요.')
                      return
                    }
                    alert('사업자 진위확인이 완료되었습니다.\n(테스트: 바로 통과)')
                    setBizVerified(true)
                  }}
                >
                  진위확인
                </button>
              </div>
              <p className="field-hint">※ 국세청 API 사업자 진위확인 인증</p>
            </div>

            <button
              className={`btn-primary ${!form.bizName || !form.bizNum ? 'btn-disabled' : ''}`}
              onClick={() => {
                if (!form.bizName || !form.bizNum) return
                setBizVerified(true)
              }}
            >
              다음
            </button>
            <button className="btn-secondary" onClick={() => setPhoneVerified(false)}>이전</button>
          </div>
        )}

        {/* STEP 2-3: 나머지 정보 입력 */}
        {step === 2 && phoneVerified && bizVerified && (
          <div className="step-content">
            <h2 className="section-title">정보입력</h2>
            <p className="section-sub">나머지 정보를 입력해주세요.</p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <div className="verified-box" style={{ flex: 1 }}>✅ 휴대폰 인증 완료</div>
              <div className="verified-box" style={{ flex: 1 }}>✅ 사업자 인증 완료</div>
            </div>

            <div className="field-group">
              <label className="field-label">대표자명 <span className="required">*</span></label>
              <input
                className="field-input"
                placeholder="대표자 이름을 입력해주세요"
                value={form.ownerName}
                onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
              />
            </div>

            <div className="field-group">
              <label className="field-label">휴대폰 번호 <span className="required">*</span></label>
              <input
                className="field-input"
                value={form.phone}
                readOnly
                style={{ background: '#f9f9f9', color: '#888' }}
              />
            </div>

            <div className="field-group">
              <label className="field-label">전화번호</label>
              <input
                className="field-input"
                placeholder="학원 전화번호를 입력해주세요"
                value={form.tel}
                onChange={e => setForm(f => ({ ...f, tel: e.target.value }))}
              />
            </div>

            <div className="field-group">
              <label className="field-label">이메일 <span className="required">*</span></label>
              <input
                className="field-input"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="field-group">
              <label className="field-label">주소 <span className="required">*</span></label>
              <div className="input-row">
                <input
                  className="field-input"
                  placeholder="주소 검색"
                  value={form.address}
                  readOnly
                />
                <button className="btn-inline">주소 검색</button>
              </div>
              <input
                className="field-input"
                placeholder="상세 주소를 입력해주세요"
                value={form.addressDetail}
                onChange={e => setForm(f => ({ ...f, addressDetail: e.target.value }))}
                style={{ marginTop: 8 }}
              />
            </div>

            <div className="field-group">
              <label className="field-label">가입경로</label>
              <div className="referral-boxes">
                {[
                  { value: 'instagram', label: '인스타그램' },
                  { value: 'youtube', label: '유튜브' },
                  { value: 'search', label: '검색' },
                  { value: 'referral', label: '추천인' },
                ].map(item => (
                  <div
                    key={item.value}
                    className={`referral-box ${form.referral === item.value ? 'selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, referral: item.value, referralCode: '' }))}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {form.referral === 'referral' && (
              <div className="field-group">
                <label className="field-label">추천인</label>
                <input
                  className="field-input"
                  placeholder="추천인을 입력해주세요"
                  value={form.referralCode}
                  onChange={e => setForm(f => ({ ...f, referralCode: e.target.value }))}
                />
              </div>
            )}

            <button
              className={`btn-primary ${!canSubmit ? 'btn-disabled' : ''}`}
              onClick={() => { if (canSubmit) setStep(3) }}
            >
              회원가입
            </button>
            <button className="btn-secondary" onClick={() => setBizVerified(false)}>이전</button>
          </div>
        )}

        {/* STEP 3 신청완료 */}
        {step === 3 && (
          <div className="step-content" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h2 className="section-title">신청이 완료되었습니다</h2>
            <p className="section-sub" style={{ marginTop: 8 }}>
              담당자 확인 후 연락드리겠습니다.
            </p>
          </div>
        )}

      </div>

      <div className="footer">
        <p className="footer-brand">GNB 지엔비시스템</p>
        <p className="footer-copy">Copyright ⓒ GNBSYSTEM corp. All Rights reserved</p>
      </div>

    </div>
  )
}