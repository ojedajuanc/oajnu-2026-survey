import { createContext, useContext, useState } from 'react';

const ActiveSurveyContext = createContext(null);

export function ActiveSurveyProvider({ children }) {
  const [activeSurveyId, setActiveSurveyId] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  // Email the participant typed at the cover; anonymous auth has no user.email,
  // so we carry it here to store alongside the response on submit.
  const [participantEmail, setParticipantEmail] = useState(null);

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
