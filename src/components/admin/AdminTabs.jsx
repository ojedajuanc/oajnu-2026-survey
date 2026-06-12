import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/constants.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useActiveSurvey } from '../../context/ActiveSurveyContext.jsx';
import Button from '../ui/Button.jsx';

export default function AdminTabs({ active }) {
  const { signOut } = useAuth();
  const { activeSurveyId } = useActiveSurvey();
  return (
    <>
      <div className="admin__topbar">
        <strong>Panel del moderador</strong>
        <Button variant="ghost" onClick={() => signOut()}>
          Salir
        </Button>
      </div>
      <nav className="admin__tabs">
        <Link
          to={ROUTES.ADMIN_SURVEYS}
          className={`admin__tab ${active === 'surveys' ? 'admin__tab--active' : ''}`}
        >
          Encuestas
        </Link>
        <Link
          to={activeSurveyId ? ROUTES.ADMIN_PANEL : ROUTES.ADMIN_SURVEYS}
          className={`admin__tab ${active === 'panel' ? 'admin__tab--active' : ''} ${!activeSurveyId ? 'admin__tab--disabled' : ''}`}
        >
          Configurar
        </Link>
        <Link
          to={activeSurveyId ? ROUTES.ADMIN_DASHBOARD : ROUTES.ADMIN_SURVEYS}
          className={`admin__tab ${active === 'dashboard' ? 'admin__tab--active' : ''} ${!activeSurveyId ? 'admin__tab--disabled' : ''}`}
        >
          Dashboard
        </Link>
      </nav>
    </>
  );
}
