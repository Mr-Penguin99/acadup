import { createContext, useContext, useState } from 'react'

// 단계가 추가될 때는 이 배열에만 추가하면 됨
export const TUTORIAL_STEPS = [
  { id: 'class-status-intro', path: '/classes' },
  { id: 'class-status-register-btn', path: '/classes' },
  { id: 'class-create-code-hint', path: '/classes' },
  { id: 'class-create-required-fields', path: '/classes' },
  { id: 'class-create-payday-hint', path: '/classes' },
  { id: 'class-create-name-hint', path: '/classes' },
  { id: 'class-create-subject-hint', path: '/classes' },
  { id: 'class-create-paycycle-hint', path: '/classes' },
  { id: 'class-create-optype-hint', path: '/classes' },
  { id: 'class-create-period-hint', path: '/classes' },
  { id: 'class-create-payment-hint', path: '/classes' },
  { id: 'class-create-save-hint', path: '/classes' },
  { id: 'class-create-new-register-hint', path: '/classes' },
  { id: 'class-create-closing', path: '/classes' },
  { id: 'class-status-complete-hint', path: '/classes' },
  { id: 'class-status-student-menu-hint', path: '/classes' },
  { id: 'student-class-list-intro', path: '/students' },
  { id: 'student-required-fields', path: '/students' },
  { id: 'student-name-hint', path: '/students' },
  { id: 'student-enroll-hint', path: '/students' },
  { id: 'student-phone-hint', path: '/students' },
  { id: 'student-birth-hint', path: '/students' },
  { id: 'student-save-hint', path: '/students' },
  { id: 'student-save-complete-hint', path: '/students' },
]

const STEP_KEY = 'tutorialStep'
const STARTED_KEY = 'tutorialStarted'

const TutorialContext = createContext(null)

export function TutorialProvider({ children }) {
  const [step, setStep] = useState(() => Number(localStorage.getItem(STEP_KEY) || 0))
  const [started, setStarted] = useState(() => localStorage.getItem(STARTED_KEY) === 'true')
  const [isOpen, setIsOpen] = useState(false)

  const totalSteps = TUTORIAL_STEPS.length
  const activeStep = TUTORIAL_STEPS[step] || null

  const persistStep = (n) => {
    setStep(n)
    localStorage.setItem(STEP_KEY, String(n))
  }

  const markStarted = () => {
    setStarted(true)
    localStorage.setItem(STARTED_KEY, 'true')
  }

  // 로그인/가입 후 처음 진입했을 때 자동으로 한 번만 띄움
  const autoStart = (stepId) => {
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

  // 플로팅 박스에서 이어보기 (완료된 경우 처음부터 다시 시작)
  const resume = () => {
    if (step >= totalSteps) {
      persistStep(0)
    }
    setIsOpen(true)
  }

  const close = () => setIsOpen(false)

  return (
    <TutorialContext.Provider value={{
      step, totalSteps, activeStep, isOpen, started,
      autoStart, advance, resume, close, goBack,
    }}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  return useContext(TutorialContext)
}
