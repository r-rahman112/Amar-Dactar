import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const missingFirebaseEnvVars = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`);

export const isFirebaseConfigured = missingFirebaseEnvVars.length === 0;

if (!isFirebaseConfigured) {
  console.error(
    `[Firebase] Missing required Vite environment variables: ${missingFirebaseEnvVars.join(", ")}. ` +
      "Firebase Auth, Firestore, and Storage are disabled until these values are configured.",
  );
}

const app: FirebaseApp | null = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

if (auth) {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("[Firebase] Failed to enable local auth persistence:", error);
  });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");

export default app;
