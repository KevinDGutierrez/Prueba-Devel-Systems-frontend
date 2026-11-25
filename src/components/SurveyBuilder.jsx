import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  AlertCircle,
  ArrowLeft,
  Type,
  Hash,
  Calendar
} from 'lucide-react';
import ApiService from '../services/api';
import ConfirmModal from './ConfirmModal';

export default function SurveyBuilder({ onSurveyCreated, onCancel, editSurvey = null }) {
  const [titulo, setTitulo] = useState(editSurvey?.titulo || '');
  const [descripcion, setDescripcion] = useState(editSurvey?.descripcion || '');
  const [estado, setEstado] = useState(editSurvey?.estado || 'activa');
  const [campos, setCampos] = useState(editSurvey?.campos || [
    {
      id_local: 1,
      nombre_campo: 'nombre_completo',
      titulo_etiqueta: 'Nombre completo',
      tipo_campo: 'texto',
      es_requerido: true,
      orden: 1
    },
    {
      id_local: 2,
      nombre_campo: 'edad',
      titulo_etiqueta: 'Edad',
      tipo_campo: 'numero',
      es_requerido: true,
      orden: 2
    },
    {
      id_local: 3,
      nombre_campo: 'fecha_contacto',
      titulo_etiqueta: 'Fecha de contacto',
      tipo_campo: 'fecha',
      es_requerido: false,
      orden: 3
    }
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ultimoAgregadoId, setUltimoAgregadoId] = useState(null);
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    if (editSurvey) {
      setTitulo(editSurvey.titulo || '');
      setDescripcion(editSurvey.descripcion || '');
      setEstado(editSurvey.estado || 'activa');
      setCampos(editSurvey.campos || []);
    } else {
      setTitulo('');
      setDescripcion('');
      setEstado('activa');
      setCampos([
        {
          id_local: 1,
          nombre_campo: 'nombre_completo',
          titulo_etiqueta: 'Nombre completo',
          tipo_campo: 'texto',
          es_requerido: true,
          orden: 1
        },
        {
          id_local: 2,
          nombre_campo: 'edad',
          titulo_etiqueta: 'Edad',
          tipo_campo: 'numero',
          es_requerido: true,
          orden: 2
        },
        {
          id_local: 3,
          nombre_campo: 'fecha_contacto',
          titulo_etiqueta: 'Fecha de contacto',
          tipo_campo: 'fecha',
          es_requerido: false,
          orden: 3
        }
      ]);
    }
  }, [editSurvey]);

  const agregarCampo = (tipo = 'texto') => {
    const nuevoId = Date.now();
    const count = campos.length + 1;
    const tiposLabels = { texto: 'Texto', numero: 'Número', fecha: 'Fecha' };
    
    setUltimoAgregadoId(nuevoId);
    setCampos([
      ...campos,
      {
        id_local: nuevoId,
        nombre_campo: `campo_${count}`,
        titulo_etiqueta: `Pregunta ${count} (${tiposLabels[tipo]})`,
        tipo_campo: tipo,
        es_requerido: true,
        orden: count
      }
    ]);
  };

  const eliminarCampo = (index) => {
    if (campos.length <= 1) {
      setModalAlerta({
        isOpen: true,
        message: 'La encuesta debe tener al menos una pregunta obligatoria.'
      });
      return;
    }
    setCampos(campos.filter((_, i) => i !== index));
  };

  const actualizarCampo = (index, key, value) => {
    const nuevos = [...campos];
    nuevos[index][key] = value;
    
    if (key === 'titulo_etiqueta' && !nuevos[index].editadoManualmente) {
      nuevos[index].nombre_campo = value
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 40);
    }

    setCampos(nuevos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) {
      setError('El título de la encuesta es obligatorio.');
      return;
    }

    const nombres = new Set();
    for (const c of campos) {
      const nom = c.nombre_campo.trim();
      if (!nom) {
        setError('Cada campo debe tener un identificador válido.');
        return;
      }
      if (nombres.has(nom)) {
        setError(`El identificador "${nom}" está repetido. Usa nombres únicos.`);
        return;
      }
      nombres.add(nom);
    }

    setSaving(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        estado,
        campos: campos.map((c, i) => ({
          id_campo: c.id_campo,
          nombre_campo: c.nombre_campo.trim(),
          titulo_etiqueta: c.titulo_etiqueta.trim(),
          tipo_campo: c.tipo_campo,
          es_requerido: Boolean(c.es_requerido),
          orden: i + 1
        }))
      };

      if (editSurvey) {
        await ApiService.updateEncuesta(editSurvey.id_encuesta, payload);
        onSurveyCreated('Encuesta editada correctamente');
      } else {
        await ApiService.createEncuesta(payload);
        onSurveyCreated('Encuesta creada correctamente');
      }
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3 pb-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
            title="Regresar a encuestas"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Regresar</span>
          </button>
          <div className="sm:border-l sm:border-slate-200 sm:pl-2.5">
            <h2 className="text-sm font-semibold text-slate-900 leading-tight">
              {editSurvey ? 'Editar encuesta' : 'Nueva encuesta'}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-2xs"
        >
          <Save size={13} />
          <span>{saving ? 'Guardando...' : (editSurvey ? 'Guardar cambios' : 'Crear encuesta')}</span>
        </button>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle size={14} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-3 space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">
              Título de la encuesta *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Encuesta de Satisfacción"
              className="w-full px-2.5 py-1.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-800 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-800 transition-colors"
            >
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
            </select>
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">
              Instrucciones (opcional)
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Instrucciones breves..."
              className="w-full px-2.5 py-1.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-800 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-semibold text-slate-900">
            Preguntas ({campos.length})
          </h3>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Añadir:</span>
            <button
              type="button"
              onClick={() => agregarCampo('texto')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.97] text-slate-700 rounded-md text-[11px] font-medium cursor-pointer transition-all flex items-center gap-1"
            >
              <Type size={11} /> Texto
            </button>
            <button
              type="button"
              onClick={() => agregarCampo('numero')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.97] text-slate-700 rounded-md text-[11px] font-medium cursor-pointer transition-all flex items-center gap-1"
            >
              <Hash size={11} /> Número
            </button>
            <button
              type="button"
              onClick={() => agregarCampo('fecha')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 active:scale-[0.97] text-slate-700 rounded-md text-[11px] font-medium cursor-pointer transition-all flex items-center gap-1"
            >
              <Calendar size={11} /> Fecha
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {campos.map((campo, index) => {
            const isNuevo = campo.id_local === ultimoAgregadoId;

            return (
              <div
                key={campo.id_campo || campo.id_local || index}
                className={`p-2.5 rounded-lg border border-slate-200 bg-slate-50/40 space-y-2 ${
                  isNuevo ? 'animate-field-in border-slate-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">
                      #{index + 1}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-medium uppercase bg-white border border-slate-200 text-slate-600">
                      {campo.tipo_campo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <label className="flex items-center gap-1 cursor-pointer text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={campo.es_requerido}
                        onChange={(e) => actualizarCampo(index, 'es_requerido', e.target.checked)}
                        className="rounded text-slate-900 w-3 h-3"
                      />
                      <span>Obligatorio</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => eliminarCampo(index)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Eliminar pregunta"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 space-y-0.5">
                    <input
                      type="text"
                      required
                      value={campo.titulo_etiqueta}
                      onChange={(e) => actualizarCampo(index, 'titulo_etiqueta', e.target.value)}
                      placeholder="Texto de la pregunta..."
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <input
                      type="text"
                      required
                      value={campo.nombre_campo}
                      onChange={(e) => {
                        actualizarCampo(index, 'editadoManualmente', true);
                        actualizarCampo(index, 'nombre_campo', e.target.value);
                      }}
                      placeholder="campo_id"
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600 focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={modalAlerta.isOpen}
        title="Validación de formulario"
        message={modalAlerta.message}
        variant="warning"
        confirmText="Entendido"
        cancelText="Cerrar"
        onConfirm={() => setModalAlerta({ isOpen: false, message: '' })}
        onCancel={() => setModalAlerta({ isOpen: false, message: '' })}
      />
    </div>
  );
}
