import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SurveyBuilder from '../components/SurveyBuilder';
import ApiService from '../services/api';

export default function SurveyBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) {
      setSurvey(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await ApiService.getEncuestaById(id);
        if (isMounted) {
          setSurvey(res.data);
        }
      } catch {
        if (isMounted) navigate('/encuestas');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Cargando encuesta...
      </div>
    );
  }

  return (
    <SurveyBuilder
      key={id || 'nueva-encuesta'}
      editSurvey={survey}
      onSurveyCreated={(msg) => navigate('/encuestas', { state: { toastMessage: msg } })}
      onCancel={() => navigate('/encuestas')}
    />
  );
}
