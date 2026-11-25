import React from 'react';
import { useParams } from 'react-router-dom';
import PublicSurvey from './PublicSurvey';

export default function PublicSurveyPage() {
  const { uuid } = useParams();
  return <PublicSurvey uuid={uuid} />;
}
