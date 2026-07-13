import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { EXTERNAL_SIGNUP_URL, DATA_TEMPLATE_URL, DEVICE_PRODUCTS, ATTACHMENT_FIELDS } from '../lib/conversionFlowConstants'

const pageStyle = { minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }
const cardStyle = { width: 480, maxWidth: '100%', boxSizing: 'border-box' }
const migrationCardStyle = { ...cardStyle, minHeight: 380 }
const titleStyle = { fontSize: 18, fontWeight: 700, color: '#192a3c', marginBottom: 14 }
const descStyle = { fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 22 }
const primaryBtn = { padding: '10px 20px', background: '#F5841F', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }
const grayBtn = { padding: '10px 20px', background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }
const fieldLabel = { fontSize: 14, fontWeight: 600, color: '#444', marginBottom: 4, display: 'block' }
const fieldInput = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 }

const closeWindow = () => { window.close() }

function FileUploadRow({ placeholder, file, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
      <div style={{
        flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6,
        fontSize: 13, color: file ? '#333' : '#aaa', background: '#fff',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {file ? file.name : placeholder}
      </div>
      <label style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 16px', background: '#192a3c', color: '#fff', borderRadius: 6,
        fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M14 2v5h5" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        파일첨부
        <input type="file" style={{ display: 'none' }} onChange={onChange} />
      </label>
    </div>
  )
}

function AttachmentGroup({ label, required, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 14, fontWeight: 700, color: '#192a3c', marginBottom: 6, display: 'block' }}>
        {label}{required && <span style={{ color: '#e5484d', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const DAUM_POSTCODE_SRC = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
const loadDaumPostcode = () => new Promise((resolve, reject) => {
  if (window.daum?.Postcode) { resolve(); return }
  const existing = document.querySelector(`script[src="${DAUM_POSTCODE_SRC}"]`)
  if (existing) { existing.addEventListener('load', () => resolve()); return }
  const script = document.createElement('script')
  script.src = DAUM_POSTCODE_SRC
  script.onload = () => resolve()
  script.onerror = () => reject(new Error('주소 검색 스크립트를 불러오지 못했습니다.'))
  document.head.appendChild(script)
})

// "지금 바로 시작하기" / "잠금 해제하러 가기"를 누르면 이 페이지가 새 창(팝업)으로 열려서
// 1단계 데이터 이전 신청, 2단계 단말기 신청까지 이 창 안에서 진행됨.
// 단말기 신청완료를 누르면 실제 가입 페이지를 새 탭으로 열고 이 창은 닫힘.
export default function ConversionRequest() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [migrationStatus, setMigrationStatus] = useState(null)
  const [deviceDone, setDeviceDone] = useState(false)
  const [step, setStep] = useState('migration-intro')

  const [migrationRequestId, setMigrationRequestId] = useState(null)
  const [product, setProduct] = useState(null)
  const [hasDevice, setHasDevice] = useState('')
  const [form, setForm] = useState({ bizNo: '', academyName: '', contactName: '', phone: '', address: '', addressDetail: '' })
  const [files, setFiles] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const [{ data: migRows }, { data: devRows }] = await Promise.all([
        supabase.from('data_migration_requests').select('status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('device_applications').select('id').eq('user_id', user.id).limit(1),
      ])
      if (cancelled) return
      const migStatus = migRows?.[0]?.status || null
      const hasDeviceRow = !!devRows?.length
      // "완료했다"의 기준: 데이터 이전은 '신청완료' 버튼 클릭(status==='completed'), 단말기는 '단말기 신청완료' 버튼 클릭(row 존재) - 건너뛰기는 완료로 치지 않음
      const migrationDone = migStatus === 'completed'
      setMigrationStatus(migStatus)
      setDeviceDone(hasDeviceRow)
      setForm(f => ({ ...f, academyName: profile?.biz_name || f.academyName, contactName: profile?.owner_name || f.contactName, phone: profile?.phone || f.phone }))
      if (migrationDone && hasDeviceRow) {
        window.open(EXTERNAL_SIGNUP_URL, '_blank')
        closeWindow()
        return
      }
      if (migrationDone && !hasDeviceRow) setStep('device-select')
      else setStep('migration-intro')
      setLoading(false)
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // 데이터 이전 단계(신청완료/건너뛰기)를 끝낸 뒤: 단말기 신청을 이미 완료했다면 바로 가입 링크로, 아니면 단말기 신청 화면으로
  const proceedAfterMigration = () => {
    if (deviceDone) {
      window.open(EXTERNAL_SIGNUP_URL, '_blank')
      closeWindow()
      return
    }
    setStep('device-select')
  }

  const requestMigration = async () => {
    if (!user) return
    setSubmitting(true)
    const { data, error } = await supabase.from('data_migration_requests').insert({ user_id: user.id, status: 'requested' }).select('id').single()
    setSubmitting(false)
    if (error) { alert(error.message || '신청에 실패했습니다.'); return }
    setMigrationRequestId(data.id)
    setMigrationStatus('requested')
    setStep('migration-info')
  }

  const completeMigrationRequest = async () => {
    if (migrationRequestId) {
      await supabase.from('data_migration_requests').update({ status: 'completed' }).eq('id', migrationRequestId)
      setMigrationStatus('completed')
    }
    proceedAfterMigration()
  }

  const skipMigration = async () => {
    if (!user) return
    await supabase.from('data_migration_requests').insert({ user_id: user.id, status: 'skipped' })
    setMigrationStatus('skipped')
    proceedAfterMigration()
  }

  const skipDevice = () => {
    window.open(EXTERNAL_SIGNUP_URL, '_blank')
    closeWindow()
  }

  const uploadAttachments = async () => {
    const attachments = {}
    for (const { key } of ATTACHMENT_FIELDS) {
      const file = files[key]
      if (!file) continue
      const path = `${user.id}/${Date.now()}-${key}-${file.name}`
      const { error } = await supabase.storage.from('device-attachments').upload(path, file)
      if (error) { console.error('첨부파일 업로드 실패:', key, error); continue }
      attachments[key] = path
    }
    return attachments
  }

  const searchAddress = async () => {
    try {
      await loadDaumPostcode()
      new window.daum.Postcode({
        oncomplete: (data) => {
          setForm(f => ({ ...f, address: data.roadAddress || data.jibunAddress }))
        },
      }).open()
    } catch (e) {
      alert(e.message || '주소 검색을 불러오지 못했습니다.')
    }
  }

  const submitDevice = async () => {
    if (!product) { alert('상품을 선택해 주세요.'); return }
    if (!user) return
    setSubmitting(true)
    const attachments = await uploadAttachments()
    const fullAddress = [form.address, form.addressDetail].filter(Boolean).join(' ')
    const { error } = await supabase.from('device_applications').insert({
      user_id: user.id,
      product,
      has_existing_device: hasDevice === 'yes',
      biz_no: form.bizNo,
      academy_name: form.academyName,
      contact_name: form.contactName,
      phone: form.phone,
      address: fullAddress,
      attachments,
    })
    setSubmitting(false)
    if (error) { alert(error.message || '신청에 실패했습니다.'); return }
    window.open(EXTERNAL_SIGNUP_URL, '_blank')
    closeWindow()
  }

  if (loading) return null

  return (
    <div style={pageStyle}>
      <style>{`
        .cr-gray-btn:hover { background:#d5d5d5 !important; color:#fff !important; }
        .cr-primary-btn:hover { background:#d9720f !important; color:#fff !important; }
      `}</style>
      <div style={(step === 'migration-intro' || step === 'migration-info') ? migrationCardStyle : cardStyle}>

        {step === 'migration-intro' && (
          <>
            <div style={{ ...titleStyle, fontSize: 28, textAlign: 'center' }}>데이터 이전 신청하기</div>
            <div style={{ background: '#F5F7F9', borderRadius: 8, padding: '18px 20px', marginBottom: 22 }}>
              <div style={{ ...descStyle, fontSize: 16, textAlign: 'center', margin: 0 }}>기존에 가지고 계신 수강생, 수납, 반의 데이터를 해당 양식에 기입 후 이메일로 보내주시면 데이터 이전 작업을 도와드립니다.</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button className="cr-gray-btn" style={{ ...grayBtn, width: 240, boxSizing: 'border-box', textAlign: 'center' }} onClick={skipMigration}>건너뛰기</button>
              <button className="cr-primary-btn" style={{ ...primaryBtn, width: 240, boxSizing: 'border-box', textAlign: 'center' }} disabled={submitting} onClick={requestMigration}>신청하기</button>
            </div>
          </>
        )}

        {step === 'migration-info' && (
          <>
            <div style={{ ...titleStyle, fontSize: 28, textAlign: 'center' }}>데이터 이전 신청하기</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <a href={DATA_TEMPLATE_URL} download="아카데미업_데이터이전양식.xlsx" style={{ ...grayBtn, textDecoration: 'underline', display: 'inline-block' }}>첨부파일 다운로드</a>
            </div>
            <div style={{ background: '#F5F7F9', borderRadius: 8, padding: '18px 20px', marginBottom: 22, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>
                첨부파일을 다운로드하고 이메일<br />
                <strong>acadup3435@naver.com</strong>으로 보내주세요.<br />
                학원명 · 원장님 성함은 메일 작성 시 필수로 남겨주세요.<br />
                작업 기간은 약 1~2일 소요됩니다.
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button className="cr-gray-btn" style={{ ...grayBtn, width: 240, boxSizing: 'border-box', textAlign: 'center' }} onClick={proceedAfterMigration}>건너뛰기</button>
              <button className="cr-primary-btn" style={{ ...primaryBtn, width: 240, boxSizing: 'border-box', textAlign: 'center' }} onClick={completeMigrationRequest}>신청완료</button>
            </div>
          </>
        )}

        {step === 'device-select' && (
          <>
            <div style={{ ...titleStyle, fontSize: 28, textAlign: 'center' }}>단말기 신청하기</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {Object.entries(DEVICE_PRODUCTS).map(([key, p]) => (
                <div key={key}
                  onClick={() => setProduct(key)}
                  style={{
                    border: `2px solid ${product === key ? '#F5841F' : '#e0e0e0'}`,
                    borderRadius: 8, padding: '14px 16px', cursor: 'pointer',
                    background: product === key ? '#FFF7EF' : '#fff',
                  }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#192a3c', marginBottom: 6 }}>상품 {key} · {p.name}</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#666', lineHeight: 1.7 }}>
                    {p.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button style={grayBtn} onClick={skipDevice}>건너뛰기</button>
              <button style={primaryBtn} disabled={!product} onClick={() => setStep('device-form')}>신청하기</button>
            </div>
          </>
        )}

        {step === 'device-form' && (
          <>
            <div style={{ ...titleStyle, fontSize: 28, textAlign: 'center' }}>단말기 신청 정보 입력</div>

            <label style={fieldLabel}>기존 단말기 이용 여부</label>
            <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 14, color: '#333' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={hasDevice === 'yes'} onChange={() => setHasDevice(hasDevice === 'yes' ? '' : 'yes')} /> 사용중이다
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={hasDevice === 'no'} onChange={() => setHasDevice(hasDevice === 'no' ? '' : 'no')} /> 사용중이지 않다
              </label>
            </div>

            <label style={fieldLabel}>사업자번호</label>
            <input style={fieldInput} value={form.bizNo} onChange={e => setForm(f => ({ ...f, bizNo: e.target.value }))} placeholder="000-00-00000" />

            <label style={fieldLabel}>학원명</label>
            <input style={fieldInput} value={form.academyName} onChange={e => setForm(f => ({ ...f, academyName: e.target.value }))} />

            <label style={fieldLabel}>대표자(담당자)</label>
            <input style={fieldInput} value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} />

            <label style={fieldLabel}>휴대폰번호</label>
            <input style={fieldInput} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="010-0000-0000" />

            <label style={fieldLabel}>주소</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input style={{ ...fieldInput, marginBottom: 0, background: '#f8f9fb' }} value={form.address} readOnly placeholder="주소 검색을 눌러주세요" onClick={searchAddress} />
              <button type="button" style={{ ...grayBtn, flexShrink: 0 }} onClick={searchAddress}>주소 검색</button>
            </div>
            <input style={fieldInput} value={form.addressDetail} onChange={e => setForm(f => ({ ...f, addressDetail: e.target.value }))} placeholder="상세주소를 입력해주세요" />

            <div style={{ background: '#F5F7F9', borderRadius: 8, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>카드단말기 사용을 위한 국내 카드사 등록 서류입니다.</div>

              <AttachmentGroup label="사업자등록증" required>
                <FileUploadRow placeholder="사업자등록증 사본" file={files.bizCert} onChange={e => setFiles(f => ({ ...f, bizCert: e.target.files?.[0] || null }))} />
              </AttachmentGroup>

              <AttachmentGroup label="신분증 사본" required>
                <FileUploadRow placeholder="신분증 사본" file={files.idCopy1} onChange={e => setFiles(f => ({ ...f, idCopy1: e.target.files?.[0] || null }))} />
                <FileUploadRow placeholder="공동대표인 경우 신분증 사본" file={files.idCopy2} onChange={e => setFiles(f => ({ ...f, idCopy2: e.target.files?.[0] || null }))} />
              </AttachmentGroup>

              <AttachmentGroup label="통장 사본" required>
                <FileUploadRow placeholder="통장 사본" file={files.bankCopy} onChange={e => setFiles(f => ({ ...f, bankCopy: e.target.files?.[0] || null }))} />
              </AttachmentGroup>

              <div style={{ height: 10 }} />

              <AttachmentGroup label="건물외부 학원 간판사진">
                <FileUploadRow placeholder="건물외부 학원 간판사진" file={files.outerSign} onChange={e => setFiles(f => ({ ...f, outerSign: e.target.files?.[0] || null }))} />
              </AttachmentGroup>

              <AttachmentGroup label="건물내부 학원 입구사진">
                <FileUploadRow placeholder="건물내부 학원 입구사진" file={files.innerEntrance} onChange={e => setFiles(f => ({ ...f, innerEntrance: e.target.files?.[0] || null }))} />
              </AttachmentGroup>

              <AttachmentGroup label="강의실 사진">
                <FileUploadRow placeholder="강의실 사진" file={files.classroomPhoto} onChange={e => setFiles(f => ({ ...f, classroomPhoto: e.target.files?.[0] || null }))} />
              </AttachmentGroup>

              <div style={{ height: 10 }} />

              <AttachmentGroup label="법인 인감증명서 (법인인 경우)">
                <FileUploadRow placeholder="법인 인감증명서" file={files.corpSeal} onChange={e => setFiles(f => ({ ...f, corpSeal: e.target.files?.[0] || null }))} />
              </AttachmentGroup>

              <AttachmentGroup label="법인 주주명부 (법인인 경우)">
                <FileUploadRow placeholder="법인 주주명부" file={files.corpShareholders} onChange={e => setFiles(f => ({ ...f, corpShareholders: e.target.files?.[0] || null }))} />
              </AttachmentGroup>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button style={{ ...grayBtn, width: 240, boxSizing: 'border-box', textAlign: 'center' }} onClick={skipDevice}>건너뛰기</button>
              <button style={{ ...primaryBtn, width: 240, boxSizing: 'border-box', textAlign: 'center' }} disabled={submitting} onClick={submitDevice}>단말기 신청완료</button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
