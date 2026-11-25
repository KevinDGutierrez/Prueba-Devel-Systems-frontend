import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import ApiService from '../services/api';

export default function PublicSurvey({ uuid }) {
  const [encuesta, setEncuesta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [respuestas, setRespuestas] = useState({});
  const [validacionesError, setValidacionesError] = useState({});

  useEffect(() => {
    async function loadSurvey() {
      try {
        setLoading(true);
        setError(null);
        const res = await ApiService.getEncuestaPublica(uuid);
        setEncuesta(res.data);
      } catch (err) {
        setError(err.message || 'No fue posible cargar la encuesta');
      } finally {
        setLoading(false);
      }
    }
    loadSurvey();
  }, [uuid]);

  const handleChange = (idCampo, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [idCampo]: valor
    }));
    if (validacionesError[idCampo]) {
      setValidacionesError(prev => ({
        ...prev,
        [idCampo]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!encuesta) return;

    const nuevosErrores = {};
    for (const campo of encuesta.campos) {
      const val = respuestas[campo.id_campo];

      if (campo.es_requerido && (val === undefined || val === null || String(val).trim() === '')) {
        nuevosErrores[campo.id_campo] = `Este campo es obligatorio.`;
      } else if (val !== undefined && val !== null && String(val).trim() !== '') {
        if (campo.tipo_campo === 'numero' && isNaN(Number(val))) {
          nuevosErrores[campo.id_campo] = `Ingrese un valor numérico.`;
        }
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setValidacionesError(nuevosErrores);
      return;
    }

    setSubmitting(true);
    try {
      const payloadValores = Object.entries(respuestas).map(([id_campo, valor]) => ({
        id_campo: parseInt(id_campo, 10),
        valor
      }));

      await ApiService.responderEncuestaPublica(uuid, payloadValores);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al enviar su respuesta.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-xs text-slate-500">Cargando formulario...</p>
      </div>
    );
  }

  if (error && !encuesta) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-slate-200/80 max-w-sm w-full text-center shadow-xs">
          <h2 className="text-sm font-semibold text-slate-800">
            Encuesta no disponible
          </h2>
          <p className="text-xs text-slate-500 mt-2 mb-4">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl border border-slate-200/80 max-w-sm w-full text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={22} />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            Respuesta enviada
          </h2>
          <p className="text-xs text-slate-500">
            Gracias por completar el formulario. Tus respuestas han sido registradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">
            {encuesta.titulo}
          </h1>

          {encuesta.descripcion && (
            <p className="text-xs text-slate-600 leading-relaxed">
              {encuesta.descripcion}
            </p>
          )}

          <div className="pt-2 text-[11px] text-slate-400">
            * Campos obligatorios
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {encuesta.campos.map((campo, index) => {
            const errorMsg = validacionesError[campo.id_campo];

            return (
              <div
                key={campo.id_campo}
                className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2"
              >
                <label className="block text-xs font-medium text-slate-800">
                  {campo.titulo_etiqueta}
                  {campo.es_requerido && <span className="text-rose-500 ml-1">*</span>}
                </label>

                {campo.tipo_campo === 'texto' && (
                  <input
                    type="text"
                    required={campo.es_requerido}
                    value={respuestas[campo.id_campo] || ''}
                    onChange={(e) => handleChange(campo.id_campo, e.target.value)}
                    placeholder="Tu respuesta..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                  />
                )}

                {campo.tipo_campo === 'numero' && (
                  <input
                    type="number"
                    step="any"
                    required={campo.es_requerido}
                    value={respuestas[campo.id_campo] || ''}
                    onChange={(e) => handleChange(campo.id_campo, e.target.value)}
                    placeholder="Número"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                  />
                )}

                {campo.tipo_campo === 'fecha' && (
                  <input
                    type="date"
                    required={campo.es_requerido}
                    value={respuestas[campo.id_campo] || ''}
                    onChange={(e) => handleChange(campo.id_campo, e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                  />
                )}

                {errorMsg && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {errorMsg}
                  </p>
                )}
              </div>
            );
          })}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {submitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enviar respuesta</span>
                  <Send size={13} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
