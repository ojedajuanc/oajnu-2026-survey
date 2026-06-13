import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import { auth } from '../config/firebase.js';

// Admin auth (Email/Password)
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOut() {
  return fbSignOut(auth);
}

export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Participant auth (Anonymous): grants a stable UID instantly, no email round-trip.
// The participant's email is captured separately in the UI and stored with the response.
// Requires "Anonymous" provider enabled in Firebase Console → Authentication.
export function signInParticipant() {
  return signInAnonymously(auth);
}
