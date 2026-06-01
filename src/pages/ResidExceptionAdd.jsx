import { useState } from 'react'

export default function ResidExceptionAdd() {
  const [form, setForm] = useState({
    resId: '',
    reason: '',
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
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
        주민번호 예외 등록
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 10 }}>
        <button style={{
          padding: '6px 20px', background: '#F5841F', color: '#fff',
          border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 700,
        }}>저장</button>
        <button style={{
          padding: '6px 20px', background: '#29b6f6', color: '#fff',
          border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 700,
        }}>신규 주민등록 예외 등록</button>
      </div>

      <div style={{
        background: '#fff', border: '1px solid #ddd',
        borderRadius: 4, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            <tr>
              <td style={labelStyle}><span style={reqStyle}>*</span> 주민번호</td>
              <td style={valueStyle}>
                <input
                  style={inputStyle}
                  value={form.resId}
                  onChange={e => setForm(f => ({ ...f, resId: e.target.value }))}
                  placeholder=""
                />
              </td>
            </tr>
            <tr>
              <td style={labelStyle}><span style={reqStyle}>*</span> 예외처리 사유</td>
              <td style={valueStyle}>
                <input
                  style={{ ...inputStyle, width: '100%' }}
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder=""
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
  width: 200,
}

const reqStyle = {
  color: '#F5841F',
  marginRight: 2,
}
