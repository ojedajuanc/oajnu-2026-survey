import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

function responsesRef(surveyId, sessionId) {
  return collection(db, 'surveys', surveyId, 'sessions', sessionId, 'responses');
}

// US-16 / NFR-06: addDoc creates a new auto-id doc — concurrent submits never overwrite.
export async function writeResponse(answers, participantUid, participantEmail, surveyId, sessionId) {
  return addDoc(responsesRef(surveyId, sessionId), {
    submittedAt: serverTimestamp(),
    participantUid,
    participantEmail,
    answers,
  });
}

// Returns true if the participant (by Firebase Auth UID) already submitted for this session.
export async function hasParticipantResponded(uid, surveyId, sessionId) {
  const q = query(
    responsesRef(surveyId, sessionId),
    where('participantUid', '==', uid),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export function subscribeResponses(callback, surveyId, sessionId) {
  const q = query(responsesRef(surveyId, sessionId), orderBy('submittedAt', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
