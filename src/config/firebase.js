import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDVvsKjGnsk45oiT8weDYlC4Xs3Gud8K5Q",
  authDomain: "tt-ai-93c3c.firebaseapp.com",
  projectId: "tt-ai-93c3c",
  storageBucket: "tt-ai-93c3c.firebasestorage.app",
  messagingSenderId: "413836759617",
  appId: "1:413836759617:web:11782462f6efacd4aaecc0",
  measurementId: "G-51LZQ49079"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
