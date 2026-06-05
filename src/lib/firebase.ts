import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDrcFJJG6jfDJTuMqJaM6UlgtZsIbbK1UM",
  authDomain: "logixa-help.firebaseapp.com",
  projectId: "logixa-help",
  storageBucket: "logixa-help.firebasestorage.app",
  messagingSenderId: "56555986008",
  appId: "1:56555986008:web:ce122cb0a75007497cfe2d",
  measurementId: "G-9QC9TQRLTW",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const db = getFirestore(app)
