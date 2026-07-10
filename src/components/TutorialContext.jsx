import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// 단계가 추가될 때는 이 배열에만 추가하면 됨
// stage: 0=시작, 1=반관리, 2=수강생관리, 3=수납관리 (진행도 표시용)
export const TUTORIAL_STEPS = [
  { id: 'tutorial-welcome', path: '/classes', stage: 0 },
  { id: 'class-status-intro', path: '/classes', stage: 1 },
  { id: 'class-status-register-btn', path: '/classes', stage: 1 },
  { id: 'class-create-code-hint', path: '/classes', stage: 1 },
  { id: 'class-create-required-fields', path: '/classes', stage: 1 },
  { id: 'class-create-payday-hint', path: '/classes', stage: 1 },
  { id: 'class-create-name-hint', path: '/classes', stage: 1 },
  { id: 'class-create-subject-hint', path: '/classes', stage: 1 },
  { id: 'class-create-paycycle-hint', path: '/classes', stage: 1 },
  { id: 'class-create-optype-hint', path: '/classes', stage: 1 },
  { id: 'class-create-period-from-hint', path: '/classes', stage: 1 },
  { id: 'class-create-period-hint', path: '/classes', stage: 1 },
  { id: 'class-create-payment-hint', path: '/classes', stage: 1 },
  { id: 'class-create-save-hint', path: '/classes', stage: 1 },
  { id: 'class-create-new-register-hint', path: '/classes', stage: 1 },
  { id: 'class-status-complete-hint', path: '/classes', stage: 1 },
  { id: 'class-status-student-menu-hint', path: '/classes', stage: 1 },
  { id: 'student-class-list-intro', path: '/students', stage: 2 },
  { id: 'student-required-fields', path: '/students', stage: 2 },
  { id: 'student-name-hint', path: '/students', stage: 2 },
  { id: 'student-enroll-hint', path: '/students', stage: 2 },
  { id: 'student-phone-hint', path: '/students', stage: 2 },
  { id: 'student-birth-hint', path: '/students', stage: 2 },
  { id: 'student-save-hint', path: '/students', stage: 2 },
  { id: 'student-save-complete-hint', path: '/students', stage: 2 },
  { id: 'student-family-hint', path: '/students', stage: 2 },
  { id: 'student-family-name-hint', path: '/students', stage: 2 },
  { id: 'student-family-relation-hint', path: '/students', stage: 2 },
  { id: 'student-family-phone-hint', path: '/students', stage: 2 },
  { id: 'student-family-msgtype-hint', path: '/students', stage: 2 },
  { id: 'student-family-msgtype-info-hint', path: '/students', stage: 2 },
  { id: 'student-family-save-hint', path: '/students', stage: 2 },
  { id: 'student-family-complete-hint', path: '/students', stage: 2 },
  { id: 'student-class-tab-hint', path: '/students', stage: 2 },
  { id: 'student-class-tab-content-hint', path: '/students', stage: 2 },
  { id: 'student-class-register-hint', path: '/students', stage: 2 },
  { id: 'student-class-register-detail-hint', path: '/students', stage: 2 },
  { id: 'student-class-register-payday-hint', path: '/students', stage: 2 },
  { id: 'student-class-register-discount-hint', path: '/students', stage: 2 },
  { id: 'student-class-register-submit-hint', path: '/students', stage: 2 },
  { id: 'student-class-register-complete-hint', path: '/students', stage: 2 },
  { id: 'payment-menu-hint', path: '/students', stage: 2 },
  { id: 'payment-page-hint', path: '/payments', stage: 3 },
  { id: 'payment-page-detail-hint', path: '/payments', stage: 3 },
  { id: 'payment-student-list-hint', path: '/payments', stage: 3 },
  { id: 'payment-student-name-hint', path: '/payments', stage: 3 },
  { id: 'payment-detail-hint', path: '/payments', stage: 3 },
  { id: 'payment-checkbox-hint', path: '/payments', stage: 3 },
  { id: 'payment-manual-btn-hint', path: '/payments', stage: 3 },
  { id: 'payment-manual-modal-hint', path: '/payments', stage: 3 },
  { id: 'payment-pay-btn-hint', path: '/payments', stage: 3 },
  { id: 'payment-register-modal-hint', path: '/payments', stage: 3 },
  { id: 'payment-register-method-hint', path: '/payments', stage: 3 },
  { id: 'payment-register-installment-hint', path: '/payments', stage: 3 },
  { id: 'payment-register-pay-btn-hint', path: '/payments', stage: 3 },
  { id: 'payment-completed-list-hint', path: '/payments', stage: 3 },
  { id: 'payment-history-menu-hint', path: '/payments', stage: 3 },
  { id: 'payment-history-list-hint', path: '/payments', stage: 3 },
  { id: 'payment-history-name-hint', path: '/payments', stage: 3 },
  { id: 'payment-billing-detail-hint', path: '/payments', stage: 3 },
  { id: 'payment-billing-checkbox-hint', path: '/payments', stage: 3 },
  { id: 'payment-cancel-btn-hint', path: '/payments', stage: 3 },
  { id: 'payment-cancel-modal-hint', path: '/payments', stage: 3 },
  { id: 'payment-cancel-completed-list-hint', path: '/payments', stage: 3 },
  { id: 'payment-unpaid-menu-hint', path: '/payments', stage: 3 },
  { id: 'payment-final-list-hint', path: '/payments', stage: 3 },
  { id: 'payment-final-detail-hint', path: '/payments', stage: 3 },
]

