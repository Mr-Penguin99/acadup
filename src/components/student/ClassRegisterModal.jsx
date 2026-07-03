import ClassRegister from '../../pages/ClassRegister'

export default function ClassRegisterModal({ onClose, modalRef, classSectionRef, classNameRowRef, onClassSelect, resetKey, classPaydayRowRef, classDiscountRowRef, classDiscountRepeatSelectRef, classSubmitBtnRef, onSubmitClick, autoSelectFirstClass }) {
  return (
    <div style={{
      position:'fixed', top:0, left:0, width:'100%', height:'100%',
      background:'rgba(0,0,0,0.4)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center',
    }} onClick={onClose}>
      <div ref={modalRef} style={{
        background:'#fff', width:660, height:'94vh', overflowY:'auto',
        borderRadius:6, boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
      }} onClick={e=>e.stopPropagation()}>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'12px 20px', borderBottom:'1px solid #e0e0e0',
          position:'sticky', top:0, background:'#fff', zIndex:1,
        }}>
          <span style={{fontSize:16, fontWeight:700, color:'#333'}}>수강신청</span>
          <button onClick={onClose} style={{
            background:'none', border:'none', fontSize:20, lineHeight:1,
            cursor:'pointer', color:'#888', padding:'0 4px',
          }}>✕</button>
        </div>
        <ClassRegister key={resetKey} classSectionRef={classSectionRef} classNameRowRef={classNameRowRef} onClassSelect={onClassSelect} classPaydayRowRef={classPaydayRowRef} classDiscountRowRef={classDiscountRowRef} classDiscountRepeatSelectRef={classDiscountRepeatSelectRef} classSubmitBtnRef={classSubmitBtnRef} onSubmitClick={onSubmitClick} autoSelectFirstClass={autoSelectFirstClass} />
      </div>
    </div>
  )
}
