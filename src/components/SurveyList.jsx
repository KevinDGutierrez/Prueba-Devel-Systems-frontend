import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  ExternalLink, 
  Eye, 
  Edit2, 
  Trash2, 
  Check, 
  FileText, 
  Layers
} from 'lucide-react';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

export default function SurveyList({ encuestas, onEdit, onViewResults, onRefresh, onDeleteSuccess }) {
  const { isAdmin } = useAuth();
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [modalDelete, setModalDelete] = useState({ isOpen: false, id: null, titulo: '', totalRespuestas: 0 });

  const encuestasAMostrar = isAdmin ? encuestas : encuestas.filter(e => e.estado === 'activa');

  const handleCopyLink = (enlace, id) => {
    navigator.clipboard.writeText(enlace);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openDeleteModal = (id, titulo, totalRespuestas = 0) => {
    setModalDelete({ isOpen: true, id, titulo, totalRespuestas });
  };

  const confirmDelete = async () => {
    if (!modalDelete.id) return;
    setDeletingId(modalDelete.id);
    try {
      await ApiService.deleteEncuesta(modalDelete.id);
      setModalDelete({ isOpen: false, id: null, titulo: '', totalRespuestas: 0 });
      if (onDeleteSuccess) {
        onDeleteSuccess('Encuesta eliminada correctamente');
      }
      onRefresh();
    } catch (error) {
      setModalDelete({ isOpen: false, id: null, titulo: '', totalRespuestas: 0 });
    } finally {
      setDeletingId(null);
    }
  };

  if (encuestasAMostrar.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-12 text-center max-w-sm mx-auto mt-8 shadow-xs animate-fade-in">
        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
          <FileText size={20} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          No hay encuestas disponibles
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {isAdmin ? 'Crea tu primera encuesta para distribuirla públicamente.' : 'No hay encuestas activas en este momento.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {encuestasAMostrar.map((encuesta) => {
          const isActiva = encuesta.estado === 'activa';
          const isCopied = copiedId === encuesta.id_encuesta;

          return (
            <div
              key={encuesta.id_encuesta}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 card-interactive p-5 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                    isActiva 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {encuesta.estado === 'activa' ? 'Activa' : 'Inactiva'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    v{encuesta.version}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-1">
                  {encuesta.titulo}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {encuesta.descripcion || 'Sin descripción'}
                </p>

                <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Layers size={13} className="text-slate-400" />
                    {encuesta.total_campos} campos
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    {encuesta.total_respuestas} respuestas
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <input
                    type="text"
                    readOnly
                    value={encuesta.enlace_publico}
                    className="bg-transparent text-slate-600 text-[11px] font-mono flex-1 outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(encuesta.enlace_publico, encuesta.id_encuesta)}
                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Copiar enlace"
                  >
                    {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                  <a
                    href={encuesta.enlace_publico}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                    title="Abrir formulario"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => onViewResults(encuesta.id_encuesta)}
                    className="text-xs font-medium text-slate-800 hover:text-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={13} className="text-slate-500" />
                    <span>Ver estadísticas</span>
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(encuesta)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === encuesta.id_encuesta}
                        onClick={() => openDeleteModal(encuesta.id_encuesta, encuesta.titulo, encuesta.total_respuestas || 0)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Eliminar encuesta"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={modalDelete.isOpen}
        title="¿Desea eliminar esta encuesta?"
        message={
          modalDelete.totalRespuestas > 0
            ? `La encuesta "${modalDelete.titulo}" tiene ${modalDelete.totalRespuestas} ${modalDelete.totalRespuestas === 1 ? 'respuesta registrada' : 'respuestas registradas'}. Si la eliminas, también se borrarán permanentemente todas sus respuestas.`
            : `La encuesta "${modalDelete.titulo}" no tiene respuestas registradas y será eliminada permanentemente del sistema.`
        }
        confirmText="Eliminar encuesta"
        cancelText="Conservar"
        variant="danger"
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onCancel={() => setModalDelete({ isOpen: false, id: null, titulo: '', totalRespuestas: 0 })}
      />
    </div>
  );
}
