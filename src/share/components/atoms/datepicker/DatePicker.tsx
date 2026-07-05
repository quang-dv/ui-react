import { useEffect, useId, useMemo, useRef, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './DatePicker.css'

type Mode = 'day' | 'month' | 'year'
type Boundary = 'none' | 'endOfDate' | 'endOfMonth' | 'endOfYear'

type SingleValue = number | null
type RangeValue = [number | null, number | null]

type BaseProps = {
  label?: string
  mode?: Mode
  placeholder?: string
  boundary?: Boundary
}

type SingleProps = BaseProps & {
  range?: false
  value: SingleValue
  onChange: (value: SingleValue) => void
}

type RangeProps = BaseProps & {
  range: true
  value: RangeValue
  onChange: (value: RangeValue) => void
}

export type DatePickerCommonProps = SingleProps | RangeProps

export function DatePicker(props: DatePickerCommonProps) {
  const { label, mode = 'day', placeholder = 'Select date', boundary = 'none' } = props
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const isRange = props.range === true

  const selectedSingle = useMemo(() => {
    if (isRange) return null
    return toDate(props.value)
  }, [isRange, props.value])

const selectedRange = useMemo(() => {
    if (!isRange) return [null, null] as const
    return [toDate(props.value[0]), toDate(props.value[1])] as const
  }, [isRange, props.value])

  const displayValue = useMemo(() => formatValue(props.value, isRange, mode), [isRange, mode, props.value])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const handleSingleChange = (next: Date | null) => {
    if (isRange) return
    props.onChange(toTimestamp(next, boundary))
    setOpen(false)
  }

  const handleRangeChange = (next: [Date | null, Date | null]) => {
    if (!isRange) return
    const [start, end] = next
    props.onChange([toTimestamp(start, boundary), toTimestamp(end, boundary)])
  }

  return (
    <div className="dp" ref={rootRef}>
      {label ? (
        <label className="dp__label" id={id}>
          {label}
        </label>
      ) : null}

      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-labelledby={label ? id : undefined}
        className="dp__trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{displayValue || placeholder}</span>
        <span aria-hidden="true" className="dp__icon" />
      </button>

      {open ? (
        <div className="dp__menu">
          {isRange ? (
            <ReactDatePicker
              inline
              calendarStartDay={1}
              disabledKeyboardNavigation
              endDate={selectedRange[1] ?? undefined}
              onChange={handleRangeChange}
              openToDate={selectedToOpenDate(selectedRange)}
              renderCustomHeader={(headerProps) => <CalendarHeader {...headerProps} />}
              selectsRange
              selected={selectedRange[0] ?? undefined}
              showMonthYearPicker={mode === 'month'}
              showYearPicker={mode === 'year'}
              showPopperArrow={false}
              startDate={selectedRange[0] ?? undefined}
              shouldCloseOnSelect={false}
            />
          ) : (
            <ReactDatePicker
              inline
              calendarStartDay={1}
              disabledKeyboardNavigation
              onChange={handleSingleChange}
              openToDate={selectedToOpenDate(selectedSingle)}
              renderCustomHeader={(headerProps) => <CalendarHeader {...headerProps} />}
              selected={selectedSingle ?? undefined}
              showMonthYearPicker={mode === 'month'}
              showYearPicker={mode === 'year'}
              showPopperArrow={false}
              shouldCloseOnSelect
            />
          )}
        </div>
      ) : null}
    </div>
  )
}

function toDate(timestamp: number | null) {
  return timestamp === null ? null : new Date(timestamp)
}

function toTimestamp(date: Date | null, boundary: Boundary) {
  if (!date) return null

  const normalized =
    boundary === 'endOfDate'
      ? endOfDay(date)
      : boundary === 'endOfMonth'
        ? endOfMonth(date)
        : boundary === 'endOfYear'
          ? endOfYear(date)
          : date

  return normalized.getTime()
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function endOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999)
}

function formatValue(value: SingleValue | RangeValue, range: boolean, mode: Mode) {
  if (range) {
    const [start, end] = value as RangeValue
    if (!start && !end) return ''
    return [formatDate(start, mode), formatDate(end, mode)].filter(Boolean).join(' - ')
  }
  return formatDate(value as SingleValue, mode)
}

function formatDate(timestamp: number | null, mode: Mode) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (mode === 'year') return String(date.getFullYear())
  if (mode === 'month') return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function selectedToOpenDate(selected: Date | readonly [Date | null, Date | null] | null) {
  if (Array.isArray(selected)) return selected[0] ?? new Date()
  return selected ?? new Date()
}

type CalendarHeaderProps = {
  date: Date
  decreaseMonth: () => void
  increaseMonth: () => void
  changeMonth: (month: number) => void
  changeYear: (year: number) => void
  prevMonthButtonDisabled: boolean
  nextMonthButtonDisabled: boolean
}

function CalendarHeader({
  date,
  changeMonth,
  changeYear,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  decreaseMonth,
  increaseMonth,
}: CalendarHeaderProps) {
  const years = Array.from({ length: 11 }, (_, index) => date.getFullYear() - 5 + index)

  return (
    <div className="dp__header">
      <button
        aria-label="Previous month"
        className="dp__nav"
        disabled={prevMonthButtonDisabled}
        type="button"
        onClick={decreaseMonth}
      />

      <div className="dp__header-selects">
        <select
          className="dp__select dp__select--month"
          value={date.getMonth()}
          onChange={(event) => changeMonth(Number(event.target.value))}
        >
          {MONTHS.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>

        <select
          className="dp__select dp__select--year"
          value={date.getFullYear()}
          onChange={(event) => changeYear(Number(event.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <button
        aria-label="Next month"
        className="dp__nav"
        disabled={nextMonthButtonDisabled}
        type="button"
        onClick={increaseMonth}
      />
    </div>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
