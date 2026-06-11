import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import CourseNode from './CourseNode'

const nodeTypes = { custom: CourseNode }

const CICLOS = ['1er Ciclo','2do Ciclo','3er Ciclo','4to Ciclo','5to Ciclo','6to Ciclo','7mo Ciclo','8vo Ciclo','9no Ciclo','10mo Ciclo', 'Electivo']
const PERIODOS = ['2024-1', '2024-2', '2025-1', '2025-2', '2026-1', '2026-2', '2027-1']

// ---- UTILIDADES GLOBALES (Fuera del componente para evitar crashes de React) ----
function notaColor(nota) {
  if (nota === null || nota === undefined || isNaN(nota) || nota === '--') return { text: 'text-slate-500', bar: 'from-slate-700 to-slate-600', hex: '#64748b' }
  const n = parseFloat(nota)
  if (n >= 14) return { text: 'text-emerald-400', bar: 'from-emerald-600 to-cyan-500', hex: '#10b981' }
  if (n >= 10) return { text: 'text-amber-400', bar: 'from-amber-600 to-yellow-500', hex: '#f59e0b' }
  return { text: 'text-red-400', bar: 'from-red-700 to-red-500', hex: '#ef4444' }
}

const parsearCamposRequeridos = (sys) => {
  if (!sys) return []
  const form = sys.formula.toUpperCase()
  const campos = []
  if (sys.usa_practicas || form.includes('SUM_PC3') || form.includes('SUM_PC5') || form.includes('PP_PC') || form.includes('PP_PC6') || form.includes('PP_MIXTO') || /\bPP\b/.test(form)) {
    let pcCount = 4;
    if (form.includes('PP_MIXTO_5X5')) pcCount = 5;
    else if (form.includes('SUM_PC5') || form.includes('PP_PC6')) pcCount = 6;
    for(let i=1; i<=pcCount; i++) campos.push({ id: `PC${i}`, label: `Práctica ${i}` })
  } else {
    for(let i=1; i<=6; i++) {
      if (form.includes(`PC${i}`)) campos.push({ id: `PC${i}`, label: `Práctica ${i}` })
    }
  }
  if (form.includes('MON1')) campos.push({ id: 'MON1', label: 'Monografía 1' })
  if (form.includes('MON2')) campos.push({ id: 'MON2', label: 'Monografía 2' })
  if (form.includes('LAB1') || form.includes('PP_LAB') || form.includes('PP_MIXTO')) {
    const labCount = form.includes('PP_MIXTO_5X5') ? 5 : 8;
    for(let i=1; i<=labCount; i++) campos.push({ id: `LAB${i}`, label: `Laboratorio ${i}` })
  }
  if (form.includes('EP')) campos.push({ id: 'EP', label: 'Examen Parcial' })
  if (form.includes('EF')) campos.push({ id: 'EF', label: 'Examen Final' })
  if (form.includes('EP') && form.includes('EF')) campos.push({ id: 'ES', label: 'Sustitutorio' })
  if (form.includes('PF')) campos.push({ id: 'PF', label: 'Promedio Final' })
  return campos
}

const evaluarSistema = (sys, notas) => {
  if (!sys) return null
  try {
    let formula = sys.formula.toUpperCase()
    
    // PC logic (SUM_PC3, PP_PC, PP legacy, SUM_PC5, PP_PC6)
    let sum3 = 0
    let sum5 = 0
    const is5x5 = formula.includes('PP_MIXTO_5X5')
    const is6pc = formula.includes('SUM_PC5') || formula.includes('PP_PC6')
    if (sys.usa_practicas || formula.includes('SUM_PC3') || formula.includes('SUM_PC5') || formula.includes('PP_PC') || formula.includes('PP_PC6') || formula.includes('PP_MIXTO') || /\bPP\b/.test(formula)) {
      if (is6pc) {
        const pcs = [1,2,3,4,5,6].map(i => parseFloat(notas[`PC${i}`]) || 0).sort((a,b) => b - a)
        sum5 = pcs[0] + pcs[1] + pcs[2] + pcs[3] + pcs[4]
      } else if (is5x5) {
        const pcs = [1,2,3,4,5].map(i => parseFloat(notas[`PC${i}`]) || 0).sort((a,b) => b - a)
        sum3 = pcs[0] + pcs[1] + pcs[2] + pcs[3]
      } else {
        const pcs = [1,2,3,4].map(i => parseFloat(notas[`PC${i}`]) || 0).sort((a,b) => b - a)
        sum3 = pcs[0] + pcs[1] + pcs[2]
      }
    }

    // LAB logic (PP_LAB)
    let sum6 = 0
    if (formula.includes('PP_LAB') || formula.includes('LAB1') || formula.includes('PP_MIXTO')) {
      if (is5x5) {
        const labs = [1,2,3,4,5].map(i => parseFloat(notas[`LAB${i}`]) || 0).sort((a,b) => b - a)
        sum6 = labs[0] + labs[1] + labs[2] + labs[3]
      } else {
        const labs = [1,2,3,4,5,6,7,8].map(i => parseFloat(notas[`LAB${i}`]) || 0).sort((a,b) => b - a)
        sum6 = labs[0] + labs[1] + labs[2] + labs[3] + labs[4] + labs[5]
      }
    }

    // Inyección nativa segura
    const script = `
      const SUM_PC3 = ${sum3};
      const SUM_PC5 = ${sum5};
      const PP_PC = ${is5x5 ? sum3 / 4 : sum3 / 3};
      const PP = ${is5x5 ? sum3 / 4 : sum3 / 3};
      const PP_PC6 = ${sum5 / 5};
      const PP_LAB = ${is5x5 ? sum6 / 4 : sum6 / 6};
      const PP_MIXTO = ${(sum3 + sum6) / 9};
      const PP_MIXTO_5X5 = ${(sum3 + sum6) / 8};
      
      let EP = ${parseFloat(notas.EP) || 0};
      let EF = ${parseFloat(notas.EF) || 0};
      const ES = ${parseFloat(notas.ES)};
      
      if (!isNaN(ES)) {
        if (EP <= EF) {
          EP = ES;
        } else {
          EF = ES;
        }
      }

      const ROUND = (num) => Math.round(num);
      const FLOOR = (num) => Math.floor(num);
      const CEIL = (num) => Math.ceil(num);

      const PC1 = ${parseFloat(notas.PC1) || 0};
      const PC2 = ${parseFloat(notas.PC2) || 0};
      const PC3 = ${parseFloat(notas.PC3) || 0};
      const PC4 = ${parseFloat(notas.PC4) || 0};
      const PC5 = ${parseFloat(notas.PC5) || 0};
      const PC6 = ${parseFloat(notas.PC6) || 0};
      const MON1 = ${parseFloat(notas.MON1) || 0};
      const MON2 = ${parseFloat(notas.MON2) || 0};
      const PF = ${parseFloat(notas.PF) || 0};
      return ${formula};
    `
    const result = new Function(script)()
    return isNaN(result) ? null : Math.floor((result + 0.00001) * 10) / 10
  } catch (e) {
    console.error("Error evaluando formula:", e)
    return null
  }
}

// ---- COMPONENTES VISUALES ----
function CircularGauge({ value }) {
  const numVal = value ? Math.min(Math.max(parseFloat(value), 0), 20) : 0
  const pct = numVal / 20
  const cx = 100, cy = 105, r = 74
  const startDeg = 215
  const totalDeg = 290
  const toRad = (deg) => (deg * Math.PI) / 180
  const arcPath = (fromDeg, toDeg) => {
    const clampedTo = Math.min(toDeg, fromDeg + 289.9)
    const s = toRad(fromDeg), e = toRad(clampedTo)
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e)
    const large = (clampedTo - fromDeg) > 180 ? 1 : 0
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
  }
  const fillEnd = startDeg + pct * totalDeg
  const bgEnd = startDeg + totalDeg
  const color = notaColor(numVal).hex

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="150" viewBox="0 0 200 150" className="drop-shadow-2xl">
        <path d={arcPath(startDeg, bgEnd)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" strokeLinecap="round" />
        <path d={arcPath(startDeg, fillEnd)} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="48" fontWeight="900" className="tracking-tighter">
          {numVal.toFixed(1)}
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="12" fontWeight="700" letterSpacing="0.2em" className="uppercase">
          Score
        </text>
      </svg>
    </div>
  )
}

