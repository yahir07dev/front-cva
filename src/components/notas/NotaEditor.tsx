'use client'

import { useRef, useState, useCallback } from 'react'
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import { Node, mergeAttributes } from '@tiptap/react'
import { Loader2 } from 'lucide-react'

const ResizableImageView = ({ node, updateAttributes, selected }: any) => {
  const [isResizing, setIsResizing] = useState(false)
  const startX = useRef(0)
  const startW = useRef(0)
  const imgRef = useRef<HTMLImageElement>(null)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() 
    setIsResizing(true)
    startX.current = e.clientX
    startW.current = node.attrs.width || imgRef.current?.clientWidth || 300

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX.current
      const newW = Math.max(80, Math.min(800, startW.current + delta))
      updateAttributes({ width: Math.round(newW) })
    }
    const onUp = () => {
      setIsResizing(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [node.attrs.width, updateAttributes])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    startX.current = e.touches[0].clientX
    startW.current = node.attrs.width || imgRef.current?.clientWidth || 300

    const onMove = (ev: TouchEvent) => {
      const delta = ev.touches[0].clientX - startX.current
      const newW = Math.max(80, Math.min(800, startW.current + delta))
      updateAttributes({ width: Math.round(newW) })
    }
    const onEnd = () => {
      setIsResizing(false)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }, [node.attrs.width, updateAttributes])

  const width = node.attrs.width
  const align = node.attrs.align || 'left'

  return (
    <NodeViewWrapper style={{ display: 'block', textAlign: align, marginBottom: '8px', userSelect: isResizing ? 'none' : 'auto' }}>
      <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          style={{ width: width ? `${width}px` : 'auto', maxWidth: '100%', borderRadius: '12px', display: 'block', outline: selected ? '2px solid #1a73e8' : 'none', outlineOffset: '2px', cursor: 'default' }}
        />
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          title="Arrastrar tamaño"
          style={{ position: 'absolute', bottom: 4, right: 4, width: 24, height: 24, background: 'rgba(26,115,232,0.85)', borderRadius: 6, cursor: 'nwse-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: selected ? 1 : 0, transition: 'opacity 0.15s', zIndex: 10 }}
        >
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 8L8 2M5 8L8 5M8 8V8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  inline: false,
  draggable: true,
  atom: true,
  addAttributes() { return { src: { default: null }, alt: { default: null }, width: { default: null }, align: { default: 'left' } } },
  parseHTML() { return [{ tag: 'img[src]' }] },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const { width, align, ...rest } = HTMLAttributes
    return ['img', mergeAttributes(rest, { style: `width:${width ? width + 'px' : 'auto'}; display:block;` })]
  },
  addNodeView() { return ReactNodeViewRenderer(ResizableImageView) },
})

