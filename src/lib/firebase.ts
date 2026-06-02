import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "amar-dactar.firebaseapp.com",
  projectId: "amar-dactar",
  storageBucket: "amar-dactar.firebasestorage.app",
  messagingSenderId: "183155772915",
  appId: "1:183155772915:web:c0c6d16f8f921ff28e1686"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");

export default app;