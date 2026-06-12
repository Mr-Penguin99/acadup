import { useState } from 'react'

export default function MyInfo() {
  const [form, setForm] = useState({
    empNo: localStorage.getItem('userEmpNo') || '200001',
    name: localStorage.getItem('userName') || '원장',
    resId1: '000000', resId2: '1111111',
    id: '10102093',
    pw: '',
    phone: '010-0000-0000',
    msgType: 'SMS수신',
    emergency: '',
    extension: '',
    email1: 'abcdefg123', email2: 'naver.com', emailType: '직접입력',
    zip: '', addr: '', addrDetail: '',
    empStatus: '재직',
    stateType: '',
    dept: '관리 부문 1급,원장',
    workType: '원장',
    joinDate: '2026.01.01',
    leaveDate: '',
    career: '',
  })

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif",
      background: '#fff',
      minHeight: '100vh',
      padding: '16px 20px',
      fontSize: 13,
      color: '#333',
    }}>
      {/* 페이지 제목 */}
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: '#000' }}>
        나의 정보관리
      </div>

      {/* 수정 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button style={{
          padding: '6px 20px', background: '#F5841F', color: '#fff',
          border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }} onClick={() => { localStorage.setItem('userName', form.name); localStorage.setItem('userEmpNo', form.empNo) }}>수정</button>
      </div>

      {/* 기본정보 카드 */}
      <div style={{
        background: '#fff',
        border: '1px solid #e0e0e0',
        marginBottom: 20,
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex' }}>

          {/* 사진 */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'flex-start', gap: 8, flexShrink: 0,
            padding: '20px 20px 16px', borderRight: '1px solid #e0e0e0',
            background: '#fafafa', minWidth: 140, paddingTop: 20,
          }}>
            <div style={{
              width: 120, height: 140, border: '1px solid #ddd',
              borderRadius: 4, background: '#e8e8e8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src="/icons/avatar.svg"
                alt="프로필"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="font-size:56px">👤</span>'; }}
              />
            </div>
            <button style={{
              padding: '4px 10px', background: '#fff', border: '1px solid #ccc',
              borderRadius: 4, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            }}>사진등록/수정</button>
          </div>

          {/* 폼 */}
          <div style={{ flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={labelStyle}><span style={reqStyle}>*</span> 사원번호</td>
                  <td style={valueStyle}>
                    <input style={inputStyle} value={form.empNo} readOnly />
                  </td>
                  <td style={labelStyle}><span style={reqStyle}>*</span> 주민번호</td>
                  <td style={valueStyle}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input style={{ ...inputStyle, width: 110 }} value={form.resId1} onChange={e => setForm(f => ({ ...f, resId1: e.target.value }))} />
                      <span>-</span>
                      <input style={{ ...inputStyle, width: 110 }} value={form.resId2} onChange={e => setForm(f => ({ ...f, resId2: e.target.value }))} />
                      <span style={{ color: '#aaa', fontSize: 12 }}>예) 901230-12...</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={labelStyle}><span style={reqStyle}>*</span> 성명</td>
                  <td style={valueStyle}>
                    <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </td>
                  <td style={labelStyle}>비밀번호</td>
                  <td style={valueStyle}>
                    <button style={{
                      padding: '5px 12px', background: '#fff', border: '1px solid #ccc',
                      borderRadius: 4, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                    }} onClick={() => window.open('/changepassword', '_blank', 'width=500,height=600')}>
                      비밀번호 변경
                    </button>
                  </td>
                </tr>
                <tr>
                  <td style={labelStyle}>아이디</td>
                  <td style={valueStyle}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input style={inputStyle} value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} />
                      <button style={{
                        padding: '5px 10px', background: '#fff', border: '1px solid #ccc',
                        borderRadius: 4, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                      }}>중복체크</button>
                    </div>
                  </td>
                  <td style={labelStyle}>메세지설정</td>
                  <td style={valueStyle}>
                    <select style={inputStyle} value={form.msgType} onChange={e => setForm(f => ({ ...f, msgType: e.target.value }))}>
                      <option>SMS수신</option>
                      <option>알림톡수신</option>
                      <option>수신안함</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td style={labelStyle}><span style={reqStyle}>*</span> 휴대폰</td>
                  <td style={valueStyle}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                      <span style={{ color: '#aaa', fontSize: 12 }}>예) 010-1234-5678</span>
                    </div>
                  </td>
                  <td style={labelStyle}>내선번호</td>
                  <td style={valueStyle}>
                    <input style={inputStyle} value={form.extension} onChange={e => setForm(f => ({ ...f, extension: e.target.value }))} />
                  </td>
                </tr>
                <tr>
                  <td style={labelStyle}>비상연락</td>
                  <td style={valueStyle}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input style={inputStyle} value={form.emergency} onChange={e => setForm(f => ({ ...f, emergency: e.target.value }))} />
                      <span style={{ color: '#aaa', fontSize: 12 }}>예) 010-1234-5678</span>
                    </div>
                  </td>
                  <td style={{ ...labelStyle, borderRight: 'none' }} colSpan={2}></td>
                </tr>
                <tr>
                  <td style={labelStyle}>이메일</td>
                  <td colSpan={3} style={valueStyle}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input style={{ ...inputStyle, width: 130 }} value={form.email1} onChange={e => setForm(f => ({ ...f, email1: e.target.value }))} />
                      <span>@</span>
                      <input style={{ ...inputStyle, width: 130 }} value={form.email2} onChange={e => setForm(f => ({ ...f, email2: e.target.value }))} />
                      <select style={{ ...inputStyle, width: 100 }} value={form.emailType} onChange={e => setForm(f => ({ ...f, emailType: e.target.value }))}>
                        <option>직접입력</option>
                        <option>gmail.com</option>
                        <option>naver.com</option>
                        <option>kakao.com</option>
                        <option>daum.net</option>
                        <option>hanmail.net</option>
                      </select>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={labelStyle}>주소</td>
                  <td colSpan={3} style={valueStyle}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input style={{ ...inputStyle, width: 120 }} value={form.zip} placeholder="우편번호" onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} />
                      <button style={{
                        padding: '5px 12px', background: '#fff', border: '1px solid #ccc',
                        borderRadius: 4, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                      }}>우편번호 찾기</button>
                    </div>
                    <input style={{ ...inputStyle, width: '100%', marginBottom: 6, boxSizing: 'border-box' }} value={form.addr} onChange={e => setForm(f => ({ ...f, addr: e.target.value }))} />
                    <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} value={form.addrDetail} placeholder="상세주소를 입력해 주세요." onChange={e => setForm(f => ({ ...f, addrDetail: e.target.value }))} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 상세정보 타이틀 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 16, height: 16, background: '#F5841F',
          borderRadius: 2, flexShrink: 0,
        }} />
        <span style={{ fontSize: 14, fontWeight: 700 }}>상세정보</span>
      </div>

      {/* 상세정보 카드 */}
      <div style={{
        background: '#fff',
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={labelStyle}>재직구분</td>
              <td style={valueStyle}><span style={{ color: '#1565C0' }}>{form.empStatus}</span></td>
              <td style={labelStyle}>상태구분</td>
              <td style={valueStyle}>{form.stateType}</td>
            </tr>
            <tr>
              <td style={labelStyle}>업무부서</td>
              <td style={valueStyle}>{form.dept}</td>
              <td style={labelStyle}><span style={reqStyle}>*</span> 근무구분</td>
              <td style={valueStyle}>{form.workType}</td>
            </tr>
            <tr>
              <td style={labelStyle}><span style={reqStyle}>*</span> 입사일자</td>
              <td style={valueStyle}>{form.joinDate}</td>
              <td style={labelStyle}>퇴사일자</td>
              <td style={valueStyle}>{form.leaveDate}</td>
            </tr>
            <tr>
              <td style={{ ...labelStyle, verticalAlign: 'top', paddingTop: 14, borderBottom: 'none' }}>약력사항</td>
              <td colSpan={3} style={{ ...valueStyle, borderBottom: 'none' }}>
                <textarea
                  style={{
                    width: '100%', height: 140, padding: '8px 10px',
                    border: '1px solid #ddd', borderRadius: 4, resize: 'vertical',
                    fontFamily: 'inherit', fontSize: 13, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  value={form.career}
                  onChange={e => setForm(f => ({ ...f, career: e.target.value }))}
                  maxLength={1500}
                />
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  입력 문자수 : {form.career.length} (1500자 이내로 입력해 주세요)
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

const labelStyle = {
  padding: '10px 12px',
  background: '#fafafa',
  color: '#444',
  fontWeight: 600,
  fontSize: 13,
  borderBottom: '1px solid #e0e0e0',
  borderRight: '1px solid #e0e0e0',
  whiteSpace: 'nowrap',
  width: 120,
  textAlign: 'center',
}

const valueStyle = {
  padding: '8px 12px',
  borderBottom: '1px solid #e0e0e0',
  borderRight: '1px solid #e0e0e0',
  fontSize: 13,
}

const inputStyle = {
  padding: '6px 10px',
  border: '1px solid #ddd',
  borderRadius: 4,
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  color: '#333',
  width: 160,
}

const reqStyle = {
  color: '#F5841F',
  marginRight: 2,
}