function CustomLineChart({ data }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: 800, height: 300 })

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
        }
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  if (!data || data.length === 0) return null
  const { width, height } = size
  const paddingX = 50
  const paddingY = 25
  
  const minScore = 0
  const maxScore = 20
  
  const getX = (index) => paddingX + (index * ((width - paddingX * 2) / Math.max(data.length - 1, 1)))
  const getY = (score) => height - paddingY - ((score - minScore) / (maxScore - minScore)) * (height - paddingY * 2)

  // Crear el path de la línea
  let pathD = ''
  data.forEach((d, i) => {
    const x = getX(i)
    const y = getY(d.Promedio)
    if (i === 0) pathD += `M ${x} ${y}`
    else pathD += ` L ${x} ${y}`
  })

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg width={width} height={height} className="overflow-visible absolute top-0 left-0">
        {/* Grid Horizontal */}
        {[0, 5, 10, 15, 20].map(val => (
          <g key={val}>
            <line x1={paddingX} y1={getY(val)} x2={width - paddingX} y2={getY(val)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
            <text x={paddingX - 15} y={getY(val)} fill="rgba(255,255,255,0.4)" fontSize="12" fontWeight="bold" textAnchor="end" dominantBaseline="middle">{val}</text>
          </g>
        ))}
        
        {/* Línea Principal */}
        <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="4" className="drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]" />

        {/* Puntos y Etiquetas */}
        {data.map((d, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={getX(i)} cy={getY(d.Promedio)} r="6" fill="#0d1220" stroke="#22d3ee" strokeWidth="3" className="transition-all duration-300 group-hover:r-[9] group-hover:stroke-white drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
            <text x={getX(i)} y={height - 5} fill="rgba(255,255,255,0.6)" fontSize="12" fontWeight="900" tracking="widest" textAnchor="middle" className="uppercase">{d.name}</text>
            <rect x={getX(i) - 25} y={getY(d.Promedio) - 45} width="50" height="26" rx="6" fill="#0d1220" stroke="rgba(34,211,238,0.4)" className="opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
            <text x={getX(i)} y={getY(d.Promedio) - 27} fill="#22d3ee" fontSize="13" fontWeight="900" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{d.Promedio.toFixed(3)}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function NotaBadge({ valor, onClick }) {
  const v = valor !== null && valor !== undefined ? parseFloat(valor).toFixed(1) : null
  const c = notaColor(v)
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`text-5xl font-black tracking-tighter ${c.text} hover:scale-105 hover:opacity-80 transition-transform cursor-pointer relative group flex items-center justify-center`}
      title="Configurar Evaluaciones"
    >
      {v || '--'}
      <span className="absolute -top-1 -right-3 w-4 h-4 bg-cyan-500/20 border border-cyan-500/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(34,211,238,0.5)]">
        <svg className="w-2.5 h-2.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
      </span>
    </button>
  )
}

// ---- COMPONENTE PRINCIPAL ----
const getCurrentPeriod = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() // 0-11
  return `${year}-${month < 7 ? '1' : '2'}`
}

export default function DashboardAlumno() {
  const navigate = useNavigate()
  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const currentPeriod = useMemo(() => getCurrentPeriod(), [])
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(currentPeriod)
  const [periodosDinamicos, setPeriodosDinamicos] = useState([currentPeriod])
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carrerasDisponibles, setCarrerasDisponibles] = useState([])
  const [nombreInput, setNombreInput] = useState('')

  // Diccionario Dinámico de Sistemas de Evaluación
  const [sistemasDict, setSistemasDict] = useState({})

  // Estado para el Modal Personalizado de Periodo
  const [modalPeriodo, setModalPeriodo] = useState({ visible: false, valor: '' })

  // Estados de Matrícula (Carrito)
  const [mostrarModalMatricula, setMostrarModalMatricula] = useState(false)
  const [catalogoGlobal, setCatalogoGlobal] = useState([])
  const [misCursosGlobales, setMisCursosGlobales] = useState([])
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false)
  const [filtroCicloMatricula, setFiltroCicloMatricula] = useState('1er Ciclo')
  const [carrito, setCarrito] = useState([])

  // Estados de Notas
  const [modalNota, setModalNota] = useState({ visible: false, curso: null, detalleLocal: {} })

  // Estados del Simulador
  const [mostrarSimulador, setMostrarSimulador] = useState(false)
  const [simuladorLocal, setSimuladorLocal] = useState({})
  const [metasCursos, setMetasCursos] = useState({})
  const META_DEFAULT = 14
  const getMetaCurso = useCallback((cursoId) => metasCursos[cursoId] ?? META_DEFAULT, [metasCursos])
  const setMetaCurso = (cursoId, val) => setMetasCursos(prev => ({ ...prev, [cursoId]: val }))

  // Mapa Curricular
  const [mostrarMapaCurricular, setMostrarMapaCurricular] = useState(false)
  const [misCursosGlobalesDict, setMisCursosGlobalesDict] = useState({})
  const [progresoData, setProgresoData] = useState([])
  
  // Pestañas
  const [tabActiva, setTabActiva] = useState('cursos')

  const fetchSistemas = useCallback(async () => {
    const { data } = await supabase.from('sistemas_evaluacion').select('*')
    if (data) {
      const dict = {}
      data.forEach(sys => dict[sys.id] = sys)
      if (!dict['Libre']) dict['Libre'] = { id: 'Libre', nombre: 'Ingreso Libre', formula: 'PF', usa_practicas: false }
      setSistemasDict(dict)
    }
  }, [])

  const fetchMisCursosActuales = useCallback(async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase.from('cursos').select('*').eq('user_id', userId)
      if (error) throw error
      
      const uniquePeriods = [...new Set((data || []).map(c => c.periodo))].sort((a,b) => b.localeCompare(a))
      if (!uniquePeriods.includes(currentPeriod)) uniquePeriods.unshift(currentPeriod)
      setPeriodosDinamicos(uniquePeriods)

      // ---- CÁLCULO DE PROGRESIÓN (POR PERIODO HISTÓRICO) ----
      const agrupadoPorPeriodo = {}
      ;(data || []).forEach(c => {
         const nota = parseFloat(c.promedio)
         if (!isNaN(nota) && c.creditos > 0) {
            if (!agrupadoPorPeriodo[c.periodo]) agrupadoPorPeriodo[c.periodo] = { sum: 0, creditos: 0 }
            agrupadoPorPeriodo[c.periodo].sum += nota * c.creditos
            agrupadoPorPeriodo[c.periodo].creditos += c.creditos
         }
      })
      
      const chartData = []
      const sortedPeriods = Object.keys(agrupadoPorPeriodo).sort((a,b) => a.localeCompare(b)) // Cronológico
      sortedPeriods.forEach(periodo => {
         const promedio = agrupadoPorPeriodo[periodo].sum / agrupadoPorPeriodo[periodo].creditos
         chartData.push({
            name: periodo,
            Promedio: parseFloat(promedio.toFixed(3))
         })
      })
      setProgresoData(chartData)

      const cursosPeriodo = (data || []).filter(c => c.periodo === periodoSeleccionado)
      setCursos(cursosPeriodo)
      
      const initSims = {}
      ;(cursosPeriodo || []).forEach(c => {
        const detalle = c.notas_detalle || {}
        initSims[c.id] = { ...detalle }
      })
      setSimuladorLocal(initSims)
    } catch (error) { console.error(error) }
    finally { setCargando(false) }
  }, [userId, periodoSeleccionado])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email)
        setUserId(user.id)
        const { data: p } = await supabase.from('perfiles').select('*').eq('user_id', user.id).single()
        if (p) setPerfil(p)
        else {
          const { data: carr } = await supabase.from('carreras').select('*')
          setCarrerasDisponibles(carr || [])
        }
      }
    })
    fetchSistemas()
  }, [fetchSistemas])

  useEffect(() => { 
    if (userId) fetchMisCursosActuales() 
  }, [periodoSeleccionado, userId, fetchMisCursosActuales])

  // ---- MATRICULA TIPO CARRITO Y MAPA CURRICULAR ----
  const fetchCatalogoGlobal = async () => {
    if (catalogoGlobal.length === 0 && perfil) {
      setCargandoCatalogo(true)
      try {
        const { data, error } = await supabase.from('catalogo_cursos').select('*').eq('carrera_id', perfil.carrera_id)
        if (error) throw error
        setCatalogoGlobal(data || [])
      } catch (error) { console.error(error) }
      finally { setCargandoCatalogo(false) }
    }
  }

  const abrirMatricula = async () => {
    setMostrarModalMatricula(true)
    setCarrito([])
    try {
      const resMisCursos = await supabase.from('cursos').select('nombre, promedio, periodo').eq('user_id', userId)
      const cursosAprobados = (resMisCursos.data || []).filter(c => parseFloat(c.promedio) >= 10).map(c => c.nombre)
      const cursosActuales = (resMisCursos.data || []).filter(c => c.periodo === periodoSeleccionado).map(c => c.nombre)
      const cursosNoPermitidos = [...new Set([...cursosAprobados, ...cursosActuales])]
      setMisCursosGlobales(cursosNoPermitidos)
      await fetchCatalogoGlobal()
    } catch (error) { console.error(error) }
  }

  useEffect(() => {
    if (mostrarModalMatricula && catalogoGlobal.length > 0) {
      const ciclosDisponibles = ['1er Ciclo', '2do Ciclo', '3er Ciclo', '4to Ciclo', '5to Ciclo', '6to Ciclo', '7mo Ciclo', '8vo Ciclo', '9no Ciclo', '10mo Ciclo', 'Electivo'];
      let encontreCiclo = false;
      for (const ciclo of ciclosDisponibles) {
        const hayCursosEnCiclo = catalogoGlobal.some(c => c.ciclo_sugerido === ciclo && !misCursosGlobales.includes(c.nombre));
        if (hayCursosEnCiclo) {
          setFiltroCicloMatricula(ciclo);
          encontreCiclo = true;
          break;
        }
      }
      if (!encontreCiclo) setFiltroCicloMatricula('1er Ciclo');
    }
  }, [mostrarModalMatricula, catalogoGlobal, misCursosGlobales]);

  const abrirMapaCurricular = async () => {
    setMostrarMapaCurricular(true)
    try {
      // Traer historial completo para pintar aprobados/pendientes
      const resMisCursos = await supabase.from('cursos').select('nombre, promedio').eq('user_id', userId)
      const historial = (resMisCursos.data || []).reduce((acc, c) => {
        acc[c.nombre] = parseFloat(c.promedio)
        return acc
      }, {})
      setMisCursosGlobalesDict(historial)
      await fetchCatalogoGlobal()
    } catch (error) { console.error(error) }
  }

  const toggleCarrito = (cursoCat) => {
    const existe = carrito.find(c => c.id === cursoCat.id)
    if (existe) {
      setCarrito(carrito.filter(c => c.id !== cursoCat.id))
    } else {
      setCarrito([...carrito, cursoCat])
    }
  }

  const confirmarMatriculaMasiva = async () => {
    if (carrito.length === 0) return
    try {
      const inserts = carrito.map(cursoCat => {
        const sistId = cursoCat.sistema_evaluacion || 'Libre'
        return {
          user_id: userId,
          nombre: cursoCat.nombre,
          ciclo: cursoCat.ciclo_sugerido,
          periodo: periodoSeleccionado,
          profesor: '',
          creditos: cursoCat.creditos,
          promedio: null,
          sistema_evaluacion: sistId,
          notas_detalle: {}
        }
      })
      const { error } = await supabase.from('cursos').insert(inserts)
      if (error) throw error
      
      setMostrarModalMatricula(false)
      fetchMisCursosActuales()
    } catch (error) { console.error(error) }
  }

  const desmatricularCurso = async (cursoId) => {
    if (window.confirm("¿Estás seguro que deseas desmatricularte de este curso en este periodo?")) {
      await supabase.from('cursos').delete().eq('id', cursoId)
      fetchMisCursosActuales()
    }
  }

  // ---- EDICION DE NOTAS AVANZADA ----
  const abrirModalNota = (curso) => {
    const sistId = curso.sistema_evaluacion || 'Libre'
    const sys = sistemasDict[sistId]
    if (!sys) {
      alert("Error: El sistema de evaluación de este curso no está cargado.")
      return
    }
    const detalle = curso.notas_detalle || {}
    setModalNota({ visible: true, curso, detalleLocal: { ...detalle }, sys })
  }

  const actualizarDetalleLocal = (key, value) => {
    setModalNota(prev => ({
      ...prev,
      detalleLocal: { ...prev.detalleLocal, [key]: value }
    }))
  }

  const handleAprobarInsight = async () => {
    // Si la predicción era real, aquí el alumno podría simular que aprueba el curso.
    alert("Función 'Matricular en Plan' en construcción.")
  }

  // ---- REACT FLOW MALLA LOGIC ----
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    if (!mostrarMapaCurricular || !catalogoGlobal.length) return;

    const newNodes = []
    const newEdges = []

    catalogoGlobal.forEach(curso => {
      const notaHistorial = misCursosGlobalesDict[curso.nombre]
      const isAprobado = notaHistorial !== undefined && notaHistorial >= 10
      const isReprobado = notaHistorial !== undefined && notaHistorial < 10
      const enCursoActual = cursos.find(c => c.nombre === curso.nombre)
      
      const preString = curso.pre_requisitos || 'NINGUNO'
      let isDesbloqueado = true
      const prereqsFaltantes = []

      if (preString !== 'NINGUNO' && preString.trim() !== '') {
        const reqs = preString.split(',').map(r => r.trim())
        for (const req of reqs) {
          const notaReq = misCursosGlobalesDict[req]
          if (notaReq === undefined || notaReq < 10) {
            isDesbloqueado = false
            prereqsFaltantes.push(req)
          }

          const reqCurso = catalogoGlobal.find(c => c.nombre === req)
          if (reqCurso) {
            newEdges.push({
              id: `e-${reqCurso.id}-${curso.id}`,
              source: reqCurso.id,
              target: curso.id,
              animated: notaReq !== undefined && notaReq >= 10,
              style: { stroke: notaReq !== undefined && notaReq >= 10 ? '#10b981' : '#475569', strokeWidth: 2.5 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
                color: notaReq !== undefined && notaReq >= 10 ? '#10b981' : '#475569',
              },
            })
          }
        }
      }

      newNodes.push({
        id: curso.id,
        type: 'custom',
        data: { curso, isAprobado, isReprobado, enCursoActual, isDesbloqueado, prereqsFaltantes, notaHistorial },
        position: { x: 0, y: 0 }
      })
    })

    // Grid Layout por Ciclos (Optimizado y Centrado)
    const ciclosCols = ['1er Ciclo', '2do Ciclo', '3er Ciclo', '4to Ciclo', '5to Ciclo', '6to Ciclo', '7mo Ciclo', '8vo Ciclo', '9no Ciclo', '10mo Ciclo', 'Electivo']
    
    // 1. Contar materias por ciclo para calcular alturas
    const colsCount = {}
    newNodes.forEach(node => {
      const ciclo = node.data.curso.ciclo_sugerido
      colsCount[ciclo] = (colsCount[ciclo] || 0) + 1
    })

    // 2. Encontrar la columna más alta
    let maxRows = 0
    Object.values(colsCount).forEach(count => {
      if (count > maxRows) maxRows = count
    })

    // 3. Parámetros de espacio ultra-masivos para visibilidad total de líneas
    const Y_SPACING = 300;
    const X_SPACING = 650;
    const GLOBAL_HEIGHT = maxRows * Y_SPACING;

    const cycleCounters = {}
    
    newNodes.forEach(node => {
      const ciclo = node.data.curso.ciclo_sugerido
      let colIndex = ciclosCols.indexOf(ciclo)
      if (colIndex === -1) colIndex = 11 // Fallback

      if (cycleCounters[ciclo] === undefined) cycleCounters[ciclo] = 0
      const rowIndex = cycleCounters[ciclo]
      cycleCounters[ciclo]++

      // Calcular offset para centrar verticalmente la columna entera
      const colHeight = colsCount[ciclo] * Y_SPACING
      const yOffset = (GLOBAL_HEIGHT - colHeight) / 2

      node.position = { 
        x: colIndex * X_SPACING, 
        y: yOffset + (rowIndex * Y_SPACING) 
      }
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [mostrarMapaCurricular, catalogoGlobal, misCursosGlobalesDict, cursos])

  // ==========================================
  // 5) RENDER PRINCIPAL
  // ==========================================
  const guardarNotas = async (e) => {
    e.preventDefault()
    try {
      const { curso, detalleLocal, sys } = modalNota
      const nuevoPromedio = evaluarSistema(sys, detalleLocal)
      
      const { error } = await supabase.from('cursos').update({ 
        notas_detalle: detalleLocal,
        promedio: nuevoPromedio
      }).eq('id', curso.id)
      
      if (error) throw error
      fetchMisCursosActuales()
      setModalNota({ visible: false, curso: null, detalleLocal: {}, sys: null })
    } catch (error) { console.error(error) }
  }

  // ---- SIMULADOR: UTILIDADES AVANZADAS ----
  const resolverNecesario = (sys, detalleBase, campoTarget, meta) => {
    if (!sys || !campoTarget) return null
    const det = { ...detalleBase }
    det[campoTarget] = 0
    if ((evaluarSistema(sys, det) || 0) >= meta) return 0
    det[campoTarget] = 20
    if ((evaluarSistema(sys, det) || 0) < meta) return Infinity
    let lo = 0, hi = 20
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2
      det[campoTarget] = mid
      if ((evaluarSistema(sys, det) || 0) < meta) lo = mid
      else hi = mid
    }
    return Math.ceil(((lo + hi) / 2) * 10) / 10
  }

  const NOTA_APROBATORIA = 10.0
  const calcularRiesgo = (detalleReal, sys, camposReq, meta) => {
    if (!sys) return 'unknown'
    const best = { ...detalleReal }; camposReq.forEach(c => { if (best[c.id] == null || best[c.id] === '') best[c.id] = 20 })
    if ((evaluarSistema(sys, best) || 0) < NOTA_APROBATORIA) return 'critico'
    const worst = { ...detalleReal }; camposReq.forEach(c => { if (worst[c.id] == null || worst[c.id] === '') worst[c.id] = 0 })
    if ((evaluarSistema(sys, worst) || 0) >= meta) return 'meta'
    if ((evaluarSistema(sys, worst) || 0) >= NOTA_APROBATORIA) return 'seguro'
    return 'peligro'
  }

  const autocompletarCurso = (cursoId, targetNota) => {
    const curso = cursos.find(c => c.id === cursoId)
    if (!curso) return
    const det = { ...(simuladorLocal[cursoId] || curso.notas_detalle || {}) }
    const sys = sistemasDict[curso.sistema_evaluacion || 'Libre']
    if (!sys) return
    const campos = parsearCamposRequeridos(sys)
    
    // Aquí filtramos usando notas_detalle (la BD) para asegurar que podamos sobrescribir notas simuladas previas
    const vaciosReales = campos.filter(c => curso.notas_detalle[c.id] == null || curso.notas_detalle[c.id] === '')
    if (vaciosReales.length === 0) return

    const testMax = { ...det }; vaciosReales.forEach(c => testMax[c.id] = 20)
    if ((evaluarSistema(sys, testMax) || 0) < targetNota) {
      alert(`Matemáticamente imposible alcanzar ${targetNota} en ${curso.nombre}`)
      return
    }

    let lo = 0, hi = 20
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2
      const testDet = { ...det }; vaciosReales.forEach(c => testDet[c.id] = mid)
      if ((evaluarSistema(sys, testDet) || 0) < targetNota) lo = mid
      else hi = mid
    }
    const minVal = Math.ceil((lo + hi) / 2)
    
    const newDet = { ...det }; vaciosReales.forEach(c => newDet[c.id] = minVal)
    setSimuladorLocal(prev => ({ ...prev, [cursoId]: newDet }))
  }

  const PRIORIDAD = ['EF', 'EP', 'MON2', 'MON1', 'LAB8', 'LAB7', 'LAB6', 'LAB5', 'LAB4', 'LAB3', 'LAB2', 'LAB1', 'PC4', 'PC3', 'PC2', 'PC1', 'PF']
  const detectarCampoObjetivo = (detalleReal, camposReq) => {
    for (const pid of PRIORIDAD) {
      const campo = camposReq.find(c => c.id === pid)
      if (campo && (detalleReal[campo.id] == null || detalleReal[campo.id] === '')) return campo
    }
    return camposReq[camposReq.length - 1]
  }

  // ---- CÁLCULOS GLOBALES ----
  const calcularPonderado = (listaCursos, simulador = null) => {
    if (listaCursos.length === 0 || Object.keys(sistemasDict).length === 0) return null
    let sumaPonderada = 0, totalCreditos = 0
    listaCursos.forEach(c => {
      let nota = null
      if (simulador && simulador[c.id]) {
        const sys = sistemasDict[c.sistema_evaluacion || 'Libre']
        if (sys) nota = evaluarSistema(sys, simulador[c.id])
      } else {
        nota = parseFloat(c.promedio)
      }
      if (nota !== null && !isNaN(nota)) {
        sumaPonderada += nota * c.creditos
        totalCreditos += c.creditos
      }
    })
    return totalCreditos === 0 ? null : (sumaPonderada / totalCreditos).toFixed(3)
  }

  const promedioGeneral = calcularPonderado(cursos)
  const promedioSimulado = calcularPonderado(cursos, simuladorLocal)
  const creditosTotal = cursos.reduce((sum, c) => sum + (c.creditos || 0), 0)
  const aprobados = cursos.filter(c => parseFloat(c.promedio) >= 10).length
  const catalogoAMostrar = catalogoGlobal.filter(c =>
    c.ciclo_sugerido === filtroCicloMatricula && !misCursosGlobales.includes(c.nombre)
  )

  // ---- INSIGHTS J.A.R.V.I.S. ----
  const sugerencias = useMemo(() => {
    const sugs = []
    if (!cursos.length || !Object.keys(sistemasDict).length) return sugs

    const cursosEsfuerzo = []
    const rutasOptimas = []
    const zonasConfort = []

    // ---- Algoritmos Predictivos Avanzados ----
    cursos.forEach(c => {
      const detalleReal = c.notas_detalle || {}
      const sys = sistemasDict[c.sistema_evaluacion || 'Libre']
      if (!sys) return
      const camposReq = parsearCamposRequeridos(sys)
      const campoObj = detectarCampoObjetivo(detalleReal, camposReq)
      
      // Imposibilidad matemática (Nota requerida > 20)
      const best = { ...detalleReal }; camposReq.forEach(f => { if (best[f.id] == null || best[f.id] === '') best[f.id] = 20 })
      if ((evaluarSistema(sys, best) || 0) < getMetaCurso(c.id)) {
        sugs.push({ tipo: 'alerta', texto: `Meta Inalcanzable: Ya no podrás llegar a tu meta en "${c.nombre}" aunque saques 20 en todo lo que falta.` })
      }

      if (!campoObj) return

      const necesarioMeta = resolverNecesario(sys, { ...detalleReal }, campoObj.id, getMetaCurso(c.id))
      const necesarioAprobar = resolverNecesario(sys, { ...detalleReal }, campoObj.id, NOTA_APROBATORIA)

      // Riesgo de Esfuerzo Desproporcionado (> 16)
      if (necesarioMeta > 16 && necesarioMeta <= 20) {
        cursosEsfuerzo.push({ curso: c, req: necesarioMeta, campo: campoObj.id })
      }

      // Ruta Óptima (<= 12)
      if (necesarioAprobar > 0 && necesarioAprobar <= 12) {
        rutasOptimas.push({ curso: c, req: necesarioAprobar, campo: campoObj.id, tipo: 'aprobar' })
      } else if (necesarioMeta > 0 && necesarioMeta <= 12) {
        rutasOptimas.push({ curso: c, req: necesarioMeta, campo: campoObj.id, tipo: 'meta' })
      }

      // Zona de Confort (necesarioAprobar == 0 y créditos >= 4)
      if (necesarioAprobar === 0 && (c.creditos || 0) >= 4) {
        zonasConfort.push(c)
      }
    })

    if (cursosEsfuerzo.length > 0) {
      const c = cursosEsfuerzo.sort((a, b) => b.req - a.req)[0]
      sugs.push({ tipo: 'alerta', texto: `Riesgo de Sobreesfuerzo: Alcanzar tu meta en "${c.curso.nombre}" requiere un exigente ${c.req} en ${c.campo}. Considera reducir tu meta para no frustrarte.` })
    }

    if (rutasOptimas.length > 0) {
      const ro = rutasOptimas.sort((a, b) => (b.curso.creditos || 0) - (a.curso.creditos || 0))[0]
      sugs.push({ tipo: 'estrategia', texto: `Ruta Óptima: Con solo asegurar un ${ro.req} en ${ro.campo} de "${ro.curso.nombre}" lograrás ${ro.tipo === 'aprobar' ? 'salvar el curso' : 'tu meta'}. Enfoca tu energía aquí.` })
    }

    if (zonasConfort.length > 0) {
      const zc = zonasConfort.sort((a, b) => (b.creditos || 0) - (a.creditos || 0))[0]
      sugs.push({ tipo: 'oportunidad', texto: `Zona de Confort: Ya aprobaste "${zc.nombre}". Al tener ${zc.creditos} créditos, cualquier punto extra en tus próximos exámenes subirá masivamente tu ponderado general. ¡No te relajes!` })
    }

    // Impacto del Escenario Actual
    if (promedioSimulado && promedioGeneral) {
      const diff = (parseFloat(promedioSimulado) - parseFloat(promedioGeneral)).toFixed(1)
      if (diff > 0.5) sugs.push({ tipo: 'positivo', texto: `Simulación Excelente: Con este escenario subirías ${diff} puntos tu ponderado del ciclo (${promedioGeneral} → ${promedioSimulado}).` })
      else if (diff < -0.5) sugs.push({ tipo: 'alerta', texto: `Simulación Peligrosa: Este escenario bajaría ${Math.abs(diff)} puntos tu ponderado general.` })
    }

    const cursosEnMeta = cursos.filter(c => {
      const simDet = simuladorLocal[c.id] || c.notas_detalle || {}
      const sys = sistemasDict[c.sistema_evaluacion || 'Libre']
      if (!sys) return false
      return (evaluarSistema(sys, simDet) || 0) >= getMetaCurso(c.id)
    })
    
    if (cursosEnMeta.length === cursos.length && cursos.length > 0) {
      sugs.push({ tipo: 'positivo', texto: `¡Victoria Total! Todas tus materias alcanzan su meta con estas notas simuladas.` })
    }

    return sugs
  }, [cursos, promedioSimulado, promedioGeneral, sistemasDict, simuladorLocal, getMetaCurso])

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{backgroundImage:'linear-gradient(rgba(34,211,238,1) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,1) 1px,transparent 1px)', backgroundSize:'60px 60px'}}></div>
      
      <nav className="relative z-10 border-b border-white/[0.06] bg-[#080c14]/80 backdrop-blur-xl px-4 lg:px-8 py-4 sticky top-0">
        <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.15)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10 5 10-5"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12l10 5 10-5"/></svg>
              </div>
              <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">Promedium</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {perfil && perfil.nombre_completo ? (
              <span className="hidden sm:block text-xs text-white font-bold tracking-wide">Hola, {perfil.nombre_completo.split(' ')[0]}</span>
            ) : (
              <span className="hidden sm:block text-[10px] text-slate-600 font-mono">{userEmail}</span>
            )}
            <button onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] text-slate-500 hover:text-white hover:border-white/10 transition-all text-[10px] font-bold tracking-widest uppercase">
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-10 flex-1 flex flex-col">
        
        {/* HEADER AREA: Título y Métricas Balanceadas */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-8">
          
          {/* Lado Izquierdo: Títulos y Selector */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-[pulse_2s_ease-in-out_infinite]"></div>
                <p className="text-[10px] text-cyan-400 font-bold tracking-[0.3em] uppercase">Panel Académico</p>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-50 to-cyan-400/80 leading-none">MI CONSOLA</h2>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center bg-white/[0.02] border border-white/[0.08] rounded-xl p-1 shadow-inner h-fit">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3">Periodo:</span>
                <select value={periodoSeleccionado} onChange={(e) => setPeriodoSeleccionado(e.target.value)} className="bg-transparent text-cyan-400 text-xs font-bold py-1.5 px-2 outline-none cursor-pointer">
                  {periodosDinamicos.map(p => <option key={p} value={p} className="bg-[#0d1220]">{p}</option>)}
                </select>
              </div>
              <button 
                onClick={() => setModalPeriodo({ visible: true, valor: '' })}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors"
                title="Añadir periodo histórico"
              >
                +
              </button>
            </div>
          </div>

          {/* Lado Derecho: Métricas */}
          {!cargando && cursos.length > 0 && (
            <div className="flex flex-wrap gap-4 w-full xl:w-auto">
              {[
                { label: 'Ponderado Ciclo', value: promedioGeneral ?? '--', sub: 'sobre 20', color: notaColor(promedioGeneral).text },
                { label: 'Créditos', value: creditosTotal, sub: 'matriculados', color: 'text-blue-400' },
                { label: 'Aprobados', value: `${aprobados}/${cursos.length}`, sub: 'cursos', color: 'text-emerald-400' },
              ].map((stat, i) => (
                <div key={i} className="flex-1 xl:flex-none min-w-[140px] bg-white/[0.02] border border-white/[0.05] rounded-2xl px-6 py-4 hover:border-white/15 transition-all flex flex-col justify-center shadow-lg shadow-black/20">
                  <p className="text-[9px] text-slate-500 font-bold tracking-[0.2em] uppercase mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center bg-white/[0.02] border border-white/[0.05] rounded-2xl p-2 mb-6 shadow-xl backdrop-blur-md gap-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <button 
              onClick={() => setTabActiva('cursos')}
              className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl font-black text-[11px] tracking-widest uppercase transition-all ${tabActiva === 'cursos' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-transparent text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              Mis Cursos
            </button>
            <button 
              onClick={() => setTabActiva('analitica')}
              className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl font-black text-[11px] tracking-widest uppercase transition-all ${tabActiva === 'analitica' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-transparent text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              Analítica Histórica
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto mt-2 lg:mt-0">
            <button 
              onClick={abrirMapaCurricular}
              className="w-full sm:w-auto relative group overflow-hidden px-6 py-3.5 rounded-xl bg-[#080c14] border border-emerald-500/30 text-emerald-400 font-black text-[11px] tracking-widest uppercase transition-all hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              Mapa Curricular
            </button>
            
            <button 
              onClick={() => setMostrarSimulador(!mostrarSimulador)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black text-[11px] tracking-widest uppercase transition-all active:scale-95 border relative overflow-hidden group ${mostrarSimulador ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-[#080c14] text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/5'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              J.A.R.V.I.S. Simulador
            </button>
            
            <button 
              onClick={abrirMatricula}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-[11px] tracking-widest uppercase transition-all border border-white/[0.06] bg-white/[0.03] text-white hover:bg-white/[0.08]"
            >
              + Matricular
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 relative">
          <div className="flex-1 transition-all duration-500 w-full">
            
            {tabActiva === 'cursos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-in fade-in duration-500">
              {cargando ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-7 animate-pulse"><div className="h-24"></div></div>
                ))
              ) : cursos.length === 0 ? (
                <div className="col-span-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-20 text-center">
                  <p className="text-slate-500 font-bold text-sm mb-1">Sin cursos en {periodoSeleccionado}</p>
                </div>
              ) : (
                cursos.map((curso) => {
                  const sys = sistemasDict[curso.sistema_evaluacion || 'Libre']
                  const color = notaColor(curso.promedio)

                  return (
                    <div key={curso.id} className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-white/15 transition-all duration-300 relative flex flex-col overflow-hidden shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/40">
                      
                      {/* Borde dinámico de color en hover */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color.bar} opacity-40 group-hover:opacity-100 transition-opacity`}></div>

                      <button onClick={() => desmatricularCurso(curso.id)} className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-red-400 hover:border-red-500/30 opacity-0 group-hover:opacity-100 transition-all z-10" title="Desmatricularse">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>

                      <h3 className="text-xl font-black text-white uppercase mb-3 pr-10 leading-tight">{curso.nombre}</h3>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-8">
                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {curso.ciclo}
                        </span>
                        <span className="text-[10px] font-bold text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {curso.creditos} CR.
                        </span>
                        <span className="text-[10px] font-bold text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {sys?.nombre || 'Sist. Libre'}
                        </span>
                      </div>
                      
                      <div className="mt-auto flex justify-end">
                        <NotaBadge valor={curso.promedio} onClick={() => abrirModalNota(curso)} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            )}

            {/* GRÁFICO DE PROGRESIÓN NATIVO (PESTAÑA ANALÍTICA) */}
            {tabActiva === 'analitica' && progresoData.length > 1 && (
              <div className="animate-in fade-in duration-500 w-full">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 md:p-8 shadow-2xl w-full h-[400px] flex flex-col relative overflow-hidden">
                  
                  {/* Decoración de fondo */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                  
                  <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    Panel de Evolución Académica Histórica
                  </h3>
                  
                  <div className="flex-1 w-full relative z-10">
                    <CustomLineChart data={progresoData} />
                  </div>
                </div>
              </div>
            )}

            {tabActiva === 'analitica' && progresoData.length <= 1 && (
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-20 text-center animate-in fade-in duration-500">
                <p className="text-slate-500 font-bold text-sm mb-1">Analítica no disponible</p>
                <p className="text-xs text-slate-600">Necesitas al menos 2 periodos académicos completados para trazar tu evolución.</p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* SIMULADOR J.A.R.V.I.S. (MODAL INMERSIVO) */}
      {mostrarSimulador && (
        <div className="fixed inset-0 bg-[#080c14]/95 backdrop-blur-md flex items-center justify-center z-50 p-4 lg:p-8">
          <div className="bg-[#080c14] border border-cyan-500/20 rounded-3xl w-full max-w-[1600px] h-full flex flex-col overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.1)] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.07] via-transparent to-transparent pointer-events-none"/>

            {/* Header Modal */}
            <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 border-b border-white/[0.05] relative z-10 bg-[#080c14]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"/>
                <h3 className="text-sm md:text-base font-black tracking-[0.25em] uppercase text-cyan-400">J.A.R.V.I.S. Predictor Inmersivo</h3>
              </div>

              {/* Gauge + Real vs Sim (Centrado) */}
              <div className="flex flex-col lg:flex-row items-center gap-8 my-4 md:my-0">
                <div className="scale-75 origin-center md:scale-100 flex items-center justify-center">
                  <CircularGauge value={promedioSimulado} />
                </div>
                {promedioGeneral && (
                  <div className="flex items-center gap-5 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Real</p>
                      <p className={`text-2xl font-black ${notaColor(promedioGeneral).text}`}>{promedioGeneral}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 text-slate-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                      <span className={`text-xs font-black ${
                        promedioSimulado && parseFloat(promedioSimulado) > parseFloat(promedioGeneral) ? 'text-emerald-400'
                        : promedioSimulado && parseFloat(promedioSimulado) < parseFloat(promedioGeneral) ? 'text-red-400'
                        : 'text-slate-500'
                      }`}>
                        {promedioSimulado ? `${parseFloat(promedioSimulado) >= parseFloat(promedioGeneral) ? '+' : ''}${(parseFloat(promedioSimulado) - parseFloat(promedioGeneral)).toFixed(1)}` : '--'}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Simulado</p>
                      <p className={`text-2xl font-black ${notaColor(promedioSimulado).text}`}>{promedioSimulado ?? '--'}</p>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => setMostrarSimulador(false)} className="text-slate-600 hover:text-white transition-colors text-3xl leading-none px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10">×</button>
            </div>

            {/* Cursos y Sugerencias */}
            <div className="overflow-y-auto custom-scrollbar flex-1 p-6 md:p-8 relative z-10 flex flex-col gap-8">
              
              {/* Sugerencias JARVIS (Tira Horizontal) */}
              {sugerencias.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.25em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/>
                    Insights Predictivos
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sugerencias.map((sug, i) => {
                      const styles = {
                        positivo: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
                        alerta: 'text-red-300 bg-red-500/10 border-red-500/20 shadow-red-500/5',
                        estrategia: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/5',
                        oportunidad: 'text-amber-300 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5',
                        info: 'text-slate-300 bg-white/[0.05] border-white/[0.1]'
                      }
                      const icons = {
                        positivo: <svg className="w-5 h-5 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
                        alerta: <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
                        estrategia: <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
                        oportunidad: <svg className="w-5 h-5 text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
                        info: <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      }
                      return (
                        <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border w-full shadow-lg transition-transform hover:-translate-y-0.5 ${styles[sug.tipo] || styles.info}`}>
                          <div className="flex-shrink-0 bg-black/20 rounded-full p-1.5">{icons[sug.tipo] || icons.info}</div>
                          <div className="text-xs leading-relaxed font-bold tracking-wide">{sug.texto}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Grilla de Cursos */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {cursos.length === 0 ? (
                    <div className="col-span-full">
                      <p className="text-sm text-slate-500 text-center py-20">Matricula cursos para simular</p>
                    </div>
                  ) : (
                    cursos.map(curso => {
                    const detalleReal = curso.notas_detalle || {}
                    const det = simuladorLocal[curso.id] || detalleReal
                    const sys = sistemasDict[curso.sistema_evaluacion || 'Libre']
                    if (!sys) return null
                    const camposReq = parsearCamposRequeridos(sys)
                    const promCurso = evaluarSistema(sys, det)
                    const promFmt = promCurso?.toFixed(1) ?? '--'
                    const metaCurso = getMetaCurso(curso.id)
                    const riesgo = calcularRiesgo(detalleReal, sys, camposReq, metaCurso)
                    const campoObj = detectarCampoObjetivo(detalleReal, camposReq)
                    const necesarioMeta = campoObj ? resolverNecesario(sys, { ...detalleReal }, campoObj.id, metaCurso) : null
                    const necesarioAprobar = campoObj ? resolverNecesario(sys, { ...detalleReal }, campoObj.id, NOTA_APROBATORIA) : null

                    const riesgoBadge = {
                      meta:    { label: `Meta ${metaCurso}`, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                      seguro:  { label: 'Aprueba', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
                      peligro: { label: 'En peligro', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                      critico: { label: 'Crítico', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
                      unknown: { label: '?', cls: 'text-slate-500 bg-white/5 border-white/10' },
                    }[riesgo]

                    return (
                      <div key={curso.id} className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 relative flex flex-col overflow-hidden shadow-xl shadow-black/20 hover:shadow-cyan-500/5">
                        
                        {/* Borde superior glow de riesgo */}
                        <div className="absolute top-0 left-0 right-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: riesgoBadge.cls.includes('emerald') ? '#10b981' : riesgoBadge.cls.includes('amber') ? '#f59e0b' : riesgoBadge.cls.includes('red') ? '#ef4444' : '#22d3ee' }}></div>

                        <div className="flex justify-between items-start mb-5 gap-4">
                          <h3 className="text-xl font-black text-white uppercase leading-tight truncate" title={curso.nombre}>{curso.nombre}</h3>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border flex-shrink-0 ${riesgoBadge.cls}`}>
                            {riesgoBadge.label}
                          </span>
                        </div>
                        
                        {/* Meta y Nota simulada integrada */}
                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-xl p-3.5 mb-5 shadow-inner">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nota Sim.</span>
                            <span className={`text-3xl font-black leading-none ${notaColor(promFmt).text}`}>{promFmt}</span>
                          </div>
                          <div className="w-px h-10 bg-white/10"></div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tu Meta</span>
                            <input
                              type="number" min="0" max="20" step="0.5"
                              value={metaCurso}
                              onClick={e => e.stopPropagation()}
                              onChange={e => setMetaCurso(curso.id, parseFloat(e.target.value) || 0)}
                              className="w-16 bg-white/[0.05] text-cyan-400 font-black text-xl rounded-lg px-2 py-1 outline-none text-center border border-white/[0.08] focus:border-cyan-500/50 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Calculadora inversa */}
                        <div className="space-y-2 mb-6">
                          {campoObj && necesarioMeta !== null && (
                            <div className={`text-[10px] font-bold px-3 py-2.5 rounded-lg flex items-center gap-2.5 ${
                              necesarioMeta === 0 ? 'text-emerald-400 bg-emerald-500/10'
                              : necesarioMeta === Infinity ? 'text-slate-400 bg-white/5'
                              : 'text-cyan-400 bg-cyan-500/10'
                            }`}>
                              <div className={`w-1.5 h-1.5 flex-shrink-0 rounded-full ${necesarioMeta === 0 ? 'bg-emerald-400' : necesarioMeta === Infinity ? 'bg-slate-400' : 'bg-cyan-400 animate-pulse'}`}></div>
                              <span>
                                {necesarioMeta === 0 && `✓ Ya alcanzas tu meta de ${metaCurso}`}
                                {necesarioMeta === Infinity && `Meta inalcanzable en ${campoObj.id}`}
                                {necesarioMeta > 0 && necesarioMeta < Infinity && `Para lograr ${metaCurso}: necesitas ≥ ${necesarioMeta} en ${campoObj.id}`}
                              </span>
                            </div>
                          )}
                          {campoObj && necesarioAprobar !== null && necesarioMeta !== 0 && (
                            <div className={`text-[10px] font-bold px-3 py-2.5 rounded-lg flex items-center gap-2.5 ${
                              necesarioAprobar === 0 ? 'text-emerald-400 bg-emerald-500/10'
                              : necesarioAprobar === Infinity ? 'text-red-400 bg-red-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                            }`}>
                              <div className={`w-1.5 h-1.5 flex-shrink-0 rounded-full ${necesarioAprobar === 0 ? 'bg-emerald-400' : necesarioAprobar === Infinity ? 'bg-red-400' : 'bg-amber-400 animate-pulse'}`}></div>
                              <span>
                                {necesarioAprobar === 0 && '✓ Ya apruebas el curso'}
                                {necesarioAprobar === Infinity && `✗ Imposible aprobar`}
                                {necesarioAprobar > 0 && necesarioAprobar < Infinity && `Para salvar (10): necesitas ≥ ${necesarioAprobar} en ${campoObj.id}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Data Entry Premium numérico */}
                        <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
                          {camposReq.map(campo => {
                            const realVal = detalleReal[campo.id]
                            const isReal = realVal != null && realVal !== ''
                            const val = isReal ? realVal : det[campo.id]
                            const isEmpty = val == null || val === ''
                            const numVal = parseFloat(val) || 0
                            const color = isEmpty ? '#64748b' : numVal >= 14 ? '#10b981' : numVal >= 11 ? '#f59e0b' : '#ef4444'
                            const borderClass = isReal ? 'border-white/[0.02]' : 'border-white/[0.05] hover:border-cyan-500/30'
                            const bgClass = isReal ? 'bg-black/40' : 'bg-white/[0.03]'
                            return (
                              <div key={campo.id} className={`relative group ${bgClass} border ${borderClass} rounded-xl p-3 transition-all flex items-center justify-between overflow-hidden`}>
                                <div className="absolute inset-0 opacity-10 pointer-events-none transition-all" style={{ backgroundColor: color, width: isEmpty ? '0%' : `${(numVal/20)*100}%` }}></div>
                                <span className={`text-[11px] font-black uppercase relative z-10 ${isReal ? 'text-slate-500' : 'text-slate-400'}`}>{campo.id} {isReal && '🔒'}</span>
                                <input
                                  type="number" min="0" max="20" step="1"
                                  disabled={isReal}
                                  value={isEmpty ? '' : numVal}
                                  placeholder="--"
                                  onChange={e => {
                                    if (isReal) return
                                    const v = e.target.value
                                    setSimuladorLocal(prev => ({ ...prev, [curso.id]: { ...prev[curso.id], [campo.id]: v === '' ? '' : parseInt(v) } }))
                                  }}
                                  className="w-14 bg-transparent text-right font-black text-base outline-none relative z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ color: isEmpty ? '#94a3b8' : color }}
                                />
                              </div>
                            )
                          })}
                        </div>

                        {/* Botones de Autocompletado */}
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => autocompletarCurso(curso.id, NOTA_APROBATORIA)} className="flex-1 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                            Salvar (10)
                          </button>
                          <button onClick={() => autocompletarCurso(curso.id, metaCurso)} className="flex-1 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                            Lograr Meta
                          </button>
                        </div>
                      </div>
                    )
                  })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* CARRITO MATRICULA */}
      {mostrarModalMatricula && (
        <div className="fixed inset-0 bg-[#080c14]/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1220] border border-blue-500/20 rounded-2xl p-6 md:p-8 w-full max-w-4xl shadow-[0_0_40px_rgba(59,130,246,0.1)] relative max-h-[90vh] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-white">Buscador de Malla</h3>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex-1 md:flex-none flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl p-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase px-3">Ciclo:</span>
                  <select value={filtroCicloMatricula} onChange={(e) => setFiltroCicloMatricula(e.target.value)} className="bg-transparent text-blue-400 text-xs font-bold py-2 px-2 outline-none">
                    {CICLOS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={() => setMostrarModalMatricula(false)} className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-500 hover:text-white">x</button>
              </div>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 mb-4">
              {cargandoCatalogo ? (
                <div className="text-center py-20 text-slate-500">Cargando malla...</div>
              ) : catalogoAMostrar.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl text-slate-400">Sin cursos disponibles o ya los llevas.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalogoAMostrar.map(curso => {
                    const isSelected = carrito.some(c => c.id === curso.id)
                    return (
                      <div key={curso.id} className={`border rounded-xl p-5 transition-all flex flex-col justify-between ${isSelected ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/[0.02] border-white/[0.05] hover:border-blue-500/30'}`}>
                        <div className="mb-4">
                          <span className="text-[9px] font-bold text-blue-400/60 uppercase mb-1 block">{curso.creditos} Créditos</span>
                          <h4 className="text-sm font-black text-white uppercase">{curso.nombre}</h4>
                        </div>
                        <button 
                          onClick={() => toggleCarrito(curso)}
                          className={`w-full py-2.5 text-[10px] font-black uppercase rounded-lg border transition-all ${isSelected ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-600 hover:text-white'}`}
                        >
                          {isSelected ? '✓ Seleccionado' : 'Añadir'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Action Bar Carrito */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <span className="text-sm font-bold text-white"><span className="text-blue-400 font-black">{carrito.length}</span> cursos listos para matricular en {periodoSeleccionado}</span>
              <button 
                onClick={confirmarMatriculaMasiva}
                disabled={carrito.length === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-colors"
              >
                Confirmar Matrícula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAPA CURRICULAR INMERSIVO (Skill Tree) */}
      {mostrarMapaCurricular && (
        <div className="fixed inset-0 bg-[#080c14]/98 backdrop-blur-xl flex items-center justify-center z-[70] p-4 lg:p-8">
          <div className="w-full h-full max-w-[1800px] flex flex-col relative overflow-hidden border border-emerald-500/20 rounded-3xl bg-[#0d1220] shadow-[0_0_80px_rgba(16,185,129,0.1)]">
            
            {/* Header del Mapa */}
            <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 border-b border-white/[0.05] relative z-10 bg-[#080c14]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
                <h3 className="text-sm md:text-base font-black tracking-[0.25em] uppercase text-emerald-400">Ruta Académica (Skill Tree)</h3>
              </div>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 my-4 md:my-0 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500"></div>Aprobado</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-cyan-500/20 border border-cyan-500"></div>En Curso</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500"></div>Desbloqueado</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/20"></div>Bloqueado</div>
              </div>
              <button onClick={() => setMostrarMapaCurricular(false)} className="text-slate-600 hover:text-white transition-colors text-3xl leading-none px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10">×</button>
            </div>

            {/* Contenedor del Árbol (React Flow) */}
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
                <MiniMap nodeColor="#10b981" maskColor="rgba(8,12,20, 0.8)" className="bg-[#0d1220]" />
              </ReactFlow>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTAS DINAMICO */}
      {modalNota.visible && modalNota.sys && (
        <div className="fixed inset-0 bg-[#080c14]/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#0d1220] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="mb-6">
              <h3 className="text-lg font-black text-white uppercase mb-1">Cargar Calificaciones</h3>
              <p className="text-[10px] text-cyan-400 uppercase truncate">{modalNota.curso?.nombre}</p>
            </div>

            <form onSubmit={guardarNotas} className="space-y-6">
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex justify-between">
                <div>
                  <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Sistema Bloqueado</p>
                  <p className="text-sm font-black text-white">{modalNota.sys.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Fórmula (Info)</p>
                  <p className="text-xs font-mono text-cyan-400">{modalNota.sys.formula}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {parsearCamposRequeridos(modalNota.sys).map(campo => (
                  <div key={campo.id}>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1.5">{campo.label} ({campo.id})</label>
                    <input
                      type="number" min="0" max="20" step="0.1"
                      className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/[0.1] rounded-lg text-white text-lg font-black text-center outline-none focus:border-cyan-500/50"
                      placeholder="--"
                      value={modalNota.detalleLocal[campo.id] ?? ''}
                      onChange={e => actualizarDetalleLocal(campo.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {(() => {
                const form = modalNota.sys.formula.toUpperCase()
                const warnings = []
                if (form.includes('PP_MIXTO_5X5')) {
                  warnings.push(
                    <div key="mixto5x5" className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-center mb-2">
                      <p className="text-[9px] text-purple-400/80 uppercase font-bold">Lógica Mixta 5x5 (PCs + LABs)</p>
                      <p className="text-[10px] text-slate-400 mt-1">El sistema tomará las 4 mejores PCs de 5 y los 4 mejores Laboratorios de 5, uniéndolos todos en un solo promedio dividido entre 8.</p>
                    </div>
                  )
                } else if (form.includes('PP_MIXTO')) {
                  warnings.push(
                    <div key="mixto" className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-center mb-2">
                      <p className="text-[9px] text-purple-400/80 uppercase font-bold">Lógica Mixta (PCs + LABs)</p>
                      <p className="text-[10px] text-slate-400 mt-1">El sistema tomará las 3 mejores PCs y los 6 mejores Laboratorios, uniéndolos todos en un solo promedio dividido entre 9.</p>
                    </div>
                  )
                } else {
                  if (form.includes('SUM_PC5') || form.includes('PP_PC6')) {
                    warnings.push(
                      <div key="pc6" className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-center mb-2">
                        <p className="text-[9px] text-amber-400/80 uppercase font-bold">Lógica de 6 Prácticas Activa</p>
                        <p className="text-[10px] text-slate-400 mt-1">El sistema eliminará la peor nota y tomará las 5 más altas de PC1-PC6.</p>
                      </div>
                    )
                  } else if (modalNota.sys.usa_practicas || form.includes('SUM_PC3') || form.includes('PP_PC') || /\bPP\b/.test(form)) {
                    warnings.push(
                      <div key="pc" className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-center mb-2">
                        <p className="text-[9px] text-amber-400/80 uppercase font-bold">Lógica de Prácticas Activa</p>
                        <p className="text-[10px] text-slate-400 mt-1">El sistema eliminará la peor nota y tomará las 3 más altas de PC1-PC4.</p>
                      </div>
                    )
                  }
                  if (form.includes('PP_LAB')) {
                    warnings.push(
                      <div key="lab" className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-center mb-2">
                        <p className="text-[9px] text-blue-400/80 uppercase font-bold">Lógica de Laboratorios</p>
                        <p className="text-[10px] text-slate-400 mt-1">El sistema eliminará las 2 peores notas y promediará los 6 mejores laboratorios.</p>
                      </div>
                    )
                  }
                }
                if (form.includes('EP') && form.includes('EF')) {
                  warnings.push(
                    <div key="es" className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center mb-2">
                      <p className="text-[9px] text-emerald-400/80 uppercase font-bold">Derecho a Sustitutorio (ES)</p>
                      <p className="text-[10px] text-slate-400 mt-1">Si ingresas una nota en ES, ésta reemplazará obligatoriamente a la nota más baja entre tu Parcial (EP) y tu Final (EF).</p>
                    </div>
                  )
                }
                return warnings
              })()}

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setModalNota({visible:false, curso:null, detalleLocal:{}})} className="flex-1 py-3.5 rounded-xl border border-white/[0.06] text-slate-500 hover:text-white text-[10px] font-black uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-[10px] uppercase">Guardar Notas</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
      {/* MODAL DE SELECCIÓN DE CARRERA Y NOMBRE (ONBOARDING) */}
      {(!perfil || !perfil.nombre_completo) && !cargando && carrerasDisponibles.length > 0 && (
        <div className="fixed inset-0 bg-[#080c14]/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0d1220] border border-cyan-500/30 rounded-3xl p-10 w-full max-w-md shadow-[0_0_50px_rgba(34,211,238,0.1)] text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Bienvenido a Promedium</h2>
            <p className="text-slate-400 text-sm mb-6">Para preparar tu consola, cuéntanos cómo te llamas y qué carrera estudias.</p>
            
            <div className="mb-6 text-left">
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Tu Nombre Completo</label>
              <input 
                type="text" 
                autoFocus
                placeholder="Ej. Alex"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-500/50 transition-colors"
                value={nombreInput}
                onChange={(e) => setNombreInput(e.target.value)}
              />
            </div>

            <div className="text-left mb-2">
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Selecciona tu carrera (Click para confirmar)</label>
            </div>

            <div className="space-y-3">
              {carrerasDisponibles.map(c => (
                <button 
                  key={c.id} 
                  onClick={async () => {
                    if (!nombreInput.trim()) { alert("Por favor ingresa tu nombre"); return; }
                    const { data, error } = await supabase.from('perfiles').upsert({ user_id: userId, carrera_id: c.id, nombre_completo: nombreInput.trim() }, { onConflict: 'user_id' }).select().single()
                    if (error) {
                      alert("Error guardando perfil: " + error.message + "\n\n¿Ejecutaste el script SQL para agregar la columna nombre_completo?")
                      console.error("Upsert error:", error)
                    } else if (data) {
                      setPerfil(data)
                    }
                  }}
                  className="w-full bg-white/[0.03] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-white font-bold py-4 px-6 rounded-xl transition-all flex justify-between items-center group"
                >
                  <span className="uppercase tracking-wide text-sm">{c.nombre}</span>
                  <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERIODO HISTÓRICO */}
      {modalPeriodo.visible && (
        <div className="fixed inset-0 bg-[#080c14]/95 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0d1220] border border-cyan-500/30 rounded-3xl p-8 w-full max-w-sm shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white mb-1">Añadir Periodo</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-6">Ej. 2023-2, 2021-1</p>
            
            <input 
              type="text" 
              autoFocus
              placeholder="Escribe el ciclo..."
              className="w-full px-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-500/50 mb-6 text-center font-black text-xl tracking-widest placeholder:text-slate-700"
              value={modalPeriodo.valor}
              onChange={(e) => setModalPeriodo({...modalPeriodo, valor: e.target.value.toUpperCase()})}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && modalPeriodo.valor.trim() !== '') {
                  const p = modalPeriodo.valor.trim()
                  if (!periodosDinamicos.includes(p)) setPeriodosDinamicos([...periodosDinamicos, p].sort((a,b) => b.localeCompare(a)))
                  setPeriodoSeleccionado(p)
                  setModalPeriodo({ visible: false, valor: '' })
                }
              }}
            />
            
            <div className="flex gap-3">
              <button onClick={() => setModalPeriodo({ visible: false, valor: '' })} className="flex-1 py-3.5 rounded-xl border border-white/[0.06] text-slate-500 hover:text-white text-[10px] font-black uppercase transition-colors">Cancelar</button>
              <button 
                onClick={() => {
                  if (modalPeriodo.valor.trim() !== '') {
                    const p = modalPeriodo.valor.trim()
                    if (!periodosDinamicos.includes(p)) setPeriodosDinamicos([...periodosDinamicos, p].sort((a,b) => b.localeCompare(a)))
                    setPeriodoSeleccionado(p)
                    setModalPeriodo({ visible: false, valor: '' })
                  }
                }} 
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-[10px] uppercase shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-transform hover:scale-105"
              >Aceptar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}