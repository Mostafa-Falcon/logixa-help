"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Bold, Italic, Code, List, ListOrdered, Quote, Heading2, Undo, Redo } from "lucide-react"

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export default function RichEditor({ value, onChange, placeholder, minHeight = 200 }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder || "اكتب هنا..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none px-4 py-3 text-sm leading-relaxed",
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  if (!editor) return null

  const ToolBtn = ({ onClick, active, icon, title }: { onClick: () => void; active: boolean; icon: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-md p-1.5 transition-colors ${
        active ? "bg-[var(--color-brand)]/20 text-[var(--color-brand)]" : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-soft)] hover:text-white"
      }`}
    >
      {icon}
    </button>
  )

  return (
    <div className="rich-editor rounded-xl border overflow-hidden" style={{ borderColor: "rgba(224, 197, 132, 0.12)" }}>
      <div className="flex flex-wrap items-center gap-0.5 border-b px-3 py-2" style={{ borderColor: "rgba(224, 197, 132, 0.08)", background: "rgba(255,255,255,0.02)" }}>
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} icon={<Bold className="h-4 w-4" />} title="عريض" />
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} icon={<Italic className="h-4 w-4" />} title="مائل" />
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} icon={<Code className="h-4 w-4" />} title="كود" />
        <span className="mx-1 h-5 w-px bg-white/10" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} icon={<Heading2 className="h-4 w-4" />} title="عنوان" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} icon={<List className="h-4 w-4" />} title="قائمة نقطية" />
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} icon={<ListOrdered className="h-4 w-4" />} title="قائمة مرقمة" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} icon={<Quote className="h-4 w-4" />} title="اقتباس" />
        <span className="mx-1 h-5 w-px bg-white/10" />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} active={false} icon={<Undo className="h-4 w-4" />} title="تراجع" />
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} active={false} icon={<Redo className="h-4 w-4" />} title="إعادة" />
      </div>
      <EditorContent editor={editor} style={{ direction: "rtl" }} />
    </div>
  )
}
