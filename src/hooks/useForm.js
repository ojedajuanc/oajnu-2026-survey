import { useState, useCallback } from 'react';
import { QUESTION_TYPES } from '../config/constants.js';

// Decides whether a given answer counts as "provided" for a required question.
function isAnswered(question, value) {
  if (value === undefined || value === null) return false;
  switch (question.type) {
    case QUESTION_TYPES.TEXT:
      return typeof value === 'string' && value.trim().length > 0;
    case QUESTION_TYPES.RANKING:
      return Array.isArray(value) && value.length === question.config.selectCount;
    case QUESTION_TYPES.NUMBER:
      return typeof value === 'number' && !Number.isNaN(value);
    case QUESTION_TYPES.BINARY:
    case QUESTION_TYPES.DROPDOWN:
      return value !== '';
    case QUESTION_TYPES.CHECK: {
      const min = question.config.min ?? (question.required ? 1 : 0);
      const max = question.config.max ?? question.config.options.length;
      return Array.isArray(value) && value.length >= min && value.length <= max;
    }
    default:
      return true;
  }
}

// questions: array sorted by order. submitFn: (answers) => Promise.
export function useForm(questions, submitFn) {
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const total = questions.length;
  const current = questions[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;

  const setAnswer = useCallback((qId, val) => {
    setAnswers((a) => ({ ...a, [qId]: val }));
    setError('');
  }, []);

  // Required + empty → block. Omit empty optional answers (never write null).
  const validateCurrent = useCallback(() => {
    if (!current) return true;
    const val = answers[current.id];
    if (current.required && !isAnswered(current, val)) {
      setError('Esta pregunta es obligatoria.');
      return false;
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
      if (isAnswered(q, val)) payload[q.id] = val;
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
    } catch (e) {
      console.error('Error al enviar respuesta:', e);
      setError('No se pudo enviar. Intentá de nuevo.');
      setSubmitting(false);
    }
  }, [validateCurrent, isLast, buildPayload, submitFn]);

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
