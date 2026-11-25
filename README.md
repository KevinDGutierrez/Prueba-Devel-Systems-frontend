# ACME Surveys — Frontend

Aplicación web SPA para la creación de encuestas, administración de usuarios/roles, visualización de analíticas y recolección pública de respuestas, desarrollada con **React**, **Vite** y **Tailwind CSS**.

## Justificación de la estructura de la Aplicación

- `src/pages/`: vistas principales conectadas al enrutamiento (`BrowserRouter`) y protegidas mediante `ProtectedRoute`.
- `src/components/`: componentes modulares y reutilizables (`SurveyBuilder`, `SurveyList`, `SurveyResults`, `ResultsHub`, `DashboardView`, `UserManagement`, `ConfirmModal`, `Toast`, `Sidebar`, `Header`).
- `src/context/AuthContext.jsx`: gestiona el estado de sesión contra el backend mediante cookies `HttpOnly` y cierre automático por inactividad (15 minutos).
- `src/services/api.js`: capa única de comunicación HTTP con `credentials: 'include'` y envío automático de `X-CSRF-Token` en operaciones mutantes.

## Comandos principales

```bash
npm install
npm run dev
npm run build
```
