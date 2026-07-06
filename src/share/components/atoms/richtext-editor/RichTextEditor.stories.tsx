import { useState } from 'react'
import { RichTextEditor, type ToolbarAction } from './RichTextEditor'

const meta = {
  title: 'Shared/Atoms/RichTextEditor',
  component: RichTextEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta

function DefaultExample() {
  const [value, setValue] = useState(
    '<h2>Document title</h2><p><strong>Hello</strong>, this is a rich text editor.</p><p>You can add <a href="https://example.com">links</a>, images, and tables.</p>',
  )

  return <RichTextEditor value={value} onChange={setValue} />
}

function NoToolbarExample() {
  const [value, setValue] = useState('<p>Toolbar is hidden in this story.</p>')

  return <RichTextEditor toolbar={false} value={value} onChange={setValue} />
}

function CustomToolbarExample() {
  const [value, setValue] = useState('<p>Custom toolbar actions are rendered here.</p>')

  const actions: ToolbarAction[] = [
    {
      key: 'bold',
      label: 'Bold',
      onClick: (editor) => {
        editor.chain().focus().toggleBold().run()
      },
      active: (editor) => editor.isActive('bold'),
    },
    {
      key: 'italic',
      label: 'Italic',
      onClick: (editor) => {
        editor.chain().focus().toggleItalic().run()
      },
      active: (editor) => editor.isActive('italic'),
    },
    {
      key: 'clear',
      label: 'Clear',
      onClick: (editor) => {
        editor.chain().focus().clearContent().run()
      },
    },
  ]

  return <RichTextEditor toolbarActions={actions} value={value} onChange={setValue} />
}

export const Default = {
  render: () => <DefaultExample />,
}

export const NoToolbar = {
  render: () => <NoToolbarExample />,
}

export const CustomToolbar = {
  render: () => <CustomToolbarExample />,
}
