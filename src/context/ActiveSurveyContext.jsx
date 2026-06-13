import { createContext, useContext, useEffect, useState } from 'react';

const ActiveSurveyContext = createContext(null);

// Persisted in sessionStorage so a page refresh on /encuesta keeps the active
// survey/session context. Tied to the tab lifetime, matching the anonymous-auth
// persistence model (browserSessionPersistence in firebase.js).
const KEYS = {
  surveyId: 'dyn:activeSurveyId',
  sessionId: 'dyn:activeSessionId',
  email: 'dyn:participantEmail',
};

function loadPersisted(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function savePersisted(key, value) {
  try {
    if (value == null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* ignore storage failures (private mode, quota) */
  }
}

export function ActiveSurveyProvider({ children }) {
  const [activeSurveyId, setActiveSurveyId] = useState(() => loadPersisted(KEYS.surveyId));
  const [activeSessionId, setActiveSessionId] = useState(() => loadPersisted(KEYS.sessionId));
  // Email the participant typed at the cover; anonymous auth has no user.email,
  // so we carry it here to store alongside the response on submit.
  const [participantEmail, setParticipantEmail] = useState(() => loadPersisted(KEYS.email));

  useEffect(() => savePersisted(KEYS.surveyId, activeSurveyId), [activeSurveyId]);
  useEffect(() => savePersisted(KEYS.sessionId, activeSessionId), [activeSessionId]);
  useEffect(() => savePersisted(KEYS.email, participantEmail), [participantEmail]);

  return (
    <ActiveSurveyContext.Provider
      value={{
        activeSurveyId,
        setActiveSurveyId,
        activeSessionId,
        setActiveSessionId,
        participantEmail,
        setParticipantEmail,
      }}
    >
      {children}
    </ActiveSurveyContext.Provider>
  );
}

export function useActiveSurvey() {
  const ctx = useContext(ActiveSurveyContext);
  if (!ctx) throw new Error('useActiveSurvey must be used within ActiveSurveyProvider');
  return ctx;
}
