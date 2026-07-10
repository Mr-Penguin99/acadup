import { useState } from 'react'

export default function ChangePassword() {
  const [form, setForm] = useState({
    oldPw: '', newPw: '', confirmPw: ''
  })

  return (
    <div style={{
      fontFamily: "'Noto Sans KR', sans-serif",
      background: '#f5f5f5',
      minHeight: '100vh',
      padding: '20px 24px',
      fontSize: 13,
      color: '#333',
    }}>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
        비밀번호 변경
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button style={{
          padding: '6px 20px', background: '#555', color: '#fff',
          border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer',
          fontFamily: 'inherit',
        }}>비밀번호 변경</button>
      </div>

      <div style={{
        background: '#fff', border: '1px solid #ddd',
        borderRadius: 4, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            <tr>
              <td style={labelStyle}>아이디</td>
              <td style={valueStyle}>200001</td>
            </tr>
            <tr>
              <td style={labelStyle}>성명</td>
              <td style={valueStyle}>원장</td>
            </tr>
            <tr>
              <td style={labelStyle}>기존 비밀번호</td>
              <td style={valueStyle}>
                <input
                  type="password"
                  style={inputStyle}
                  value={form.oldPw}
                  onChange={e => setForm(f => ({ ...f, oldPw: e.target.value }))}
                />
              </td>
            </tr>
            <tr>
              <td style={labelStyle}>신규 비밀번호</td>
              <td style={valueStyle}>
                <input
                  type="password"
                  style={inputStyle}
                  value={form.newPw}
                  onChange={e => setForm(f => ({ ...f, newPw: e.target.value }))}
                />
              </td>
            </tr>
            <tr>
              <td style={labelStyle}>비밀번호 확인</td>
              <td style={valueStyle}>
                <input
                  type="password"
                  style={inputStyle}
                  value={form.confirmPw}
                  onChange={e => setForm(f => ({ ...f, confirmPw: e.target.value }))}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

const labelStyle = {
  padding: '12px 16px',
  background: '#fafafa',
  color: '#555',
  fontWeight: 500,
  borderBottom: '1px solid #f0f0f0',
  whiteSpace: 'nowrap',
  width: 120,
  textAlign: 'center',
}

const valueStyle = {
  padding: '8px 16px',
  borderBottom: '1px solid #f0f0f0',
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
