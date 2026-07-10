import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTutorial, TUTORIAL_STEPS } from './TutorialContext'

// 반 등록/수정 등 팝업창(별도 라우트)에서는 노출하지 않고, 메인 앱 화면에서만 노출
const MAIN_APP_ROUTES = ['/dashboard', '/settings', '/students', '/payments', '/classes']

export default function TutorialFloatingButton() {
  const { profileSynced, step, totalSteps, openReplay, isOpen, mode, effectiveStep } = useTutorial()
  const navigate = useNavigate()
  const location = useLocation()
  const [replayHover, setReplayHover] = useState(false)

  // started 여부와 무관하게 항상 노출 - started가 (동기화 지연 등으로) 잘못 false가 되어도
  // 이 박스를 통해 언제든 다시 튜토리얼로 들어갈 수 있도록 함
  if (!profileSynced || !MAIN_APP_ROUTES.includes(location.pathname)) return null

  // 리플레이 중에는 이전/다음으로 이동한 위치에 맞춰 진행도 표시가 같이 움직이고,
  // 리플레이 중이 아닐 때는 실제 저장된 진행 위치를 보여줌
  const displayStep = (isOpen && mode === 'replay') ? effectiveStep : step
  const progress = Math.round((Math.min(displayStep, totalSteps) / totalSteps) * 100)

  // "튜토리얼 다시보기" 버튼을 눌렀을 때만 replay 모드로 열림 - 완료했다면 반관리 시작 지점부터
  // (웰컴 단계로는 절대 안 감), 아직 진행 중이면 그 위치부터 훑어봄
  // (실제 진행상태는 건드리지 않으므로 확인창 없이 바로 열림)
  const handleReplayClick = () => {
    const targetIndex = step >= totalSteps ? 1 : Math.max(step, 1)
    const targetPath = TUTORIAL_STEPS[targetIndex]?.path
    openReplay(targetIndex)
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', right: 24, bottom: 24, zIndex: 2500, width: 200,
        background: '#fff', border: '1px solid #eee', borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: '14px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        fontSize: 13, color: '#333', userSelect: 'none',
      }}
    >
      <div style={{ fontWeight: 700 }}>
        튜토리얼 진행도 <span style={{ color: '#F5841F' }}>{progress}%</span>
      </div>
      <button
        onClick={handleReplayClick}
        onMouseEnter={() => setReplayHover(true)}
        onMouseLeave={() => setReplayHover(false)}
        style={{
          width: '100%', padding: '8px 0',
          background: replayHover ? '#fff' : '#F5841F',
          color: replayHover ? '#F5841F' : '#fff',
          border: replayHover ? '1px solid #F5841F' : '1px solid transparent',
          borderRadius: 6, fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
        }}
      >
        튜토리얼 다시보기
      </button>
    </div>
  )
}
