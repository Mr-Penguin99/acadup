// 특정 버튼/입력 행동 없이 그냥 닫을 수 없는 안내용 오버레이.
// 배경 클릭으로는 닫히지 않고, 전달된 액션(버튼 클릭 등)에서만 onNext를 호출해야 함.
export default function TutorialOverlay({ title, description, onNext, nextLabel = '다음' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 10, padding: '32px 36px',
        maxWidth: 420, width: '90%', textAlign: 'center',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 24, whiteSpace: 'pre-line' }}>
          {description}
        </p>
        <button
          style={{
            padding: '10px 28px', background: '#F5841F', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
          onClick={onNext}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
