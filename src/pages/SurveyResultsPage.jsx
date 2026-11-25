import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SurveyResults from '../components/SurveyResults';

export default function SurveyResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <SurveyResults
      idEncuesta={id}
      onBack={() => navigate(-1)}
    />
  );
}
