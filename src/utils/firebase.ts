/**
 * Firebase Configuration
 * Initializes Firebase only for web mode
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { isWeb } from './platform';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBhIdFZZtrYkLRbXzP8-G2D6X2VjocDJl4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nclservice.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nclservice",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nclservice.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029347494118",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029347494118:web:280d59719cd636286d1327"
};

// Initialize Firebase only for web
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (isWeb()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log('[FIREBASE] Initialized successfully for web mode');
  } catch (error) {
    console.error('[FIREBASE] Initialization error:', error);
  }
}

export {
  auth,
  googleProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  type ConfirmationResult
};
