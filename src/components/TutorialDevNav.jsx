import { useNavigate, useLocation } from 'react-router-dom'
import { useTutorial, TUTORIAL_STEPS } from './TutorialContext'

// 개발 중 튜토리얼 단계를 수동으로 넘겨가며 확인하기 위한 임시 내비게이션
export default function TutorialDevNav() {
  const { isOpen, step, advance, goBack } = useTutorial()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isOpen) return null

  const goToStep = (targetIndex, action) => {
    action()
    const targetPath = TUTORIAL_STEPS[Math.max(0, Math.min(targetIndex, TUTORIAL_STEPS.length - 1))]?.path
    if (targetPath && location.pathname !== targetPath) navigate(targetPath)
  }

  const baseStyle = {
    position: 'fixed', top: '50%', transform: 'translateY(-50%)', zIndex: 5000,
    background: '#222', color: '#fff', border: 'none', borderRadius: 20,
    padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontFamily: 'inherit',
  }

  return (
    <>
      {step > 0 && (
        <button style={{ ...baseStyle, left: 16 }} onClick={() => goToStep(step - 1, goBack)}>
          ◀ 이전
        </button>
      )}
      <button style={{ ...baseStyle, right: 16 }} onClick={() => goToStep(step + 1, advance)}>
        다음 ▶
      </button>
    </>
  )
}
