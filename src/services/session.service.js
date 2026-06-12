import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  collectionGroup,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

// No I/O to avoid confusion with 1/0
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomCode() {
  return Array.from(
    { length: 4 },
    () => ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
  ).join('');
}

function sessionRef(surveyId, sessionId) {
  return doc(db, 'surveys', surveyId, 'sessions', sessionId);
}

export async function getSession(surveyId, sessionId) {
  const snap = await getDoc(sessionRef(surveyId, sessionId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Creates or updates a session. Auto-generates a roomCode if it doesn't have one.
export async function saveSession(data, surveyId, sessionId) {
  const ref = sessionRef(surveyId, sessionId);
  const existing = await getDoc(ref);
  const needsRoomCode = !existing.exists() || !existing.data().roomCode;
  const roomCode = needsRoomCode ? generateRoomCode() : existing.data().roomCode;
  await setDoc(
    ref,
    {
      ...data,
      roomCode,
      ...(existing.exists()
        ? {}
        : { createdAt: serverTimestamp(), startedAt: null, closedAt: null }),
    },
    { merge: true }
  );
  return roomCode;
}

export async function setPublished(published, uid, surveyId, sessionId) {
  const ref = sessionRef(surveyId, sessionId);
  const existing = await getDoc(ref);
  const needsRoomCode = !existing.exists() || !existing.data().roomCode;
  const roomCode = needsRoomCode ? generateRoomCode() : existing.data().roomCode;
  await setDoc(
    ref,
    {
      published,
      roomCode,
      ...(published && existing.exists() && !existing.data().startedAt
        ? { startedAt: serverTimestamp() }
        : {}),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp(), createdBy: uid, label: '' }),
    },
    { merge: true }
  );
}

export function subscribeSession(callback, surveyId, sessionId, onError) {
  return onSnapshot(
    sessionRef(surveyId, sessionId),
    (snap) => {
      callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    (err) => {
      console.error('subscribeSession error:', err);
      if (onError) onError(err);
    }
  );
}

// Resolves a 4-letter room code to { surveyId, sessionId, ...sessionData } via collection group query.
export async function getSessionByRoomCode(roomCode) {
  const q = query(
    collectionGroup(db, 'sessions'),
    where('roomCode', '==', roomCode.toUpperCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const parts = d.ref.path.split('/');
  // path: surveys/{surveyId}/sessions/{sessionId}
  return { surveyId: parts[1], sessionId: parts[3], id: d.id, ...d.data() };
}
