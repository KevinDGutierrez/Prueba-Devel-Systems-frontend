import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import SurveysPage from './pages/SurveysPage';
import SurveyBuilderPage from './pages/SurveyBuilderPage';
import ResultsHubPage from './pages/ResultsHubPage';
import SurveyResultsPage from './pages/SurveyResultsPage';
import UserManagement from './components/UserManagement';
import PublicSurveyPage from './pages/PublicSurveyPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/encuesta/:uuid" element={<PublicSurveyPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="encuestas" element={<SurveysPage />} />
        <Route
          path="encuestas/nueva"
          element={
            <ProtectedRoute adminOnly>
              <SurveyBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="encuestas/editar/:id"
          element={
            <ProtectedRoute adminOnly>
              <SurveyBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route path="resultados" element={<ResultsHubPage />} />
        <Route path="resultados/:id" element={<SurveyResultsPage />} />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
