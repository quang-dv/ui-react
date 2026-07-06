import { useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import './RichTextEditor.css'

type Props = {
  value?: string
  placeholder?: string
  onChange?: (html: string) => void
  onUploadImage?: (file: File) => Promise<string> | string
}

export function RichTextEditor({
  value = '<p></p>',
  placeholder = 'Write something...',
  onChange,
  onUploadImage,
}: Props) {
  const [isInTable, setIsInTable] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        autolink: true,
        openOnClick: false,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      TableKit,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'rte__content',
        'data-placeholder': placeholder,
      },
    },
    onSelectionUpdate: ({ editor: instance }) => setIsInTable(instance.isActive('table')),
    onUpdate: ({ editor: instance }) => onChange?.(instance.getHTML()),
  })

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return
    editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  if (!editor) return null

  const can = {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    strike: editor.isActive('strike'),
    bullet: editor.isActive('bulletList'),
    ordered: editor.isActive('orderedList'),
    link: editor.isActive('link'),
  }

  const setLink = () => {
    const url = window.prompt('Enter link URL')
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: normalizeUrl(url) }).run()
  }

  const setImage = async () => {
    const src = window.prompt('Enter image URL')
    if (!src) return
    editor.chain().focus().setImage({ src: normalizeUrl(src), alt: 'Image' }).run()
  }

  const uploadImage = async () => {
    if (!onUploadImage) {
      await setImage()
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const src = await onUploadImage(file)
      editor.chain().focus().setImage({ src: normalizeUrl(src), alt: file.name }).run()
    }
    input.click()
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="rte">
      <div className="rte__toolbar">
        <ToolbarButton active={can.bold} label="B" onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton active={can.italic} label="I" onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton active={can.strike} label="S" onClick={() => editor.chain().focus().toggleStrike().run()} />
        <ToolbarDivider />
        <ToolbarButton label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <ToolbarButton label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolbarDivider />
        <ToolbarButton active={can.bullet} label="• List" onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarButton active={can.ordered} label="1. List" onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarDivider />
        <ToolbarButton active={can.link} label="Link" onClick={setLink} />
        <ToolbarButton label="Image" onClick={setImage} />
        <ToolbarButton label="Upload" onClick={uploadImage} />
        <ToolbarButton label="Table" onClick={insertTable} />
        {isInTable ? (
          <>
            <ToolbarDivider />
            <ToolbarButton label="+ Row" onClick={() => editor.chain().focus().addRowAfter().run()} />
            <ToolbarButton label="+ Col" onClick={() => editor.chain().focus().addColumnAfter().run()} />
            <ToolbarButton label="Del Row" onClick={() => editor.chain().focus().deleteRow().run()} />
            <ToolbarButton label="Del Col" onClick={() => editor.chain().focus().deleteColumn().run()} />
            <ToolbarButton label="Del Table" onClick={() => editor.chain().focus().deleteTable().run()} />
          </>
        ) : null}
      </div>

      <div className="rte__surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  active = false,
}: {
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button className="rte__btn" data-active={active ? 'true' : 'false'} type="button" onClick={onClick}>
      {label}
    </button>
  )
}

function ToolbarDivider() {
  return <span className="rte__divider" aria-hidden="true" />
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}
