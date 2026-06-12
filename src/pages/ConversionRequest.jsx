import { useState } from 'react'
import './ConversionRequest.css'

const logo = '/logo.svg'

export default function ConversionRequest() {
  const [form, setForm] = useState({
    academyName: localStorage.getItem('academyName') || '',
    bizNo: localStorage.getItem('bizNo') || '',
    ownerName: localStorage.getItem('userName') || '',
    phone: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = form.academyName && form.bizNo && form.ownerName && form.phone && form.email

  return (
    <div className="cr-page">
      <div className="cr-header">
        <img src={logo} alt="아카데미UP" className="cr-logo" />
      </div>

      <div className="cr-card">
        {!submitted ? (
          <>
            <h2 className="cr-title">정식전환 요청</h2>
            <p className="cr-sub">정식 계정 전환을 위해 정보를 입력해주세요.<br/>계정 생성 시 약 1일이 소요되며 계정안내는 알림톡으로 전송됩니다.</p>

            <div className="cr-field">
              <label className="cr-label">학원명 <span className="cr-required">*</span></label>
              <input className="cr-input" placeholder="학원명을 입력해주세요"
                value={form.academyName} onChange={e=>setForm(f=>({...f,academyName:e.target.value}))} />
            </div>

            <div className="cr-field">
              <label className="cr-label">사업자번호 <span className="cr-required">*</span></label>
              <input className="cr-input" placeholder="000-00-00000"
                value={form.bizNo} onChange={e=>setForm(f=>({...f,bizNo:e.target.value}))} />
            </div>

            <div className="cr-field">
              <label className="cr-label">대표자명 <span className="cr-required">*</span></label>
              <input className="cr-input" placeholder="대표자 이름을 입력해주세요"
                value={form.ownerName} onChange={e=>setForm(f=>({...f,ownerName:e.target.value}))} />
            </div>

            <div className="cr-field">
              <label className="cr-label">연락처 <span className="cr-required">*</span></label>
              <input className="cr-input" placeholder="010-0000-0000"
                value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
            </div>

            <div className="cr-field">
              <label className="cr-label">이메일 <span className="cr-required">*</span></label>
              <input className="cr-input" type="email" placeholder="example@email.com"
                value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
            </div>

            <div className="cr-field">
              <label className="cr-label">문의사항</label>
              <textarea className="cr-textarea" placeholder="전환 관련 문의사항을 입력해주세요. (선택)"
                value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} />
            </div>

            <button className={`cr-btn-primary ${!canSubmit ? 'cr-btn-disabled' : ''}`}
              onClick={() => { if (canSubmit) setSubmitted(true) }}>
              전환 요청하기
            </button>
          </>
        ) : (
          <div className="cr-done">
            <div className="cr-done-icon">✅</div>
            <h2 className="cr-title">요청이 완료되었습니다!</h2>
            <p className="cr-sub">담당자 확인 후 입력하신 연락처로<br/>빠르게 연락드리겠습니다.</p>

            <div className="cr-data-box">
              <div className="cr-data-box-title">데이터 이전 신청하기</div>
              <p className="cr-data-box-desc">기존 학생 정보자료나 수기로 작성하던 학생정보들을 양식에 작성 후 이메일로 첨부하면 데이터 이관 작업을 해드립니다.</p>
            </div>

            <div className="cr-btn-row">
              <button className="cr-btn-primary" onClick={() => window.close()}>데이터 이전 신청하기</button>
              <button className="cr-btn-secondary" onClick={() => window.close()}>건너뛰기</button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
