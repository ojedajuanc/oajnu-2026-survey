import { useEffect, useState, useCallback } from 'react';
import {
  subscribeControl,
  setReveal as svcSetReveal,
  setShowResultsButton as svcSetShowResultsButton,
} from '../services/control.service.js';
import { useActiveSurvey } from '../context/ActiveSurveyContext.jsx';

export function useControl(surveyIdProp, sessionIdProp) {
  const { activeSurveyId, activeSessionId } = useActiveSurvey();
  const surveyId = surveyIdProp ?? activeSurveyId;
  const sessionId = sessionIdProp ?? activeSessionId;
  const [control, setControl] = useState({ showResultsButton: false, revealedQuestions: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!surveyId || !sessionId) return;
    const unsub = subscribeControl(
      (c) => {
        setControl(c);
        setLoading(false);
      },
      surveyId,
      sessionId
    );
    return unsub;
  }, [surveyId, sessionId]);

  const setReveal = useCallback(
    (qId, bool) => svcSetReveal(qId, bool, surveyId, sessionId),
    [surveyId, sessionId]
  );
  const setShowResultsButton = useCallback(
    (bool) => svcSetShowResultsButton(bool, surveyId, sessionId),
    [surveyId, sessionId]
  );

  return { control, loading, setReveal, setShowResultsButton };
}