const TutorialContext = createContext(null)

export function TutorialProvider({ children }) {
  const { user, profile } = useAuth()
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  // 'live'=실제로 입력하며 처음 진행하는 모드(자동 시작 시에만), 'replay'=이미 저장된 진행상태를
  // 건드리지 않고 고정된 샘플 데이터로 훑어보기만 하는 모드(튜토리얼 박스로 다시 볼 때)
  const [mode, setMode] = useState('live')
  // replay 모드에서 이전/다음으로 이동하는 위치 - 실제 진행상태(step)는 건드리지 않는 별도 카운터
  const [replayStep, setReplayStep] = useState(0)
  // profile이 실제로 한 번이라도 동기화됐는지 - 이게 true가 되기 전에는 autoStart가
  // (아직 로딩 중인) 기본값(started=false, step=0)을 보고 튜토리얼을 잘못 재시작하지 않도록 막음
  const [profileSynced, setProfileSynced] = useState(false)
  // 이 계정에 대해 이미 초기 동기화를 했는지 추적 - 이후 프로필이 다른 이유로
  // (설정 저장, 토큰 갱신 등) 다시 로드되어도 진행 중인 튜토리얼 단계를 덮어쓰지 않기 위함
  const syncedUserIdRef = useRef(null)

  // 계정(profile)이 "새로" 로드/전환됐을 때 그 계정의 튜토리얼 진행상태로 동기화 (계정당 1회)
  useEffect(() => {
    if (!profile) { syncedUserIdRef.current = null; return }
    if (syncedUserIdRef.current === profile.id) return
    syncedUserIdRef.current = profile.id
    // DB 전환 이전(localStorage 기준)에 이미 진행 중이던 진행도를 1회 복구
    if (!profile.tutorial_started) {
      const legacyStarted = localStorage.getItem('tutorialStarted') === 'true'
      const legacyStep = Number(localStorage.getItem('tutorialStep') || 0)
      if (legacyStarted) {
        setStep(legacyStep)
        setStarted(true)
        if (user) supabase.from('profiles').update({ tutorial_started: true, tutorial_step: legacyStep }).eq('id', user.id)
        setProfileSynced(true)
        return
      }
    }
    setStep(profile.tutorial_step || 0)
    setStarted(profile.tutorial_started || false)
    setProfileSynced(true)
  }, [profile])

  const totalSteps = TUTORIAL_STEPS.length
  const effectiveStep = mode === 'replay' ? replayStep : step
  const activeStep = TUTORIAL_STEPS[effectiveStep] || null

  // update가 실패해도(RLS 정책 누락 등) 그동안 조용히 무시되어, 다음 로그인 시
  // DB에는 진행상태가 저장 안 된 채로 남아 처음부터 다시 시작되는 것처럼 보이는 문제가 있었음 -
  // 최소한 콘솔에는 에러가 보이도록 함
  // DB에 tutorial_started:true를 같이 쓰는 김에 로컬 started도 항상 맞춰줌 -
  // 그래야 이후 autoStart가 (step 값과 무관하게) started만 보고 정확히 판단할 수 있음
  const persistStep = (n) => {
    setStep(n)
    setStarted(true)
    if (user) supabase.from('profiles').update({ tutorial_step: n, tutorial_started: true }).eq('id', user.id)
      .then(({ error }) => { if (error) console.error('튜토리얼 진행상태 저장 실패(tutorial_step):', error) })
  }

  // 로그인/가입 후 처음 진입했을 때 자동으로 한 번만 띄움(=live 모드로 진입) -
  // "진행하기/건너뛰기" 중 하나를 실제로 눌러야(=persistStep이 한 번이라도 호출돼야) started가
  // true가 되므로, started가 false면 아직 한 번도 실제 선택을 한 적이 없는 계정이라는 뜻
  // (웰컴 화면만 보고 그냥 닫아버린 경우 포함) - 그런 계정은 몇 번을 다시 들어와도 계속
  // live 모드로 자동 시작됨. 한 번이라도 선택했다면(started=true) 이후로는 절대 자동으로
  // 안 열리고, 튜토리얼 박스를 눌러야만(=replay) 다시 볼 수 있음
  // profile 동기화가 끝나기 전에는 호출해도 무시 - 그렇지 않으면 이미 진행한 사용자가 profile
  // 로딩 중에 이 페이지로 들어왔을 때 기본값(started=false)만 보고 다시 시작시켜버리는 경쟁 상태가 생김
  const autoStart = (stepId) => {
    if (!profileSynced) return
    if (!started && TUTORIAL_STEPS[0]?.id === stepId) {
      setMode('live')
      setIsOpen(true)
    }
  }

  // 특정 버튼 클릭/입력 등 실제 행동을 했을 때 다음 단계로 진행
  // 다음 단계가 같은 흐름에 더 남아있으면 바로 이어서 보여주고, 마지막 단계면 닫음
  // replay 모드에서는 도중에는 실제 진행상태(step)를 건드리지 않고 replayStep만 옮기지만,
  // 끝까지 다 보고 자연스럽게 완료되면(100%) 그 완료 상태도 실제 진행상태로 저장함
  const advance = () => {
    if (mode === 'replay') {
      setReplayStep(s => {
        const next = s + 1
        if (next >= totalSteps) { persistStep(next); setIsOpen(false) }
        return next
      })
      return
    }
    const next = step + 1
    persistStep(next)
    if (next >= totalSteps) {
      setIsOpen(false)
    }
  }

  // 이전 단계로 이동 - replay 모드에서 사용자가 직접 훑어볼 때 씀 (live 모드에서는 노출 안 함)
  // replay에서는 웰컴 단계(index 0)로 절대 돌아갈 수 없도록 1(반관리 시작)에서 멈춤
  const goBack = () => {
    if (mode === 'replay') { setReplayStep(s => Math.max(s - 1, 1)); return }
    if (step > 0) persistStep(step - 1)
  }

  // 특정 단계를 건너뛰고 임의의 인덱스로 바로 이동 (live 모드 전용, 실제 진행상태를 옮김)
  const skipTo = (n) => {
    persistStep(n)
    if (n >= totalSteps) setIsOpen(false)
  }

  // 웰컴 단계에서 "건너뛰기"를 눌렀을 때 사용 - live 모드에서는 진행도를 (웰컴 바로 다음인)
  // 반관리 시작 지점으로 남기고 닫음. 진행도 %는 사실상 0%에 가깝게 표시되고, 이후 튜토리얼
  // 박스를 누르면 정확히 반관리 단계("반 현황 페이지입니다")부터 replay로 이어짐
  // (started는 persistStep이 true로 만들어주므로 웰컴이 자동으로 다시 뜨진 않음)
  // replay 모드(미리보기)에서는 실제 진행상태를 절대 건드리지 않고 그냥 리플레이만 종료함
  const skip = () => {
    if (mode === 'replay') { setReplayStep(totalSteps); setIsOpen(false); return }
    persistStep(1)
    setIsOpen(false)
  }

  // "창닫기"로 리플레이를 나갈 때는, 지금 훑어보던 위치(replayStep)를 실제 진행상태로 저장함 -
  // 예: 98% 위치에서 창닫기하면 실제 진행도도 98%로, 10% 위치에서 닫으면 10%로 남음.
  // 단, 마지막 단계를 보고 있는 상태에서 닫으면 그것도 완료로 쳐서 100%로 저장함
  const close = () => {
    if (mode === 'replay') persistStep(replayStep >= totalSteps - 1 ? totalSteps : replayStep)
    setIsOpen(false)
  }

  // 튜토리얼 박스를 눌러 replay 모드로 열기 - 실제 진행상태(step)는 전혀 건드리지 않으므로
  // 완료 여부와 상관없이 확인창 없이 바로 열림. atIndex를 안 주면 지금 저장된 진행 위치에서 이어봄
  // (100% 완료 후 "처음부터"를 포함해) 웰컴 단계(index 0)로는 절대 안 열리고 항상 반관리
  // 시작 지점("반 현황 페이지입니다") 이상에서 시작함
  const openReplay = (atIndex) => {
    setMode('replay')
    setReplayStep(Math.max(atIndex ?? Math.min(step, totalSteps - 1), 1))
    setIsOpen(true)
  }

  // 플로팅 박스 전체를 클릭했을 때(이어보기) - openReplay의 별칭
  const resume = () => openReplay()

  return (
    <TutorialContext.Provider value={{
      step, totalSteps, activeStep, isOpen, started, profileSynced, mode, replayStep, effectiveStep,
      autoStart, advance, resume, openReplay, close, goBack, skipTo, skip,
    }}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  return useContext(TutorialContext)
}
