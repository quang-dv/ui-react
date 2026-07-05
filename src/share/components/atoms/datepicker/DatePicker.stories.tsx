import { useState } from 'react'
import { DatePicker } from './DatePicker'

const meta = {
  title: 'Shared/Atoms/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta

const now = Date.now()
const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime()

function SingleDayExample() {
  const [value, setValue] = useState<number | null>(startOfDay)

  return <DatePicker label="Day" value={value} onChange={setValue} />
}

function SingleMonthExample() {
  const [value, setValue] = useState<number | null>(startOfMonth)

  return <DatePicker label="Month" mode="month" value={value} onChange={setValue} />
}

function SingleYearExample() {
  const [value, setValue] = useState<number | null>(startOfYear)

  return <DatePicker label="Year" mode="year" value={value} onChange={setValue} />
}

function RangeDayExample() {
  const [value, setValue] = useState<[number | null, number | null]>([
    startOfDay,
    new Date(now + 7 * 24 * 60 * 60 * 1000).getTime(),
  ])

  return <DatePicker label="Range day" range value={value} onChange={setValue} />
}

function RangeMonthExample() {
  const [value, setValue] = useState<[number | null, number | null]>([
    startOfMonth,
    new Date(new Date().getFullYear(), new Date().getMonth() + 3, 1).getTime(),
  ])

  return <DatePicker label="Range month" mode="month" range value={value} onChange={setValue} />
}

function CreatableBoundaryExample() {
  const [value, setValue] = useState<number | null>(startOfDay)

  return (
    <DatePicker
      label="End of date"
      boundary="endOfDate"
      value={value}
      onChange={setValue}
    />
  )
}

export const SingleDay = {
  render: () => <SingleDayExample />,
}

export const SingleMonth = {
  render: () => <SingleMonthExample />,
}

export const SingleYear = {
  render: () => <SingleYearExample />,
}

export const RangeDay = {
  render: () => <RangeDayExample />,
}

export const RangeMonth = {
  render: () => <RangeMonthExample />,
}

export const EndOfDate = {
  render: () => <CreatableBoundaryExample />,
}

export const AllModes = {
  render: () => {
    const stories: Array<{ title: string; node: React.ReactNode }> = [
      { title: 'Single day', node: <SingleDayExample /> },
      { title: 'Single month', node: <SingleMonthExample /> },
      { title: 'Single year', node: <SingleYearExample /> },
      { title: 'Range day', node: <RangeDayExample /> },
      { title: 'Range month', node: <RangeMonthExample /> },
      { title: 'End of date', node: <CreatableBoundaryExample /> },
    ]

    return (
      <div style={{ display: 'grid', gap: 28 }}>
        {stories.map((story) => (
          <section key={story.title} style={{ display: 'grid', gap: 10 }}>
            <strong>{story.title}</strong>
            {story.node}
          </section>
        ))}
      </div>
    )
  },
}
