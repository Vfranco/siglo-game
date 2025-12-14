import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkWwUta5jGgrlVGEJKlaj2dvfx3dvfOjM",
  authDomain: "siglo-game.firebaseapp.com",
  projectId: "siglo-game",
  storageBucket: "siglo-game.firebasestorage.app",
  messagingSenderId: "246423166490",
  appId: "1:246423166490:web:0a43f3fdb87917662e7ba3",
  measurementId: "G-CY9EFE1D6C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
