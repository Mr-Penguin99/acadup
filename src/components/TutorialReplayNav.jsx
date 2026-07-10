import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTutorial, TUTORIAL_STEPS } from './TutorialContext'

// 하단 단계 이동 표시 - 웰컴(시작) 단계는 replay에서 절대 못 가므로 제외하고 반관리/수강생관리/수납관리만 노출
const STAGES = [
  { stage: 1, label: '반관리' },
  { stage: 2, label: '수강생관리' },
  { stage: 3, label: '수납관리' },
]
// 각 단계의 첫 번째 스텝 인덱스 - 그 화면에서만 하단 바 사용법 안내 텍스트를 보여줌
const STAGE_START_INDEXES = STAGES.map(s => TUTORIAL_STEPS.findIndex(x => x.stage === s.stage))

// replay(다시보기) 모드에서만 뜨는 이전/다음 내비게이션 - 실제로 처음 진행하는 live 모드에서는
// 사용자가 실제 입력/클릭으로 단계를 진행해야 하므로 노출하지 않음
export default function TutorialReplayNav() {
  const { isOpen, mode, replayStep, activeStep, advance, goBack, close, openReplay } = useTutorial()
  const navigate = useNavigate()
  const location = useLocation()
  const active = isOpen && mode === 'replay'

  // 이전/다음/단계이동 버튼은 상태(replayStep)만 바꾸고, 실제 라우트 이동은 아래 별도 effect가
  // activeStep(현재 진짜 상태)을 보고 알아서 맞춰줌 - 버튼 클릭 시점에 계산한 인덱스로 직접
  // navigate하면, 빠르게 연타하거나 다른 렌더와 겹칠 때 상태와 라우트가 어긋나서(예: 실제로는
  // "수납관리 메뉴를 클릭해 주세요" 단계인데 화면은 여전히 /payments에 남아있는 등) 해당 단계의
  // 강조표시/말풍선이 안 뜨는 버그가 있었음
  const goToStage = (stageNum) => {
    const startIndex = TUTORIAL_STEPS.findIndex(s => s.stage === stageNum)
    if (startIndex === -1) return
    openReplay(startIndex)
  }

  // 다음 버튼/스페이스바/방향키 → = 다음, 이전 버튼/방향키 ← = 이전
  useEffect(() => {
    if (!active) return
    const handleKeyDown = e => {
      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault()
        advance()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active])

  // 현재 진짜 단계(activeStep)가 바뀔 때마다 그 단계의 경로로 라우트를 맞춤 -
  // 클릭/키보드 어느 쪽으로 이동했든, 항상 실제 상태 기준으로 한 곳에서만 navigate하므로 어긋날 일이 없음
  useEffect(() => {
    if (!active || !activeStep?.path) return
    if (location.pathname !== activeStep.path) navigate(activeStep.path)
  }, [active, activeStep, location.pathname])

  if (!active) return null

  const currentStage = TUTORIAL_STEPS[Math.min(replayStep, TUTORIAL_STEPS.length - 1)]?.stage ?? 1

  const navBtnStyle = {
    position: 'fixed', top: '50%', transform: 'translateY(-50%)', zIndex: 5000,
    background: 'transparent', color: '#fff', border: 'none',
    padding: '10px 16px', fontSize: 14, fontWeight: 400, cursor: 'pointer',
    boxShadow: 'none', fontFamily: 'inherit',
  }

  const arrowStyle = { display: 'inline-block', transform: 'scaleY(1.8)' }

  return (
    <>
      {replayStep > 1 && (
        <button style={{ ...navBtnStyle, left: 16 }} onClick={goBack}>
          <span style={{ ...arrowStyle, marginRight: 6 }}>&lt;</span>이전
        </button>
      )}
      <button style={{ ...navBtnStyle, right: 16 }} onClick={advance}>
        다음<span style={{ ...arrowStyle, marginLeft: 6 }}>&gt;</span>
      </button>
      <button
        onClick={close}
        aria-label="창닫기"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 5000,
          background: 'transparent', color: '#fff', border: 'none',
          fontSize: 16, fontWeight: 400, cursor: 'pointer', lineHeight: 1,
          fontFamily: 'inherit', padding: 8,
        }}
      >
        창닫기 <span style={{ fontWeight: 700, fontSize: 16 }}>✕</span>
      </button>
      <div style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 5000,
        display: 'flex', alignItems: 'flex-start', background: '#555555',
        padding: '10px 28px', borderRadius: 24, userSelect: 'none',
      }}>
        {STAGES.map((s, i) => {
          const filled = currentStage >= s.stage
          return (
            <div key={s.stage} onClick={() => goToStage(s.stage)}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '0 22px' }}>
              {i > 0 && (
                <div style={{ position: 'absolute', top: 5, left: -22, width: 44, height: 2, background: filled ? '#F5841F' : '#888' }} />
              )}
              <div style={{
                width: 12, height: 12, borderRadius: '50%', position: 'relative',
                background: filled ? '#F5841F' : 'transparent',
                border: `2px solid ${filled ? '#F5841F' : '#888'}`,
              }} />
              <div style={{ marginTop: 6, fontSize: 12, color: '#fff', whiteSpace: 'nowrap' }}>{s.label}</div>
            </div>
          )
        })}
        {STAGE_START_INDEXES.includes(replayStep) && (
          <div style={{
            position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 20,
            width: 'max-content',
            color: '#fff', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-line', textAlign: 'left',
          }}>
            {'하단 바의 단계에 있는 원을 클릭해 해당 단계로 넘어갈 수 있습니다.\n< 이전, 다음 >, 스페이스바, 방향키 ←, →로 이전·다음 단계로 넘어갈 수 있습니다.'}
          </div>
        )}
      </div>
    </>
  )
}
