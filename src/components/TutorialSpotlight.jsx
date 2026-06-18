// 지정된 영역(rect)만 오버레이를 비워 강조하고, 그 옆에 말풍선 툴팁을 띄움.
// 강조된 영역은 실제 페이지 요소가 그대로 노출되어 클릭 가능하고, 나머지는 어두운 배경으로 막혀있음.
// placement='bottom'(기본): 강조 영역 아래, 왼쪽 정렬 / placement='top': 강조 영역 위, 중앙 정렬
export default function TutorialSpotlight({ rect, message, placement = 'bottom' }) {
  if (!rect) return null

  const PAD = 6
  const top = rect.top - PAD
  const left = rect.left - PAD
  const width = rect.width + PAD * 2
  const height = rect.height + PAD * 2
  const bottom = top + height
  const right = left + width
  const centerX = left + width / 2

  const dark = { position: 'fixed', background: 'rgba(0,0,0,0.6)', zIndex: 3000 }

  const tooltipWidth = 280
  const tooltipLeft = Math.min(Math.max(left, 12), window.innerWidth - tooltipWidth - 12)
  const arrowLeft = Math.min(Math.max(left - tooltipLeft + width / 2 - 8, 12), tooltipWidth - 28)

  // top 배치는 텍스트 길이에 맞춰 한 줄로 표시하고 강조 영역 중앙 위에 맞춤(가운데 정렬은 transform으로 처리)
  const tooltipBoxStyle = placement === 'top'
    ? { left: centerX, top: top - 14, transform: 'translate(-50%, -100%)', width: 'max-content', maxWidth: 'calc(100vw - 24px)', whiteSpace: 'nowrap' }
    : { left: tooltipLeft, top: bottom + 14, width: tooltipWidth }
  const arrowBoxStyle = placement === 'top'
    ? { left: '50%', transform: 'translateX(-50%)', bottom: -8, borderTop: '8px solid #fff' }
    : { left: arrowLeft, top: -8, borderBottom: '8px solid #fff' }

  return (
    <>
      {/* 위 / 아래 / 좌 / 우 4개로 나눠 중앙(강조 영역)만 구멍을 냄 */}
      <div style={{ ...dark, top: 0, left: 0, width: '100%', height: top }} />
      <div style={{ ...dark, top: bottom, left: 0, width: '100%', height: `calc(100% - ${bottom}px)` }} />
      <div style={{ ...dark, top, left: 0, width: left, height }} />
      <div style={{ ...dark, top, left: right, width: `calc(100% - ${right}px)`, height }} />

      {/* 말풍선 툴팁 */}
      <div style={{
        position: 'fixed',
        zIndex: 3001, background: '#fff', borderRadius: 8, padding: '14px 16px',
        fontSize: 14, color: '#333', lineHeight: 1.5, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        ...tooltipBoxStyle,
      }}>
        <div style={{
          position: 'absolute',
          width: 0, height: 0,
          borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
          ...arrowBoxStyle,
        }} />
        {message}
      </div>
    </>
  )
}
