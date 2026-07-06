import { useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { Editor } from '@tiptap/core'
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
  toolbar?: boolean
  toolbarActions?: ToolbarAction[]
}

export type ToolbarAction = {
  key: string
  label: string
  onClick: (editor: Editor) => void | Promise<void>
  active?: (editor: Editor) => boolean
  show?: (state: { isInTable: boolean; isInImage: boolean }) => boolean
}

export function RichTextEditor({
  value = '<p></p>',
  placeholder = 'Write something...',
  onChange,
  onUploadImage,
  toolbar = true,
  toolbarActions,
}: Props) {
  const [isInTable, setIsInTable] = useState(false)
  const [isInImage, setIsInImage] = useState(false)

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
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            align: {
              default: 'center',
              parseHTML: (element) => element.getAttribute('data-align') ?? 'center',
              renderHTML: (attributes) => ({ 'data-align': attributes.align }),
            },
            width: {
              default: '100%',
              parseHTML: (element) => element.getAttribute('data-width') ?? '100%',
              renderHTML: (attributes) => ({ 'data-width': attributes.width }),
            },
          }
        },
      }).configure({
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
    onSelectionUpdate: ({ editor: instance }) => {
      setIsInTable(instance.isActive('table'))
      setIsInImage(instance.isActive('image'))
    },
    onUpdate: ({ editor: instance }) => onChange?.(instance.getHTML()),
  })

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return
    editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  if (!editor) return null

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

  const updateImage = (attributes: { align?: 'left' | 'center' | 'right'; width?: string }) => {
    editor.chain().focus().updateAttributes('image', attributes).run()
  }

  const defaultActions: ToolbarAction[] = [
    { key: 'bold', label: 'B', onClick: (instance) => { instance.chain().focus().toggleBold().run() }, active: (instance) => instance.isActive('bold') },
    { key: 'italic', label: 'I', onClick: (instance) => { instance.chain().focus().toggleItalic().run() }, active: (instance) => instance.isActive('italic') },
    { key: 'strike', label: 'S', onClick: (instance) => { instance.chain().focus().toggleStrike().run() }, active: (instance) => instance.isActive('strike') },
    { key: 'h1', label: 'H1', onClick: (instance) => { instance.chain().focus().toggleHeading({ level: 1 }).run() } },
    { key: 'h2', label: 'H2', onClick: (instance) => { instance.chain().focus().toggleHeading({ level: 2 }).run() } },
    { key: 'h3', label: 'H3', onClick: (instance) => { instance.chain().focus().toggleHeading({ level: 3 }).run() } },
    { key: 'bullet', label: '• List', onClick: (instance) => { instance.chain().focus().toggleBulletList().run() }, active: (instance) => instance.isActive('bulletList') },
    { key: 'ordered', label: '1. List', onClick: (instance) => { instance.chain().focus().toggleOrderedList().run() }, active: (instance) => instance.isActive('orderedList') },
    { key: 'link', label: 'Link', onClick: setLink, active: (instance) => instance.isActive('link') },
    { key: 'image', label: 'Image', onClick: setImage },
    { key: 'upload', label: 'Upload', onClick: uploadImage },
    { key: 'table', label: 'Table', onClick: insertTable },
  ]

  const actions = toolbarActions ?? defaultActions

  return (
    <div className="rte">
      {toolbar ? (
        <div className="rte__toolbar">
          {actions.map((action) => {
            const visible = action.show?.({ isInTable, isInImage }) ?? true
            if (!visible) return null

            const active = action.active?.(editor) ?? false
            return (
              <ToolbarButton
                key={action.key}
                active={active}
                label={action.label}
                onClick={() => void action.onClick(editor)}
              />
            )
          })}

          {isInImage ? (
            <>
              <ToolbarDivider />
              <ToolbarButton label="Left" onClick={() => updateImage({ align: 'left', width: '50%' })} />
              <ToolbarButton label="Center" onClick={() => updateImage({ align: 'center', width: '70%' })} />
              <ToolbarButton label="Right" onClick={() => updateImage({ align: 'right', width: '50%' })} />
              <ToolbarButton label="Fit" onClick={() => updateImage({ width: '100%' })} />
            </>
          ) : null}

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
      ) : null}

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
    <button
      className="rte__btn"
      data-active={active ? 'true' : 'false'}
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
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
