import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xhfluyouysudzmifoubd.supabase.co'
const SUPABASE_KEY = 'sb_publishable_DUv-OLv7CebkgoiA08_gFg_nD1HsH8z'

// 관리자 로그인 전용 클라이언트. 메인 앱(익명 방문자 세션)이 쓰는 supabase 클라이언트와
// 완전히 분리된 별도 인증 컨텍스트라서, 관리자 로그인이 메인 앱의 익명 세션을 덮어쓰지 않음.
// 세션을 저장소에 남기지 않으므로(persistSession:false) 탭/창을 닫거나 새로고침하면
// 세션이 사라져 재접속 시 다시 로그인해야 함
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    // 메인 supabase 클라이언트와 저장소 키가 겹치면 두 GoTrueClient가 같은 채널로 인증 이벤트를
    // 주고받아 서로의 세션을 오염시킬 수 있음(멀티탭 동기화 매커니즘) - 완전히 다른 키로 분리
    storageKey: 'sb-admin-auth-token',
  },
})
