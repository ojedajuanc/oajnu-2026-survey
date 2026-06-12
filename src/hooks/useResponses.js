import { useEffect, useState } from 'react';
import { subscribeResponses } from '../services/response.service.js';
import { useActiveSurvey } from '../context/ActiveSurveyContext.jsx';

export function useResponses(surveyIdProp, sessionIdProp) {
  const { activeSurveyId, activeSessionId } = useActiveSurvey();
  const surveyId = surveyIdProp ?? activeSurveyId;
  const sessionId = sessionIdProp ?? activeSessionId;
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!surveyId || !sessionId) return;
    const unsub = subscribeResponses(
      (list) => {
        setResponses(list);
        setLoading(false);
      },
      surveyId,
      sessionId
    );
    return unsub;
  }, [surveyId, sessionId]);

  return { responses, count: responses.length, loading };
}
