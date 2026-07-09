import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTutorial, TUTORIAL_STEPS } from './TutorialContext'

// replay(다시보기) 모드에서만 뜨는 이전/다음 내비게이션 - 실제로 처음 진행하는 live 모드에서는
// 사용자가 실제 입력/클릭으로 단계를 진행해야 하므로 노출하지 않음
export default function TutorialReplayNav() {
  const { isOpen, mode, replayStep, advance, goBack, close } = useTutorial()
  const navigate = useNavigate()
  const location = useLocation()
  const active = isOpen && mode === 'replay'

  const goToStep = (targetIndex, action) => {
    action()
    const targetPath = TUTORIAL_STEPS[Math.max(0, Math.min(targetIndex, TUTORIAL_STEPS.length - 1))]?.path
    if (targetPath && location.pathname !== targetPath) navigate(targetPath)
  }

  // 다음 버튼/스페이스바/방향키 → = 다음, 이전 버튼/방향키 ← = 이전
  useEffect(() => {
    if (!active) return
    const handleKeyDown = e => {
      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault()
        goToStep(replayStep + 1, advance)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToStep(replayStep - 1, goBack)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active, replayStep])

  if (!active) return null

  const navBtnStyle = {
    position: 'fixed', top: '50%', transform: 'translateY(-50%)', zIndex: 5000,
    background: 'transparent', color: '#fff', border: 'none',
    padding: '10px 16px', fontSize: 14, fontWeight: 400, cursor: 'pointer',
    boxShadow: 'none', fontFamily: 'inherit',
  }

  const arrowStyle = { display: 'inline-block', transform: 'scaleY(1.8)' }

  return (
    <>
      {replayStep > 0 && (
        <button style={{ ...navBtnStyle, left: 16 }} onClick={() => goToStep(replayStep - 1, goBack)}>
          <span style={{ ...arrowStyle, marginRight: 6 }}>&lt;</span>이전
        </button>
      )}
      <button style={{ ...navBtnStyle, right: 16 }} onClick={() => goToStep(replayStep + 1, advance)}>
        다음<span style={{ ...arrowStyle, marginLeft: 6 }}>&gt;</span>
      </button>
      <button
        onClick={close}
        aria-label="창닫기"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 5000,
          background: 'transparent', color: '#fff', border: 'none',
          fontSize: 18, fontWeight: 400, cursor: 'pointer', lineHeight: 1,
          fontFamily: 'inherit', padding: 8,
        }}
      >
        창닫기 <span style={{ fontWeight: 700 }}>✕</span>
      </button>
    </>
  )
}
