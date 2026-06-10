import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import CourseNode from './CourseNode'

const nodeTypes = { custom: CourseNode }

const CICLOS = [...Array(10)].map((_, i) => `${i+1}${['er','do','er','to','to','to','mo','vo','no','mo'][i]} Ciclo`).concat(['Electivo'])

export default function Dashboard() {
  const navigate = useNavigate()
  
  // Tablas
  const [catalogo, setCatalogo] = useState([])
  const [sistemas, setSistemas] = useState([])
  const [cursosGlobales, setCursosGlobales] = useState([])
  const [carreras, setCarreras] = useState([])
  const [perfiles, setPerfiles] = useState([])

  // Estados UI
  const [tabActiva, setTabActiva] = useState('malla')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaPreReq, setBusquedaPreReq] = useState('')
  const [busquedaUsuario, setBusquedaUsuario] = useState('')
  const [filtroCicloAdmin, setFiltroCicloAdmin] = useState('Todos')
  const [cargando, setCargando] = useState(true)

  // Selector de Jerarquía (Facultad -> Carrera)
  const [facultadSeleccionada, setFacultadSeleccionada] = useState('')
  const [carreraSeleccionada, setCarreraSeleccionada] = useState('')

  // Efecto para inicializar y auto-seleccionar carrera
  useEffect(() => {
    if (carreras.length > 0) {
       const facs = [...new Set(carreras.map(c => c.facultad || 'FIIS'))]
       const currentFac = facultadSeleccionada || facs[0]
       if (!facultadSeleccionada) setFacultadSeleccionada(currentFac)
       
       const carrerasDeFac = carreras.filter(c => (c.facultad || 'FIIS') === currentFac)
       if (carrerasDeFac.length > 0 && !carrerasDeFac.find(c => c.id === carreraSeleccionada)) {
          setCarreraSeleccionada(carrerasDeFac[0].id)
       }
    }
  }, [carreras, facultadSeleccionada])

  // Modales
  const [mostrarModalMalla, setMostrarModalMalla] = useState(false)
  const [cursoMaestro, setCursoMaestro] = useState(null)

  const [mostrarModalSist, setMostrarModalSist] = useState(false)
  const [sistMaestro, setSistMaestro] = useState(null)

  const [mostrarMapaAdmin, setMostrarMapaAdmin] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const fetchDatosEstructurales = async () => {
    setCargando(true)
    try {
      const [resCat, resSist, resCarreras, resPerfiles] = await Promise.all([
        supabase.from('catalogo_cursos').select('*').order('ciclo_sugerido', { ascending: true }),
        supabase.from('sistemas_evaluacion').select('*'),
        supabase.from('carreras').select('*'),
        supabase.from('perfiles').select('user_id, nombre_completo')
      ])
      if (resCat.error) console.error('[catalogo_cursos] Error Supabase:', resCat.error.message)
      if (resSist.error) console.error('[sistemas_evaluacion] Error Supabase:', resSist.error.message)
      
      if (resCat.data) setCatalogo(resCat.data)
      if (resSist.data) setSistemas(resSist.data)
      if (resCarreras && resCarreras.data) setCarreras(resCarreras.data)
      if (resPerfiles && resPerfiles.data) setPerfiles(resPerfiles.data)
    } catch (error) { console.error(error) }
    finally { setCargando(false) }
  }

  const fetchCursosGlobales = async () => {
    const { data } = await supabase.from('cursos').select('*')
    if (data) setCursosGlobales(data)
  }

  useEffect(() => { 
    fetchDatosEstructurales()
    fetchCursosGlobales()
  }, [])

  // Cuando los sistemas carguen, sincronizar el valor del modal si estaba en fallback
  useEffect(() => {
    if (sistemas.length > 0 && cursoMaestro && !cursoMaestro.id) {
      // Solo aplicar al crear (sin id), para no pisarle el valor a la edición
      const existe = sistemas.find(s => s.id === cursoMaestro.sistema_evaluacion)
      if (!existe) {
        setCursoMaestro(prev => prev ? { ...prev, sistema_evaluacion: sistemas[0].id } : prev)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sistemas])

  // Lógica del Mapa Modo Dios
  useEffect(() => {
    if (!mostrarMapaAdmin || catalogo.length === 0) return

    const newNodes = []
    const newEdges = []
    const ciclosCols = ['1er Ciclo', '2do Ciclo', '3er Ciclo', '4to Ciclo', '5to Ciclo', '6to Ciclo', '7mo Ciclo', '8vo Ciclo', '9no Ciclo', '10mo Ciclo', 'Electivo']
    const colsCount = {}
    
    // Solo graficamos la carrera seleccionada para que no sea un caos
    const catalogoCarrera = catalogo.filter(c => c.carrera_id === carreraSeleccionada)

    catalogoCarrera.forEach(curso => {
      const ciclo = curso.ciclo_sugerido
      colsCount[ciclo] = (colsCount[ciclo] || 0) + 1
      
      const preString = curso.pre_requisitos || 'NINGUNO'
      if (preString !== 'NINGUNO' && preString.trim() !== '') {
        const reqs = preString.split(',').map(r => r.trim())
        for (const req of reqs) {
          const reqCurso = catalogoCarrera.find(c => c.nombre === req)
          if (reqCurso) {
            newEdges.push({
              id: `e-${reqCurso.id}-${curso.id}`,
              source: reqCurso.id,
              target: curso.id,
              animated: true,
              style: { stroke: '#a855f7', strokeWidth: 2.5 },
              markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#a855f7' },
            })
          }
        }
      }

      newNodes.push({
        id: curso.id,
        type: 'custom',
        data: { curso, isAprobado: false, isReprobado: false, enCursoActual: false, isDesbloqueado: true },
        position: { x: 0, y: 0 }
      })
    })

    let maxRows = 0
    Object.values(colsCount).forEach(c => { if (c > maxRows) maxRows = c })
    const Y_SPACING = 300, X_SPACING = 650, GLOBAL_HEIGHT = maxRows * Y_SPACING
    const cycleCounters = {}

    newNodes.forEach(node => {
      const ciclo = node.data.curso.ciclo_sugerido
      let colIndex = ciclosCols.indexOf(ciclo)
      if (colIndex === -1) colIndex = 11

      if (cycleCounters[ciclo] === undefined) cycleCounters[ciclo] = 0
      const rowIndex = cycleCounters[ciclo]
      cycleCounters[ciclo]++

      const colHeight = (colsCount[ciclo] || 1) * Y_SPACING
      const yOffset = (GLOBAL_HEIGHT - colHeight) / 2
      node.position = { x: colIndex * X_SPACING, y: yOffset + (rowIndex * Y_SPACING) }
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [mostrarMapaAdmin, catalogo])

  // ---- LÓGICA MALLA CURRICULAR ----
  const abrirModalMalla = (curso = null) => {
    const primerSistema = sistemas.length > 0 ? sistemas[0].id : ''
    const primeraCarrera = carreraSeleccionada || (carreras.length > 0 ? carreras[0].id : null)
    if (curso) {
      setCursoMaestro({ ...curso })
    } else {
      setCursoMaestro({ nombre: '', creditos: 1, ciclo_sugerido: '1er Ciclo', sistema_evaluacion: primerSistema, pre_requisitos: 'NINGUNO', carrera_id: primeraCarrera })
    }
    setMostrarModalMalla(true)
  }

  const guardarEnCatalogo = async (e) => {
    e.preventDefault()
    if (cursoMaestro.id) {
      const oldCourse = catalogo.find(c => c.id === cursoMaestro.id)

      await supabase.from('catalogo_cursos').update({
        nombre: cursoMaestro.nombre, creditos: cursoMaestro.creditos, ciclo_sugerido: cursoMaestro.ciclo_sugerido, sistema_evaluacion: cursoMaestro.sistema_evaluacion, pre_requisitos: cursoMaestro.pre_requisitos, carrera_id: cursoMaestro.carrera_id
      }).eq('id', cursoMaestro.id)

      // Cascada manual a las matrículas de los alumnos usando el nombre antiguo
      if (oldCourse) {
        await supabase.from('cursos').update({
          nombre: cursoMaestro.nombre,
          creditos: cursoMaestro.creditos,
          sistema_evaluacion: cursoMaestro.sistema_evaluacion
        }).eq('nombre', oldCourse.nombre)
      }
    } else {
      await supabase.from('catalogo_cursos').insert([cursoMaestro])
    }
    setMostrarModalMalla(false)
    fetchDatosEstructurales()
  }

  const eliminarCurso = async (id) => {
    if(confirm("¿Seguro que deseas eliminar este curso del catálogo maestro?")) {
      await supabase.from('catalogo_cursos').delete().eq('id', id)
      fetchDatosEstructurales()
    }
  }

  // ---- LÓGICA SISTEMAS EVALUACIÓN ----
  const abrirModalSist = (sys = null) => {
    if (sys) {
      setSistMaestro({ ...sys, isEdit: true })
    } else {
      setSistMaestro({ id: '', nombre: '', formula: '', facultad: facultadSeleccionada, isEdit: false })
    }
    setMostrarModalSist(true)
  }

  const guardarSistema = async (e) => {
    e.preventDefault()
    const payload = { 
      id: sistMaestro.id, nombre: sistMaestro.nombre, 
      formula: sistMaestro.formula, usa_practicas: sistMaestro.usa_practicas 
    }
    
    let result = null
    if (sistMaestro.isEdit) {
      result = await supabase.from('sistemas_evaluacion').update(payload).eq('id', sistMaestro.id)
    } else {
      result = await supabase.from('sistemas_evaluacion').insert([payload])
    }
    
    if (result && result.error) {
      alert("Error al guardar el sistema: " + result.error.message)
      console.error("[sistemas_evaluacion] Error Supabase:", result.error)
      return
    }

    setMostrarModalSist(false)
    fetchDatosEstructurales()
  }

  const eliminarSistema = async (id) => {
    if(confirm(`¿Seguro que deseas eliminar el sistema ${id}? Los cursos vinculados podrían romperse.`)) {
      await supabase.from('sistemas_evaluacion').delete().eq('id', id)
      fetchDatosEstructurales()
    }
  }


  const catalogoFiltrado = catalogo.filter(c => {
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchCiclo = filtroCicloAdmin === 'Todos' || c.ciclo_sugerido === filtroCicloAdmin
    const matchCarrera = c.carrera_id === carreraSeleccionada
    return matchBusqueda && matchCiclo && matchCarrera
  })

  const tabs = [
    { id: 'malla', label: 'Malla curricular', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg> },
    { id: 'sistemas', label: 'Sistemas Eval.', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 20V10M18 20V4M6 20v-4"/></svg> },
    { id: 'usuarios', label: 'Usuarios', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'reportes', label: 'Reportes', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  ]

  // Stats Globales
  const usuariosAgrupados = Object.values(cursosGlobales.reduce((acc, c) => {
    if (!acc[c.user_id]) acc[c.user_id] = { id: c.user_id, cursos: 0, sumNotas: 0, conNota: 0 }
    acc[c.user_id].cursos += 1
    if (c.promedio !== null && c.promedio !== undefined) {
      acc[c.user_id].sumNotas += parseFloat(c.promedio)
      acc[c.user_id].conNota += 1
    }
    return acc
  }, {})).map(u => {
    const perfil = perfiles.find(p => p.user_id === u.id)
    return { 
      ...u, 
      nombre: perfil?.nombre_completo || `Estudiante ${u.id.substring(0, 4).toUpperCase()}`
    }
  })

  const usuariosFiltrados = usuariosAgrupados.filter(u => 
    u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) || 
    u.id.toLowerCase().includes(busquedaUsuario.toLowerCase())
  )

  let globalSum = 0; let globalCount = 0; let aprobadosCount = 0;
  cursosGlobales.forEach(c => {
    if (c.promedio !== null && c.promedio !== undefined) {
      globalSum += parseFloat(c.promedio)
      globalCount++
      if (parseFloat(c.promedio) >= 10) aprobadosCount++
    }
  })
  
  const promedioGeneralInstitucion = globalCount > 0 ? (globalSum / globalCount).toFixed(1) : '--'
  const tasaAprobacion = globalCount > 0 ? ((aprobadosCount / globalCount) * 100).toFixed(0) : '--'

  // Reportes Cálculos
  const cursosStats = Object.values(cursosGlobales.reduce((acc, c) => {
    if (!acc[c.curso_catalogo_id]) {
      const catInfo = catalogo.find(cat => cat.id === c.curso_catalogo_id)
      acc[c.curso_catalogo_id] = { id: c.curso_catalogo_id, nombre: catInfo?.nombre || 'Desconocido', carrera_id: catInfo?.carrera_id, sum: 0, count: 0, reprobados: 0 }
    }
    if (c.promedio !== null && c.promedio !== undefined) {
      const prom = parseFloat(c.promedio)
      acc[c.curso_catalogo_id].sum += prom
      acc[c.curso_catalogo_id].count += 1
      if (prom < 10) acc[c.curso_catalogo_id].reprobados += 1
    }
    return acc
  }, {})).filter(c => c.count > 0).map(c => ({
    ...c, 
    promedio: (c.sum / c.count),
    tasaReprobacion: (c.reprobados / c.count) * 100
  }))

  const cursosMasDificiles = [...cursosStats].sort((a, b) => a.promedio - b.promedio).slice(0, 5)
  const topEstudiantes = [...usuariosAgrupados].filter(u => u.conNota > 0).map(u => ({...u, promedio: u.sumNotas / u.conNota})).sort((a, b) => b.promedio - a.promedio).slice(0, 5)

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{backgroundImage:'linear-gradient(rgba(34,211,238,1) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,1) 1px,transparent 1px)', backgroundSize:'60px 60px'}}></div>
      
      <nav className="relative z-10 border-b border-white/[0.06] bg-[#080c14]/80 backdrop-blur-xl px-6 py-4 sticky top-0">
        <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.15)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10 5 10-5"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12l10 5 10-5"/></svg>
              </div>
              <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">Promedium</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
              <span className="text-[9px] text-amber-400/80 font-bold tracking-[0.2em] uppercase">Admin</span>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] text-slate-500 hover:text-white hover:border-white/10 transition-all text-[10px] font-bold tracking-widest uppercase">
            Salir
          </button>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-[pulse_2s_ease-in-out_infinite]"></div>
            <p className="text-[10px] text-amber-400 font-bold tracking-[0.3em] uppercase">Control Total</p>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-500 leading-none mb-8">PANEL DE CONTROL</h2>

          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id} onClick={() => setTabActiva(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                  tabActiva === tab.id
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    : 'bg-white/[0.02] border border-white/[0.05] text-slate-500 hover:text-slate-300 hover:border-white/10'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {tabActiva === 'malla' && (
          <div className="animate-in fade-in duration-300">
            {/* HERRAMIENTAS MALLA */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl mb-8 gap-4">
              
              {/* SELECTORES DE JERARQUÍA (FACULTAD -> CARRERA) */}
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <select 
                   value={facultadSeleccionada}
                   onChange={e => setFacultadSeleccionada(e.target.value)}
                   className="bg-[#080c14] border border-white/10 text-amber-400 font-bold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl outline-none"
                >
                   {[...new Set(carreras.map(c => c.facultad || 'FIIS'))].map(f => (
                     <option key={f} value={f}>{f}</option>
                   ))}
                </select>

                <select 
                   value={carreraSeleccionada}
                   onChange={e => setCarreraSeleccionada(e.target.value)}
                   className="bg-[#080c14] border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl outline-none flex-1 lg:flex-none"
                >
                   {carreras.filter(c => (c.facultad || 'FIIS') === facultadSeleccionada).map(c => (
                     <option key={c.id} value={c.id}>{c.nombre}</option>
                   ))}
                </select>
              </div>

              {/* BARRA DE BÚSQUEDA Y BOTONES */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
                <select
                  value={filtroCicloAdmin} onChange={(e) => setFiltroCicloAdmin(e.target.value)}
                  className="bg-[#080c14] border border-white/[0.08] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 outline-none focus:border-cyan-500/30 cursor-pointer w-full sm:w-auto"
                >
                  <option value="Todos" className="bg-[#080c14] text-slate-300">Todos los ciclos</option>
                  {CICLOS.map(c => <option key={c} value={c} className="bg-[#080c14] text-slate-300">{c}</option>)}
                </select>
                <input
                  type="text" placeholder="Buscar materia..."
                  className="bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 rounded-xl text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-cyan-500/30 w-full sm:w-56"
                  value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                />
                <button
                  onClick={() => setMostrarMapaAdmin(true)}
                  className="w-full sm:w-auto bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 px-5 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                  Modo Dios
                </button>
                <button
                  onClick={() => abrirModalMalla()}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
                >
                  Nuevo registro
                </button>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] w-36 whitespace-nowrap">Ciclo</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] w-auto">Materia</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] w-24">Sistema</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] w-24 text-center">Créditos</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] w-48 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {cargando ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 text-sm">Cargando malla...</td></tr>
                  ) : (
                    catalogoFiltrado.map(item => (
                      <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-bold text-amber-400/60 tracking-widest px-2.5 py-1 rounded-lg bg-amber-500/5 border border-amber-500/10 uppercase">{item.ciclo_sugerido}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-200 text-sm uppercase tracking-tight">{item.nombre}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">{item.sistema_evaluacion || 'Libre'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-black text-white">{item.creditos}</span> <span className="text-[9px] text-slate-600">cr</span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => abrirModalMalla(item)} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">Editar</button>
                          <button onClick={() => eliminarCurso(item.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-[9px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">Eliminar</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tabActiva === 'sistemas' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl mb-8 gap-4">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <select 
                   value={facultadSeleccionada}
                   onChange={e => setFacultadSeleccionada(e.target.value)}
                   className="bg-[#080c14] border border-white/10 text-amber-400 font-bold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl outline-none"
                >
                   {[...new Set([...carreras.map(c => c.facultad || 'FIIS'), ...sistemas.map(s => s.facultad || 'FIIS')])].map(f => (
                     <option key={f} value={f}>{f}</option>
                   ))}
                </select>
              </div>
              <button
                onClick={() => abrirModalSist()}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white px-5 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
              >
                Nuevo Sistema
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sistemas.filter(s => (s.facultad || 'FIIS') === facultadSeleccionada).map(sys => (
                <div key={sys.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/30 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">{sys.id}</span>
                    <div className="flex gap-2">
                      <button onClick={() => abrirModalSist(sys)} title="Editar Sistema" className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-400/30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      <button onClick={() => eliminarSistema(sys.id)} title="Eliminar Sistema" className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{sys.nombre}</h4>
                  <p className="text-xs font-mono text-amber-400 bg-black/30 p-2 rounded border border-white/5 mb-3">{sys.formula}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    Activo en {facultadSeleccionada}
                  </p>
                </div>
              ))}
              {sistemas.filter(s => (s.facultad || 'FIIS') === facultadSeleccionada).length === 0 && (
                 <div className="col-span-full py-10 text-center text-slate-500 text-sm">No hay sistemas creados para esta facultad.</div>
              )}
            </div>
          </div>
        )}

        {tabActiva === 'usuarios' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl">
              <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] px-4">Directorio ({usuariosFiltrados.length})</h3>
              <input
                type="text" placeholder="Buscar por nombre o ID..."
                className="bg-[#080c14] border border-white/[0.08] px-4 py-3 rounded-xl text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-cyan-500/30 w-full sm:w-80"
                value={busquedaUsuario} onChange={(e) => setBusquedaUsuario(e.target.value)}
              />
            </div>
            
            {usuariosFiltrados.length === 0 && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-10 text-center max-w-2xl mx-auto mt-10">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-5 border border-cyan-500/20">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h4 className="text-xl font-black text-white mb-3">No hay coincidencias</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Si creaste un usuario recientemente, recuerda que debe matricular al menos un curso para que el sistema empiece a trackear su rendimiento y aparezca en el directorio activo.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {usuariosFiltrados.map((user, i) => {
                const prom = user.conNota > 0 ? (user.sumNotas / user.conNota).toFixed(1) : '--'
                const colorVariations = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-500']
                const bgGradient = colorVariations[i % colorVariations.length]
                const iniciales = user.nombre.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
                
                return (
                  <div key={user.id} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-white/20 transition-colors flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${bgGradient} p-1 mb-4 shadow-lg`}>
                      <div className="w-full h-full bg-[#080c14] rounded-full flex items-center justify-center">
                        <span className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-br ${bgGradient}`}>
                          {iniciales}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-black text-white mb-1 uppercase tracking-tight w-full truncate">{user.nombre}</h4>
                    <p className="text-[9px] font-mono text-slate-500 truncate w-full mb-5">{user.id}</p>
                    
                    <div className="w-full flex gap-3">
                      <div className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Cursos</p>
                        <p className="text-xl font-black text-white">{user.cursos}</p>
                      </div>
                      <div className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Promedio</p>
                        <p className={`text-xl font-black ${prom >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>{prom}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tabActiva === 'reportes' && (
          <div className="animate-in fade-in duration-300">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              {/* CUADRO DE HONOR */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                  Cuadro de Honor (Top 5)
                </h3>
                
                <div className="space-y-3">
                  {topEstudiantes.length === 0 ? <p className="text-sm text-slate-500">No hay datos de calificaciones aún.</p> :
                   topEstudiantes.map((est, idx) => (
                    <div key={est.id} className="flex justify-between items-center bg-[#080c14] border border-white/[0.05] p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-500 text-[#080c14]' : idx === 1 ? 'bg-slate-300 text-[#080c14]' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-400'}`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-tight">{est.nombre}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">{est.cursos} cursos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-amber-400">{est.promedio.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CURSOS CUELLO DE BOTELLA */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Cursos Críticos (Más Bajos)
                </h3>
                
                <div className="space-y-3">
                  {cursosMasDificiles.length === 0 ? <p className="text-sm text-slate-500">No hay datos de calificaciones aún.</p> :
                   cursosMasDificiles.map((curso, idx) => (
                    <div key={curso.id} className="flex justify-between items-center bg-[#080c14] border border-white/[0.05] p-4 rounded-xl">
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[200px] sm:max-w-[250px]">{curso.nombre}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Tasa Reprobación: <span className="text-red-400 font-bold">{curso.tasaReprobacion.toFixed(0)}%</span></p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-red-400">{curso.promedio.toFixed(2)}</span>
                        <p className="text-[9px] text-slate-600">promedio</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* MÉTRICAS GLOBALES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-cyan-900/40 to-[#080c14] border border-cyan-500/20 rounded-2xl px-8 py-6">
                <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest mb-2">Promedio General Institución</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-black text-white">{promedioGeneralInstitucion}</p>
                  <p className="text-xs text-slate-400 mb-2 font-mono">/ 20.0</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-900/40 to-[#080c14] border border-emerald-500/20 rounded-2xl px-8 py-6">
                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mb-2">Tasa Global de Aprobación</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-black text-white">{tasaAprobacion}%</p>
                  <p className="text-xs text-slate-400 mb-2 font-mono">notas &gt;= 10.0</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL MALLA */}
      {mostrarModalMalla && cursoMaestro && (
        <div className="fixed inset-0 bg-[#080c14]/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1220] border border-white/[0.08] rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-6">{cursoMaestro.id ? 'Editar Materia' : 'Nueva Materia'}</h3>
            <form onSubmit={guardarEnCatalogo} className="space-y-4">
              <div>
                <label className="block text-[9px] text-slate-500 font-bold uppercase mb-2">Nombre</label>
                <input required className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none" value={cursoMaestro.nombre} onChange={e => setCursoMaestro({...cursoMaestro, nombre: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold uppercase mb-2">Créditos</label>
                  <input type="number" min="1" max="10" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none" value={cursoMaestro.creditos} onChange={e => setCursoMaestro({...cursoMaestro, creditos: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 font-bold uppercase mb-2">Ciclo</label>
                  <select className="w-full px-4 py-3 bg-[#0d1220] border border-white/[0.08] rounded-xl text-white outline-none cursor-pointer" value={cursoMaestro.ciclo_sugerido} onChange={e => setCursoMaestro({...cursoMaestro, ciclo_sugerido: e.target.value})}>
                    {CICLOS.map(c => <option key={c} value={c} style={{background:'#0d1220'}}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[9px] text-slate-500 font-bold uppercase">Pre-requisitos</label>
                    <input type="text" placeholder="Buscar curso..." className="bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-lg text-[10px] text-white outline-none w-1/2" value={busquedaPreReq} onChange={(e) => setBusquedaPreReq(e.target.value)} />
                  </div>
                  <div className="w-full max-h-40 overflow-y-auto custom-scrollbar bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 flex flex-wrap gap-2">
                    {catalogo.filter(c => c.id !== cursoMaestro.id && c.nombre.toLowerCase().includes(busquedaPreReq.toLowerCase())).map(c => {
                      const isSelected = (cursoMaestro.pre_requisitos || '').split(',').map(s => s.trim()).includes(c.nombre);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            let current = (cursoMaestro.pre_requisitos || '').split(',').map(s => s.trim()).filter(s => s !== '' && s !== 'NINGUNO');
                            if (isSelected) {
                              current = current.filter(n => n !== c.nombre);
                            } else {
                              current.push(c.nombre);
                            }
                            const newValue = current.length > 0 ? current.join(', ') : 'NINGUNO';
                            setCursoMaestro({...cursoMaestro, pre_requisitos: newValue});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isSelected ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
                        >
                          {c.nombre}
                        </button>
                      );
                    })}
                    {catalogo.filter(c => c.id !== cursoMaestro.id && c.nombre.toLowerCase().includes(busquedaPreReq.toLowerCase())).length === 0 && <span className="text-[10px] text-slate-500">No se encontraron cursos.</span>}
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[9px] text-slate-500 font-bold uppercase mb-2">Sistema de Evaluación</label>
                  <select className="w-full px-4 py-3 bg-[#0d1220] border border-white/[0.08] rounded-xl text-white outline-none cursor-pointer" value={cursoMaestro.sistema_evaluacion} onChange={e => setCursoMaestro({...cursoMaestro, sistema_evaluacion: e.target.value})}>
                    {sistemas.map(sys => <option key={sys.id} value={sys.id} style={{background:'#0d1220'}}>{sys.nombre}</option>)}
                    {sistemas.length === 0 && <option value="" style={{background:'#0d1220'}}>Sin sistemas — crea uno primero</option>}
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[9px] text-slate-500 font-bold uppercase mb-2">Carrera Perteneciente</label>
                  <select className="w-full px-4 py-3 bg-[#0d1220] border border-white/[0.08] rounded-xl text-white outline-none cursor-pointer" value={cursoMaestro.carrera_id || ''} onChange={e => setCursoMaestro({...cursoMaestro, carrera_id: e.target.value})}>
                    {carreras.map(c => <option key={c.id} value={c.id} style={{background:'#0d1220'}}>{c.nombre}</option>)}
                    {carreras.length === 0 && <option value="" style={{background:'#0d1220'}}>Sin carreras - Corre la migración SQL</option>}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setMostrarModalMalla(false)} className="flex-1 py-3 rounded-xl border border-white/[0.06] text-slate-500 hover:text-white text-[10px] font-black uppercase">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-[10px] uppercase">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SISTEMAS */}
      {mostrarModalSist && sistMaestro && (
        <div className="fixed inset-0 bg-[#080c14]/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1220] border border-cyan-500/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-6 text-cyan-400">{sistMaestro.isEdit ? 'Editar Sistema' : 'Nuevo Sistema'}</h3>
            <form onSubmit={guardarSistema} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[9px] text-slate-500 font-bold uppercase mb-2">Código (ID)</label>
                  <input required disabled={sistMaestro.isEdit} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none disabled:opacity-50" placeholder="Ej. J" value={sistMaestro.id} onChange={e => setSistMaestro({...sistMaestro, id: e.target.value})} />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[9px] text-slate-500 font-bold uppercase mb-2">Nombre</label>
                  <input required className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none" placeholder="Ej. Sistema J" value={sistMaestro.nombre} onChange={e => setSistMaestro({...sistMaestro, nombre: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-slate-500 font-bold uppercase mb-2">Fórmula Matemática</label>
                <input required className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] font-mono text-amber-400 rounded-xl outline-none focus:border-cyan-500/50" placeholder="(EP + 2*EF + PP_PC) / 4" value={sistMaestro.formula} onChange={e => setSistMaestro({...sistMaestro, formula: e.target.value})} />
                <p className="text-[9px] text-slate-500 mt-2">
                  Variables mágicas: <strong>SUM_PC3</strong> (suma 3 PCs), <strong>PP_PC</strong> (promedia 3 PCs), <strong>PP_LAB</strong> (promedia 6 Labs), <strong>PP_MIXTO</strong> (promedia 3 PCs y 6 Labs entre 9), <strong>MON1, MON2</strong> (Monografías), <strong>EP, EF, PF</strong>.
                </p>
              </div>
              <div className="flex gap-3 pt-5">
                <button type="button" onClick={() => setMostrarModalSist(false)} className="flex-1 py-3 rounded-xl border border-white/[0.06] text-slate-500 hover:text-white text-[10px] font-black uppercase">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-[10px] uppercase">Guardar Sistema</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MAPA CURRICULAR ADMIN (MODO DIOS) */}
      {mostrarMapaAdmin && (
        <div className="fixed inset-0 bg-[#080c14]/98 backdrop-blur-xl flex items-center justify-center z-[70] p-4 lg:p-8">
          <div className="w-full h-full max-w-[1800px] flex flex-col relative overflow-hidden border border-purple-500/20 rounded-3xl bg-[#0d1220] shadow-[0_0_80px_rgba(168,85,247,0.1)]">
            
            <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 border-b border-white/[0.05] relative z-10 bg-[#080c14]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"/>
                <h3 className="text-sm md:text-base font-black tracking-[0.25em] uppercase text-purple-400">Previsualización de Malla (Modo Dios)</h3>
              </div>
              <button onClick={() => setMostrarMapaAdmin(false)} className="text-slate-600 hover:text-white transition-colors text-3xl leading-none px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10">×</button>
            </div>

            <div className="flex-1 w-full h-full relative" style={{ background: '#080c14' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                colorMode="dark"
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#1e293b" gap={20} size={1} />
                <Controls className="bg-[#0d1220] border-white/10 fill-white" />
                <MiniMap nodeColor="#a855f7" maskColor="rgba(8,12,20, 0.8)" className="bg-[#0d1220]" />
              </ReactFlow>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}