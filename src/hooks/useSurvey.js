import { useEffect, useState } from 'react';
import { subscribeSurvey } from '../services/survey.service.js';
import { subscribeSession } from '../services/session.service.js';
import { useActiveSurvey } from '../context/ActiveSurveyContext.jsx';

// Real-time survey definition + session document.
// Reads activeSurveyId/activeSessionId from context; callers may override via props.
export function useSurvey(surveyIdProp, sessionIdProp) {
  const { activeSurveyId, activeSessionId } = useActiveSurvey();
  const surveyId = surveyIdProp ?? activeSurveyId;
  const sessionId = sessionIdProp ?? activeSessionId;
  const [survey, setSurvey] = useState(null);
  const [session, setSession] = useState(null);
  const [surveyLoaded, setSurveyLoaded] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!surveyId || !sessionId) return;
    const unsubSurvey = subscribeSurvey((s) => {
      setSurvey(s);
      setSurveyLoaded(true);
    }, surveyId, (err) => {
      setError(err);
      setSurveyLoaded(true); // unblock loading so the UI can surface the error
    });
    const unsubSession = subscribeSession((s) => {
      setSession(s);
      setSessionLoaded(true);
    }, surveyId, sessionId, (err) => {
      setError(err);
      setSessionLoaded(true);
    });
    return () => {
      unsubSurvey();
      unsubSession();
    };
  }, [surveyId, sessionId]);

  return { survey, session, loading: !surveyLoaded || !sessionLoaded, error };
}

// Returns questions sorted by order as an array of { id, ...question }.
export function questionsToArray(survey) {
  if (!survey || !survey.questions) return [];
  return Object.entries(survey.questions)
    .map(([id, q]) => ({ id, ...q }))
    .sort((a, b) => a.order - b.order);
}
