import { createContext, useContext, useState } from 'react';

const ActiveSurveyContext = createContext(null);

export function ActiveSurveyProvider({ children }) {
  const [activeSurveyId, setActiveSurveyId] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);

  return (
    <ActiveSurveyContext.Provider
      value={{ activeSurveyId, setActiveSurveyId, activeSessionId, setActiveSessionId }}
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
