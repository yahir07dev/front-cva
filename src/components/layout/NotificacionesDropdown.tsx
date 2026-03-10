'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, Info, TrendingUp, AlertTriangle, MessageSquareQuote, X, Trash2, BellRing } from 'lucide-react'
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
               // A. VIBRACIÓN MANUAL
               if (navigator.vibrate) {
                 navigator.vibrate([300, 150, 300]);
               }
               
               // B. NOTIFICACIÓN NATIVA VISUAL
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
      // Pequeña vibración de prueba si acepta
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
    
    // Si la BD mandó una URL de destino (ej. /dashboard/rendimiento/comentarios), viajamos ahí
    if (notif.url_destino) {
      setIsOpen(false);
      router.push(notif.url_destino);
    }
  }

  const getIcon = (tipo: string) => {
    if (tipo === 'actividad_asignada') return <TrendingUp size={16} className="text-blue-500"/>
    if (tipo === 'feedback_recibido') return <MessageSquareQuote size={16} className="text-purple-500"/>
    if (tipo === 'alerta_sancion') return <AlertTriangle size={16} className="text-rose-500"/>
    return <Info size={16} className="text-neutral-500"/>
  }

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className={`relative ${variant === 'sidebar' ? 'w-full' : ''}`} ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2.5 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
        <Bell size={22} />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-rose-500 text-[10px] font-bold text-white rounded-full border-2 border-white animate-pulse">
            {noLeidas}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 top-14 bg-white border border-neutral-200 rounded-3xl shadow-2xl w-80 sm:w-96 overflow-hidden">
          
          <div className="flex items-center justify-between p-4 border-b bg-neutral-50">
            <h3 className="font-bold text-sm">Notificaciones</h3>
            <div className="flex gap-2">
              <button onClick={() => marcarTodasComoLeidas().then(fetchNotificaciones)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Leídas</button>
              <button onClick={() => limpiarTodasLasNotificaciones().then(() => setNotificaciones([]))} className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">Limpiar</button>
            </div>
          </div>

          {/* BANNER DE PERMISOS */}
          {permisoPush === 'default' && (
            <div className="bg-orange-50 border-b border-orange-100 p-3 flex items-center justify-between">
              <p className="text-[11px] text-orange-800 leading-tight">
                Activa las alertas para que tu dispositivo vibre y muestre notificaciones.
              </p>
              <button onClick={solicitarPermisoDispositivo} className="shrink-0 ml-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-sm hover:bg-orange-600 flex items-center gap-1 transition-transform active:scale-95">
                <BellRing size={12}/> Activar
              </button>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-10 text-center text-neutral-400 text-sm italic">Bandeja vacía</div>
            ) : (
              notificaciones.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => handleClicNotificacion(notif)}
                  className={`relative p-4 border-b transition-colors cursor-pointer group hover:bg-neutral-50 ${!notif.leida ? 'bg-orange-50/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 shrink-0">{getIcon(notif.tipo)}</div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className={`text-xs font-bold ${notif.tipo === 'alerta_sancion' ? 'text-rose-600' : ''}`}>{notif.titulo}</p>
                      <p className="text-[12px] text-neutral-600 line-clamp-2 leading-snug">{notif.mensaje}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); eliminarNotificacion(notif.id).then(fetchNotificaciones); }}
                    className="absolute top-4 right-4 p-1 opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-rose-500 transition-all"
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