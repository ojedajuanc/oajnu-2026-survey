import { useNavigate } from 'react-router-dom';
import { useSurvey, questionsToArray } from '../hooks/useSurvey.js';
import { useForm } from '../hooks/useForm.js';
import { useAuthContext } from '../context/AuthContext.jsx';
import { useActiveSurvey } from '../context/ActiveSurveyContext.jsx';
import { writeResponse } from '../services/response.service.js';
import { ROUTES } from '../config/constants.js';
import ProgressBar from '../components/ui/ProgressBar.jsx';
import FieldError from '../components/ui/FieldError.jsx';
import Button from '../components/ui/Button.jsx';
import QuestionRenderer from '../components/renderers/QuestionRenderer.jsx';

export default function SurveyPage() {
  const { survey, session, loading } = useSurvey();
  const { user } = useAuthContext();
  const { activeSurveyId, activeSessionId } = useActiveSurvey();
  const navigate = useNavigate();
  const questions = questionsToArray(survey);

  const form = useForm(questions, async (answers) => {
    await writeResponse(
      answers,
      user?.uid ?? null,
      user?.email ?? null,
      activeSurveyId,
      activeSessionId
    );
    navigate(ROUTES.THANKS, { replace: true });
  });

  if (loading) return <div className="page-center">Cargando…</div>;

  // Guard: not published or no questions → bounce to cover.
  if (!session?.published || questions.length === 0) {
    return (
      <div className="page-center">
        <div className="text-center">
          <p className="muted">La encuesta no está disponible.</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.COVER)} style={{ marginTop: 12 }}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const { current, currentIdx, total, error, submitting, setAnswer, answers } = form;
  const allowBack = survey?.settings?.allowBackNavigation;
  const submitLabel = survey?.meta?.submitLabel || 'Enviar respuestas';

  return (
    <div className="survey">
      <header className="survey__header">
        <div className="survey__header-row">
          <span className="survey__title">{survey?.meta?.title}</span>
          <span className="survey__counter">
            {currentIdx + 1} de {total}
          </span>
        </div>
        <ProgressBar value={currentIdx + 1} max={total} />
      </header>

      <main className="survey__body">
        <div className="question-card">
          <div className="question-card__prompt">
            {current.prompt}
            {current.required && <span className="question-card__required">*</span>}
          </div>

          <QuestionRenderer
            question={current}
            value={answers[current.id]}
            onChange={(val) => setAnswer(current.id, val)}
          />

          <FieldError message={error} />
        </div>

        <div className="survey__nav">
          {allowBack && !form.isFirst ? (
            <Button variant="ghost" onClick={form.goPrev} disabled={submitting}>
              ← Anterior
            </Button>
          ) : (
            <span />
          )}
          <Button variant="primary" onClick={form.goNext} disabled={submitting}>
            {submitting ? 'Enviando…' : form.isLast ? submitLabel : 'Siguiente →'}
          </Button>
        </div>
      </main>
    </div>
  );
}
