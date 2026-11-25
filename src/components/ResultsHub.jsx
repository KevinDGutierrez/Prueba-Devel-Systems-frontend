import React, { useState } from 'react';
import { 
  BarChart3, 
  Layers, 
  MessageSquare, 
  Search, 
  ArrowRight,
  TrendingUp,
  FileQuestion
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ResultsHub({ encuestas, onSelectSurvey }) {
  const { isAdmin } = useAuth();
  const [busqueda, setBusqueda] = useState('');

  const encuestasFiltradas = encuestas
    .filter(e => isAdmin || e.estado === 'activa')
    .filter(e => e.titulo.toLowerCase().includes(busqueda.toLowerCase()) || (e.descripcion && e.descripcion.toLowerCase().includes(busqueda.toLowerCase())));

  const totalRespuestasAcumuladas = encuestasFiltradas.reduce((acc, curr) => acc + (curr.total_respuestas || 0), 0);

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Centro de Analíticas y Resultados
          </h2>
          <p className="text-[11px] text-slate-400">
            {isAdmin ? 'Métricas consolidadas de todas las encuestas' : 'Explora estadísticas y gráficos de encuestas activas'}
          </p>
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Filtrar encuesta..."
            className="pl-7 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-800 w-52 shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Layers size={13} className="text-slate-600" /> Encuestas Analizables
          </span>
          <div className="text-lg font-bold text-slate-900 leading-tight">
            {encuestasFiltradas.length}
          </div>
          <span className="text-[10px] text-slate-400">
            Disponibles para ver métricas
          </span>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <MessageSquare size={13} className="text-emerald-600" /> Total Respuestas
          </span>
          <div className="text-lg font-bold text-slate-900 leading-tight">
            {totalRespuestasAcumuladas}
          </div>
          <span className="text-[10px] text-slate-400">
            Recibidas en total
          </span>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <TrendingUp size={13} className="text-blue-600" /> Promedio Respuestas
          </span>
          <div className="text-lg font-bold text-slate-900 leading-tight">
            {encuestasFiltradas.length > 0 ? (totalRespuestasAcumuladas / encuestasFiltradas.length).toFixed(1) : 0}
          </div>
          <span className="text-[10px] text-slate-400">
            Por encuesta
          </span>
        </div>
      </div>

      {encuestasFiltradas.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-slate-200/80 text-center text-xs text-slate-400 shadow-2xs">
          No hay encuestas para analizar con ese criterio.
        </div>
      ) : (
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-800">
            Selecciona una encuesta para ver sus gráficas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {encuestasFiltradas.map((encuesta) => {
              const tieneRespuestas = (encuesta.total_respuestas || 0) > 0;

              return (
                <div
                  key={encuesta.id_encuesta}
                  onClick={() => onSelectSurvey(encuesta.id_encuesta)}
                  className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-medium uppercase ${
                        encuesta.estado === 'activa' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {encuesta.estado}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-black">
                        {encuesta.titulo}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {encuesta.descripcion || 'Sin descripción'}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <FileQuestion size={11} /> {encuesta.total_campos} campos
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <MessageSquare size={11} className="text-slate-500" /> {encuesta.total_respuestas || 0} respuestas
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0">
                    <span className="text-xs font-medium hidden sm:inline">Analizar</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
