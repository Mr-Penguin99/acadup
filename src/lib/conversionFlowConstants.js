export const EXTERNAL_SIGNUP_URL = 'https://www.acadup.co.kr/home/member/signup_agree.asp'
export const DATA_TEMPLATE_URL = '/' + encodeURIComponent('아카데미업 _데이터이전양식.xlsx')

export const DEVICE_PRODUCTS = {
  A: {
    name: '토스프론트',
    features: ['토스프론트 단말기 무료 지원(29만원)', '연매출 3억 이상 학원도 무료 제공', '방문 설치 및 유지관리 지원', '모바일 영수증 발행'],
  },
  B: {
    name: '토스프론트+카드단말기',
    features: ['토스프론트 단말기 무료 지원(29만원)', '카드단말기(NC-8000P)', '방문설치 및 유지관리 지원', '모바일·종이 영수증 발행', '월 11,000원(VAT포함)'],
  },
}

// 첨부파일 종류 - 사용자가 나열한 목록 그대로(총 9종), ConversionRequest.jsx의 신청 화면 그룹 순서와 동일
export const ATTACHMENT_FIELDS = [
  { key: 'bizCert', label: '사업자등록증' },
  { key: 'idCopy1', label: '신분증 사본' },
  { key: 'idCopy2', label: '신분증 사본(공동대표인 경우 신분증 사본)' },
  { key: 'bankCopy', label: '통장사본' },
  { key: 'outerSign', label: '건물외부 학원 간판사진' },
  { key: 'innerEntrance', label: '건물내부 학원 입구사진' },
  { key: 'classroomPhoto', label: '강의실 사진' },
  { key: 'corpSeal', label: '법인 인감증명서(법인인 경우)' },
  { key: 'corpShareholders', label: '법인 주주명부(법인인 경우)' },
]
