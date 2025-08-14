// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2WO2uxgiq_WyI6Js6Vt3Hy30G3UEGhl4",
  authDomain: "yeshuad-be66c.firebaseapp.com",
  projectId: "yeshuad-be66c",
  storageBucket: "yeshuad-be66c.firebasestorage.app",
  messagingSenderId: "980994658242",
  appId: "1:980994658242:web:4932fb9f943f7f3444105b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
export { analytics };

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only connect to emulators if environment variables are set
  try {
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`, {
        disableWarnings: true
      });
    }
    
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
      connectFirestoreEmulator(db, host, parseInt(port));
    }
    
    if (process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
      const [host, port] = process.env.FIREBASE_STORAGE_EMULATOR_HOST.split(':');
      connectStorageEmulator(storage, host, parseInt(port));
    }
  } catch (error) {
    console.log('Emulators not configured or already connected');
  }
}

export default app;
