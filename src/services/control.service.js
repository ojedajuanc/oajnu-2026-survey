import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.js';

// Single control doc per session: surveys/{sid}/sessions/{ses}/control/state
function controlRef(surveyId, sessionId) {
  return doc(db, 'surveys', surveyId, 'sessions', sessionId, 'control', 'state');
}

export async function setReveal(questionId, revealed, surveyId, sessionId) {
  await setDoc(
    controlRef(surveyId, sessionId),
    { revealedQuestions: { [questionId]: revealed } },
    { merge: true }
  );
}

export async function setShowResultsButton(show, surveyId, sessionId) {
  await setDoc(controlRef(surveyId, sessionId), { showResultsButton: show }, { merge: true });
}

export function subscribeControl(callback, surveyId, sessionId) {
  return onSnapshot(controlRef(surveyId, sessionId), (snap) => {
    callback(
      snap.exists()
        ? { showResultsButton: false, revealedQuestions: {}, ...snap.data() }
        : { showResultsButton: false, revealedQuestions: {} }
    );
  });
}
