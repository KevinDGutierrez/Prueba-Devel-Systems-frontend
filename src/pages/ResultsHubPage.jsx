import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultsHub from '../components/ResultsHub';
import ApiService from '../services/api';

export default function ResultsHubPage() {
  const navigate = useNavigate();
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await ApiService.getEncuestas();
        setEncuestas(res.data);
      } catch {
        setEncuestas([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Cargando resultados...
      </div>
    );
  }

  return (
    <ResultsHub
      encuestas={encuestas}
      onSelectSurvey={(id) => navigate(`/resultados/${id}`)}
    />
  );
}
