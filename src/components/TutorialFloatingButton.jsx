import { useNavigate, useLocation } from 'react-router-dom'
import { useTutorial, TUTORIAL_STEPS } from './TutorialContext'

const STAGES = ['시작', '반관리', '수강생관리', '수납관리']

// 반 등록/수정 등 팝업창(별도 라우트)에서는 노출하지 않고, 메인 앱 화면에서만 노출
const MAIN_APP_ROUTES = ['/dashboard', '/settings', '/students', '/payments', '/classes']

export default function TutorialFloatingButton() {
  const { profileSynced, step, totalSteps, openReplay } = useTutorial()
  const navigate = useNavigate()
  const location = useLocation()

  // started 여부와 무관하게 항상 노출 - started가 (동기화 지연 등으로) 잘못 false가 되어도
  // 이 박스를 통해 언제든 다시 튜토리얼로 들어갈 수 있도록 함
  if (!profileSynced || !MAIN_APP_ROUTES.includes(location.pathname)) return null

  const progress = Math.round((Math.min(step, totalSteps) / totalSteps) * 100)
  const currentStage = TUTORIAL_STEPS[Math.min(step, totalSteps - 1)]?.stage ?? 0

  // 박스 전체를 클릭하면 replay 모드로 열림 - 완료했다면 처음부터, 아직 진행 중이면 그 위치부터 훑어봄
  // (실제 진행상태는 건드리지 않으므로 확인창 없이 바로 열림)
  const handleClick = () => {
    const targetIndex = step >= totalSteps ? 0 : step
    const targetPath = TUTORIAL_STEPS[targetIndex]?.path
    openReplay(targetIndex)
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath)
    }
  }

  // 진행도 표시줄의 개별 단계(반관리/수강생관리/수납관리)를 클릭하면 바로 그 단계의 시작 지점부터 replay
  const handleStageClick = (e, stageIndex) => {
    e.stopPropagation()
    const startIndex = TUTORIAL_STEPS.findIndex(s => s.stage === stageIndex)
    if (startIndex === -1) return
    openReplay(startIndex)
    const targetPath = TUTORIAL_STEPS[startIndex]?.path
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
            <div key={label} onClick={e => handleStageClick(e, i)} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
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
