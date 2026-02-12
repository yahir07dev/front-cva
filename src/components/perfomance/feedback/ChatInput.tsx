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
    { 
      id: 'positivo', 
      label: 'Positivo', 
      color: 'bg-emerald-100 dark:bg-emerald-600/30 hover:bg-emerald-200 dark:hover:bg-emerald-600/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 shadow-emerald-600/10' 
    },
    { 
      id: 'mejora', 
      label: 'Mejora', 
      color: 'bg-amber-100 dark:bg-amber-600/30 hover:bg-amber-200 dark:hover:bg-amber-600/50 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 shadow-amber-600/10' 
    },
    { 
      id: 'negativo', 
      label: 'Negativo', 
      color: 'bg-rose-100 dark:bg-rose-600/30 hover:bg-rose-200 dark:hover:bg-rose-600/50 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30 shadow-rose-600/10' 
    }
  ]

  return (
    <div className="
      flex-none p-4 
      bg-white dark:bg-neutral-950 border-t border-gray-100 dark:border-neutral-800/40
      backdrop-blur-md shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.3)]
    ">
      <form onSubmit={onSend} className="flex flex-col gap-3">
        
        {/* Selector de Tipo (Chips) */}
        <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none">
          {tipos.map(t => (
            <button 
              key={t.id} 
              type="button" 
              onClick={() => setForm({ ...form, tipo: t.id })}
              className={`
                px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap active:scale-95
                ${form.tipo === t.id 
                  ? t.color + ' shadow-md' 
                  : 'bg-gray-100 dark:bg-neutral-800/60 hover:bg-gray-200 dark:hover:bg-neutral-700/70 text-gray-500 dark:text-neutral-300 ring-1 ring-gray-200 dark:ring-neutral-700/40 hover:ring-gray-300 dark:hover:ring-neutral-600/60'
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          {/* Asunto */}
          <input 
            value={form.titulo} 
            onChange={e => setForm({ ...form, titulo: e.target.value })} 
            placeholder="Asunto..." 
            disabled={loading}
            className="
              w-full rounded-xl bg-gray-50 dark:bg-neutral-900/70 border border-gray-200 dark:border-neutral-800/50 
              px-4 py-3 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 
              focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/30 
              transition-all duration-200 disabled:opacity-50
              backdrop-blur-sm
            " 
          />
          
          {/* Descripción y Botón */}
          <div className="flex gap-3">
            <textarea 
              value={form.descripcion} 
              onChange={e => setForm({ ...form, descripcion: e.target.value })} 
              placeholder="Escribe el feedback..." 
              rows={1} 
              disabled={loading}
              className="
                flex-1 rounded-xl bg-gray-50 dark:bg-neutral-900/70 border border-gray-200 dark:border-neutral-800/50 
                px-4 py-3 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 
                focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/30 
                transition-all duration-200 resize-none min-h-[48px] disabled:opacity-50
                backdrop-blur-sm
              " 
            />
            
            <button 
              type="submit" 
              disabled={!form.descripcion.trim() || !form.titulo.trim() || loading} 
              className="
                bg-gradient-to-r from-orange-600 to-orange-500 
                text-white p-3 rounded-xl transition-all duration-300 
                shadow-lg shadow-orange-600/20 dark:shadow-orange-600/30 
                hover:shadow-xl hover:shadow-orange-600/40 
                hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed 
                flex items-center justify-center shrink-0 w-12 h-12
              "
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}