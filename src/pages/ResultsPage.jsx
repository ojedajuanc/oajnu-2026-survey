import { useMemo } from 'react';
import { useSurvey, questionsToArray } from '../hooks/useSurvey.js';
import { useResponses } from '../hooks/useResponses.js';
import { useControl } from '../hooks/useControl.js';
import { computeResults } from '../modules/aggregator.js';
import QuestionViz from '../components/visualizations/QuestionViz.jsx';

export default function ResultsPage() {
  const { survey, loading } = useSurvey();
  const { responses, count } = useResponses();
  const { control } = useControl();

  const questions = questionsToArray(survey);
  const results = useMemo(() => computeResults(questions, responses), [questions, responses]);

  if (loading) return <div className="page-center">Cargando…</div>;

  const revealed = questions.filter((q) => control.revealedQuestions?.[q.id] === true);

  return (
    <div className="container">
      <div className="results__header">
        <h1>{survey?.meta?.title || 'Resultados'}</h1>
        <p className="muted">
          <span className="results__count">{count}</span> respuestas
        </p>
      </div>

      {revealed.length === 0 ? (
        <p className="results__empty">Los resultados se mostrarán en breve.</p>
      ) : (
        revealed.map((q) => (
          <div className="viz-card" key={q.id}>
            <div className="viz-card__prompt">{q.prompt}</div>
            {(q.description || q.config?.instruction) && (
              <p className="viz-card__description">{q.description || q.config.instruction}</p>
            )}
            <QuestionViz question={q} result={results[q.id]} />
          </div>
        ))
      )}
    </div>
  );
}
