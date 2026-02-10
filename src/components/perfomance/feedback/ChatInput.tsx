'use client'

import { Send, Loader2 } from 'lucide-react'
import { TipoComentario } from '@/src/types/performance'

interface ChatInputProps {
  // Ajustamos 'mensaje' a 'descripcion' para coincidir con la BD
  form: { titulo: string; descripcion: string; tipo: TipoComentario } 
  setForm: (form: any) => void
  onSend: (e: React.FormEvent) => void
  loading?: boolean // Agregué esto para feedback visual al enviar
}

export default function ChatInput({ form, setForm, onSend, loading = false }: ChatInputProps) {
  
  const tipos = [
    { id: 'positivo', label: 'Positivo', color: 'bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-200 dark:ring-emerald-900' },
    { id: 'mejora', label: 'Mejora', color: 'bg-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-200 dark:ring-amber-900' },
    { id: 'negativo', label: 'Negativo', color: 'bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-200 dark:ring-rose-900' }
  ]

  return (
    <div className="flex-none p-4 bg-white dark:bg-[#1a1d29] border-t border-gray-100 dark:border-gray-800 z-30">
      <form onSubmit={onSend} className="flex flex-col gap-3">
        
        {/* Selector de Tipo (Chips) */}
        <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none">
          {tipos.map(t => (
            <button 
              key={t.id} 
              type="button" 
              onClick={() => setForm({ ...form, tipo: t.id })}
              className={`
                px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap
                ${form.tipo === t.id 
                  ? t.color 
                  : 'bg-gray-100 text-gray-500 dark:bg-[#0f1117] dark:text-gray-400 shadow-none hover:bg-gray-200 dark:hover:bg-gray-800'
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-2">
          {/* Asunto */}
          <input 
            value={form.titulo} 
            onChange={e => setForm({ ...form, titulo: e.target.value })} 
            placeholder="Asunto..." 
            disabled={loading}
            className="w-full bg-gray-100 dark:bg-[#0f1117] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white font-medium placeholder:text-gray-400 disabled:opacity-50" 
          />
          
          {/* Descripción y Botón */}
          <div className="flex gap-2">
            <textarea 
              value={form.descripcion} 
              onChange={e => setForm({ ...form, descripcion: e.target.value })} 
              placeholder="Escribe el feedback..." 
              rows={1} 
              disabled={loading}
              className="flex-1 bg-gray-100 dark:bg-[#0f1117] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-white resize-none placeholder:text-gray-400 disabled:opacity-50 min-h-[48px]" 
            />
            
            <button 
              type="submit" 
              disabled={!form.descripcion.trim() || !form.titulo.trim() || loading} 
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center shrink-0 w-12 h-12"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}