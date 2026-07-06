import { useState } from 'react'
import { RichTextEditor } from './RichTextEditor'

const meta = {
  title: 'Shared/Atoms/RichTextEditor',
  component: RichTextEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta

function EmptyExample() {
  const [value, setValue] = useState('<p></p>')

  return <RichTextEditor value={value} onChange={setValue} />
}

function PrefilledExample() {
  const [value, setValue] = useState(
    '<h2>Document title</h2><p><strong>Hello</strong>, this is a rich text editor.</p><p>You can add <a href="https://example.com">links</a>, images, and tables.</p>',
  )

  return <RichTextEditor value={value} onChange={setValue} />
}

export const Empty = {
  render: () => <EmptyExample />,
}

export const Prefilled = {
  render: () => <PrefilledExample />,
}
