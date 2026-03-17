'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Pin, Trash2, Save, Loader2, Search, ChevronLeft, MoreVertical, CheckCircle2 } from 'lucide-react'
import { useNotasGlobales } from '@/src/hooks/notas/useNotasGlobales'
import NotaEditor from './NotaEditor'
import { createClient } from '@/src/lib/supabase/client'
import ModalConfirmacion from '@/src/components/shared/ModalConfirmacion' // <-- IMPORTANTE: Ajusta la ruta si es diferente

import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import { Node, mergeAttributes } from '@tiptap/react'
import ImageExtension from '@tiptap/extension-image'

const ResizableImageForHTML = Node.create({
  name: 'resizableImage',
  group: 'block',
  inline: false,
  atom: true,
  addAttributes() { return { src: { default: null }, alt: { default: null }, width: { default: null }, align: { default: 'left' } } },
  parseHTML() { return [{ tag: 'img[src]' }] },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const { width, ...rest } = HTMLAttributes
    return ['img', mergeAttributes(rest, { style: `width:${width ? width + 'px' : 'auto'}` })]
  },
})

const extensions = [StarterKit, Underline, TextStyle, Color, FontFamily, ResizableImageForHTML, ImageExtension, TaskList, TaskItem]
const BG_COLORS = ['#fef3c7', '#d1fae5', '#e0e7ff', '#fce7f3', '#ffe4e6', '#f3f4f6', '#0f766e']

