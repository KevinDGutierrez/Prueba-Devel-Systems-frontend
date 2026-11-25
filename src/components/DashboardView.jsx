import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Eye
} from 'lucide-react';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardView({ onViewSurveyResults, onNavigateToSurveys }) {
  const { isAdmin } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await ApiService.getDashboardStats();
        setStatsData(res.data);
      } catch {
        setStatsData(null);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 animate-fade-in">
        Cargando estadísticas...
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Aún no se han agregado datos al sistema.
      </div>
    );
  }

  const { summary, responsesOverTime, surveyDistribution, activeSurveys } = statsData;
  const maxResponses = Math.max(...(surveyDistribution || []).map(s => s.cantidad || s.total_respuestas || 0), 1);

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Dashboard
          </h2>
        </div>

        <button
          type="button"
          onClick={onNavigateToSurveys}
          className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          <span>Ir a encuestas</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Layers size={13} className="text-slate-600" /> Total Encuestas
            </span>
            <div className="text-lg font-bold text-slate-900 leading-tight">
              {summary?.total_encuestas || 0}
            </div>
            <span className="text-[10px] text-slate-400">
              {summary?.encuestas_activas || 0} activas • {summary?.encuestas_inactivas || 0} inactivas
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" /> Respuestas Totales
            </span>
            <div className="text-lg font-bold text-slate-900 leading-tight">
              {summary?.total_respuestas || 0}
            </div>
            <span className="text-[10px] text-slate-400">
              Registradas en sistema
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-blue-600" /> Tasa de Actividad
            </span>
            <div className="text-lg font-bold text-slate-900 leading-tight">
              {summary?.total_encuestas > 0 ? Math.round(((summary?.encuestas_activas || 0) / summary.total_encuestas) * 100) : 0}%
            </div>
            <span className="text-[10px] text-slate-400">
              Encuestas disponibles
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Users size={13} className="text-slate-600" /> Usuarios
            </span>
            <div className="text-lg font-bold text-slate-900 leading-tight">
              {summary?.total_usuarios_activos || 0}
            </div>
            <span className="text-[10px] text-slate-400">
              Cuentas activas
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Layers size={13} className="text-emerald-600" /> Encuestas Abiertas
            </span>
            <div className="text-lg font-bold text-slate-900 leading-tight">
              {summary?.encuestas_disponibles || 0}
            </div>
            <span className="text-[10px] text-slate-400">
              Disponibles para participar
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-blue-600" /> Participación Global
            </span>
            <div className="text-lg font-bold text-slate-900 leading-tight">
              {summary?.total_respuestas_globales || 0}
            </div>
            <span className="text-[10px] text-slate-400">
              Respuestas recibidas
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <BarChart3 size={14} className="text-slate-700" />
              <span>Respuestas por Encuesta</span>
            </span>
          </div>

          {(surveyDistribution || []).length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aún no se han agregado datos de respuestas.
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {surveyDistribution.map((item, idx) => {
                const count = item.cantidad !== undefined ? item.cantidad : (item.total_respuestas || 0);
                const percent = Math.round((count / maxResponses) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium truncate max-w-[220px]" title={item.titulo}>
                        {item.titulo}
                      </span>
                      <span className="font-semibold text-slate-900 font-mono text-[11px]">
                        {count} {count === 1 ? 'respuesta' : 'respuestas'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-slate-900 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isAdmin ? (
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-slate-700" />
                <span>Cronología de Envíos</span>
              </span>
            </div>

            {(responsesOverTime || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Aún no se han agregado datos de actividad.
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {responsesOverTime.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-50 transition-colors text-xs border border-slate-100">
                    <span className="text-slate-600 font-mono text-[11px]">
                      {d.fecha}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold font-mono text-[11px]">
                      +{d.cantidad} respuestas
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Encuestas Activas Disponibles</span>
              </span>
            </div>

            {(activeSurveys || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No hay encuestas activas en este momento.
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {activeSurveys.map((s) => (
                  <div key={s.id_encuesta} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all text-xs">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-medium text-slate-900 truncate">
                        {s.titulo}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {s.total_campos} campos • {s.total_respuestas} respuestas
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onViewSurveyResults(s.id_encuesta)}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-colors cursor-pointer"
                        title="Ver analíticas"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
