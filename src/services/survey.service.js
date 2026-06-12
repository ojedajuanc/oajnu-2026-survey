import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { DEFAULT_META, DEFAULT_SETTINGS } from '../config/constants.js';

function surveyRef(surveyId) {
  return doc(db, 'surveys', surveyId);
}

export async function getSurvey(surveyId) {
  const snap = await getDoc(surveyRef(surveyId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Persists meta, settings and questions. Merges so timestamps/other fields survive.
export async function saveSurvey(data, surveyId) {
  const ref = surveyRef(surveyId);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      meta: data.meta,
      settings: data.settings,
      questions: data.questions,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
}

export function subscribeSurvey(callback, surveyId, onError) {
  return onSnapshot(
    surveyRef(surveyId),
    (snap) => {
      callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    (err) => {
      console.error('subscribeSurvey error:', err);
      if (onError) onError(err);
    }
  );
}

export async function listSurveys() {
  const q = query(collection(db, 'surveys'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createSurvey(name, uid) {
  const ref = doc(collection(db, 'surveys'));
  await setDoc(ref, {
    name,
    meta: DEFAULT_META,
    settings: DEFAULT_SETTINGS,
    questions: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: uid,
  });
  return ref.id;
}

export async function deleteSurvey(surveyId) {
  await deleteDoc(surveyRef(surveyId));
}

export async function renameSurvey(surveyId, name) {
  await updateDoc(surveyRef(surveyId), { name, updatedAt: serverTimestamp() });
}