function isDark(hex: string) {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

export default function NotasClient() {
  const supabase = useMemo(() => createClient(), [])
  const {
    notas, loading, canManage, canCreate, canDelete,
    handleCreate, handleUpdate, handleDelete, handleTogglePin,
  } = useNotasGlobales()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle'|'saving'|'saved'>('idle')

  // 👇 NUEVOS ESTADOS PARA EL MODAL DE ELIMINAR 👇
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [currentNota, setCurrentNota] = useState<{
    id?: string; titulo: string; contenidoJson: any; colorFondo: string; pinned?: boolean
  } | null>(null)

  const notasFiltradas = useMemo(() => {
    if (!search) return notas
    return notas.filter(n => n.titulo.toLowerCase().includes(search.toLowerCase()))
  }, [notas, search])

  const openCreateModal = async () => {
    try {
      const nuevaNota = await handleCreate('', '', BG_COLORS[0]) 
      setCurrentNota({
        id: nuevaNota.id, titulo: nuevaNota.titulo, contenidoJson: nuevaNota.contenido_json,
        colorFondo: nuevaNota.color_fondo, pinned: nuevaNota.pinned
      })
      setModalOpen(true)
      setShowMoreMenu(false)
      setSyncStatus('idle')
    } catch (e: any) {
      alert("Error al crear la nota colaborativa: " + e.message)
    }
  }

  const openEditModal = (nota: any) => {
    if (!canManage) return
    setCurrentNota({
      id: nota.id, titulo: nota.titulo, contenidoJson: nota.contenido_json,
      colorFondo: nota.color_fondo || BG_COLORS[0], pinned: nota.pinned
    })
    setModalOpen(true)
    setShowMoreMenu(false)
    setSyncStatus('idle')
  }

  // RECIBIR CAMBIOS EN VIVO
  useEffect(() => {
    if (!currentNota?.id || !modalOpen) return;

    const channel = supabase.channel(`nota-colab-${currentNota.id}`, {
      config: { broadcast: { self: false } } 
    });

    channel.on('broadcast', { event: 'sync' }, ({ payload }) => {
      setCurrentNota(prev => {
        if (!prev) return prev;
        const { contenidoJson, ...cambiosSeguros } = payload;
        return { ...prev, ...cambiosSeguros };
      });
    }).subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [currentNota?.id, modalOpen, supabase]);

  // ENVIAR CAMBIOS 
  const updateLocalNota = (changes: Partial<typeof currentNota>) => {
    setCurrentNota(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...changes };
      if (next.id) {
        supabase.channel(`nota-colab-${next.id}`).send({ type: 'broadcast', event: 'sync', payload: changes });
      }
      return next;
    });
  }

  // AUTO-GUARDADO
  useEffect(() => {
    if (!currentNota?.id || !modalOpen) return;

    const original = notas.find(n => n.id === currentNota.id);
    const hasChanged = original && (
      original.titulo !== currentNota.titulo ||
      JSON.stringify(original.contenido_json) !== JSON.stringify(currentNota.contenidoJson) ||
      original.color_fondo !== currentNota.colorFondo
    );

    if (hasChanged) {
      setSyncStatus('saving');
      const timeoutId = setTimeout(async () => {
        try {
          await handleUpdate(currentNota.id!, currentNota.titulo, currentNota.contenidoJson, currentNota.colorFondo);
          setSyncStatus('saved');
          setTimeout(() => setSyncStatus('idle'), 2500); 
        } catch(e) { console.error(e); }
      }, 1000); 
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentNota, notas, modalOpen, handleUpdate]);


  // 👇 LÓGICA DE ELIMINAR CON MODAL 👇
  const triggerDelete = (id: string, e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setNoteToDelete(id);
    setDeleteModalOpen(true);
    setShowMoreMenu(false);
  }

  const executeDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);
    try {
      await handleDelete(noteToDelete);
      setDeleteModalOpen(false);
      // Si la nota que borramos es la que está abierta actualmente, cerramos el editor
      if (currentNota?.id === noteToDelete) {
        setModalOpen(false);
      }
      setNoteToDelete(null);
    } catch (e) {
      alert("Error al eliminar la nota.");
    } finally {
      setIsDeleting(false);
    }
  }


  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#25C2FF]" size={32} /></div>
  if (!canManage && !canCreate) return <div className="flex h-full items-center justify-center text-neutral-500">No tienes permisos para ver las notas.</div>

  const noteBgColor  = currentNota?.colorFondo || BG_COLORS[0]
  const noteDark     = isDark(noteBgColor)
  const noteTextColor = noteDark ? '#ffffff' : '#171717'
  const noteSubColor  = noteDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)'

  return (
    <div className="relative flex flex-col h-full w-full bg-neutral-50 dark:bg-neutral-950 font-sans overflow-hidden">
      
      <div className="px-4 pt-6 pb-4 sm:px-8 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-4">Notas de Equipo</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input type="text" placeholder="Buscar en tus notas…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-transparent focus:ring-2 focus:ring-[#25C2FF] outline-none text-sm font-medium transition-all" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-28 scrollbar-hide">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {notasFiltradas.map((nota) => {
            const previewHTML = nota.contenido_json ? generateHTML(nota.contenido_json, extensions) : ''
            const cardDark = isDark(nota.color_fondo || BG_COLORS[0])
            const cardText = cardDark ? 'white' : '#1a1a1a'
            const cardSub  = cardDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'

            return (
              <div
                key={nota.id} onClick={() => openEditModal(nota)}
                className="relative aspect-square rounded-3xl p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer hover:-translate-y-0.5 overflow-hidden group ring-1 ring-black/5 dark:ring-white/10"
                style={{ backgroundColor: nota.color_fondo || '#fef3c7', color: cardText }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.12, backgroundImage: `linear-gradient(transparent 95%, currentColor 95%), linear-gradient(90deg, transparent 95%, currentColor 95%)`, backgroundSize: '16px 16px' }} />

                <div className="relative flex flex-col h-full z-10">
                  <div className="flex items-start justify-between gap-2 mb-1.5 shrink-0">
                    <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2">
                      {nota.titulo || <span className="opacity-50 italic">Sin título</span>}
                    </h3>
                    {nota.pinned && <Pin size={13} className="shrink-0 fill-current mt-0.5 opacity-70" />}
                  </div>

                  <style dangerouslySetInnerHTML={{ __html: `
                    .preview-content ul[data-type="taskList"] { list-style: none; padding: 0; }
                    .preview-content ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 5px; margin-bottom: 2px; }
                    .preview-content ul[data-type="taskList"] li[data-checked="true"] { text-decoration: line-through; opacity: 0.55; }
                    .preview-content input[type="checkbox"] { pointer-events: none; margin-top: 3px; accent-color: #25C2FF; width: 14px; height: 14px; flex-shrink: 0; }
                    .preview-content p { margin: 0 0 3px; line-height: 1.45; }
                    .preview-content img { width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 4px; }
                  ` }} />

                  <div 
                    className="preview-content prose prose-sm flex-1 overflow-hidden pointer-events-none text-xs sm:text-sm" 
                    style={{ color: cardText, opacity: 0.8, maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }} 
                    dangerouslySetInnerHTML={{ __html: previewHTML }} 
                  />

                  <div className="mt-2 pt-2 border-t text-[10px] font-semibold uppercase tracking-wide shrink-0" style={{ borderColor: cardDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)', color: cardSub }}>
                    {new Date(nota.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                  </div>
                </div>

                {/* 👇 BOTÓN ELIMINAR: Visible en móvil siempre (opacity-100), oculto en PC (sm:opacity-0) hasta hacer hover 👇 */}
                {canDelete && (
                  <button 
                    onClick={e => triggerDelete(nota.id, e)} 
                    className="absolute top-3 right-3 p-1.5 bg-black/20 text-white hover:bg-red-500 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all active:scale-90 z-20"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        {notasFiltradas.length === 0 && <div className="mt-20 text-center text-neutral-400 font-medium text-sm">No tienes notas creadas aún.</div>}
      </div>

      {canCreate && (
        <button onClick={openCreateModal} className="absolute bottom-24 right-6 md:bottom-10 md:right-8 bg-[#25C2FF] hover:bg-[#0ea5e9] text-white p-4 rounded-full shadow-[0_8px_30px_rgba(37,194,255,0.45)] transition-transform hover:scale-105 active:scale-95 z-10">
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* ── MODAL DE EDICIÓN ─────────────────────────────────────────────────── */}
      {modalOpen && currentNota && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div
            className="relative w-full h-full sm:h-[92vh] sm:max-w-lg flex flex-col sm:rounded-[28px] overflow-hidden shadow-2xl transition-colors duration-300 ring-1 ring-white/10"
            style={{ backgroundColor: noteBgColor, color: noteTextColor }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.12, backgroundImage: `linear-gradient(transparent 95%, currentColor 95%), linear-gradient(90deg, transparent 95%, currentColor 95%)`, backgroundSize: '20px 20px' }} />

            <div className="relative z-50 flex items-center justify-between px-3 py-2.5" style={{ background: 'rgba(0,0,0,0.04)' }}>
              
              <div className="flex flex-col items-center pl-2" style={{ color: noteSubColor }}>
                <span className="text-xs font-medium leading-none">
                  {new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center gap-1">
                
                {currentNota.id && (
                  <button 
                    onClick={async () => {
                      await handleTogglePin(currentNota.id!, currentNota.pinned || false)
                      updateLocalNota({ pinned: !currentNota.pinned }) 
                    }} 
                    className={`p-2 rounded-full transition-all active:scale-95 ${currentNota.pinned ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-[rgba(128,128,128,0.2)]'}`}
                    title={currentNota.pinned ? "Desfijar nota" : "Fijar nota"}
                  >
                    <Pin size={20} color={noteTextColor} className={currentNota.pinned ? "fill-current" : ""} />
                  </button>
                )}

                {/* BOTÓN MENÚ ELIMINAR */}
                {currentNota.id && canDelete && (
                  <div className="relative">
                    <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-2 rounded-full hover:bg-[rgba(128,128,128,0.2)] active:scale-95 transition-all">
                      <MoreVertical size={20} color={noteTextColor} />
                    </button>

                    {showMoreMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onPointerDown={() => setShowMoreMenu(false)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-700 py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <button
                            type="button"
                            // 👇 Disparamos triggerDelete en vez de window.confirm 👇
                            onPointerDown={(e) => triggerDelete(currentNota.id!, e)}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 font-bold transition-colors"
                          >
                            <Trash2 size={16} />
                            Eliminar nota
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setModalOpen(false)}
                  className="flex items-center justify-center bg-[#25C2FF] hover:bg-[#0ea5e9] text-white px-4 py-1.5 ml-2 rounded-full shadow-md transition-all active:scale-95 disabled:opacity-50"
                  title="Cerrar y guardar"
                >
                  {syncStatus === 'saving' && <Loader2 size={16} className="animate-spin mr-1.5" />}
                  {syncStatus === 'saved' && <CheckCircle2 size={16} className="mr-1.5 animate-in zoom-in duration-300" />}
                  <span className="text-sm font-bold">
                    {syncStatus === 'saving' ? 'Guardando' : 'Listo'}
                  </span>
                </button>

              </div>
            </div>

            <input
              type="text"
              value={currentNota.titulo}
              onChange={e => updateLocalNota({ titulo: e.target.value })}
              placeholder="Título"
              className="relative z-10 w-full bg-transparent border-0 px-5 py-3 text-[22px] sm:text-2xl font-bold outline-none placeholder:opacity-40 leading-tight"
              style={{ color: noteTextColor }}
            />

            <div className="relative z-10 flex-1 overflow-hidden flex flex-col">
              <NotaEditor
                key={currentNota.id} 
                contenidoInicial={currentNota.contenidoJson}
                onChange={json => updateLocalNota({ contenidoJson: json })}
                colorFondo="transparent"
                textColor={noteTextColor}
                onBgColorChange={c => updateLocalNota({ colorFondo: c })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ─────────────────────────── */}
      <ModalConfirmacion
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setNoteToDelete(null);
        }}
        onConfirm={executeDelete}
        titulo="Eliminar Nota"
        descripcion="¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer y desaparecerá para todos los administradores."
        variant="danger"
        textConfirmar="Sí, eliminar"
        loading={isDeleting}
      />
      
    </div>
  )
}