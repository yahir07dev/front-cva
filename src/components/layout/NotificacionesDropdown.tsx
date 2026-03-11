'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Info, TrendingUp, AlertTriangle, MessageSquareQuote, X, BellRing } from 'lucide-react'
import { createClient } from '@/src/lib/supabase/client'
import { obtenerMisNotificaciones, marcarComoLeida, marcarTodasComoLeidas, eliminarNotificacion, limpiarTodasLasNotificaciones } from '@/src/services/notificacionesService'

export default function NotificacionesDropdown({ variant = 'header' }: { variant?: 'sidebar' | 'header' }) {
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [permisoPush, setPermisoPush] = useState<string>('default')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // 1. Revisar permisos al abrir el dropdown
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermisoPush(Notification.permission)
    }
  }, [isOpen])

  const fetchNotificaciones = useCallback(async () => {
    try {
      const data = await obtenerMisNotificaciones();
      setNotificaciones(data);
    } catch (e) {
      console.error("Error al cargar notificaciones:", e);
    }
  }, []);

  // 2. REALTIME: Vibración y notificación nativa en primer plano
  useEffect(() => {
    fetchNotificaciones();
    let isMounted = true;
    let myChannel: any = null;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      myChannel = supabase.channel(`notifs_vibe_${user.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notificaciones',
          filter: `usuario_id=eq.${user.id}`
        }, (payload) => {
           fetchNotificaciones(); 
           
           if (typeof window !== 'undefined') {
             try {
               if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
               
               if ('Notification' in window && Notification.permission === 'granted') {
                 new Notification(payload.new.titulo || 'Nueva alerta', {
                   body: payload.new.mensaje || 'Tienes una nueva actualización.',
                   icon: '/favicon.ico',
                 });
               }
             } catch (err) {
               console.warn('El navegador bloqueó la alerta:', err);
             }
           }
        })
        .subscribe();
    }

    setupRealtime();

    return () => {
      isMounted = false;
      if (myChannel) supabase.removeChannel(myChannel);
    }
  }, [fetchNotificaciones, supabase]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // 3. FUNCIÓN PARA PEDIR PERMISOS
  const solicitarPermisoDispositivo = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermisoPush(permission);
      if (permission === 'granted' && navigator.vibrate) {
         navigator.vibrate(200); 
      }
    }
  }

  // 4. RUTEO CORRECTO AL HACER CLIC
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

  const getIcon = (tipo: string) => {
    if (tipo === 'actividad_asignada') return <TrendingUp size={16} className="text-blue-500 dark:text-blue-400"/>
    if (tipo === 'feedback_recibido') return <MessageSquareQuote size={16} className="text-purple-500 dark:text-purple-400"/>
    if (tipo === 'alerta_sancion') return <AlertTriangle size={16} className="text-rose-500 dark:text-rose-400"/>
    return <Info size={16} className="text-neutral-500 dark:text-neutral-400"/>
  }

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className={`relative ${variant === 'sidebar' ? 'w-full' : ''}`} ref={dropdownRef}>
      {/* BOTÓN CAMPANA */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <Bell size={22} />
        {noLeidas > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center bg-rose-500 rounded-full ring-2 ring-white dark:ring-neutral-950 animate-pulse" />
        )}
      </button>

      {/* MENÚ DESPLEGABLE */}
      {isOpen && (
        <div className="
          absolute z-50 right-0 top-14 w-80 sm:w-96 overflow-hidden
          bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl
          border border-neutral-200/60 dark:border-neutral-800/60 
          rounded-3xl shadow-2xl dark:shadow-black/50
          animate-in fade-in slide-in-from-top-2 duration-200
        ">
          
          {/* HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-950/50">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Notificaciones</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => marcarTodasComoLeidas().then(fetchNotificaciones)} 
                className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Marcar leídas
              </button>
              <button 
                onClick={() => limpiarTodasLasNotificaciones().then(() => setNotificaciones([]))} 
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* BANNER DE PERMISOS (Minimalista) */}
          {permisoPush === 'default' && (
            <div className="bg-neutral-100 dark:bg-neutral-800/50 border-b border-neutral-200/60 dark:border-neutral-700/50 p-3.5 flex items-center justify-between gap-3">
              <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-tight">
                Activa las alertas para recibir notificaciones en tu dispositivo.
              </p>
              <button 
                onClick={solicitarPermisoDispositivo} 
                className="shrink-0 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm hover:scale-105 active:scale-95 flex items-center gap-1 transition-all"
              >
                <BellRing size={12}/> Activar
              </button>
            </div>
          )}

          {/* LISTA DE NOTIFICACIONES */}
          <div className="max-h-[400px] overflow-y-auto overscroll-contain">
            {notificaciones.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <Bell className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-3" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Estás al día</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">No tienes notificaciones nuevas</p>
              </div>
            ) : (
              notificaciones.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => handleClicNotificacion(notif)}
                  className={`
                    relative p-4 border-b border-neutral-100 dark:border-neutral-800/50 
                    transition-all cursor-pointer group hover:bg-neutral-50 dark:hover:bg-neutral-800/50
                    ${!notif.leida ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
                  `}
                >
                  {/* Indicador sutil de no leída */}
                  {!notif.leida && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 dark:bg-blue-400 rounded-r-full" />
                  )}

                  <div className="flex gap-3 items-start">
                    <div className={`mt-0.5 shrink-0 p-2 rounded-full ${!notif.leida ? 'bg-white dark:bg-neutral-800 shadow-sm' : ''}`}>
                      {getIcon(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className={`text-xs font-bold mb-0.5 ${notif.tipo === 'alerta_sancion' ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'}`}>
                        {notif.titulo}
                      </p>
                      <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {notif.mensaje}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); eliminarNotificacion(notif.id).then(fetchNotificaciones); }}
                    className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-all"
                  >
                    <X size={14}/>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}