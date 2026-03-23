'use client'

import { useState, useMemo } from 'react'
import { ShieldAlert, Plus, ShieldCheck, Edit2, Trash2, KeyRound, Loader2, Search, X, CheckSquare, Save } from 'lucide-react'
import { useRoles } from '@/src/hooks/useRoles'
import { crearRolAction, actualizarRolAction, eliminarRolAction } from '@/src/actions/roles/rolesActions'

interface RolesClientProps {
  initialRoles: any[]
  initialCatalogo: any[]
}

export default function RolesClient({ initialRoles, initialCatalogo }: RolesClientProps) {
  const { roles, permisosCatalogo, recargar } = useRoles({ initialRoles, initialCatalogo })
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [rolId, setRolId] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [esSistema, setEsSistema] = useState(false)
  const [selectedPerms, setSelectedPerms] = useState<number[]>([])

  const rolesFiltrados = useMemo(() => {
    return roles.filter(r =>
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(search.toLowerCase()))
    )
  }, [roles, search])

  const permisosPorModulo = useMemo(() => {
    const grupos: Record<string, any[]> = {}
    permisosCatalogo.forEach(p => {
      const mod = p.modulo || 'otros'
      if (!grupos[mod]) grupos[mod] = []
      grupos[mod].push(p)
    })
    return grupos
  }, [permisosCatalogo])

  const abrirModalCrear = () => {
    setRolId(null); setNombre(''); setDescripcion(''); setEsSistema(false); setSelectedPerms([]); setModalOpen(true)
  }

  const abrirModalEditar = (rol: any) => {
    setRolId(rol.id); setNombre(rol.nombre); setDescripcion(rol.descripcion || ''); setEsSistema(rol.es_sistema)
    const permsIds = rol.rol_permisos?.map((rp: any) => rp.permisos?.id).filter(Boolean) || []
    setSelectedPerms(permsIds); setModalOpen(true)
  }

  const togglePermiso = (permisoId: number) => {
    setSelectedPerms(prev => prev.includes(permisoId) ? prev.filter(id => id !== permisoId) : [...prev, permisoId])
  }

  // 🚀 CONECTADO DIRECTO A LA SERVER ACTION
  const handleGuardar = async () => {
    if (!nombre.trim()) return alert('El nombre del rol es obligatorio.')
    setIsSaving(true)
    try {
      if (rolId) { await actualizarRolAction(rolId, { nombre, descripcion }, selectedPerms) }
      else { await crearRolAction({ nombre, descripcion }, selectedPerms) }
      await recargar(); setModalOpen(false)
    } catch (error: any) { alert(error.message) }
    finally { setIsSaving(false) }
  }

  const handleEliminar = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este rol?")) {
      try {
         await eliminarRolAction(id);
         await recargar();
      } catch(e: any) {
         alert(e.message);
      }
    }
  }

  // No necesitamos IF LOADING porque todo nace cargado del SSR

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        .roles-root { font-family: 'DM Sans', sans-serif; }
        .roles-root * { box-sizing: border-box; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        .role-card::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: transparent; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; transition: background 0.2s ease; pointer-events: none; }
        .role-card:hover::before { background: linear-gradient(135deg, rgba(99,102,241,0.4) 0%, transparent 60%); }

        .perm-check { appearance: none; width: 16px; height: 16px; min-width: 16px; border-radius: 4px; border: 1.5px solid; cursor: pointer; transition: all 0.15s ease; position: relative; }
        .light .perm-check { border-color: #d4d4d4; background: white; }
        .dark .perm-check { border-color: #3f3f46; background: #18181b; }
        .perm-check:checked { background: #4f46e5 !important; border-color: #4f46e5 !important; }
        .perm-check:checked::after { content: ''; position: absolute; left: 3px; top: 1px; width: 8px; height: 5px; border-left: 2px solid white; border-bottom: 2px solid white; transform: rotate(-45deg); }

        @keyframes modalIn { from { opacity: 0; transform: scale(0.97) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-panel { animation: modalIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .tag-pill { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.04em; }
      `}</style>

      <div className="roles-root relative flex flex-col h-full w-full bg-[#fafafa] dark:bg-[#0a0a0a] overflow-hidden">

        {/* ── HEADER ── */}
        <header className="px-6 pt-8 pb-6 sm:px-10 shrink-0 border-b border-neutral-100 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <ShieldAlert size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-[22px] font-700 text-neutral-900 dark:text-white leading-none tracking-[-0.02em]" style={{fontWeight:700}}>
                  Gestión de Roles
                </h1>
                <p className="text-[13px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-normal">
                  Permisos y niveles de acceso
                </p>
              </div>
            </div>

            <button
              onClick={abrirModalCrear}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-500/20"
            >
              <Plus size={15} strokeWidth={2.5} /> Nuevo
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-5 max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar rol..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-neutral-100 dark:bg-white/[0.05] border border-transparent dark:border-white/[0.06] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-white/[0.08] placeholder-neutral-400 dark:placeholder-neutral-600 text-neutral-800 dark:text-neutral-200 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                <X size={12} />
              </button>
            )}
          </div>
        </header>

        {/* ── GRID ── */}
        <div className="flex-1 overflow-y-auto scrollbar-none p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rolesFiltrados.map(rol => (
              <div
                key={rol.id}
                className="role-card group relative flex flex-col bg-white dark:bg-[#111111] rounded-2xl p-5 border border-neutral-100 dark:border-white/[0.07] transition-all hover:border-indigo-200 dark:hover:border-indigo-500/20 hover:shadow-sm overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      rol.es_sistema ? 'bg-amber-50 dark:bg-amber-400/10 text-amber-500 dark:text-amber-400' : 'bg-indigo-50 dark:bg-indigo-400/10 text-indigo-500 dark:text-indigo-400'
                    }`}>
                      {rol.es_sistema ? <ShieldCheck size={17} /> : <KeyRound size={17} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[15px] text-neutral-900 dark:text-white leading-snug tracking-[-0.01em] truncate">
                        {rol.nombre}
                      </h3>
                      <span className={`tag-pill font-medium uppercase ${
                        rol.es_sistema ? 'text-amber-500 dark:text-amber-400/80' : 'text-indigo-400 dark:text-indigo-500'
                      }`}>
                        {rol.es_sistema ? 'Sistema' : 'Personalizado'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <button onClick={() => abrirModalEditar(rol)} className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                      <Edit2 size={13} />
                    </button>
                    {!rol.es_sistema && (
                      <button onClick={() => handleEliminar(rol.id)} className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[13px] text-neutral-500 dark:text-neutral-500 leading-relaxed mb-4 flex-1 line-clamp-2">
                  {rol.descripcion || 'Sin descripción asignada.'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-white/[0.05]">
                  <span className="tag-pill text-neutral-500 dark:text-neutral-500 font-medium">
                    {rol.rol_permisos?.length || 0} permisos
                  </span>
                  <span className="tag-pill text-neutral-300 dark:text-neutral-700">
                    #{rol.id}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {rolesFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/[0.05] flex items-center justify-center">
                <Search size={16} className="text-neutral-400" />
              </div>
              <p className="text-[13px] text-neutral-400 dark:text-neutral-600">
                Sin resultados para <span className="font-semibold text-neutral-600 dark:text-neutral-400">"{search}"</span>
              </p>
            </div>
          )}
        </div>

        {/* ── MODAL ── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[6px]" onClick={() => !isSaving && setModalOpen(false)} />

            <div className="modal-panel relative w-full max-w-2xl max-h-[88vh] flex flex-col bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-neutral-100 dark:border-white/[0.07] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-white/[0.06] shrink-0">
                <div>
                  <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-white tracking-[-0.01em]">
                    {rolId ? 'Editar rol' : 'Crear nuevo rol'}
                  </h2>
                  {esSistema && <p className="text-[12px] text-amber-500 dark:text-amber-400 mt-0.5">Rol de sistema — nombre protegido</p>}
                </div>
                <button onClick={() => setModalOpen(false)} disabled={isSaving} className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.07] rounded-lg transition-colors disabled:opacity-40">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none p-6 space-y-7">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Nombre del rol</label>
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} disabled={esSistema} placeholder="Ej. Recursos Humanos" className="w-full px-4 py-3 text-[14px] bg-neutral-50 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-all disabled:opacity-50 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Descripción</label>
                    <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Describe las responsabilidades de este rol..." rows={2} className="w-full px-4 py-3 text-[14px] bg-neutral-50 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-all resize-none text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckSquare size={15} className="text-indigo-500" />
                    <span className="text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Permisos asignados</span>
                    {selectedPerms.length > 0 && <span className="ml-auto tag-pill bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">{selectedPerms.length} seleccionados</span>}
                  </div>

                  {permisosCatalogo.length === 0 ? (
                    <div className="p-5 text-center text-[13px] text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-white/[0.03] rounded-xl border border-dashed border-neutral-200 dark:border-white/[0.06]">
                      Cargando permisos...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
                        <div key={modulo} className="rounded-xl border border-neutral-100 dark:border-white/[0.06] overflow-hidden">
                          <div className="px-4 py-2.5 bg-neutral-50 dark:bg-white/[0.03] border-b border-neutral-100 dark:border-white/[0.06]">
                            <span className="tag-pill font-semibold text-neutral-500 dark:text-neutral-400 uppercase">{modulo.replace('-', ' ')}</span>
                          </div>
                          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {permisos.map(p => {
                              const isChecked = selectedPerms.includes(p.id)
                              return (
                                <label key={p.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${isChecked ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-neutral-50 dark:hover:bg-white/[0.03]'}`}>
                                  <input type="checkbox" checked={isChecked} onChange={() => togglePermiso(p.id)} className="perm-check" />
                                  <div className="min-w-0 flex-1"><span className={`text-[13px] font-medium block truncate ${isChecked ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-700 dark:text-neutral-300'}`}>{p.slug}</span></div>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-100 dark:border-white/[0.06] flex items-center justify-between shrink-0 bg-white dark:bg-[#111111]">
                <button onClick={() => setModalOpen(false)} disabled={isSaving} className="text-[13px] font-medium text-neutral-500 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/[0.05] disabled:opacity-40">
                  Cancelar
                </button>
                <button onClick={handleGuardar} disabled={isSaving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : <><Save size={14} /> Guardar rol</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}