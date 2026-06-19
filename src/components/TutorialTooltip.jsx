// 다크 오버레이 없이 특정 요소 위/아래에 붙는 말풍선 안내문 (한 줄로 표시)
// onConfirm을 전달하면 메시지 옆에 "확인[Enter]"가 붙고 클릭하면 호출됨 (Enter 처리는 호출하는 쪽에서 직접 담당)
// warning을 전달하면 그 아래 왼쪽 정렬된 경고 문구가 표시됨
// center를 true로 주면 rect의 가운데에 말풍선/말꼬리가 오도록 정렬 (기본은 rect의 왼쪽 끝에 맞춤)
// minWidth를 주면 말풍선 박스의 최소 가로 크기를 지정함 (기본은 내용 크기에 맞춰 자동)
export default function TutorialTooltip({ rect, message, placement = 'top', onConfirm, warning, center, minWidth }) {
  if (!rect) return null

  const left = center ? rect.left + rect.width / 2 : Math.max(rect.left, 12)
  const centerShift = center ? 'translateX(-50%)' : ''

  const boxStyle = placement === 'top'
    ? { top: rect.top - 22, transform: `${centerShift} translateY(-100%)`.trim() }
    : { top: rect.bottom + 22, transform: centerShift || undefined }

  // 말꼬리를 사각형을 45도 돌려서 만들고, 말풍선 박스 밑으로 충분히 겹쳐 깔아둬서
  // 테두리(이음선)가 보이지 않게 함 (박스가 나중에 그려져 겹친 부분을 덮어버림)
  const tailStyle = placement === 'top' ? { bottom: -4 } : { top: -4 }

  return (
    <div style={{
      position: 'fixed', left, zIndex: 4000, whiteSpace: 'nowrap',
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
      ...boxStyle,
    }}>
      <div style={{
        position: 'absolute', left: center ? '50%' : 16, width: 14, height: 14, background: '#fff',
        transform: center ? 'translateX(-50%) rotate(45deg)' : 'rotate(45deg)',
        ...tailStyle,
      }} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 8, padding: '12px 14px',
        fontSize: 13, color: '#333', lineHeight: 1.5, minWidth,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: message ? 'flex-start' : 'center', gap: message ? 50 : 0 }}>
          {message && <span>{message}</span>}
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
