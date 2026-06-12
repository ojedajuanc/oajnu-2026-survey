import { useNavigate } from 'react-router-dom';
import { useSurvey } from '../hooks/useSurvey.js';
import { useControl } from '../hooks/useControl.js';
import { ROUTES } from '../config/constants.js';
import Button from '../components/ui/Button.jsx';

export default function ThankYouPage() {
  const { survey, loading } = useSurvey();
  const { control } = useControl();
  const navigate = useNavigate();

  if (loading) return <div className="page-center">Cargando…</div>;

  const meta = survey?.meta;

  return (
    <div className="thankyou">
      <div className="thankyou__icon">✓</div>
      <h2 className="thankyou__title">{meta?.thankYouTitle || '¡Gracias!'}</h2>
      {meta?.thankYouBody && <p className="thankyou__body">{meta.thankYouBody}</p>}

      {control.showResultsButton && (
        <Button variant="outline" onClick={() => navigate(ROUTES.RESULTS)}>
          Ver resultados →
        </Button>
      )}
    </div>
  );
}
