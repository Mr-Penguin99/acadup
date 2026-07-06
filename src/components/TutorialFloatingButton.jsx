import { useNavigate, useLocation } from 'react-router-dom'
import { useTutorial, TUTORIAL_STEPS } from './TutorialContext'

const STAGES = ['시작', '반관리', '수강생관리', '수납관리']

// 반 등록/수정 등 팝업창(별도 라우트)에서는 노출하지 않고, 메인 앱 화면에서만 노출
const MAIN_APP_ROUTES = ['/dashboard', '/settings', '/students', '/payments', '/classes']

export default function TutorialFloatingButton() {
  const { started, step, totalSteps, resume } = useTutorial()
  const navigate = useNavigate()
  const location = useLocation()

  if (!started || !MAIN_APP_ROUTES.includes(location.pathname)) return null

  const progress = Math.round((Math.min(step, totalSteps) / totalSteps) * 100)
  const currentStage = TUTORIAL_STEPS[Math.min(step, totalSteps - 1)]?.stage ?? 0

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
        position: 'fixed', right: 24, bottom: 24, zIndex: 2500, width: 300,
        background: '#fff', border: '1px solid #eee', borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: '14px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        cursor: 'pointer', fontSize: 13, color: '#333', userSelect: 'none',
      }}
    >
      <div style={{ fontWeight: 700 }}>
        튜토리얼 진행도 <span style={{ color: '#F5841F' }}>{progress}%</span>
      </div>
      <div style={{ display: 'flex', width: '100%' }}>
        {STAGES.map((label, i) => {
          const filled = i <= currentStage
          return (
            <div key={label} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {i > 0 && (
                <div style={{ position: 'absolute', top: 5, left: '-50%', width: '100%', height: 2, background: filled ? '#F5841F' : '#ddd', zIndex: 0 }} />
              )}
              <div style={{
                width: 12, height: 12, borderRadius: '50%', position: 'relative', zIndex: 1,
                background: filled ? '#F5841F' : '#fff',
                border: `2px solid ${filled ? '#F5841F' : '#ddd'}`,
              }} />
              <div style={{ marginTop: 6, fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>{label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
