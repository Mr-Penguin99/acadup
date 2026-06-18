import { useNavigate, useLocation } from 'react-router-dom'
import { useTutorial, TUTORIAL_STEPS } from './TutorialContext'

export default function TutorialFloatingButton() {
  const { started, step, totalSteps, resume } = useTutorial()
  const navigate = useNavigate()
  const location = useLocation()

  if (!started) return null

  const progress = Math.round((Math.min(step, totalSteps) / totalSteps) * 100)

  const handleClick = () => {
    const targetIndex = step >= totalSteps ? 0 : step
    const targetPath = TUTORIAL_STEPS[targetIndex]?.path
    resume()
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath)
    }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed', right: 24, bottom: 24, zIndex: 2500,
        background: '#fff', border: '1px solid #eee', borderRadius: 30,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: '10px 18px',
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, color: '#333', userSelect: 'none',
      }}
    >
      <span>튜토리얼 보기</span>
      <span style={{ color: '#F5841F' }}>{progress}%</span>
    </div>
  )
}