const TEXT_COLORS = ['#1a1a1a', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#1a73e8', '#A855F7']
const BG_COLORS   = ['#fef3c7', '#d1fae5', '#e0e7ff', '#fce7f3', '#ffe4e6', '#f3f4f6', '#0f766e']

const IcBold       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
const IcItalic     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
const IcUnderline  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
const IcList       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
const IcTaskList   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="6" height="6" rx="1"/><polyline points="4 8 6 10 9 6"/><line x1="13" y1="8" x2="21" y2="8"/><rect x="3" y="14" width="6" height="6" rx="1"/><line x1="13" y1="17" x2="21" y2="17"/></svg>
const IcPalette    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.289-.47-.688-.47-1.125a1.64 1.64 0 0 1 1.648-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
const IcBgColor    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>
const IcImage      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>

interface NotaEditorProps {
  contenidoInicial?: any
  onChange: (json: any) => void
  colorFondo?: string
  textColor?: string
  onBgColorChange?: (color: string) => void
}

export default function NotaEditor({
  contenidoInicial,
  onChange,
  colorFondo = '#fef3c7',
  textColor = '#171717',
  onBgColorChange,
}: NotaEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showBgColors, setShowBgColors] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, TextStyle, Color, FontFamily, ResizableImage,
      TaskList.configure({ HTMLAttributes: { class: 'not-prose pl-0' } }),
      TaskItem.configure({ nested: true, HTMLAttributes: { class: 'flex items-start gap-2 my-1' } }),
    ],
    // Tiptap solo cargará esto 1 vez al abrirse, evitando el parpadeo del cursor.
    content: contenidoInicial || '',
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[50vh] pb-32 px-4 pt-2' },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    if (file.size > 5 * 1024 * 1024) { alert('La imagen debe pesar menos de 5MB.'); return }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'notas_app')

      const res = await fetch('https://api.cloudinary.com/v1_1/dgd0apnro/image/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Error al subir imagen')
      const data = await res.json()

      editor.chain().focus().insertContent({ type: 'resizableImage', attrs: { src: data.secure_url, width: null } }).run()
    } catch {
      alert('No se pudo subir la imagen')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!editor) return null

  const btnClass = (active: boolean) =>
    `p-2 rounded-xl transition-all ${active ? 'bg-[#1a73e8]/15 text-[#1a73e8]' : 'opacity-60 hover:opacity-100 hover:bg-[rgba(127,127,127,0.15)]'}`

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden transition-colors duration-300">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        {isUploading && (
          <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-white flex items-center gap-1.5 text-xs font-semibold">
            <Loader2 size={13} className="animate-spin" /> Subiendo…
          </div>
        )}
        <EditorContent editor={editor} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20" style={{ background: 'rgba(0,0,0,0.03)', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        {showColors && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[rgba(0,0,0,0.05)] overflow-x-auto scrollbar-hide">
            {TEXT_COLORS.map(c => (
              <button key={c} onClick={() => { editor.chain().focus().setColor(c).run(); setShowColors(false) }} className="w-6 h-6 rounded-full shrink-0 border border-black/10 active:scale-75 transition-transform" style={{ background: c }} />
            ))}
          </div>
        )}

        {showBgColors && onBgColorChange && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[rgba(0,0,0,0.05)] overflow-x-auto scrollbar-hide">
            {BG_COLORS.map(c => (
              <button key={c} onClick={() => { onBgColorChange(c); setShowBgColors(false) }} className="w-6 h-6 rounded-full shrink-0 transition-all active:scale-75" style={{ background: c, border: colorFondo === c ? '2.5px solid #1a73e8' : '1.5px solid rgba(0,0,0,0.12)', transform: colorFondo === c ? 'scale(1.15)' : 'scale(1)' }} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-around px-1 py-1">
          <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={btnClass(editor.isActive('taskList'))} title="Lista de tareas"><IcTaskList /></button>
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Negrita"><IcBold /></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Cursiva"><IcItalic /></button>
          <button onClick={() => fileInputRef.current?.click()} className={btnClass(false)} title="Insertar imagen"><IcImage /></button>
          <button onClick={() => { setShowColors(p => !p); setShowBgColors(false) }} className={btnClass(showColors)} title="Color de texto"><IcPalette /></button>
          {onBgColorChange && <button onClick={() => { setShowBgColors(p => !p); setShowColors(false) }} className={btnClass(showBgColors)} title="Color de fondo"><IcBgColor /></button>}
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Lista"><IcList /></button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Subrayado"><IcUnderline /></button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .prose { color: inherit !important; }
        .prose h1, .prose h2, .prose h3, .prose strong, .prose b { color: inherit !important; }
        .prose ul[data-type="taskList"] { list-style: none; padding: 0; }
        .prose ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
        .prose ul[data-type="taskList"] li input[type="checkbox"] { margin-top: 3px; width: 18px; height: 18px; accent-color: #25C2FF; cursor: pointer; flex-shrink: 0; border-radius: 4px; }
        .prose ul[data-type="taskList"] li p { margin: 0; line-height: 1.5; }
        .prose ul[data-type="taskList"] li[data-checked="true"] > div { text-decoration: line-through; opacity: 0.55; }
        .prose img { max-width: 100%; border-radius: 12px; cursor: default; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </div>
  )
}