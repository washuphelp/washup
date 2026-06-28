import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

// These keys are safe to be exposed on the client side in a standard Firebase Web application.
const firebaseConfig = {
  apiKey: "AIzaSyDcujnD8JSWdgVJYvPpNLZ8PVEj0VqgK5E",
  authDomain: "marklar-catwalk-zwjkk.firebaseapp.com",
  projectId: "marklar-catwalk-zwjkk",
  storageBucket: "marklar-catwalk-zwjkk.firebasestorage.app",
  messagingSenderId: "964931471980",
  appId: "1:964931471980:web:4073290df05abe693c2649"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID and enable long-polling to prevent proxy/iframe connection blocks
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, "ai-studio-e264ebb0-370a-4c47-ac9a-254dd485e0b7");

export { collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, limit };

