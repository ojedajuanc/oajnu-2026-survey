import { useState, useCallback, useEffect } from 'react';
import { QUESTION_TYPES } from '../config/constants.js';

// Reads persisted { answers, currentIdx } for this session, if any.
function loadProgress(storageKey) {
  if (!storageKey) return null;
  try {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Decides whether a given answer counts as "provided" (non-empty).
// Used to gate required questions and to decide which answers get written.
function isAnswered(question, value) {
  if (value === undefined || value === null) return false;
  switch (question.type) {
    case QUESTION_TYPES.TEXT:
      return typeof value === 'string' && value.trim().length > 0;
    case QUESTION_TYPES.RANKING:
      return Array.isArray(value) && value.length > 0;
    case QUESTION_TYPES.NUMBER:
      return typeof value === 'number' && !Number.isNaN(value);
    case QUESTION_TYPES.BINARY:
    case QUESTION_TYPES.DROPDOWN:
      return value !== '';
    case QUESTION_TYPES.CHECK:
      return Array.isArray(value) && value.length > 0;
    default:
      return true;
  }
}

// Validates a provided answer against the question's configured constraints.
// Returns an error message string, or null if the value is acceptable.
// Only called when isAnswered(question, value) is true, so emptiness is not
// re-checked here.
function constraintError(question, value) {
  const cfg = question.config || {};
  switch (question.type) {
    case QUESTION_TYPES.NUMBER: {
      if (cfg.min != null && value < cfg.min)
        return `El valor debe ser mayor o igual a ${cfg.min}.`;
      if (cfg.max != null && value > cfg.max)
        return `El valor debe ser menor o igual a ${cfg.max}.`;
      return null;
    }
    case QUESTION_TYPES.RANKING: {
      if (value.length !== cfg.selectCount)
        return `Tenés que ordenar ${cfg.selectCount} opción(es).`;
      return null;
    }
    case QUESTION_TYPES.CHECK: {
      const options = cfg.options || [];
      const min = cfg.min ?? (question.required ? 1 : 0);
      const max = cfg.max ?? options.length;
      if (value.length < min) return `Elegí al menos ${min} opción(es).`;
      if (value.length > max) return `Elegí hasta ${max} opción(es).`;
      return null;
    }
    default:
      return null;
  }
}

// questions: array sorted by order. submitFn: (answers) => Promise.
// storageKey (optional): when provided, answers + currentIdx are persisted to
// sessionStorage under that key so a page refresh resumes where the user left off.
export function useForm(questions, submitFn, storageKey) {
  const [answers, setAnswers] = useState(() => loadProgress(storageKey)?.answers ?? {});
  const [currentIdx, setCurrentIdx] = useState(() => loadProgress(storageKey)?.currentIdx ?? 0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Persist progress as the user answers / navigates.
  useEffect(() => {
    if (!storageKey) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ answers, currentIdx }));
    } catch {
      /* ignore storage failures (private mode, quota) */
    }
  }, [storageKey, answers, currentIdx]);

  const total = questions.length;
  const current = questions[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;

  const setAnswer = useCallback((qId, val) => {
    setAnswers((a) => ({ ...a, [qId]: val }));
    setError('');
  }, []);

  // Required + empty → block. A provided answer (required or optional) must also
  // satisfy its configured constraints. Empty optional answers are skipped.
  const validateCurrent = useCallback(() => {
    if (!current) return true;
    const val = answers[current.id];
    const answered = isAnswered(current, val);
    if (current.required && !answered) {
      setError('Esta pregunta es obligatoria.');
      return false;
    }
    if (answered) {
      const err = constraintError(current, val);
      if (err) {
        setError(err);
        return false;
      }
    }
    return true;
  }, [current, answers]);

  const goPrev = useCallback(() => {
    setError('');
    setCurrentIdx((i) => Math.max(0, i - 1));
  }, []);

  const buildPayload = useCallback(() => {
    const payload = {};
    for (const q of questions) {
      const val = answers[q.id];
      if (isAnswered(q, val) && !constraintError(q, val)) payload[q.id] = val;
    }
    return payload;
  }, [questions, answers]);

  const goNext = useCallback(async () => {
    if (!validateCurrent()) return;
    if (!isLast) {
      setCurrentIdx((i) => i + 1);
      return;
    }
    // last question → submit
    setSubmitting(true);
    try {
      await submitFn(buildPayload());
      // Submitted successfully → drop persisted progress so a later visit
      // doesn't rehydrate an already-sent form.
      if (storageKey) {
        try {
          sessionStorage.removeItem(storageKey);
        } catch {
          /* ignore */
        }
      }
    } catch (e) {
      console.error('Error al enviar respuesta:', e);
      setError('No se pudo enviar. Intentá de nuevo.');
      setSubmitting(false);
    }
  }, [validateCurrent, isLast, buildPayload, submitFn, storageKey]);

  return {
    answers,
    currentIdx,
    current,
    total,
    error,
    submitting,
    setAnswer,
    goNext,
    goPrev,
    isFirst,
    isLast,
  };
}
