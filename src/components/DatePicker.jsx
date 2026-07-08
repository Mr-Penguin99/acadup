import { useState } from 'react'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ko } from 'date-fns/locale'

registerLocale('ko', ko)

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i)
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

// 월 선택 - 연도 토글만, 아래 1~12월 그리드
export function MonthPicker({ value, onChange, style }) {
  const date = value ? new Date(value + '-01') : null

  return (
    <ReactDatePicker
      selected={date}
      onChange={d => {
        if (d) {
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          onChange(y + '-' + m)
        }
      }}
      dateFormat="yyyy-MM"
      showMonthYearPicker
      showFourColumnMonthYearPicker
      locale="ko"
      portalId="datepicker-portal"
      popperPlacement="bottom-start"
      renderCustomHeader={({ date, changeYear, decreaseYear, increaseYear }) => (
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
        }}>
          <button onClick={decreaseYear} style={arrowBtn}>◀</button>
          <select
            value={date.getFullYear()}
            onChange={e => changeYear(Number(e.target.value))}
            style={selectStyle}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={increaseYear} style={arrowBtn}>▶</button>
        </div>
      )}
      customInput={
       <input
         className="sm-input pm-input sts-input cl-input"
         style={{ width: 120, cursor: 'pointer', ...style }}
         placeholder="YYYY-MM"
         readOnly
       />
      }
    />
  )
}

// 날짜 선택 - 연도 토글 + 월 토글, 아래 일자 달력
export function DatePicker({ value, onChange, style }) {
  const date = value ? new Date(value) : null

  return (
    <ReactDatePicker
      selected={date}
      onChange={d => {
        if (d) {
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          onChange(y + '-' + m + '-' + day)
        }
      }}
      dateFormat="yyyy-MM-dd"
      locale="ko"
      portalId="datepicker-portal"
      popperPlacement="bottom-start"
      renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth }) => (
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px', gap: 4,
        }}>
          <button onClick={decreaseMonth} style={arrowBtn}>◀</button>
          <div style={{ display: 'flex', gap: 4 }}>
            <select
              value={date.getFullYear()}
              onChange={e => changeYear(Number(e.target.value))}
              style={selectStyle}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={date.getMonth()}
              onChange={e => changeMonth(Number(e.target.value))}
              style={selectStyle}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <button onClick={increaseMonth} style={arrowBtn}>▶</button>
        </div>
      )}
      customInput={
        <input
          className="sm-input pm-input sts-input cl-input"
          style={{ width: 140, cursor: 'pointer', ...style }}
          placeholder="YYYY-MM-DD"
          readOnly
       />
      }
    />
  )
}

// 날짜 선택 - 텍스트를 자유롭게 입력할 수 있고, 달력 아이콘을 클릭했을 때만 달력이 열림
export function FreeDatePicker({ value, onChange, style, className, onInputFocus }) {
  const [open, setOpen] = useState(false)
  const parsed = value ? new Date(value) : null
  const selected = parsed && !isNaN(parsed.getTime()) ? parsed : null

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <ReactDatePicker
        value={value}
        onFocus={onInputFocus}
        onChangeRaw={e => {
          // 직접 타이핑한 경우(e.target이 input)만 처리 - 달력에서 날짜를 고른 경우는 아래 onChange가 처리
          if (e?.target instanceof HTMLInputElement) {
            e.preventDefault?.()
            onChange(e.target.value.replace(/[^0-9-]/g, ''))
          }
        }}
        selected={selected}
        onChange={d => {
          if (d) {
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            onChange(y + '-' + m + '-' + day)
          }
          setOpen(false)
        }}
        open={open}
        preventOpenOnFocus
        onClickOutside={() => setOpen(false)}
        dateFormat="yyyy-MM-dd"
        locale="ko"
        portalId="datepicker-portal"
        popperPlacement="bottom-start"
        renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth }) => (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px', gap: 4,
          }}>
            <button onClick={decreaseMonth} style={arrowBtn}>◀</button>
            <div style={{ display: 'flex', gap: 4 }}>
              <select
                value={date.getFullYear()}
                onChange={e => changeYear(Number(e.target.value))}
                style={selectStyle}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={date.getMonth()}
                onChange={e => changeMonth(Number(e.target.value))}
                style={selectStyle}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <button onClick={increaseMonth} style={arrowBtn}>▶</button>
          </div>
        )}
        customInput={
          <input
            className={className}
            style={{ width: 140, paddingRight: 28, ...style }}
            placeholder="YYYY-MM-DD"
          />
        }
      />
      <button
        type="button"
        onClick={() => { setOpen(o => !o); onInputFocus?.() }}
        aria-label="달력 열기"
        style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          border: 'none', background: 'none', padding: 0, cursor: 'pointer', lineHeight: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
    </span>
  )
}

const arrowBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 13, color: '#666', padding: '0 4px', lineHeight: 1,
}

const selectStyle = {
  border: '1px solid #ddd', borderRadius: 4,
  padding: '3px 4px', fontSize: 13,
  fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
}
