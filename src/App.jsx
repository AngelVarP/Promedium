import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Dashboard from './Dashboard'
import DashboardAlumno from './DashboardAlumno'

function RutaProtegida({ children }) {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      setCargando(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-2 border-cyan-500/5 border-t-cyan-500/40 animate-spin" style={{animationDirection:'reverse', animationDuration:'1.5s'}}></div>
        </div>
        <p className="text-cyan-400/70 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">Verificando acceso</p>
      </div>
    )
  }

  if (!sesion) return <Navigate to="/" replace />
  return children
}

function LoginRegister() {
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [focused, setFocused] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje({ texto: '', tipo: '' })
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { nombre_completo: nombreCompleto }
          }
        })
        if (error) throw error
        setMensaje({ texto: 'Cuenta creada. Ya puedes iniciar sesión.', tipo: 'exito' })
        setEmail(''); setPassword(''); setNombreCompleto(''); setIsLogin(true)
      }
    } catch (error) {
      setMensaje({
        texto: error.message === 'Invalid login credentials' ? 'Credenciales incorrectas.' : error.message,
        tipo: 'error'
      })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 overflow-hidden relative font-sans">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(rgba(34,211,238,1) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,1) 1px,transparent 1px)', backgroundSize:'60px 60px'}}></div>

      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{background:'radial-gradient(circle, #0891b2, transparent 70%)'}}></div>
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{background:'radial-gradient(circle, #1d4ed8, transparent 70%)'}}></div>

      {/* Corner accents */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-cyan-500/20"></div>
      <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-cyan-500/20"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-cyan-500/20"></div>
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-cyan-500/20"></div>

      <div className="relative w-full max-w-sm z-10">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 mb-5 relative">
            <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <div className="absolute -inset-px rounded-2xl border border-cyan-400/10"></div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-1">Promedium</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-500/40"></div>
            <span className="text-[9px] text-cyan-400/60 font-bold tracking-[0.25em] uppercase">Sistema académico</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-500/40"></div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-transparent pointer-events-none"></div>

          {/* Tab switcher */}
          <div className="flex bg-white/[0.03] rounded-xl p-1 mb-7 border border-white/[0.05]">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setMensaje({texto:'',tipo:''}) }}
              className={`flex-1 py-2 text-[11px] font-bold tracking-widest uppercase rounded-lg transition-all duration-200 ${isLogin ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-400'}`}
            >Ingresar</button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setMensaje({texto:'',tipo:''}) }}
              className={`flex-1 py-2 text-[11px] font-bold tracking-widest uppercase rounded-lg transition-all duration-200 ${!isLogin ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-400'}`}
            >Registrarse</button>
          </div>

          {mensaje.texto && (
            <div className={`mb-5 px-4 py-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${mensaje.tipo === 'exito' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${mensaje.tipo === 'exito' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            {!isLogin && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className={`block text-[10px] font-bold tracking-[0.15em] uppercase mb-2 transition-colors ${focused === 'nombre' ? 'text-cyan-400' : 'text-slate-500'}`}>
                  Nombre Completo
                </label>
                <input
                  type="text" value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  onFocus={() => setFocused('nombre')}
                  onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-all focus:border-cyan-500/40 focus:bg-cyan-500/[0.03]"
                  placeholder="Ej. Ada Lovelace" required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className={`block text-[10px] font-bold tracking-[0.15em] uppercase mb-2 transition-colors ${focused === 'email' ? 'text-cyan-400' : 'text-slate-500'}`}>
                Correo electrónico
              </label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-all focus:border-cyan-500/40 focus:bg-cyan-500/[0.03]"
                placeholder="tu@correo.com" required
              />
            </div>
            <div>
              <label className={`block text-[10px] font-bold tracking-[0.15em] uppercase mb-2 transition-colors ${focused === 'pass' ? 'text-cyan-400' : 'text-slate-500'}`}>
                Contraseña
              </label>
              <input
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused(null)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-all focus:border-cyan-500/40 focus:bg-cyan-500/[0.03]"
                placeholder="••••••••" required
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full mt-2 relative py-3.5 rounded-xl font-black text-[11px] tracking-widest uppercase overflow-hidden transition-all duration-300 disabled:opacity-50 group"
              style={{background:'linear-gradient(135deg, #0e7490, #1d4ed8)'}}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'linear-gradient(135deg, #0891b2, #2563eb)'}}></div>
              <span className="relative text-white">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Procesando
                  </span>
                ) : isLogin ? 'Acceder al sistema' : 'Crear cuenta'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setMensaje({texto: '', tipo: ''}); }}
              className="w-full text-center text-[10px] text-cyan-400 hover:text-cyan-300 font-bold tracking-widest uppercase transition-colors mt-4"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia Sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-6 tracking-widest">
          PROMEDIUM · UNI · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

function App() {
  const [userEmail, setUserEmail] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { if (user) setUserEmail(user.email) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const MI_CORREO_ADMIN = "test@test.com"

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/dashboard" element={
          <RutaProtegida>
            {userEmail === MI_CORREO_ADMIN ? <Dashboard /> : <DashboardAlumno />}
          </RutaProtegida>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App