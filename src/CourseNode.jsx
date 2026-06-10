import { Handle, Position } from '@xyflow/react';

export default function CourseNode({ data }) {
  const { curso, isAprobado, isReprobado, enCursoActual, isDesbloqueado, prereqsFaltantes, notaHistorial } = data;

  let nodeStyle = 'bg-[#0d1220]/95 border-white/5 text-slate-500 opacity-50 backdrop-blur-md'
  let badgeStyle = 'bg-white/5 text-slate-600'
  let icon = '🔒'
  let tooltip = isDesbloqueado ? null : `Requiere: ${prereqsFaltantes?.join(', ')}`

  if (isAprobado) {
    nodeStyle = 'bg-emerald-500/10 border-emerald-500/40 text-white backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]'
    badgeStyle = 'bg-emerald-500/20 text-emerald-400'
    icon = '✓'
    tooltip = null
  } else if (enCursoActual) {
    nodeStyle = 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.15)] text-white backdrop-blur-md'
    badgeStyle = 'bg-cyan-500/20 text-cyan-400'
    icon = '▶'
    tooltip = null
  } else if (isDesbloqueado) {
    nodeStyle = 'bg-amber-500/10 border-amber-500/30 text-white shadow-[0_0_15px_rgba(245,158,11,0.05)] backdrop-blur-md'
    badgeStyle = 'bg-amber-500/20 text-amber-400'
    icon = '🔓'
  } else if (isReprobado) {
    nodeStyle = 'bg-red-500/10 border-red-500/40 text-white backdrop-blur-md'
    badgeStyle = 'bg-red-500/20 text-red-400'
    icon = '✗'
  }

  return (
    <div title={tooltip} className={`w-64 p-4 rounded-xl border transition-all duration-300 ${nodeStyle}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-slate-600 !border-0" />
      
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-1.5 flex-wrap">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${badgeStyle}`}>
            {curso.creditos} CR
          </span>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${curso.ciclo_sugerido === 'Electivo' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}>
            {curso.ciclo_sugerido}
          </span>
        </div>
        {icon && <span className={`text-xs font-black flex-shrink-0 ${isAprobado ? 'text-emerald-400' : enCursoActual ? 'text-cyan-400' : isDesbloqueado ? 'text-amber-400' : isReprobado ? 'text-red-400' : 'text-slate-600'}`}>{icon}</span>}
      </div>
      <h5 className="text-xs font-black uppercase leading-tight mb-2">{curso.nombre}</h5>
      
      {notaHistorial !== undefined && !enCursoActual && (
        <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
          <span className="text-[9px] uppercase font-bold text-slate-500">Nota Final</span>
          <span className={`text-xs font-black ${isAprobado ? 'text-emerald-400' : 'text-red-400'}`}>{notaHistorial.toFixed(1)}</span>
        </div>
      )}
      {tooltip && !isAprobado && !enCursoActual && !isDesbloqueado && (
        <p className="text-[8px] text-red-400/70 mt-1 uppercase tracking-wide leading-tight line-clamp-2">{tooltip}</p>
      )}

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-slate-600 !border-0" />
    </div>
  );
}
