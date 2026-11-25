import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardView from '../components/DashboardView';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <DashboardView
      onViewSurveyResults={(id) => navigate(`/resultados/${id}`)}
      onNavigateToSurveys={() => navigate('/encuestas')}
    />
  );
}
