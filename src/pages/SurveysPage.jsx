import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SurveyList from '../components/SurveyList';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import Toast from '../components/Toast';

export default function SurveysPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const loadEncuestas = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getEncuestas();
      setEncuestas(res.data);
    } catch {
      setEncuestas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEncuestas();
  }, []);

  useEffect(() => {
    if (location.state?.toastMessage) {
      setToastMessage(location.state.toastMessage);
      window.history.replaceState({}, document.title);
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          {isAdmin ? 'Todas las encuestas' : 'Encuestas activas disponibles'}
        </h2>

        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate('/encuestas/nueva')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Crear encuesta</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          Cargando encuestas...
        </div>
      ) : (
        <SurveyList
          encuestas={encuestas}
          onEdit={(enc) => navigate(`/encuestas/editar/${enc.id_encuesta}`)}
          onViewResults={(id) => navigate(`/resultados/${id}`)}
          onRefresh={loadEncuestas}
          onDeleteSuccess={showToast}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
