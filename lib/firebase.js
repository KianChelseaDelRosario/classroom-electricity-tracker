import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAGp5iynrt5My_tXctgEy3EYjnk5zByYzg",
  authDomain: "classroom-electricity-tr-908a9.firebaseapp.com",
  projectId: "classroom-electricity-tr-908a9",
  storageBucket: "classroom-electricity-tr-908a9.firebasestorage.app",
  messagingSenderId: "587375443318",
  appId: "1:587375443318:web:c9c625c800c61c009d0e57"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// experimentalForceLongPolling is required for Firestore to connect
// reliably from React Native / Expo Go - without it, writes can silently
// fail or hang on some networks.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// Using memory persistence (no extra setup) rather than AsyncStorage-backed
// persistence - this means the admin has to log in again after fully
// closing the app, but avoids a known set of Expo/Firebase persistence bugs.
// If you want to stay logged in across restarts later, this is the file to
// revisit.
export const auth = getAuth(app);