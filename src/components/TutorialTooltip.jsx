// 다크 오버레이 없이 특정 요소 위/아래/오른쪽에 붙는 말풍선 안내문
// onConfirm을 전달하면 메시지 옆에 "확인[Enter]"가 붙고 클릭하면 호출됨 (Enter 처리는 호출하는 쪽에서 직접 담당)
// warning을 전달하면 그 아래 왼쪽 정렬된 경고 문구가 표시됨
// center를 true로 주면 rect의 가운데에 말풍선/말꼬리가 오도록 정렬 (기본은 rect의 왼쪽 끝에 맞춤)
// minWidth를 주면 말풍선 박스의 최소 가로 크기를 지정함 (기본은 내용 크기에 맞춰 자동)
export default function TutorialTooltip({ rect, message, placement = 'top', onConfirm, warning, warn, center, rightAlign, minWidth, multiLine, textAlign, tailCenter, tailLeftPx }) {
  if (!rect) return null

  const isRight = placement === 'right'

  const left = isRight
    ? rect.right + 22
    : rightAlign ? rect.right : (center ? rect.left + rect.width / 2 : Math.max(rect.left, 12))

  const shift = isRight ? '' : (rightAlign ? 'translateX(-100%)' : (center ? 'translateX(-50%)' : ''))

  const boxStyle = isRight
    ? { top: rect.top + rect.height / 2, transform: 'translateY(-50%)' }
    : placement === 'top'
    ? { top: rect.top - 22, transform: `${shift} translateY(-100%)`.trim() }
    : { top: rect.bottom + 22, transform: shift || undefined }

  const tail = isRight
    ? { style: { position: 'absolute', left: -4, top: '50%', width: 14, height: 14, background: '#fff', transform: 'translateY(-50%) rotate(45deg)' } }
    : (() => {
        const tailEdge = placement === 'top' ? { bottom: -4 } : { top: -4 }
        const tailLeft = rightAlign ? undefined : (center ? '50%' : tailLeftPx !== undefined ? tailLeftPx : tailCenter ? rect.width / 2 - 640 : 16)
        const tailRight = rightAlign ? 16 : undefined
        const tailTransform = rightAlign ? 'rotate(45deg)' : (center ? 'translateX(-50%) rotate(45deg)' : 'rotate(45deg)')
        return { style: { position: 'absolute', left: tailLeft, right: tailRight, width: 14, height: 14, background: '#fff', transform: tailTransform, ...tailEdge } }
      })()

  return (
    <div style={{
      position: 'fixed', left, zIndex: 4000, whiteSpace: multiLine ? 'pre-line' : 'nowrap',
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
      ...boxStyle,
    }}>
      <div style={tail.style} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 8, padding: '12px 14px',
        fontSize: 13, color: '#333', lineHeight: 1.5, minWidth, textAlign,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: message ? 'flex-start' : 'center', gap: message ? 50 : 0 }}>
          {message && <span style={warn ? { color: '#ff3c00' } : undefined}>{message}</span>}
          {onConfirm && (
            <span
              onClick={e => { e.stopPropagation(); onConfirm() }}
              style={{ fontSize: 11, color: '#F5841F', fontWeight: 600, cursor: 'pointer' }}
            >
              확인[Enter]
            </span>
          )}
        </div>
        {warning && (
          <div style={{ textAlign: 'left', marginTop: 6, fontSize: 11, color: '#ff3c00' }}>
            {warning}
          </div>
        )}
      </div>
    </div>
  )
}
