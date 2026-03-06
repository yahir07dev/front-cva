'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, Info, TrendingUp, AlertTriangle, MessageSquareQuote, X, Trash2 } from 'lucide-react'
import { createClient } from '@/src/lib/supabase/client'
import { obtenerMisNotificaciones, marcarComoLeida, marcarTodasComoLeidas, eliminarNotificacion, limpiarTodasLasNotificaciones } from '@/src/services/notificacionesService'

interface Props {
  variant?: 'sidebar' | 'header';
}

export default function NotificacionesDropdown({ variant = 'header' }: Props) {
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchNotificaciones = useCallback(async () => {
    try {
      const data = await obtenerMisNotificaciones();
      setNotificaciones(data);
    } catch (e) {
      console.error("Error al cargar notificaciones:", e);
    }
  }, []);

  // REALTIME: Actualiza la UI y activa vibración si la pestaña está activa
  useEffect(() => {
    fetchNotificaciones();
    let isMounted = true;
    let myChannel: any = null;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      myChannel = supabase.channel(`notifs_ui_${user.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notificaciones',
          filter: `usuario_id=eq.${user.id}`
        }, (payload) => {
           fetchNotificaciones(); 
           
           // VIBRACIÓN MANUAL (Funciona cuando la app está abierta en primer plano)
           if (typeof window !== 'undefined' && navigator.vibrate) {
             navigator.vibrate([300, 150, 300]);
           }
        })
        .subscribe();
    }

    setupRealtime();

    return () => {
      isMounted = false;
      if (myChannel) {
        supabase.removeChannel(myChannel);
      }
    }
  }, [fetchNotificaciones, supabase]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleClicNotificacion = async (notif: any) => {
    if (!notif.leida) {
      await marcarComoLeida(notif.id);
      setNotificaciones(prev => prev.map(n => n.id === notif.id ? { ...n, leida: true } : n));
    }
    if (notif.url_destino) {
      setIsOpen(false);
      router.push(notif.url_destino);
    }
  }

  const handleEliminarNotificacion = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await eliminarNotificacion(id);
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  }

  const handleLimpiarTodas = async () => {
    await limpiarTodasLasNotificaciones();
    setNotificaciones([]);
  }

  const handleMarcarTodas = async () => {
    await marcarTodasComoLeidas();
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  }

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const getIcon = (tipo: string) => {
    if (tipo === 'actividad_asignada') return <TrendingUp size={16} className="text-blue-500"/>
    if (tipo === 'feedback_recibido') return <MessageSquareQuote size={16} className="text-purple-500"/>
    if (tipo === 'alerta_sancion') return <AlertTriangle size={16} className="text-rose-500"/>
    return <Info size={16} className="text-neutral-500"/>
  }

  const buttonStyle = variant === 'sidebar' 
    ? "w-full flex items-center justify-start gap-3 px-3 py-3 rounded-2xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 transition-colors"
    : "relative p-2.5 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors";

  return (
    <div className={`relative ${variant === 'sidebar' ? 'w-full' : ''}`} ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={buttonStyle}>
        <div className="relative flex items-center justify-center">
          <Bell size={variant === 'header' ? 22 : 20} strokeWidth={2} />
          {noLeidas > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center bg-rose-500 text-[9px] font-bold text-white rounded-full border-2 border-white dark:border-neutral-950 animate-pulse">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </div>
        {variant === 'sidebar' && <span className="font-medium">Notificaciones</span>}
      </button>

      {isOpen && (
        <div className={`absolute z-[100] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-[340px] sm:w-96
          ${variant === 'sidebar' ? 'bottom-14 left-0' : 'top-14 right-0'}`
        }>
          <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Bell size={16} /> Notificaciones
            </h3>
            <div className="flex items-center gap-2">
              {noLeidas > 0 && (
                <button 
                  onClick={() => handleMarcarTodas()} 
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 bg-blue-100 dark:bg-blue-500/10 px-2 py-1 rounded-lg transition-colors"
                >
                  <Check size={12}/> Leídas
                </button>
              )}
              {notificaciones.length > 0 && (
                <button 
                  onClick={() => handleLimpiarTodas()} 
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-500 flex items-center gap-1 bg-rose-100 dark:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors"
                >
                  <Trash2 size={12}/> Limpiar
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
            {notificaciones.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                 <Bell className="text-neutral-300 dark:text-neutral-700 mb-3" size={32} strokeWidth={1}/>
                 <p className="text-sm text-neutral-500 font-medium">Bandeja limpia</p>
                 <p className="text-xs text-neutral-400 mt-1">Estás al día con todo.</p>
              </div>
            ) : (
              notificaciones.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => handleClicNotificacion(notif)}
                  className={`relative p-4 border-b border-neutral-50 dark:border-neutral-800/50 transition-colors cursor-pointer group hover:bg-neutral-50 dark:hover:bg-white/5 ${!notif.leida ? 'bg-orange-50/40 dark:bg-orange-500/10' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-1 shrink-0 p-2 rounded-full h-8 w-8 flex items-center justify-center ${!notif.leida ? 'bg-white dark:bg-black shadow-sm' : 'bg-transparent'}`}>
                      {getIcon(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className={`text-xs font-bold mb-1 truncate ${notif.tipo === 'alerta_sancion' ? 'text-rose-600' : 'text-neutral-900 dark:text-neutral-200'}`}>
                        {notif.titulo}
                      </p>
                      <p className="text-[12px] text-neutral-600 dark:text-neutral-400 leading-snug line-clamp-2">
                        {notif.mensaje}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-2 font-medium uppercase tracking-wider">
                        {new Date(notif.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => handleEliminarNotificacion(e, notif.id)}
                    className="absolute top-4 right-4 p-1.5 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-md transition-colors opacity-0 group-hover:opacity-100 md:opacity-0"
                  >
                    <X size={14} strokeWidth={3}/>
                  </button>
                  
                  {!notif.leida && (
                    <div className="absolute top-[22px] right-5 h-2 w-2 bg-orange-500 rounded-full shadow-sm shadow-orange-500/50 opacity-100 md:group-hover:opacity-0 transition-opacity"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}