import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ylkmnilhlqjfjuyisgfc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsa21uaWxobHFqZmp1eWlzZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjY5ODAsImV4cCI6MjA5MzI0Mjk4MH0.fkmvG6i_Ss72MdC-Bhz-2ZB8qGq_EpAV3ctDU1sCkSE'
const supabase = createClient(supabaseUrl, supabaseKey)

const malla = [
  // PRIMER CICLO
  { nombre: 'Geometría Analítica', creditos: 3, ciclo_sugerido: '1er Ciclo', pre: 'NINGUNO' },
  { nombre: 'Cálculo Diferencial', creditos: 5, ciclo_sugerido: '1er Ciclo', pre: 'NINGUNO' },
  { nombre: 'Química I', creditos: 5, ciclo_sugerido: '1er Ciclo', pre: 'NINGUNO' },
  { nombre: 'Redacción y Comunicación', creditos: 2, ciclo_sugerido: '1er Ciclo', pre: 'NINGUNO' },
  { nombre: 'Introducción a la Ingeniería de Software', creditos: 3, ciclo_sugerido: '1er Ciclo', pre: 'NINGUNO' },
  { nombre: 'Introducción a la computación', creditos: 2, ciclo_sugerido: '1er Ciclo', pre: 'NINGUNO' },
  { nombre: 'Desarrollo Personal', creditos: 2, ciclo_sugerido: '1er Ciclo', pre: 'NINGUNO' },
  // SEGUNDO CICLO
  { nombre: 'Álgebra lineal', creditos: 4, ciclo_sugerido: '2do Ciclo', pre: 'Geometría Analítica' },
  { nombre: 'Cálculo Integral', creditos: 5, ciclo_sugerido: '2do Ciclo', pre: 'Cálculo Diferencial' },
  { nombre: 'Matemática discreta', creditos: 3, ciclo_sugerido: '2do Ciclo', pre: 'Álgebra lineal' },
  { nombre: 'Física I', creditos: 5, ciclo_sugerido: '2do Ciclo', pre: 'NINGUNO' },
  { nombre: 'Dibujo y Geometría Descriptiva', creditos: 2, ciclo_sugerido: '2do Ciclo', pre: 'Geometría Analítica' },
  { nombre: 'Algoritmia y Estructura de Datos', creditos: 3, ciclo_sugerido: '2do Ciclo', pre: 'Introducción a la computación' },
  // TERCER CICLO
  { nombre: 'Calculo Multivariable', creditos: 5, ciclo_sugerido: '3er Ciclo', pre: 'Cálculo Integral, Álgebra lineal' },
  { nombre: 'Estadística y Probabilidades', creditos: 3, ciclo_sugerido: '3er Ciclo', pre: 'Cálculo Integral' },
  { nombre: 'Física II', creditos: 5, ciclo_sugerido: '3er Ciclo', pre: 'Física I' },
  { nombre: 'Algoritmia y Estructura de Datos Avanzada', creditos: 3, ciclo_sugerido: '3er Ciclo', pre: 'Algoritmia y Estructura de Datos' },
  { nombre: 'Arquitectura de Computadoras I', creditos: 2, ciclo_sugerido: '3er Ciclo', pre: 'Matemática discreta' },
  { nombre: 'Lenguajes de Programación I (Imperativo)', creditos: 4, ciclo_sugerido: '3er Ciclo', pre: 'Algoritmia y Estructura de Datos' },
  // CUARTO CICLO
  { nombre: 'Ecuaciones Diferenciales', creditos: 5, ciclo_sugerido: '4to Ciclo', pre: 'Calculo Multivariable' },
  { nombre: 'Ética y Filosofia Política', creditos: 2, ciclo_sugerido: '4to Ciclo', pre: 'NINGUNO' },
  { nombre: 'Análisis y Modelamiento de Datos', creditos: 4, ciclo_sugerido: '4to Ciclo', pre: 'Algoritmia y Estructura de Datos Avanzada' },
  { nombre: 'Ingeniería de requerimientos I', creditos: 3, ciclo_sugerido: '4to Ciclo', pre: 'Lenguajes de Programación I (Imperativo)' },
  { nombre: 'Sistemas Operativos', creditos: 3, ciclo_sugerido: '4to Ciclo', pre: 'Arquitectura de Computadoras I' },
  { nombre: 'Lenguaje de Programación II (Orientado a Objetos)', creditos: 4, ciclo_sugerido: '4to Ciclo', pre: 'Lenguajes de Programación I (Imperativo)' },
  // QUINTO CICLO
  { nombre: 'Economía General', creditos: 3, ciclo_sugerido: '5to Ciclo', pre: 'NINGUNO' },
  { nombre: 'Realidad Nacional. Constitución y Derechos Humanos', creditos: 3, ciclo_sugerido: '5to Ciclo', pre: 'NINGUNO' },
  { nombre: 'Arquitectura de Computadoras II', creditos: 3, ciclo_sugerido: '5to Ciclo', pre: 'Arquitectura de Computadoras I' },
  { nombre: 'Análisis y Modelamiento de Comportamiento', creditos: 4, ciclo_sugerido: '5to Ciclo', pre: 'Lenguaje de Programación II (Orientado a Objetos)' },
  { nombre: 'Construcción de software I', creditos: 4, ciclo_sugerido: '5to Ciclo', pre: 'Análisis y Modelamiento de Datos, Ingeniería de requerimientos I' },
  { nombre: 'Redes y Comunicaciones', creditos: 3, ciclo_sugerido: '5to Ciclo', pre: 'Sistemas Operativos, Lenguaje de Programación II (Orientado a Objetos)' },
  { nombre: 'Taller de efectividad personal', creditos: 2, ciclo_sugerido: '5to Ciclo', pre: 'Desarrollo Personal' },
  { nombre: 'Diseño de base de datos', creditos: 3, ciclo_sugerido: '5to Ciclo', pre: 'Análisis y Modelamiento de Datos' },
  // SEXTO CICLO
  { nombre: 'Lenguajes de Dominio Especifico', creditos: 4, ciclo_sugerido: '6to Ciclo', pre: 'Análisis y Modelamiento de Comportamiento, Arquitectura de Computadoras II' },
  { nombre: 'Sistemas de Gestión de Base de Datos', creditos: 4, ciclo_sugerido: '6to Ciclo', pre: 'Diseño de base de datos' },
  { nombre: 'Etica en la Ingeniería de Software', creditos: 2, ciclo_sugerido: '6to Ciclo', pre: 'Ética y Filosofia Política' },
  { nombre: 'Estadística Aplicada', creditos: 3, ciclo_sugerido: '6to Ciclo', pre: 'Estadística y Probabilidades' },
  { nombre: 'Investigación de Operaciones', creditos: 3, ciclo_sugerido: '6to Ciclo', pre: 'Estadística y Probabilidades' },
  { nombre: 'Diseño de Software', creditos: 3, ciclo_sugerido: '6to Ciclo', pre: 'Análisis y Modelamiento de Comportamiento' },
  { nombre: 'Ingeniería de requerimientos II', creditos: 3, ciclo_sugerido: '6to Ciclo', pre: 'Ingeniería de requerimientos I' },
  // SEPTIMO CICLO
  { nombre: 'Gestión del mantenimiento, configuración y cambios del software', creditos: 3, ciclo_sugerido: '7mo Ciclo', pre: 'Diseño de Software, Sistemas de Gestión de Base de Datos' },
  { nombre: 'Taller de Ingeniería de Software I', creditos: 2, ciclo_sugerido: '7mo Ciclo', pre: 'Ingeniería de requerimientos II' },
  { nombre: 'Construcción de software II', creditos: 3, ciclo_sugerido: '7mo Ciclo', pre: 'Construcción de software I' },
  { nombre: 'Arquitectura de soluciones de software', creditos: 3, ciclo_sugerido: '7mo Ciclo', pre: 'Construcción de software I' },
  { nombre: 'Verificación y validación del Software', creditos: 3, ciclo_sugerido: '7mo Ciclo', pre: 'Diseño de Software' },
  { nombre: 'Sistemas embebidos y en tiempo real', creditos: 3, ciclo_sugerido: '7mo Ciclo', pre: 'Arquitectura de Computadoras II, Redes y Comunicaciones' },
  // OCTAVO CICLO
  { nombre: 'Aprendizaje automático I (machine learning I)', creditos: 4, ciclo_sugerido: '8vo Ciclo', pre: 'Estadística Aplicada, Construcción de software I' },
  { nombre: 'Ingeniería Económica para Software', creditos: 3, ciclo_sugerido: '8vo Ciclo', pre: 'Economía General' },
  { nombre: 'Aseguramiento de Calidad del Software', creditos: 3, ciclo_sugerido: '8vo Ciclo', pre: 'Verificación y validación del Software' },
  { nombre: 'Procesos de Ingeniería Software', creditos: 3, ciclo_sugerido: '8vo Ciclo', pre: 'Construcción de software II' },
  { nombre: 'Administración de empresas de software', creditos: 3, ciclo_sugerido: '8vo Ciclo', pre: 'Economía General' },
  { nombre: 'Taller de efectividad profesional 2', creditos: 2, ciclo_sugerido: '8vo Ciclo', pre: 'Taller de efectividad personal' },
  // NOVENO CICLO
  { nombre: 'Aprendizaje automático II (machine learning II)', creditos: 4, ciclo_sugerido: '9no Ciclo', pre: 'Aprendizaje automático I (machine learning I)' },
  { nombre: 'Proyecto de Tesis en Ingeniería de Software I', creditos: 2, ciclo_sugerido: '9no Ciclo', pre: 'Procesos de Ingeniería Software' },
  { nombre: 'Taller de Innovación y tecnologías emergentes', creditos: 3, ciclo_sugerido: '9no Ciclo', pre: 'Ingeniería Económica para Software' },
  { nombre: 'Seguridad en Redes y Desarrollo de Software seguro', creditos: 3, ciclo_sugerido: '9no Ciclo', pre: 'Procesos de Ingeniería Software' },
  { nombre: 'Metodologías Agiles para Proyectos de Software', creditos: 2, ciclo_sugerido: '9no Ciclo', pre: 'Aseguramiento de Calidad del Software' },
  { nombre: 'Taller de Ingeniería de Software II', creditos: 2, ciclo_sugerido: '9no Ciclo', pre: 'Taller de Ingeniería de Software I' },
  // DECIMO CICLO
  { nombre: 'Proyecto de Tesis en Ingeniería de Software II', creditos: 2, ciclo_sugerido: '10mo Ciclo', pre: 'Proyecto de Tesis en Ingeniería de Software I' },
  { nombre: 'Topicos Especiales en Ingeniería de Software', creditos: 3, ciclo_sugerido: '10mo Ciclo', pre: 'Aseguramiento de Calidad del Software' },
  { nombre: 'Gestión de SERVICIOS DEL SOFTWARE', creditos: 3, ciclo_sugerido: '10mo Ciclo', pre: 'Metodologías Agiles para Proyectos de Software' },
  { nombre: 'Gestión de Proyectos de SOFTWARE', creditos: 3, ciclo_sugerido: '10mo Ciclo', pre: 'Taller de Ingeniería de Software II' },
  { nombre: 'Taller de Emprendimiento', creditos: 2, ciclo_sugerido: '10mo Ciclo', pre: 'Taller de Innovación y tecnologías emergentes' }
]

async function seed() {
  console.log("Autenticando temporal para saltar RLS...")
  let { data: authData, error: authErr } = await supabase.auth.signUp({
    email: 'seeduser@test.com',
    password: 'password123'
  })

  if (authErr && authErr.message.includes('already registered')) {
    const res = await supabase.auth.signInWithPassword({
      email: 'seeduser@test.com',
      password: 'password123'
    })
    authErr = res.error
  }

  if (authErr) {
    console.error("Error autenticando:", authErr.message)
    return
  }

  console.log("Limpiando catálogo actual...")
  await supabase.from('catalogo_cursos').delete().neq('id', 0) // Delete all

  console.log("Insertando malla curricular completa...")
  const inserts = malla.map(c => ({
    nombre: c.nombre,
    creditos: c.creditos,
    ciclo_sugerido: c.ciclo_sugerido,
    pre_requisitos: c.pre,
    sistema_evaluacion: 'Libre' // Default
  }))
  
  const { error } = await supabase.from('catalogo_cursos').insert(inserts)
  if (error) {
    console.error("Error insertando malla:", error)
  } else {
    console.log("¡Malla curricular insertada exitosamente con", inserts.length, "cursos!")
  }
}

seed()
