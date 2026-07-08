import { useRef, useState } from 'react'
import './Students.css'

export default function StudentFile() {
  const [data] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('studentFileData')) } catch { return null }
  })
  const [fileType, setFileType] = useState('')
  const [fileName, setFileName] = useState('')
  const [attachedName, setAttachedName] = useState('')
  const [hover, setHover] = useState(false)
  const fileInputRef = useRef(null)

  const handleRegister = () => {
    if (!fileType.trim()) { alert('파일 종류를 입력해 주세요.'); return }
    if (!fileName) { alert('첨부할 파일을 선택해 주세요.'); return }
    setAttachedName(fileName)
    alert('처리 완료.')
    window.close()
  }

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif", padding: '20px 24px', fontSize: 13, color: '#333', minWidth: 520 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>수강생 첨부파일</span>
      </div>
      <div style={{ borderTop: '1px solid #eee', marginBottom: 14 }} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button
          style={hover ? btnHoverStyle : btnStyle}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={handleRegister}
        >등록</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', borderTop: '2px solid #555' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>수강생</td>
            <td style={valueCell}>{data?.studentName || ''}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
            <td style={labelCell}>첨부된 파일</td>
            <td style={valueCell}>{attachedName}</td>
          </tr>
          <tr>
            <td style={labelCell}>첨부할 파일</td>
            <td style={valueCell}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input style={{ ...inputStyle, width: 200 }} placeholder="파일 종류 입력" value={fileType} onChange={e => setFileType(e.target.value)} />
                <input style={{ ...inputStyle, width: 200 }} placeholder="첨부파일" value={fileName} readOnly />
                <button className="family-add-btn" onClick={() => fileInputRef.current?.click()}><span className="plus">+</span>파일찾기</button>
                <input
                  ref={fileInputRef} type="file" style={{ display: 'none' }}
                  onChange={e => setFileName(e.target.files?.[0]?.name || '')}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const btnStyle = {
  padding: '6px 16px', border: '1px solid #ff3c00',
  borderRadius: 4, fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: 'inherit',
  background: '#ff3c00', color: '#fff',
}

const btnHoverStyle = {
  ...btnStyle, background: 'transparent', color: '#000',
}

const ROW_HEIGHT = 36

const labelCell = {
  height: ROW_HEIGHT, boxSizing: 'border-box', verticalAlign: 'middle',
  padding: '0 14px', background: '#f8f9fb', fontWeight: 600,
  fontSize: 13, color: '#444', width: 180, textAlign: 'center',
  borderRight: '1px solid #e0e0e0', whiteSpace: 'nowrap',
}

const valueCell = {
  height: ROW_HEIGHT, boxSizing: 'border-box', verticalAlign: 'middle',
  padding: '0 14px', fontSize: 13, color: '#333',
}

const inputStyle = {
  padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4,
  fontSize: 12, fontFamily: 'inherit', outline: 'none', color: '#333',
}
