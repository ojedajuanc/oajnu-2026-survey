import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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

// Participant auth (Email Link / passwordless)
// actionCodeSettings.url must include the room code so the participant lands
// back on the correct survey: { url: '.../#/?room=KBJM', handleCodeInApp: true }
export function sendParticipantEmailLink(email, actionCodeSettings) {
  return sendSignInLinkToEmail(auth, email, actionCodeSettings);
}

export function isEmailLink(url) {
  return isSignInWithEmailLink(auth, url);
}

export function signInWithLink(email, url) {
  return signInWithEmailLink(auth, email, url);
}
