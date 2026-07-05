import { useEffect, useId, useMemo, useRef, useState } from 'react'
import './Dropdown.css'

export type DropdownOption = {
  label: string
  value: string
  disabled?: boolean
}

type SearchMode = 'local' | 'remote'

type DropdownProps = {
  label?: string
  options: DropdownOption[]
  value: string | string[] | null
  multiple?: boolean
  placeholder?: string
  searchPlaceholder?: string
  searchMode?: SearchMode
  creatable?: boolean
  loading?: boolean
  onChange: (value: string | string[] | null, option: DropdownOption | DropdownOption[] | null) => void
  onSearch?: (keyword: string) => void | Promise<void>
  onCreateOption?: (keyword: string) => DropdownOption | Promise<DropdownOption>
}

const EMPTY_VALUES: string[] = []

export function Dropdown({
  label,
  options,
  value,
  multiple = false,
  placeholder = 'Select option',
  searchPlaceholder = 'Search',
  searchMode = 'local',
  creatable = false,
  loading = false,
  onChange,
  onSearch,
  onCreateOption,
}: DropdownProps) {
  const labelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const selectedValues = useMemo(() => toArray(value), [value])

  const visibleOptions = useMemo(() => {
    if (searchMode === 'remote' || !keyword.trim()) return options

    const normalizedKeyword = normalize(keyword)
    return options.filter((option) => normalize(option.label).includes(normalizedKeyword))
  }, [keyword, options, searchMode])

  const isAllSelected = multiple && visibleOptions.length > 0 && visibleOptions.every((option) => selectedValues.includes(option.value))

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValues.includes(option.value)),
    [options, selectedValues],
  )

  const triggerText = getTriggerText(selectedOptions, multiple, placeholder)
  const canCreate = creatable && keyword.trim().length > 0 && visibleOptions.length === 0

  useEffect(() => {
    if (!isOpen || searchMode !== 'remote' || !onSearch) return

    const timerId = window.setTimeout(() => {
      void onSearch(keyword.trim())
    }, 300)

    return () => window.clearTimeout(timerId)
  }, [isOpen, keyword, onSearch, searchMode])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const selectOption = (option: DropdownOption) => {
    if (option.disabled) return

    if (!multiple) {
      onChange(option.value, option)
      setIsOpen(false)
      return
    }

    const nextValues = selectedValues.includes(option.value)
      ? selectedValues.filter((item) => item !== option.value)
      : [...selectedValues, option.value]
    const nextOptions = options.filter((item) => nextValues.includes(item.value))

    onChange(nextValues, nextOptions)
  }

  const toggleAll = () => {
    if (!multiple) return
    if (isAllSelected) {
      onChange([], [])
      return
    }

    const nextValues = visibleOptions.filter((option) => !option.disabled).map((option) => option.value)
    const nextOptions = options.filter((option) => nextValues.includes(option.value))
    onChange(nextValues, nextOptions)
  }

  const createOption = async () => {
    if (!onCreateOption || !keyword.trim()) return

    const newOption = await onCreateOption(keyword.trim())
    selectOption(newOption)
    setKeyword('')
  }

  return (
    <div className="dropdown" ref={rootRef}>
      {label ? (
        <label className="dropdown__label" id={labelId}>
          {label}
        </label>
      ) : null}

      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={label ? labelId : undefined}
        className="dropdown__trigger"
        data-state={isOpen ? 'open' : 'closed'}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{triggerText}</span>
        <span aria-hidden="true" className="dropdown__chevron" />
      </button>

      {isOpen ? (
        <div className="dropdown__menu">
          <div className="dropdown__search">
            <input
              className="dropdown__search-input"
              placeholder={searchPlaceholder}
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          <div aria-multiselectable={multiple || undefined} className="dropdown__list" role="listbox">
            {multiple ? (
              <button
                aria-selected={isAllSelected}
                className="dropdown__option dropdown__option--select-all"
                role="option"
                type="button"
                onClick={toggleAll}
              >
                <span aria-hidden="true" className="dropdown__checkbox">
                  {isAllSelected ? <span className="dropdown__check" /> : null}
                </span>
                <span>Select all</span>
              </button>
            ) : null}

            {visibleOptions.map((option) => {
              const selected = selectedValues.includes(option.value)

              return (
                <button
                  aria-selected={selected}
                  className="dropdown__option"
                  disabled={option.disabled}
                  key={option.value}
                  role="option"
                  type="button"
                  onClick={() => selectOption(option)}
                >
                  {multiple ? (
                    <span aria-hidden="true" className="dropdown__checkbox">
                      {selected ? <span className="dropdown__check" /> : null}
                    </span>
                  ) : null}
                  <span>{option.label}</span>
                </button>
              )
            })}

            {loading ? <div className="dropdown__empty">Loading...</div> : null}
            {!loading && visibleOptions.length === 0 ? <div className="dropdown__empty">No options found</div> : null}
            {canCreate ? (
              <button className="dropdown__create" type="button" onClick={createOption}>
                Add "{keyword.trim()}"
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function toArray(value: DropdownProps['value']) {
  if (!value) return EMPTY_VALUES
  return Array.isArray(value) ? value : [value]
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase()
}

function getTriggerText(options: DropdownOption[], multiple: boolean, placeholder: string) {
  if (options.length === 0) return placeholder
  if (multiple) return `${options.length} selected`
  return options[0].label
}
