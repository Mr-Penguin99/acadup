// 다크 오버레이 없이 특정 요소 위/아래에 붙는 말풍선 안내문 (한 줄로 표시)
export default function TutorialTooltip({ rect, message, placement = 'top' }) {
  if (!rect) return null

  const left = Math.max(rect.left, 12)

  const boxStyle = placement === 'top'
    ? { top: rect.top - 12, transform: 'translateY(-100%)' }
    : { top: rect.bottom + 12 }

  const arrowStyle = placement === 'top'
    ? { bottom: -8, borderTop: '8px solid #fff' }
    : { top: -8, borderBottom: '8px solid #fff' }

  return (
    <div style={{
      position: 'fixed', left, zIndex: 4000, whiteSpace: 'nowrap',
      background: '#fff', borderRadius: 8, padding: '12px 14px',
      fontSize: 13, color: '#333', lineHeight: 1.5,
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      ...boxStyle,
    }}>
      {message}
      <div style={{
        position: 'absolute', left: 16, width: 0, height: 0,
        borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
        ...arrowStyle,
      }} />
    </div>
  )
}
