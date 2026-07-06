// 지정된 영역(rect)만 오버레이를 비워 강조하고, 그 옆에 말풍선 툴팁을 띄움.
// 강조된 영역은 실제 페이지 요소가 그대로 노출되어 클릭 가능하고, 나머지는 어두운 배경으로 막혀있음.
// placement='bottom'(기본): 강조 영역 아래 / placement='top': 강조 영역 위 - 둘 다 강조 영역 가운데에 말풍선과 말꼬리가 옴
// onConfirm을 전달하면 메시지 옆에 "확인[Enter]"가 붙고 클릭하면 호출됨 (Enter 처리는 호출하는 쪽에서 직접 담당)
export default function TutorialSpotlight({ rect, message, placement = 'bottom', onConfirm, rightAlign }) {
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

  // 말풍선 박스는 내용(텍스트+확인 버튼) 크기에 맞춰 한 줄로 표시하고,
  // 기본은 강조 영역 가운데에 맞추고, rightAlign이면 강조 영역 오른쪽 끝에 맞춤(화면 잘림 방지)
  const tooltipBoxStyle = rightAlign
    ? (placement === 'top'
        ? { left: right, top: top - 14, transform: 'translate(-100%, -100%)', width: 'max-content', maxWidth: 'calc(100vw - 24px)', whiteSpace: 'nowrap' }
        : { left: right, top: bottom + 14, transform: 'translateX(-100%)', width: 'max-content', maxWidth: 'calc(100vw - 24px)', whiteSpace: 'nowrap' })
    : (placement === 'top'
        ? { left: centerX, top: top - 14, transform: 'translate(-50%, -100%)', width: 'max-content', maxWidth: 'calc(100vw - 24px)', whiteSpace: 'nowrap' }
        : { left: centerX, top: bottom + 14, transform: 'translateX(-50%)', width: 'max-content', maxWidth: 'calc(100vw - 24px)', whiteSpace: 'nowrap' })
  const arrowBoxStyle = rightAlign
    ? (placement === 'top'
        ? { right: 16, bottom: -8, borderTop: '8px solid #fff' }
        : { right: 16, top: -8, borderBottom: '8px solid #fff' })
    : (placement === 'top'
        ? { left: '50%', transform: 'translateX(-50%)', bottom: -8, borderTop: '8px solid #fff' }
        : { left: '50%', transform: 'translateX(-50%)', top: -8, borderBottom: '8px solid #fff' })

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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: onConfirm ? 50 : 0 }}>
          <span>{message}</span>
          {onConfirm && (
            <span
              onClick={e => { e.stopPropagation(); onConfirm() }}
              style={{ fontSize: 11, color: '#F5841F', fontWeight: 600, cursor: 'pointer' }}
            >
              확인[Enter]
            </span>
          )}
        </div>
      </div>
    </>
  )
}
