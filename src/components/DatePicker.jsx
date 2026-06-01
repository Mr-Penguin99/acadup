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

const arrowBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 13, color: '#666', padding: '0 4px', lineHeight: 1,
}

const selectStyle = {
  border: '1px solid #ddd', borderRadius: 4,
  padding: '3px 4px', fontSize: 13,
  fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
}
