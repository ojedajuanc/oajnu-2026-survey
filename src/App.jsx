import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext.jsx';
import { useActiveSurvey } from './context/ActiveSurveyContext.jsx';
import { ROUTES } from './config/constants.js';

import CoverPage from './pages/CoverPage.jsx';
import SurveyPage from './pages/SurveyPage.jsx';
import ThankYouPage from './pages/ThankYouPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import SurveysListPage from './pages/SurveysListPage.jsx';
import AdminPanelPage from './pages/AdminPanelPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

function RequireAuth({ children }) {
  const { isAdmin, loading } = useAuthContext();
  if (loading) return <div className="page-center">Cargando…</div>;
  if (!isAdmin) return <Navigate to={ROUTES.ADMIN} replace />;
  return children;
}

function RequireSurvey({ children }) {
  const { activeSurveyId } = useActiveSurvey();
  if (!activeSurveyId) return <Navigate to={ROUTES.ADMIN_SURVEYS} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.COVER} element={<CoverPage />} />
      <Route path={ROUTES.SURVEY} element={<SurveyPage />} />
      <Route path={ROUTES.THANKS} element={<ThankYouPage />} />
      <Route path={ROUTES.RESULTS} element={<ResultsPage />} />
      <Route path={ROUTES.ADMIN} element={<AdminLoginPage />} />
      <Route
        path={ROUTES.ADMIN_SURVEYS}
        element={
          <RequireAuth>
            <SurveysListPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.ADMIN_PANEL}
        element={
          <RequireAuth>
            <RequireSurvey>
              <AdminPanelPage />
            </RequireSurvey>
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <RequireAuth>
            <RequireSurvey>
              <AdminDashboardPage />
            </RequireSurvey>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.COVER} replace />} />
    </Routes>
  );
}
