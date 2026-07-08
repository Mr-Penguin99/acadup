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
  { id: 'class-create-closing', path: '/classes', stage: 1 },
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
  { id: 'student-class-register-discount-repeat-hint', path: '/students', stage: 2 },
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
  const activeStep = TUTORIAL_STEPS[step] || null

  const persistStep = (n) => {
    setStep(n)
    if (user) supabase.from('profiles').update({ tutorial_step: n }).eq('id', user.id)
  }

  const markStarted = () => {
    setStarted(true)
    if (user) supabase.from('profiles').update({ tutorial_started: true }).eq('id', user.id)
  }

  // 로그인/가입 후 처음 진입했을 때 자동으로 한 번만 띄움
  // profile 동기화가 끝나기 전(started/step이 아직 기본값일 때)에는 호출해도 무시 -
  // 그렇지 않으면 이미 완료한 사용자가 profile 로딩 중에 이 페이지로 들어왔을 때
  // 기본값(started=false)만 보고 튜토리얼을 다시 시작시켜버리는 경쟁 상태가 생김
  const autoStart = (stepId) => {
    if (!profileSynced) return
    if (!started && activeStep?.id === stepId) {
      setIsOpen(true)
      markStarted()
    }
  }

  // 특정 버튼 클릭/입력 등 실제 행동을 했을 때 다음 단계로 진행
  // 다음 단계가 같은 흐름에 더 남아있으면 바로 이어서 보여주고, 마지막 단계면 닫음
  const advance = () => {
    const next = step + 1
    persistStep(next)
    if (next >= totalSteps) {
      setIsOpen(false)
    }
  }

  // (개발/확인용) 이전 단계로 이동
  const goBack = () => {
    if (step > 0) persistStep(step - 1)
  }

  // 특정 단계를 건너뛰고 임의의 인덱스로 바로 이동
  const skipTo = (n) => {
    persistStep(n)
    if (n >= totalSteps) setIsOpen(false)
  }

  // 플로팅 박스에서 이어보기 (완료된 경우, 확인 후에만 처음부터 다시 시작)
  const resume = () => {
    if (step >= totalSteps) {
      if (!window.confirm('이미 완료한 튜토리얼입니다. 처음부터 다시 보시겠습니까?')) return
      persistStep(0)
    }
    setIsOpen(true)
  }

  const close = () => setIsOpen(false)

  return (
    <TutorialContext.Provider value={{
      step, totalSteps, activeStep, isOpen, started, profileSynced,
      autoStart, advance, resume, close, goBack, skipTo,
    }}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  return useContext(TutorialContext)
}
