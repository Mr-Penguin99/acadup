export default function ClassRegisterModal({ onClose }) {
  return (
    <div style={{
      position:'fixed', top:0, left:0, width:'100%', height:'100%',
      background:'rgba(0,0,0,0.4)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center',
    }} onClick={onClose}>
      <div style={{
        background:'#fff', width:620, borderRadius:6,
        boxShadow:'0 4px 20px rgba(0,0,0,0.2)', overflow:'hidden',
      }} onClick={e=>e.stopPropagation()}>

        {/* 헤더 */}
        <div style={{padding:'16px 20px', borderBottom:'1px solid #e0e0e0'}}>
          <span style={{fontSize:16, fontWeight:700, color:'#333'}}>수강신청</span>
        </div>

        <div style={{padding:'20px'}}>
          {/* 수강생 정보 */}
          <table style={{width:'100%', borderCollapse:'collapse', marginBottom:20}}>
            <tbody>
              <tr style={{borderTop:'2px solid #555', borderBottom:'1px solid #e0e0e0'}}>
                <td style={labelCell}>수강생 정보</td>
                <td style={valueCell}>예비학생 (01.01.01)</td>
              </tr>
            </tbody>
          </table>

          {/* 신청 정보 */}
          <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:10}}>
            <div style={{width:14, height:14, border:'2px solid #F5841F', borderRadius:2}}/>
            <span style={{fontSize:14, fontWeight:700, color:'#333'}}>신청 정보</span>
          </div>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <tbody>
              <tr style={{borderTop:'1px solid #e0e0e0', borderBottom:'1px solid #e0e0e0'}}>
                <td style={labelCell}>반명</td>
                <td style={valueCell}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <select style={selectStyle}><option>반 그룹</option></select>
                    <span style={{color:'#888'}}>{'>'}</span>
                    <select style={selectStyle}><option>반 선택</option></select>
                  </div>
                </td>
              </tr>
              <tr style={{borderBottom:'1px solid #e0e0e0'}}>
                <td style={labelCell}>합계금액</td>
                <td style={valueCell}>
                  <span style={{fontSize:14, fontWeight:700}}>0</span>
                  <span style={{marginLeft:4, fontSize:13, color:'#555'}}>원</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const labelCell = {
  padding:'10px 16px', background:'#f8f9fb', fontWeight:600,
  fontSize:13, color:'#444', width:120, textAlign:'center',
  borderRight:'1px solid #e0e0e0',
}

const valueCell = {
  padding:'10px 16px', fontSize:13, color:'#333',
}

const selectStyle = {
  padding:'6px 10px', border:'1px solid #ddd', borderRadius:4,
  fontSize:13, fontFamily:'inherit', outline:'none', color:'#333',
}
