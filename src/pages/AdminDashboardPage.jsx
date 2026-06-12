import { useMemo } from 'react';
import { useSurvey, questionsToArray } from '../hooks/useSurvey.js';
import { useResponses } from '../hooks/useResponses.js';
import { useControl } from '../hooks/useControl.js';
import { useToast } from '../components/ui/Toast.jsx';
import { computeResults } from '../modules/aggregator.js';
import AdminTabs from '../components/admin/AdminTabs.jsx';
import RevealToggle from '../components/admin/RevealToggle.jsx';
import QuestionViz from '../components/visualizations/QuestionViz.jsx';
import Toggle from '../components/ui/Toggle.jsx';
import { RoomCodeBadge } from './AdminPanelPage.jsx';

export default function AdminDashboardPage() {
  const { survey, session, loading } = useSurvey();
  const { responses, count } = useResponses();
  const { control, setReveal, setShowResultsButton } = useControl();
  const { show } = useToast();

  const questions = questionsToArray(survey);
  const results = useMemo(() => computeResults(questions, responses), [questions, responses]);

  if (loading) return <div className="page-center">Cargando…</div>;

  return (
    <div className="admin">
      <AdminTabs active="dashboard" />

      <div className="dash__stats">
        <div>
          <div className="dash__count">{count}</div>
          <div className="dash__count-label">respuestas</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <span className="dash__live">
            <span className="dash__live-dot" /> En vivo
          </span>
          {session?.roomCode && (
            <RoomCodeBadge
              roomCode={session.roomCode}
              onCopy={() => show('¡Enlace copiado!', 'success')}
            />
          )}
        </div>
      </div>

      <div className="dash__global-toggle">
        <Toggle
          checked={!!control.showResultsButton}
          onChange={setShowResultsButton}
          label='Mostrar botón "Ver resultados" en la pantalla de agradecimiento'
        />
      </div>

      {questions.length === 0 ? (
        <p className="muted">No hay preguntas configuradas.</p>
      ) : (
        questions.map((q) => (
          <div className="viz-card" key={q.id}>
            <div className="dash__viz-head">
              <div className="viz-card__prompt" style={{ margin: 0 }}>
                {q.prompt}
              </div>
              <RevealToggle
                revealed={control.revealedQuestions?.[q.id] === true}
                onChange={(v) => setReveal(q.id, v)}
              />
            </div>
            <QuestionViz question={q} result={results[q.id]} />
          </div>
        ))
      )}
    </div>
  );
}
