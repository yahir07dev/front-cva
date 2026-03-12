'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { 
  X, Video, FileText, Users, Plus, Trash2, 
  CheckCircle2, AlertCircle, Save, ChevronRight, Search 
} from 'lucide-react'

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cursoData: any, empleadosIds: number[]) => Promise<void>;
  onEdit?: (cursoId: number, cursoData: any, empleadosIds: number[]) => Promise<void>;
  cursoAEditar?: any | null;
}

export default function ModalCrearCurso({ isOpen, onClose, onSubmit, onEdit, cursoAEditar }: ModalProps) {
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<'info' | 'examen' | 'asignacion'>('info')
  const [loading, setLoading] = useState(false)
  
  // Empleados traídos de la BD
  const [empleados, setEmpleados] = useState<any[]>([])
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('')

  // 1. Estado del Curso
  const [curso, setCurso] = useState({
    titulo: '',
    descripcion: '',
    url_youtube: '',
    duracion_minutos: 30,
    es_obligatorio: false,
    esta_activo: true
  })

  // 2. Estado de Preguntas
  const [preguntas, setPreguntas] = useState<any[]>([])

  // 3. Estado de Asignaciones
  const [asignados, setAsignados] = useState<number[]>([])

  // Inicializar datos cuando se abre el modal (Crear vs Editar)
  useEffect(() => {
    if (!isOpen) return;

    // Cargar la lista de empleados para asignar
    const fetchEmpleados = async () => {
      const { data } = await supabase
        .from('empleados')
        .select('id, nombre, apellidos, foto_perfil_url, roles(nombre)')
        .eq('estado', 'activo')
        .is('deleted_at', null)
        .order('nombre', { ascending: true })
      
      if (data) setEmpleados(data)
    }
    fetchEmpleados();
    setActiveTab('info');
    setBusquedaEmpleado('');

    // Si viene un curso a editar, precargamos la info
    if (cursoAEditar) {
      setCurso({
        titulo: cursoAEditar.titulo || '',
        descripcion: cursoAEditar.descripcion || '',
        url_youtube: cursoAEditar.url_youtube || '',
        duracion_minutos: cursoAEditar.duracion_minutos || 30,
        es_obligatorio: cursoAEditar.es_obligatorio || false,
        esta_activo: cursoAEditar.esta_activo ?? true
      });

      // Mapear preguntas asegurando que tengan un tempId para iterar en React
      if (cursoAEditar.preguntas) {
        const pregsMapped = cursoAEditar.preguntas.map((p: any) => ({
          ...p,
          tempId: p.id || Math.random(),
          opciones: p.opciones_pregunta?.map((o: any) => ({
            ...o,
            tempId: o.id || Math.random()
          })) || []
        }));
        setPreguntas(pregsMapped);
      }

      // Mapear los IDs de los empleados ya asignados
      if (cursoAEditar.asignacion_cursos) {
        const empIds = cursoAEditar.asignacion_cursos
          .filter((a: any) => a.estado !== 'completado') // Podemos decidir si mantener los completados o no
          .map((a: any) => a.empleado_id);
        setAsignados(empIds);
      }

    } else {
      // Limpiar formulario para nuevo curso
      setCurso({ titulo: '', descripcion: '', url_youtube: '', duracion_minutos: 30, es_obligatorio: false, esta_activo: true });
      setPreguntas([{ 
        tempId: Date.now(), texto_pregunta: '', puntaje: 10, 
        opciones: [
          { tempId: Date.now() + 1, texto_opcion: '', es_correcta: true },
          { tempId: Date.now() + 2, texto_opcion: '', es_correcta: false }
        ] 
      }]);
      setAsignados([]);
    }
  }, [isOpen, cursoAEditar, supabase]);

  // Filtrado de empleados para la búsqueda
  const empleadosFiltrados = useMemo(() => {
    if (!busquedaEmpleado) return empleados;
    return empleados.filter(emp => 
      `${emp.nombre} ${emp.apellidos} ${emp.roles?.nombre}`.toLowerCase().includes(busquedaEmpleado.toLowerCase())
    );
  }, [empleados, busquedaEmpleado]);

  if (!isOpen) return null;

  /* ================= HANDLERS PREGUNTAS ================= */
  const handleAddPregunta = () => {
    setPreguntas([...preguntas, { 
      tempId: Date.now(), texto_pregunta: '', puntaje: 10, 
      opciones: [
        { tempId: Date.now() + 1, texto_opcion: '', es_correcta: true },
        { tempId: Date.now() + 2, texto_opcion: '', es_correcta: false }
      ] 
    }])
  }

  const handleRemovePregunta = (id: number) => {
    if (preguntas.length === 1) return alert("El examen debe tener al menos una pregunta.");
    setPreguntas(preguntas.filter(p => p.tempId !== id));
  }

  const handleAddOpcion = (preguntaId: number) => {
    setPreguntas(preguntas.map(p => {
      if (p.tempId === preguntaId) {
        return { ...p, opciones: [...p.opciones, { tempId: Date.now(), texto_opcion: '', es_correcta: false }] }
      }
      return p;
    }))
  }

  const handleRemoveOpcion = (preguntaId: number, opcionId: number) => {
    setPreguntas(preguntas.map(p => {
      if (p.tempId === preguntaId) {
        if (p.opciones.length <= 2) {
          alert("Una pregunta debe tener al menos 2 opciones.");
          return p;
        }
        return { ...p, opciones: p.opciones.filter((o: any) => o.tempId !== opcionId) }
      }
      return p;
    }))
  }

  const handleSetCorrectOpcion = (preguntaId: number, opcionId: number) => {
    setPreguntas(preguntas.map(p => {
      if (p.tempId === preguntaId) {
        return { ...p, opciones: p.opciones.map((o: any) => ({ ...o, es_correcta: o.tempId === opcionId })) }
      }
      return p;
    }))
  }

  const toggleEmpleado = (id: number) => {
    setAsignados(prev => prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id])
  }

  /* ================= GUARDAR ================= */
  const handleGuardar = async () => {
    if (!curso.titulo || !curso.url_youtube) {
      alert("El título y el enlace de YouTube son obligatorios.")
      setActiveTab('info')
      return
    }

    // Validar preguntas incompletas o sin respuesta correcta
    for (const p of preguntas) {
      if (!p.texto_pregunta.trim()) {
        alert("Hay preguntas sin texto. Por favor complétalas.");
        setActiveTab('examen'); return;
      }
      if (p.opciones.some((o: any) => !o.texto_opcion.trim())) {
        alert("Hay opciones de respuesta vacías.");
        setActiveTab('examen'); return;
      }
      if (!p.opciones.some((o: any) => o.es_correcta)) {
        alert(`La pregunta "${p.texto_pregunta}" no tiene una respuesta correcta seleccionada.`);
        setActiveTab('examen'); return;
      }
    }

    setLoading(true)
    try {
      const cursoFinal = { ...curso, preguntas };
      if (cursoAEditar && onEdit) {
        await onEdit(cursoAEditar.id, cursoFinal, asignados);
      } else {
        await onSubmit(cursoFinal, asignados);
      }
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER DEL MODAL */}
        <div className="flex-none flex flex-col md:flex-row items-start md:items-center justify-between p-6 sm:px-8 border-b border-neutral-100 dark:border-neutral-800 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
              <span className="bg-rose-100 dark:bg-rose-500/20 p-2 rounded-xl text-rose-600 dark:text-rose-400">
                <Video size={24} />
              </span>
              {cursoAEditar ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 ml-11">
              {cursoAEditar ? 'Modifica los detalles, examen y asignaciones.' : 'Diseña una experiencia de aprendizaje interactiva.'}
            </p>
          </div>

          {/* TABS */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800/50 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide">
            <button onClick={() => setActiveTab('info')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'info' ? 'bg-white dark:bg-neutral-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>
              <FileText size={18} /> Detalles
            </button>
            <button onClick={() => setActiveTab('examen')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'examen' ? 'bg-white dark:bg-neutral-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>
              <CheckCircle2 size={18} /> Examen
            </button>
            <button onClick={() => setActiveTab('asignacion')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'asignacion' ? 'bg-white dark:bg-neutral-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>
              <Users size={18} /> Asignar
            </button>
          </div>

          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-neutral-100 hover:bg-rose-100 text-neutral-500 hover:text-rose-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-colors hidden md:block">
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-thin scrollbar-thumb-rose-200 dark:scrollbar-thumb-rose-900/50 relative">
          
          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in slide-in-from-right-8 duration-300 pb-10">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Título del Curso <span className="text-rose-500">*</span></label>
                  <input type="text" value={curso.titulo} onChange={e => setCurso({...curso, titulo: e.target.value})} placeholder="Ej. Inducción de la Empresa" className="w-full bg-neutral-50 dark:bg-neutral-950 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-colors" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Descripción</label>
                  <textarea value={curso.descripcion} onChange={e => setCurso({...curso, descripcion: e.target.value})} placeholder="Explica de qué trata este módulo..." rows={3} className="w-full bg-neutral-50 dark:bg-neutral-950 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-colors resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Enlace de YouTube <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Video className="absolute left-4 top-3.5 text-rose-500" size={20} />
                      <input type="url" value={curso.url_youtube} onChange={e => setCurso({...curso, url_youtube: e.target.value})} placeholder="https://youtu.be/..." className="w-full bg-neutral-50 dark:bg-neutral-950 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Duración (Min)</label>
                    <input type="number" value={curso.duracion_minutos} onChange={e => setCurso({...curso, duracion_minutos: parseInt(e.target.value) || 0})} className="w-full bg-neutral-50 dark:bg-neutral-950 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-colors" />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <label className="flex items-center justify-between cursor-pointer bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-800 p-4 rounded-2xl flex-1 border-2 border-neutral-200 dark:border-neutral-800 transition-colors">
                    <span className="font-bold text-neutral-700 dark:text-neutral-300">Curso Obligatorio</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" checked={curso.es_obligatorio} onChange={e => setCurso({...curso, es_obligatorio: e.target.checked})} />
                      <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </div>
                  </label>

                  {cursoAEditar && (
                    <label className="flex items-center justify-between cursor-pointer bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-800 p-4 rounded-2xl flex-1 border-2 border-neutral-200 dark:border-neutral-800 transition-colors">
                      <span className="font-bold text-neutral-700 dark:text-neutral-300">Curso Activo</span>
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={curso.esta_activo} onChange={e => setCurso({...curso, esta_activo: e.target.checked})} />
                        <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXAMEN */}
          {activeTab === 'examen' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in slide-in-from-right-8 duration-300 pb-10">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-2xl flex items-start gap-3 border border-blue-200 dark:border-blue-800/30">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <p className="text-sm font-medium">Diseña el cuestionario final. Los empleados deberán obtener al menos 80% para aprobar. Haz clic en el círculo para marcar la respuesta correcta.</p>
              </div>

              {preguntas.map((pregunta, pIndex) => (
                <div key={pregunta.tempId} className="bg-neutral-50 dark:bg-neutral-900/50 border-2 border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 relative group transition-all hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm">
                  
                  <button onClick={() => handleRemovePregunta(pregunta.tempId)} className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition-colors sm:opacity-0 sm:group-hover:opacity-100" title="Eliminar pregunta">
                    <Trash2 size={18} />
                  </button>

                  <div className="flex items-start sm:items-center gap-3 mb-5 flex-col sm:flex-row">
                    <div className="bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {pIndex + 1}
                    </div>
                    <input type="text" placeholder="Escribe la pregunta..." value={pregunta.texto_pregunta} onChange={e => setPreguntas(preguntas.map(p => p.tempId === pregunta.tempId ? {...p, texto_pregunta: e.target.value} : p))} className="flex-1 w-full bg-transparent border-b-2 border-neutral-300 dark:border-neutral-700 px-2 py-1 text-lg font-bold outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-colors" />
                  </div>

                  <div className="pl-0 sm:pl-11 space-y-3">
                    {pregunta.opciones.map((opcion: any, oIndex: number) => (
                      <div key={opcion.tempId} className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${opcion.es_correcta ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-transparent bg-white dark:bg-neutral-900 hover:border-neutral-200 dark:hover:border-neutral-700'}`}>
                        <button onClick={() => handleSetCorrectOpcion(pregunta.tempId, opcion.tempId)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${opcion.es_correcta ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-neutral-400 text-transparent hover:border-emerald-400'}`}>
                          <CheckCircle2 size={16} />
                        </button>
                        <input type="text" placeholder={`Opción ${oIndex + 1}`} value={opcion.texto_opcion} onChange={e => setPreguntas(preguntas.map(p => p.tempId === pregunta.tempId ? {...p, opciones: p.opciones.map((o: any) => o.tempId === opcion.tempId ? {...o, texto_opcion: e.target.value} : o)} : p))} className="flex-1 bg-transparent outline-none text-neutral-700 dark:text-neutral-300 font-medium" />
                        <button onClick={() => handleRemoveOpcion(pregunta.tempId, opcion.tempId)} className="text-neutral-400 hover:text-rose-500 p-1 shrink-0">
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    
                    <button onClick={() => handleAddOpcion(pregunta.tempId)} className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-600 mt-3 px-2 transition-colors">
                      <Plus size={16} /> Añadir otra opción
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={handleAddPregunta} className="w-full border-2 border-dashed border-rose-300 dark:border-rose-900/50 hover:border-rose-500 dark:hover:border-rose-500 bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-3xl p-6 font-bold flex items-center justify-center gap-2 transition-all hover:shadow-md">
                <Plus size={24} /> Agregar Nueva Pregunta
              </button>
            </div>
          )}

          {/* TAB 3: ASIGNACIÓN */}
          {activeTab === 'asignacion' && (
            <div className="space-y-6 max-w-5xl mx-auto animate-in slide-in-from-right-8 duration-300 pb-10">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 sticky top-0 z-10 py-2">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Participantes</h3>
                  <p className="text-sm text-neutral-500">{asignados.length} seleccionados de {empleados.length}</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-neutral-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar empleado..." 
                      value={busquedaEmpleado}
                      onChange={(e) => setBusquedaEmpleado(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white dark:focus:bg-neutral-950 transition-all"
                    />
                  </div>
                  <button onClick={() => setAsignados(asignados.length === empleados.length ? [] : empleados.map(e => e.id))} className="text-sm font-bold text-rose-600 hover:text-rose-700 whitespace-nowrap bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-xl transition-colors">
                    {asignados.length === empleados.length ? 'Desmarcar todos' : 'Marcar todos'}
                  </button>
                </div>
              </div>

              {empleadosFiltrados.length === 0 ? (
                <div className="text-center py-10 text-neutral-500">No se encontraron empleados.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {empleadosFiltrados.map(emp => {
                    const isSelected = asignados.includes(emp.id)
                    return (
                      <div key={emp.id} onClick={() => toggleEmpleado(emp.id)} className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 shadow-sm' : 'border-neutral-200 dark:border-neutral-800 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md'}`}>
                        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 overflow-hidden border border-neutral-300 dark:border-neutral-600">
                          {emp.foto_perfil_url ? (
                            <img src={emp.foto_perfil_url} alt={emp.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold">{emp.nombre.charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{emp.nombre} {emp.apellidos}</p>
                          <p className="text-xs text-neutral-500 truncate">{emp.roles?.nombre || 'Empleado'}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'border-neutral-300 dark:border-neutral-600 text-transparent'}`}>
                          <CheckCircle2 size={12} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* FOOTER DEL MODAL */}
        <div className="flex-none p-5 sm:p-6 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <button onClick={onClose} className="px-4 sm:px-6 py-3 font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
            Cancelar
          </button>
          
          {activeTab !== 'asignacion' ? (
            <button onClick={() => setActiveTab(activeTab === 'info' ? 'examen' : 'asignacion')} className="flex items-center gap-2 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 text-white px-6 sm:px-8 py-3.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg">
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleGuardar} disabled={loading} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 sm:px-8 py-3.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/30 disabled:opacity-50 disabled:scale-100">
              {loading ? 'Guardando...' : (
                <><Save size={18} /> {cursoAEditar ? 'Guardar Cambios' : 'Publicar Curso'}</>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}