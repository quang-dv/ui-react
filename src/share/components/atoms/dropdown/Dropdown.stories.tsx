import { useState } from 'react'
import { Dropdown, type DropdownOption } from './Dropdown'

const meta = {
  title: 'Shared/Atoms/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta

const OPTIONS: DropdownOption[] = [
  { label: 'Option 1', value: 'option-1' },
  { label: 'Option 2', value: 'option-2' },
  { label: 'Option 3', value: 'option-3' },
  { label: 'Option 4', value: 'option-4' },
  { label: 'Option 5', value: 'option-5' },
  { label: 'Option 6', value: 'option-6' },
]

function SingleExample() {
  const [value, setValue] = useState<string | string[] | null>('option-2')

  return <Dropdown label="Text label" options={OPTIONS} value={value} onChange={setValue} />
}

function MultipleExample() {
  const [value, setValue] = useState<string | string[] | null>(['option-1', 'option-2', 'option-3'])

  return (
    <Dropdown
      label="Text label"
      multiple
      options={OPTIONS}
      value={value}
      onChange={setValue}
    />
  )
}

function RemoteSearchExample() {
  const [value, setValue] = useState<string | string[] | null>(null)
  const [items, setItems] = useState(OPTIONS)

  const searchRemote = async (keyword: string) => {
    const normalized = keyword.trim().toLowerCase()
    setItems(
      OPTIONS.filter((option) => option.label.toLowerCase().includes(normalized)).slice(0, 4),
    )
  }

  return (
    <Dropdown
      label="Remote search"
      options={items}
      placeholder="Search API"
      searchMode="remote"
      value={value}
      onChange={setValue}
      onSearch={searchRemote}
    />
  )
}

function CreatableExample() {
  const [value, setValue] = useState<string | string[] | null>(null)
  const [items, setItems] = useState(OPTIONS)

  const createOption = async (keyword: string) => {
    const newOption = { label: keyword, value: keyword.toLowerCase().replace(/\s+/g, '-') }
    setItems((current) => [...current, newOption])
    return newOption
  }

  return (
    <Dropdown
      label="Creatable"
      options={items}
      creatable
      value={value}
      onChange={setValue}
      onCreateOption={createOption}
    />
  )
}

export const Single = {
  render: () => <SingleExample />,
}

export const Multiple = {
  render: () => <MultipleExample />,
}

export const RemoteSearch = {
  render: () => <RemoteSearchExample />,
}

export const Creatable = {
  render: () => <CreatableExample />,
}

