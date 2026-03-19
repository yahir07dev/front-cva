//src/components/perfomance/feedback/ChatInput.tsx
'use client'

import { Send, Loader2 } from 'lucide-react'
import { TipoComentario } from '@/src/types/performance'

interface ChatInputProps {
  form: { titulo: string; descripcion: string; tipo: TipoComentario }
  setForm: (form: any) => void
  onSend: (e: React.FormEvent) => void
  loading?: boolean
}

export default function ChatInput({ form, setForm, onSend, loading = false }: ChatInputProps) {
  
  const tipos = [
    { id: 'positivo', label: 'Positivo', dot: 'bg-emerald-500', activeText: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'mejora', label: 'Mejora', dot: 'bg-amber-500', activeText: 'text-amber-600 dark:text-amber-400' },
    { id: 'negativo', label: 'Negativo', dot: 'bg-rose-500', activeText: 'text-rose-600 dark:text-rose-400' }
  ]

  return (
    <div className="
      flex-none p-4 pb-6 sm:pb-4
      bg-white/80 dark:bg-neutral-950/80 
      backdrop-blur-xl
      border-t border-neutral-100 dark:border-0
    ">
      <form onSubmit={onSend} className="max-w-4xl mx-auto flex flex-col gap-3">
        
        {/* Selector de Tipo (Chips Minimalistas) */}
        <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-hide">
          {tipos.map(t => {
            const isActive = form.tipo === t.id
            return (
              <button 
                key={t.id} 
                type="button" 
                onClick={() => setForm({ ...form, tipo: t.id })}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95
                  ${isActive 
                    ? `bg-neutral-100 dark:bg-white/10 ${t.activeText} shadow-sm` 
                    : 'bg-transparent text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5'
                  }
                `}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${isActive ? t.dot : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Inputs Integrados */}
        <div className="flex flex-col gap-2 p-1.5 bg-neutral-50 dark:bg-white/[0.03] rounded-[24px] border border-neutral-200/50 dark:border-0 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/30 transition-all">
          
          {/* Asunto (Input discreto) */}
          <input 
            value={form.titulo} 
            onChange={e => setForm({ ...form, titulo: e.target.value })} 
            placeholder="Asunto..." 
            disabled={loading}
            className="
              w-full bg-transparent px-4 pt-2 text-xs font-bold text-neutral-900 dark:text-white 
              placeholder:text-neutral-400 focus:outline-none disabled:opacity-50
            " 
          />
          
          <div className="flex items-end gap-2 pr-1 pb-1">
            {/* Mensaje (Textarea) */}
            <textarea 
              value={form.descripcion} 
              onChange={e => setForm({ ...form, descripcion: e.target.value })} 
              placeholder="Escribe tu feedback aquí..." 
              rows={1} 
              disabled={loading}
              className="
                flex-1 bg-transparent px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 
                placeholder:text-neutral-400 focus:outline-none resize-none min-h-[40px] max-h-[120px] disabled:opacity-50
              " 
            />
            
            {/* Botón de Enviar (Circular) */}
            <button 
              type="submit" 
              disabled={!form.descripcion.trim() || !form.titulo.trim() || loading} 
              className="
                flex items-center justify-center h-10 w-10 rounded-full
                bg-orange-600 text-white 
                shadow-lg shadow-orange-600/20 
                hover:bg-orange-500 hover:scale-105 active:scale-95 
                transition-all duration-300 disabled:opacity-0 disabled:scale-50
              "
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}